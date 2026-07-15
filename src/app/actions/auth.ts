"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "E-mail e senha são obrigatórios." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Credenciais inválidas. Tente novamente." };
  }

  // Fetch the user's role to redirect appropriately
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  revalidatePath("/", "layout");
  
  if (profile?.role === "admin") {
    redirect("/admin");
  } else if (profile?.role === "doctor") {
    redirect("/doctor");
  } else {
    redirect("/patient");
  }
}

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function signupPatient(formData: FormData) {
  const supabase = await createClient(); // Cliente normal (para autenticar sessão)
  
  // Cliente Root para burlar Rate Limits e RLS de teste sem herdar o JWT via cookie
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const fullName = formData.get("full_name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  if (!email || !password || !fullName) {
    return { error: "Todos os campos são obrigatórios." };
  }

  // Cria o usuário de forma administrativa (Bypassa rate limits e necessidade de confirmar email)
  const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (adminError) {
    // Se o usuário já existe no banco, tentamos apenas logá-lo mais abaixo
    if (!adminError.message.includes("already registered")) {
      return { error: "Erro interno (Rate Limit Bypass): " + adminError.message };
    }
  } else if (adminData.user) {
    // Se criou com sucesso, injeta nas tabelas as permissões
    await supabaseAdmin.from("profiles").insert({
      id: adminData.user.id,
      full_name: fullName,
      role: "patient"
    });
    
    await supabaseAdmin.from("patients").insert({
      id: adminData.user.id,
      data_processing_consent: true,
      consent_date: new Date().toISOString()
    });
  }

  // Realiza o login na sessão atual do navegador
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    return { error: "Conta criada, mas falha ao autenticar sessão: " + signInError.message };
  }

  revalidatePath("/", "layout");
  redirect("/patient");
}



export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

// ==========================================
// ADMIN GATEWAY (INFRASTRUCTURE AS CODE)
// ==========================================
export async function adminLoginGateway(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  const envEmail = process.env.ADMIN_EMAIL;
  const envPassword = process.env.ADMIN_PASSWORD;

  console.log("ENV Admin Email:", envEmail);
  console.log("Input Email:", email);

  if (!email || !password) return { error: "Preencha todos os campos." };
  if (email !== envEmail || password !== envPassword) {
    return { error: "Credenciais de cofre inválidas. Acesso restrito. Lembre-se de reiniciar o servidor (npm run dev) para carregar as variáveis de ambiente." };
  }

  const supabase = await createClient();

  // Tenta logar primeiro
  let { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  // Se falhar (provavelmente a conta master não existe ainda), cria a conta
  if (authError) {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (signUpError) return { error: signUpError.message };
    user = signUpData.user;
  }

  if (user) {
    // Força o cargo para admin (apenas Update, pois o Insert falharia no RLS padrão)
    const { error: updateError } = await supabase.from("profiles").update({ 
      role: "admin", 
      full_name: "Administrador (Master)" 
    }).eq("id", user.id);
    if (updateError) return { error: "Erro RLS de Banco de Dados (Update): " + updateError.message };
  }

  revalidatePath("/", "layout");
  redirect("/admin");
}
