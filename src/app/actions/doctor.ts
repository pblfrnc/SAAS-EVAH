"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type DailyAvailability = {
  dayId: number; // 0 = Domingo, ..., 6 = Sábado
  isActive: boolean;
  start: string;
  end: string;
  blockedSlots: string[];
};

export type DoctorAvailability = DailyAvailability[];

export async function updateDoctorAvailability(availability: DoctorAvailability) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Não autorizado" };

  const { error } = await supabase
    .from("doctors")
    .update({ availability: availability })
    .eq("id", user.id);

  if (error) {
    console.error("Error updating availability:", error);
    return { error: "Erro ao atualizar agenda. Tente novamente." };
  }

  revalidatePath("/settings");
  revalidatePath("/patient"); // Atualiza catálogo se necessário
  return { success: true };
}

export async function getDoctorSettings() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("doctors")
    .select("consultation_fee, availability")
    .eq("id", user.id)
    .single();

  return data;
}

export async function updateConsultationFee(fee: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Não autorizado" };

  const { error } = await supabase
    .from("doctors")
    .update({ consultation_fee: fee })
    .eq("id", user.id);

  if (error) {
    console.error("Error updating fee:", error);
    return { error: "Erro ao atualizar valor da consulta." };
  }

  revalidatePath("/doctor/settings");
  revalidatePath("/patient"); 
  return { success: true };
}
