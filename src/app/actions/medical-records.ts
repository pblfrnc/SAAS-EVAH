"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createMedicalRecord(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };

  const appointmentId = formData.get("appointment_id") as string;
  const patientId = formData.get("patient_id") as string;
  const diagnosis = formData.get("diagnosis") as string;
  const notes = formData.get("notes") as string;
  
  if (!appointmentId || !patientId || !diagnosis || !notes) {
    return { error: "Todos os campos (diagnóstico e anotações) são obrigatórios." };
  }

  // Insert into medical_records
  const { error: recordError } = await supabase.from("medical_records").insert({
    doctor_id: user.id,
    patient_id: patientId,
    appointment_id: appointmentId,
    diagnosis,
    notes,
  });

  if (recordError) {
    console.error("Error creating record:", recordError);
    return { error: "Falha ao salvar o prontuário. Tente novamente." };
  }

  // Update appointment status to 'completed'
  const { error: updateError } = await supabase
    .from("appointments")
    .update({ status: "completed" })
    .eq("id", appointmentId);

  if (updateError) {
    console.error("Error updating appointment:", updateError);
    // Even if it failed to update the appointment, the record was created.
  }

  revalidatePath("/doctor");
  revalidatePath("/patient");
  return { success: true };
}

export async function getPatientMedicalRecords() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("medical_records")
    .select(`
      id,
      diagnosis,
      notes,
      created_at,
      doctors ( profiles (full_name), specialization )
    `)
    .eq("patient_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching records:", error);
    return [];
  }
  
  return data;
}
