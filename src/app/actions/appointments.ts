"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export async function getAvailableDoctors(search?: string, specialty?: string) {
  const supabase = await createClient();
  
  let query = supabase
    .from("doctors")
    .select(`
      id,
      crm,
      specialization,
      bio,
      availability,
      consultation_fee,
      profiles!inner ( full_name, avatar_url )
    `)
    .eq("is_active", true);

  if (search) {
    query = query.ilike("profiles.full_name", `%${search}%`);
  }
  
  if (specialty && specialty !== "todas") {
    query = query.ilike("specialization", `%${specialty}%`);
  }

  const { data: doctors, error } = await query;

  if (error) {
    console.error("Error fetching doctors:", error);
    return [];
  }
  
  return doctors;
}

export async function createAppointment(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };

  const doctorId = formData.get("doctor_id") as string;
  const dateStr = formData.get("date") as string; // YYYY-MM-DD
  const timeStr = formData.get("time") as string; // HH:MM
  
  if (!doctorId || !dateStr || !timeStr) {
    return { error: "Data, horário e médico são obrigatórios." };
  }

  // Create start and end times (assuming 30 minute duration as agreed)
  const startTime = new Date(`${dateStr}T${timeStr}:00`);
  const endTime = new Date(startTime.getTime() + 30 * 60000); // +30 minutes
  
  // Gera a sala interna no SaaS apontando para o componente Jitsi
  const meetId = Math.random().toString(36).substring(2, 10);
  const telemedicineUrl = `/meet/${meetId}`;

  const { error } = await supabase.from("appointments").insert({
    patient_id: user.id,
    doctor_id: doctorId,
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    status: "scheduled",
    telemedicine_url: telemedicineUrl
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/patient");
  revalidatePath("/doctor");
  return { success: true };
}
export async function confirmAppointment(doctorId: string, dateStr: string, timeStr: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };

  if (!doctorId || !dateStr || !timeStr) {
    return { error: "Dados inválidos." };
  }

  // Verifica se a consulta já existe para evitar duplicação em refresh de página
  const startTime = new Date(`${dateStr}T${timeStr}:00`);
  const endTime = new Date(startTime.getTime() + 30 * 60000);
  
  const { data: existing } = await supabase
    .from("appointments")
    .select("id")
    .eq("patient_id", user.id)
    .eq("doctor_id", doctorId)
    .eq("start_time", startTime.toISOString());
    
  if (existing && existing.length > 0) {
    return { success: true, alreadyExists: true };
  }

  const meetId = Math.random().toString(36).substring(2, 10);
  const telemedicineUrl = `/meet/${meetId}`;

  const { error } = await supabase.from("appointments").insert({
    patient_id: user.id,
    doctor_id: doctorId,
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    status: "scheduled",
    telemedicine_url: telemedicineUrl
  });

  if (error) {
    return { error: error.message };
  }

  // --- DISPARO DE NOTIFICAÇÕES (E-MAILS) ---
  try {
    const { sendPatientConfirmation, sendDoctorNotification } = await import("@/lib/email");
    
    // Buscar nomes para os e-mails
    const { data: patientProfile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
    const { data: doctorProfile } = await supabase.from("profiles").select("full_name").eq("id", doctorId).single();
    
    const patientName = patientProfile?.full_name || "Paciente";
    const doctorName = doctorProfile?.full_name || "Médico(a)";
    const patientEmail = user.email || `paciente_${user.id}@evah.mock`;
    const doctorEmail = `medico_${doctorId}@evah.mock`; // Em produção, buscar na auth.users via RPC admin
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const fullMeetLink = `${baseUrl}${telemedicineUrl}`;

    // Dispara assíncrono (não bloqueia a resposta do usuário)
    Promise.all([
      sendPatientConfirmation(patientEmail, patientName, doctorName, dateStr, timeStr, fullMeetLink),
      sendDoctorNotification(doctorEmail, doctorName, patientName, dateStr, timeStr)
    ]).catch(err => console.error("Erro no envio assíncrono de emails", err));
    
  } catch (err) {
    console.error("Falha ao carregar ou disparar módulo de e-mail:", err);
  }

  revalidatePath("/patient");
  revalidatePath("/doctor");
  return { success: true };
}
export async function getPatientAppointments() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("appointments")
    .select(`
      id, start_time, end_time, status, telemedicine_url,
      doctors (
        specialization,
        profiles (full_name)
      )
    `)
    .eq("patient_id", user.id)
    .neq("payment_status", "pending")
    .order("start_time", { ascending: true });

  if (error) return [];
  return data;
}

