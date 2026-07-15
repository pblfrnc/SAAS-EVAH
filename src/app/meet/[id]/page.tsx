import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TelemedicineSidebar } from "@/components/telemedicine-sidebar";
import { getOrCreateMemedToken } from "@/app/actions/memed";

export default async function MeetRoom(
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Verifica o perfil do usuário para voltar ao painel correto e pegar o nome
  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single();
  const isDoctor = profile?.role === "doctor";
  const backUrl = isDoctor ? "/doctor" : "/patient";

  const roomName = `EvahHealth-${params.id}`;
  const displayName = isDoctor ? `👨‍⚕️ Dr(a). ${profile?.full_name || 'Médico'}` : `👤 ${profile?.full_name || 'Paciente'}`;
  
  let patientData = null;
  if (isDoctor) {
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: appointment } = await supabaseAdmin
      .from("appointments")
      .select(`
        id,
        patients (
          id, cpf, birth_date, address, phone,
          profiles (full_name)
        )
      `)
      .eq("id", params.id)
      .single();
    
    if (appointment?.patients) {
      patientData = Array.isArray(appointment.patients) ? appointment.patients[0] : appointment.patients;
    }
  }

  let memedToken = "";
  if (isDoctor && user) {
    const memedRes = await getOrCreateMemedToken(user.id);
    if (memedRes.token) {
      memedToken = memedRes.token;
    }
  }

  // Passamos configurações via URL Hash para o Jitsi
  // Para o paciente, iniciamos mutado para não atrapalhar caso o médico já esteja lá
  const patientConfig = !isDoctor ? '&config.startWithAudioMuted=true' : '';
  const jitsiUrl = `https://meet.jit.si/${roomName}#config.prejoinPageEnabled=false&config.disableDeepLinking=true&userInfo.displayName="${encodeURIComponent(displayName)}"${patientConfig}`;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header da Sala */}
      <header className="h-16 border-b flex items-center justify-between px-6 bg-card shrink-0">
        <div className="flex items-center gap-4">
          <Link href={backUrl}>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-bold text-lg leading-tight">Teleconsulta Evah</h1>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1 bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full border border-green-500/20 cursor-help outline-none">
                    <LockKeyhole className="h-3 w-3" />
                    <span className="text-[10px] font-bold">NGS2</span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="start" className="max-w-xs">
                    <p className="text-sm font-semibold mb-1">Segurança CFM nº 2.314/2022</p>
                    <p className="text-xs text-muted-foreground">Conexão Criptografada Ponta-a-Ponta com Nível de Garantia de Segurança 2 (NGS2). Seus dados de saúde estão protegidos pela LGPD.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <ShieldCheck className="h-3 w-3 text-green-500" /> 
              {isDoctor ? 'Você é o anfitrião da sala' : 'Conexão 100% Segura'}
            </p>
          </div>
        </div>
        
        {/* Se for médico e quiser abrir o PEP completo em nova guia, mantemos o botão como alternativa */}
        {isDoctor && (
          <Link href="/doctor" target="_blank">
            <Button variant="outline" className="rounded-full h-9 shadow-sm text-xs border-primary text-primary hover:bg-primary/10">
              Painel Completo em Nova Guia
            </Button>
          </Link>
        )}
      </header>

      {/* Frame de Vídeo e Sidebar */}
      <main className={`flex-1 w-full h-full bg-[#111111] ${isDoctor && patientData ? 'grid grid-cols-1 lg:grid-cols-3' : ''}`}>
        <div className={isDoctor && patientData ? "lg:col-span-2 h-full" : "h-full"}>
          <iframe 
            src={jitsiUrl}
            allow="camera *; microphone *; fullscreen *; display-capture *; autoplay *"
            className="w-full h-full border-none"
          />
        </div>
        
        {isDoctor && patientData && (
          <div className="hidden lg:block h-full border-l">
            <TelemedicineSidebar appointmentId={params.id} patient={patientData} memedToken={memedToken} />
          </div>
        )}
      </main>
    </div>
  );
}
