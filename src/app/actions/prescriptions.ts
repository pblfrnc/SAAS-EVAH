/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function getDoctorPatients() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Pega os pacientes com quem este médico teve consultas (distintos)
  const { data, error } = await supabaseAdmin
    .from("appointments")
    .select(`
      patients (
        id,
        cpf,
        birth_date,
        address,
        phone,
        profiles (full_name)
      )
    `)
    .eq("doctor_id", user.id);

  if (error) {
    console.error("Error fetching patients:", error);
    return [];
  }

  // Deduplicar a lista de pacientes usando Map
  const uniquePatients = new Map();
  data.forEach((app: any) => {
    const patientObj = Array.isArray(app.patients) ? app.patients[0] : app.patients;
    if (patientObj && !uniquePatients.has(patientObj.id)) {
      uniquePatients.set(patientObj.id, patientObj);
    }
  });

  return Array.from(uniquePatients.values());
}

export async function savePrescription(patientId: string, docHash: string, medications: any[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };

  const { error } = await supabase.from("prescriptions").insert({
    patient_id: patientId,
    doctor_id: user.id,
    doc_hash: docHash,
    medications: medications
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function getDoctorPrescriptionsHistory() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabaseAdmin
    .from("prescriptions")
    .select(`
      id, created_at, doc_hash, medications,
      patients (
        id, cpf, profiles (full_name)
      )
    `)
    .eq("doctor_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data;
}
