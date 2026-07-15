"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cria um cliente Supabase com a Service Role Key (Bypass RLS) - Apenas para funções de Admin seguras
const createAdminClient = async () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

export async function adminGetDoctors() {
  const supabase = await createAdminClient();
  
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      doctors (
        crm,
        specialization,
        consultation_fee,
        is_active
      )
    `)
    .eq("role", "doctor");

  if (error) {
    console.error("Error fetching doctors:", error);
    return [];
  }
  
  return data.map((d: any) => ({
    id: d.id,
    name: d.full_name,
    crm: d.doctors?.[0]?.crm || "N/A",
    specialization: d.doctors?.[0]?.specialization || "N/A",
    fee: d.doctors?.[0]?.consultation_fee || 150.00,
    isActive: d.doctors?.[0]?.is_active ?? false,
  }));
}

export async function adminGetPatients() {
  const supabase = await createAdminClient();
  
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      created_at,
      patients (
        cpf,
        birth_date,
        phone,
        address,
        data_processing_consent,
        consent_date
      )
    `)
    .eq("role", "patient");

  if (error) {
    console.error("Error fetching patients:", error);
    return [];
  }
  
  return data.map((d: any) => ({
    id: d.id,
    name: d.full_name,
    createdAt: d.created_at,
    cpf: d.patients?.[0]?.cpf || "Não informado",
    birth_date: d.patients?.[0]?.birth_date || "",
    phone: d.patients?.[0]?.phone || "",
    address: d.patients?.[0]?.address || "",
    lgpdConsent: d.patients?.[0]?.data_processing_consent || false,
  }));
}

export async function adminDeleteUser(userId: string) {
  const supabase = await createAdminClient();
  
  // Apaga o usuário do Supabase Auth (O que causa um CASCADE DELETE no banco de dados nas tabelas profiles, doctors, patients, etc)
  const { error } = await supabase.auth.admin.deleteUser(userId);
  
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath("/admin/doctors");
  revalidatePath("/admin/patients");
  return { success: true };
}

export async function adminUpdateDoctorFee(doctorId: string, fee: number) {
  const supabase = await createAdminClient();
  
  const { error } = await supabase
    .from("doctors")
    .update({ consultation_fee: fee })
    .eq("id", doctorId);
    
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath("/admin/doctors");
  revalidatePath("/admin/finances");
  return { success: true };
}

export async function adminToggleDoctorStatus(doctorId: string, currentStatus: boolean) {
  const supabase = await createAdminClient();
  
  const { error } = await supabase
    .from("doctors")
    .update({ is_active: !currentStatus })
    .eq("id", doctorId);
    
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath("/admin/doctors");
  revalidatePath("/patient");
  return { success: true };
}
export async function adminCreateDoctor(formData: FormData) {
  const supabase = await createAdminClient();
  
  const fullName = formData.get("full_name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const crm = formData.get("crm") as string;
  const crmState = formData.get("crm_state") as string;
  const specialization = formData.get("specialization") as string || "Clínico Geral";
  
  if (!email || !password || !fullName || !crm || !crmState) {
    return { error: "Todos os campos obrigatórios devem ser preenchidos." };
  }

  // Cria o usuário silenciosamente sem deslogar o Admin
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      full_name: fullName,
      role: "doctor"
    });

    if (profileError) {
      await supabase.auth.admin.deleteUser(data.user.id);
      return { error: "Erro ao criar perfil: " + profileError.message };
    }
    
    const formattedCrm = `${crm}-${crmState}`;
    
    const { error: doctorError } = await supabase.from("doctors").insert({
      id: data.user.id,
      crm: formattedCrm,
      specialization: specialization,
      consultation_fee: 150.00,
      is_active: true
    });

    if (doctorError) {
      await supabase.auth.admin.deleteUser(data.user.id);
      return { error: "Erro ao criar registro médico (CRM pode já estar em uso): " + doctorError.message };
    }
  }

  revalidatePath("/admin/doctors");
  return { success: true };
}

export async function adminUpdateDoctorAvailability(doctorId: string, availability: any) {
  const supabase = await createAdminClient();
  
  const { error } = await supabase
    .from("doctors")
    .update({ availability })
    .eq("id", doctorId);
    
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath("/admin/agenda");
  revalidatePath("/patient"); // Atualiza cache da agenda se paciente tentar agendar
  return { success: true };
}
