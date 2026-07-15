import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // O Webhook oficial (/api/webhooks/mercadopago) é responsável por confirmar a consulta.
  // Esta rota serve apenas para devolver o usuário à interface.

  // Após processar e revalidar o cache, redireciona o usuário para a aplicação limpa
  const url = request.nextUrl.clone();
  url.pathname = "/patient/appointments";
  url.search = ""; // Limpa os query params
  return NextResponse.redirect(url);
}
