"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updatePatientDetails(patientId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autorizado" };
  }

  // Obter service_role key para ignorar RLS e atualizar os dados
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const fullName = formData.get("fullName") as string;
  const cpf = formData.get("cpf") as string;
  const phone = formData.get("phone") as string;
  const birthDate = formData.get("birthDate") as string;
  const address = formData.get("address") as string;

  try {
    // 1. Atualizar nome na tabela profiles
    if (fullName) {
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", patientId);
        
      if (profileError) throw profileError;
    }

    // 2. Atualizar dados na tabela patients
    const patientUpdates: any = {};
    if (cpf) patientUpdates.cpf = cpf;
    if (phone) patientUpdates.phone = phone;
    if (birthDate) patientUpdates.birth_date = birthDate;
    if (address) patientUpdates.address = address;

    if (Object.keys(patientUpdates).length > 0) {
      const { error: patientError } = await supabaseAdmin
        .from("patients")
        .update(patientUpdates)
        .eq("id", patientId);

      if (patientError) throw patientError;
    }

    revalidatePath(`/meet/[id]`);
    return { success: true };

  } catch (error: any) {
    console.error("Erro ao atualizar paciente:", error);
    return { error: "Falha ao salvar os dados do paciente." };
  }
}
