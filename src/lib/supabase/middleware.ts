import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string) {
          request.cookies.set({
            name,
            value,
          });
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          supabaseResponse.cookies.set({
            name,
            value,
          });
        },
        remove(name: string) {
          request.cookies.set({
            name,
            value: '',
          });
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          supabaseResponse.cookies.set({
            name,
            value: '',
          });
        },
      },
    }
  );

  // IMPORTANTE: Evita a gravação de sessão no Supabase ao carregar assets estáticos
  // Isso não deve ser chamado no middleware em rotas públicas estáticas para economizar performance
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Controle de rotas protegidas
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/doctor') || request.nextUrl.pathname.startsWith('/patient') || request.nextUrl.pathname.startsWith('/admin');
  const isAdminLogin = request.nextUrl.pathname === '/admin/login';
  
  if (isDashboardRoute && !isAdminLogin && !user) {
    const url = request.nextUrl.clone();
    if (request.nextUrl.pathname.startsWith('/admin')) {
      url.pathname = '/admin/login';
    } else {
      url.pathname = '/';
    }
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
