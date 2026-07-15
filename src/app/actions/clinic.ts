"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getClinicSettings() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clinic_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error || !data) {
    // Retorna defaults se não achar a tabela (caso a migration não tenha rodado)
    return {
      clinic_name: "Clínica Evah",
      cnpj: "00.000.000/0001-00",
      address: "Endereço da Sede, 123 - Cidade, UF",
      phone: "(00) 0000-0000",
      email: "contato@evah.health",
      tech_responsible_name: "Dr. Administrador",
      tech_responsible_crm: "CRM/UF 000000"
    };
  }
  return data;
}

export async function updateClinicSettings(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Não autorizado" };

  // Verifica se o usuário é admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { error: "Apenas administradores podem alterar as configurações da clínica." };

  const clinic_name = formData.get("clinic_name") as string;
  const cnpj = formData.get("cnpj") as string;
  const address = formData.get("address") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const tech_responsible_name = formData.get("tech_responsible_name") as string;
  const tech_responsible_crm = formData.get("tech_responsible_crm") as string;

  const { error } = await supabase
    .from("clinic_settings")
    .upsert({
      id: 1,
      clinic_name,
      cnpj,
      address,
      phone,
      email,
      tech_responsible_name,
      tech_responsible_crm,
      updated_at: new Date().toISOString()
    });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/print-prescription");
  return { success: true };
}
