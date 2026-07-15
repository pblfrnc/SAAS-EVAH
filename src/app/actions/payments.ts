"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getDoctorBookedSlots } from "./appointments";

export async function createCheckoutSession(
  doctorId: string, 
  doctorName: string, 
  fee: number,
  dateStr: string,
  timeStr: string
) {
  // Previne Race Condition: Verifica se o horário já foi agendado antes de ir pro pagamento
  const bookedSlots = await getDoctorBookedSlots(doctorId, dateStr);
  if (bookedSlots.includes(timeStr)) {
    return { error: "Oops! Este horário acabou de ser agendado por outro paciente. Por favor, escolha outro." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };

  // Create a pending appointment to reserve the slot and pass its ID to MP
  const startTime = new Date(`${dateStr}T${timeStr}:00`);
  const endTime = new Date(startTime.getTime() + 30 * 60000); 
  const meetId = Math.random().toString(36).substring(2, 10);
  const telemedicineUrl = `/meet/${meetId}`;

  const { data: appointment, error: insertError } = await supabase.from("appointments").insert({
    patient_id: user.id,
    doctor_id: doctorId,
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    status: "scheduled", // Postgres enum: scheduled, confirmed, completed, cancelled
    payment_status: "pending",
    telemedicine_url: telemedicineUrl
  }).select("id").single();

  if (insertError) {
    console.error("Error creating pending appointment:", insertError);
    return { error: "Erro ao iniciar o agendamento." };
  }

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const publicBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  // Callback URLs para redirecionar o usuário (Mercado Pago EXIGE URLs públicas ou https para auto_return)
  const successUrl = `${publicBaseUrl}/api/payments/callback?payment_success=true&app_id=${appointment.id}`;
  const failureUrl = `${publicBaseUrl}/patient/appointments?payment_failed=true`;
  const pendingUrl = `${publicBaseUrl}/patient/appointments?payment_pending=true`;
  
  // Webhook URL
  const webhookUrl = `${publicBaseUrl}/api/webhooks/mercadopago`;

  if (!token || token === 'COLE_SUA_CHAVE_AQUI') {
    // Em modo de simulação, aprova o pagamento imediatamente
    await supabase.from("appointments").update({
      payment_status: "paid",
      status: "scheduled"
    }).eq("id", appointment.id);

    return { 
      init_point: successUrl, 
      id: "mock_preference_123" 
    };
  }

  try {
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        items: [
          {
            title: `Consulta Telemedicina - ${doctorName}`,
            description: `Atendimento clínico online via Plataforma Evah (${dateStr} às ${timeStr})`,
            quantity: 1,
            currency_id: "BRL",
            unit_price: Number(fee)
          }
        ],
        external_reference: appointment.id,
        back_urls: {
          success: successUrl,
          failure: failureUrl,
          pending: pendingUrl
        },
        auto_return: "approved",
        notification_url: webhookUrl,
        statement_descriptor: "CLINICA EVAH"
      })
    });

    const data = await response.json();
    
    if (data.init_point) {
      return { init_point: data.init_point, id: data.id };
    } else {
      console.error("Mercado Pago Error:", data);
      return { error: data.message || "Falha ao gerar link de pagamento." };
    }
  } catch (error: any) {
    console.error("Payment API Error:", error);
    return { error: "Erro interno ao contatar gateway de pagamento." };
  }
}
