import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Mercado Pago sends notifications for multiple topics.
    // We only care about payments that are created or updated.
    if (body.type === "payment" && body.action === "payment.created") {
      const paymentId = body.data.id;
      
      const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
      if (!token || token === 'COLE_SUA_CHAVE_AQUI') {
        return NextResponse.json({ received: true });
      }

      // 1. Fetch payment details from MP to get external_reference and status
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!mpResponse.ok) {
        throw new Error("Failed to fetch payment details from Mercado Pago");
      }
      
      const paymentData = await mpResponse.json();
      const appointmentId = paymentData.external_reference;
      const status = paymentData.status; // e.g. "approved", "pending", "rejected"
      
      if (!appointmentId) {
        return NextResponse.json({ error: "Missing external_reference" }, { status: 400 });
      }

      const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // 2. Update the appointment status
      if (status === "approved") {
        const { data: appointment, error: updateError } = await supabaseAdmin
          .from("appointments")
          .update({ 
            payment_status: "paid", 
            payment_id: String(paymentId),
            status: "scheduled"
          })
          .eq("id", appointmentId)
          .select("*, doctors(profiles(full_name), consultation_fee), patients(profiles(full_name, email), phone)")
          .single();

        if (updateError || !appointment) {
          console.error("Error updating appointment via webhook:", updateError);
          return NextResponse.json({ error: "Database error" }, { status: 500 });
        }

        // 3. Record payout split for the doctor (Future platform fee can be calculated here)
        // Here we simulate a 10% platform fee
        const total = Number(paymentData.transaction_amount || appointment.doctors?.consultation_fee || 150);
        const platformFee = total * 0.10;
        const doctorAmount = total - platformFee;
        
        await supabaseAdmin.from("payouts").insert({
          doctor_id: appointment.doctor_id,
          appointment_id: appointment.id,
          amount_total: total,
          platform_fee: platformFee,
          doctor_amount: doctorAmount,
          status: "pending"
        });

        // 4. Send Confirmation Emails
        try {
          const { sendPatientConfirmation, sendDoctorNotification } = await import("@/lib/email");
          
          const patientProfile = Array.isArray(appointment.patients?.profiles) ? appointment.patients.profiles[0] : appointment.patients?.profiles;
          const doctorProfile = Array.isArray(appointment.doctors?.profiles) ? appointment.doctors.profiles[0] : appointment.doctors?.profiles;
          
          const patientName = patientProfile?.full_name || "Paciente";
          const doctorName = doctorProfile?.full_name || "Médico";
          const patientEmail = patientProfile?.email || `paciente_${appointment.patient_id}@evah.mock`;
          const doctorEmail = `medico_${appointment.doctor_id}@evah.mock`;
          
          const startDate = new Date(appointment.start_time);
          const dateStr = startDate.toISOString().split("T")[0];
          const hh = String(startDate.getUTCHours()).padStart(2, '0');
          const mm = String(startDate.getUTCMinutes()).padStart(2, '0');
          const timeStr = `${hh}:${mm}`;
          
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
          const fullMeetLink = `${baseUrl}${appointment.telemedicine_url}`;

          Promise.all([
            sendPatientConfirmation(patientEmail, patientName, doctorName, dateStr, timeStr, fullMeetLink),
            sendDoctorNotification(doctorEmail, doctorName, patientName, dateStr, timeStr)
          ]).catch(err => console.error("Erro no webhook emails:", err));

        } catch (err) {
          console.error("Error sending emails in webhook:", err);
        }

      } else if (status === "rejected" || status === "cancelled") {
        await supabaseAdmin
          .from("appointments")
          .update({ payment_status: "failed", status: "cancelled" })
          .eq("id", appointmentId);
      }

      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