export async function getDoctorAppointments() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Usa Service Role para bypass do RLS de profiles dos pacientes
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabaseAdmin
    .from("appointments")
    .select(`
      id, patient_id, start_time, end_time, status, telemedicine_url,
      patients (
        id,
        cpf,
        profiles (full_name)
      )
    `)
    .eq("doctor_id", user.id)
    .neq("payment_status", "pending")
    .order("start_time", { ascending: true });

  if (error) return [];
  return data;
}

export async function getDoctorBookedSlots(doctorId: string, dateStr: string) {
  const supabase = await createClient();
  
  // O dateStr chega como YYYY-MM-DD
  // Vamos buscar todas as consultas desse médico que começam ou terminam nesse dia
  const startOfDay = new Date(`${dateStr}T00:00:00.000Z`).toISOString();
  const endOfDay = new Date(`${dateStr}T23:59:59.999Z`).toISOString();

  const { data, error } = await supabase
    .from("appointments")
    .select("start_time")
    .eq("doctor_id", doctorId)
    .gte("start_time", startOfDay)
    .lte("start_time", endOfDay)
    .neq("status", "cancelled"); // Opcional, ignorar cancelados

  if (error) return [];

  // Converte os timestamps para horários "HH:mm" locais (UTC-3 se assumirmos o servidor igual ao browser)
  // Para evitar fusos problemáticos no Server, vamos extrair a hora em formato UTC e compensar se necessário,
  // ou melhor, mandar as strings pro client processar. Como combinamos que start_time está no BD, extraímos HH:mm
  return data.map(app => {
    const d = new Date(app.start_time);
    // Extrai o HH:mm garantindo fuso local ou mantendo a string
    // Como a ISO string foi criada via `${dateStr}T${timeStr}:00`, no UTC é o horário real.
    const hh = String(d.getUTCHours()).padStart(2, '0');
    const mm = String(d.getUTCMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  });
}
export async function getGlobalFinances() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("appointments")
    .select(`
      id, start_time, status,
      doctors ( consultation_fee )
    `)
    .order("start_time", { ascending: true });

  if (error) return [];
  return data;
}

export async function triggerAppointmentReminder(appointmentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Não autorizado" };
  }

  // Busca detalhes do appointment com bypass (Service Role) para conseguir acessar dados do paciente
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: appointment, error } = await supabaseAdmin
    .from("appointments")
    .select(`
      id, start_time, telemedicine_url,
      doctors (
        profiles ( full_name )
      ),
      patients (
        id,
        phone,
        profiles ( full_name, email )
      )
    `)
    .eq("id", appointmentId)
    .single();

  if (error || !appointment) {
    console.error("Erro ao buscar appointment:", error);
    return { error: "Consulta não encontrada" };
  }

  const patientProfile = Array.isArray((appointment.patients as any)?.profiles) 
    ? (appointment.patients as any)?.profiles[0] 
    : (appointment.patients as any)?.profiles;
    
  const doctorProfile = Array.isArray((appointment.doctors as any)?.profiles)
    ? (appointment.doctors as any)?.profiles[0]
    : (appointment.doctors as any)?.profiles;

  const patientName = patientProfile?.full_name || "Paciente";
  // O Supabase Auth guarda o email no profiles se a gente tiver cadastrado lá, senão teremos que usar um mock
  const patientEmail = patientProfile?.email || `paciente_${(appointment.patients as any)?.id}@evah.mock`;
  const patientPhone = (appointment.patients as any)?.phone || "(00) 00000-0000";
  
  const doctorName = doctorProfile?.full_name || "Médico(a)";
  
  const startDate = new Date(appointment.start_time);
  const dateStr = startDate.toISOString().split("T")[0];
  
  const hh = String(startDate.getUTCHours()).padStart(2, '0');
  const mm = String(startDate.getUTCMinutes()).padStart(2, '0');
  const timeStr = `${hh}:${mm}`;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const fullMeetLink = `${baseUrl}${appointment.telemedicine_url}`;

  try {
    const { sendPatientReminderEmail, sendPatientReminderSMS } = await import("@/lib/email");
    
    await Promise.all([
      sendPatientReminderEmail(patientEmail, patientName, doctorName, dateStr, timeStr, fullMeetLink),
      sendPatientReminderSMS(patientPhone, patientName, doctorName, dateStr, timeStr)
    ]);
    
    return { success: true };
  } catch (err: any) {
    console.error("Erro ao enviar lembretes:", err);
    return { error: "Falha ao disparar mensagens: " + err.message };
  }
}
