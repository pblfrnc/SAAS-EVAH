import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "simulated_key");

interface EmailResult {
  success: boolean;
  error?: string;
  simulated?: boolean;
}

export async function sendPatientConfirmation(
  patientEmail: string, 
  patientName: string, 
  doctorName: string, 
  dateStr: string, 
  timeStr: string,
  meetLink: string
): Promise<EmailResult> {
  const isSimulation = !process.env.RESEND_API_KEY;
  const dateFormatted = new Date(dateStr + "T00:00:00").toLocaleDateString('pt-BR');

  const subject = `Sua consulta com ${doctorName} está confirmada!`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 10px; overflow: hidden;">
      <div style="background-color: #2563eb; color: #ffffff; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Consulta Confirmada!</h1>
      </div>
      <div style="padding: 20px; color: #333333;">
        <p>Olá <strong>${patientName}</strong>,</p>
        <p>Sua consulta por telemedicina foi agendada com sucesso. Aqui estão os detalhes:</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;">👨‍⚕️ <strong>Médico(a):</strong> ${doctorName}</p>
          <p style="margin: 5px 0;">📅 <strong>Data:</strong> ${dateFormatted}</p>
          <p style="margin: 5px 0;">⏰ <strong>Horário:</strong> ${timeStr}</p>
        </div>

        <p>No horário marcado, clique no botão abaixo para acessar a sala virtual de atendimento:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${meetLink}" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-weight: bold; font-size: 16px;">
            Acessar Sala de Telemedicina
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666666;">Se precisar reagendar ou cancelar, acesse o painel da plataforma EvaH Health.</p>
      </div>
      <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #9ca3af;">
        EvaH Health - Sistema de Gestão Médica
      </div>
    </div>
  `;

  if (isSimulation) {
    console.log("=========================================");
    console.log(`[SIMULAÇÃO DE EMAIL - PACIENTE] Destino: ${patientEmail}`);
    console.log(`Assunto: ${subject}`);
    console.log(`Conteúdo gerado com sucesso.`);
    console.log("Para enviar emails reais, adicione a chave RESEND_API_KEY no arquivo .env.local.");
    console.log("=========================================");
    return { success: true, simulated: true };
  }

  try {
    const { error } = await resend.emails.send({
      from: "EvaH Health <agendamento@suaclinica.com>", // You need to verify this domain on Resend
      to: [patientEmail],
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error("[Email Error]:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("[Email Exception]:", err);
    return { success: false, error: err.message };
  }
}

export async function sendDoctorNotification(
  doctorEmail: string, 
  doctorName: string, 
  patientName: string, 
  dateStr: string, 
  timeStr: string
): Promise<EmailResult> {
  const isSimulation = !process.env.RESEND_API_KEY;
  const dateFormatted = new Date(dateStr + "T00:00:00").toLocaleDateString('pt-BR');

  const subject = `Novo Agendamento: ${patientName} no dia ${dateFormatted}`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 10px; overflow: hidden;">
      <div style="background-color: #10b981; color: #ffffff; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Novo Agendamento Confirmado!</h1>
      </div>
      <div style="padding: 20px; color: #333333;">
        <p>Olá <strong>${doctorName}</strong>,</p>
        <p>Você tem uma nova consulta marcada na plataforma EvaH Health.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;">👤 <strong>Paciente:</strong> ${patientName}</p>
          <p style="margin: 5px 0;">📅 <strong>Data:</strong> ${dateFormatted}</p>
          <p style="margin: 5px 0;">⏰ <strong>Horário:</strong> ${timeStr}</p>
        </div>

        <p>Acesse o seu painel de médico para ver o histórico do paciente e os detalhes da consulta.</p>
      </div>
    </div>
  `;

  if (isSimulation) {
    console.log("=========================================");
    console.log(`[SIMULAÇÃO DE EMAIL - MÉDICO] Destino: ${doctorEmail}`);
    console.log(`Assunto: ${subject}`);
    console.log(`Conteúdo gerado com sucesso.`);
    console.log("=========================================");
    return { success: true, simulated: true };
  }

  try {
    const { error } = await resend.emails.send({
      from: "EvaH Health Notificações <notificacoes@suaclinica.com>", 
      to: [doctorEmail],
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error("[Email Error]:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("[Email Exception]:", err);
    return { success: false, error: err.message };
  }
}

export async function sendPatientReminderEmail(
  patientEmail: string, 
  patientName: string, 
  doctorName: string, 
  dateStr: string, 
  timeStr: string,
  meetLink: string
): Promise<EmailResult> {
  const isSimulation = !process.env.RESEND_API_KEY;
  const dateFormatted = new Date(dateStr + "T00:00:00").toLocaleDateString('pt-BR');

  const subject = `Lembrete: Sua consulta com ${doctorName} está chegando!`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 10px; overflow: hidden;">
      <div style="background-color: #f59e0b; color: #ffffff; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Lembrete de Consulta ⏰</h1>
      </div>
      <div style="padding: 20px; color: #333333;">
        <p>Olá <strong>${patientName}</strong>,</p>
        <p>Este é um lembrete para a sua consulta por telemedicina que ocorrerá em breve. Confira os detalhes:</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;">👨‍⚕️ <strong>Médico(a):</strong> ${doctorName}</p>
          <p style="margin: 5px 0;">📅 <strong>Data:</strong> ${dateFormatted}</p>
          <p style="margin: 5px 0;">⏰ <strong>Horário:</strong> ${timeStr}</p>
        </div>

        <p>Por favor, acesse a sala de telemedicina no horário marcado através do botão abaixo:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${meetLink}" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-weight: bold; font-size: 16px;">
            Acessar Sala de Telemedicina
          </a>
        </div>
      </div>
      <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #9ca3af;">
        EvaH Health - Sistema de Gestão Médica
      </div>
    </div>
  `;

  if (isSimulation) {
    console.log("=========================================");
    console.log(`[SIMULAÇÃO DE EMAIL - LEMBRETE] Destino: ${patientEmail}`);
    console.log(`Assunto: ${subject}`);
    console.log(`Conteúdo gerado com sucesso.`);
    console.log("=========================================");
    return { success: true, simulated: true };
  }

  try {
    const { error } = await resend.emails.send({
      from: "EvaH Health <agendamento@suaclinica.com>", 
      to: [patientEmail],
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error("[Email Error]:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("[Email Exception]:", err);
    return { success: false, error: err.message };
  }
}

export async function sendPatientReminderSMS(
  patientPhone: string,
  patientName: string,
  doctorName: string,
  dateStr: string,
  timeStr: string
): Promise<EmailResult> {
  // SMS is completely mocked as requested
  const dateFormatted = new Date(dateStr + "T00:00:00").toLocaleDateString('pt-BR');
  
  const shortName = patientName.split(" ")[0];
  const smsBody = `EvaH Health: Ola ${shortName}, lembrete de consulta c/ ${doctorName} dia ${dateFormatted} as ${timeStr}. Acesse a plataforma para entrar na sala!`;

  console.log("=========================================");
  console.log(`[SIMULAÇÃO DE SMS - TWILIO/ZENVIA] Destino: ${patientPhone}`);
  console.log(`Mensagem: "${smsBody}"`);
  console.log("Status: Enviado com sucesso via API simulada.");
  console.log("=========================================");

  return { success: true, simulated: true };
}
