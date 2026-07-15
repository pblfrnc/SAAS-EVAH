"use server";

import { createClient } from "@/lib/supabase/server";

export async function getOrCreateMemedToken(doctorId: string): Promise<{ token?: string, error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Não autorizado" };
    }

    // 1. Busca os dados do médico no banco
    const { data: doctor, error: doctorError } = await supabase
      .from("doctors")
      .select("id, crm, memed_token, profiles(full_name)")
      .eq("id", doctorId)
      .single();

    if (doctorError || !doctor) {
      return { error: "Médico não encontrado" };
    }

    // Se já tiver token gerado, retorna ele para evitar bater na API da Memed de novo
    if (doctor.memed_token) {
      return { token: doctor.memed_token };
    }

    // 2. Não possui token. Vamos gerar via API Homologação da Memed.
    const apiKey = process.env.MEMED_API_KEY;
    const secretKey = process.env.MEMED_SECRET_KEY;
    if (!apiKey || !secretKey) {
      return { error: "MEMED_API_KEY ou MEMED_SECRET_KEY não configuradas no servidor." };
    }

    // O CRM vem no formato "CRM/UF 123456" ou apenas números. Vamos limpar.
    // Idealmente separar estado e números, mas para sandbox podemos passar hardcoded caso falte.
    const rawCrm = doctor.crm || "123456";
    const fullName = Array.isArray((doctor as any).profiles) ? (doctor as any).profiles[0]?.full_name : (doctor as any).profiles?.full_name;
    const nameParts = (fullName || "Médico Memed").split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Sobrenome";

    const memedPayload = {
      data: {
        type: "usuarios",
        attributes: {
          external_id: doctor.id,
          nome: firstName,
          sobrenome: lastName,
          crm: rawCrm.replace(/\D/g, '') || "123456",
          uf: "SP" // Simplificação para ambiente Sandbox
        }
      }
    };

    let response = await fetch(`https://sandbox.api.memed.com.br/v1/sinapse-prescricao/usuarios?api-key=${apiKey}&secret-key=${secretKey}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(memedPayload)
    });

    let data = await response.json();

    if (!response.ok) {
      // Se já existir, a Memed retorna erro de external_id. Vamos buscar o usuário existente.
      if (data?.errors?.[0]?.code === "external_id") {
        const getRes = await fetch(`https://sandbox.api.memed.com.br/v1/sinapse-prescricao/usuarios/${doctor.id}?api-key=${apiKey}&secret-key=${secretKey}`, {
          method: 'GET',
          headers: { 'Accept': 'application/vnd.api+json' }
        });
        
        if (getRes.ok) {
          data = await getRes.json();
        } else {
          console.error("Erro ao buscar médico existente na Memed:", await getRes.text());
          return { error: "Falha ao recuperar token do médico na Memed." };
        }
      } else {
        console.error("Erro na API da Memed:", JSON.stringify(data));
        return { error: "Falha ao registrar médico na Memed." };
      }
    }

    const generatedToken = data?.data?.attributes?.token;

    if (!generatedToken) {
      return { error: "Memed não retornou o token esperado." };
    }

    // 3. Salva o token gerado no banco de dados para reuso
    const { error: updateError } = await supabase
      .from("doctors")
      .update({ memed_token: generatedToken })
      .eq("id", doctorId);

    if (updateError) {
      console.error("Erro ao salvar token no Supabase:", updateError);
      // Retorna o token mesmo assim para a sessão atual funcionar
    }

    return { token: generatedToken };

  } catch (err: any) {
    console.error("Erro em getOrCreateMemedToken:", err);
    return { error: "Erro interno ao gerar token da Memed" };
  }
}
