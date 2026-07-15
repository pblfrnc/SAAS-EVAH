import Link from "next/link";
import { Activity, ShieldCheck, ArrowRight, Video, CalendarHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginDialog } from "@/components/login-dialog";
import { RegisterDialog } from "@/components/register-dialog";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen mesh-bg">
      {/* HEADER PREMIUM */}
      <header className="px-6 lg:px-12 h-20 flex items-center justify-between glass sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <span className="font-heading font-bold text-2xl tracking-tight text-foreground">
            Evah <span className="text-primary">Health</span>
          </span>
        </Link>
        <nav className="hidden md:flex gap-8">
          <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Funcionalidades</Link>
          <Link href="#security" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">LGPD</Link>
          <Link href="#about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Para Clínicas</Link>
        </nav>
        <div className="flex items-center gap-2 md:gap-4">
          <LoginDialog />
          <div className="hidden sm:inline-flex">
            <RegisterDialog />
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="w-full py-24 md:py-32 lg:py-40 flex flex-col justify-center items-center text-center px-4 md:px-6 relative overflow-hidden">
          <div className="max-w-4xl space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <ShieldCheck className="h-4 w-4" /> 100% em conformidade com a LGPD
            </div>
            <h1 className="text-5xl md:text-7xl font-bold font-heading tracking-tight leading-tight text-foreground animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              Saúde digital que <br className="hidden md:block"/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                conecta pessoas
              </span>
            </h1>
            <p className="mx-auto max-w-[700px] text-lg md:text-xl text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              O Evah transforma a experiência médica, aproximando pacientes e profissionais através de teleconsultas fluidas, agendamentos inteligentes e prontuários ultrasseguros.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
              <RegisterDialog />
              <Link href="#about">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-full bg-background/50 backdrop-blur-sm border-primary/20 hover:bg-primary/5 transition-all">
                  Sou Profissional
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section id="features" className="w-full py-20 bg-card/50 relative">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4">Projetado para cuidar de você</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Uma plataforma completa, construída para remover atritos e colocar o foco onde importa: na saúde.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group bg-background rounded-3xl p-8 shadow-sm border border-border/50 hover:shadow-premium hover:-translate-y-1 transition-all duration-300">
                <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Video className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold font-heading mb-3">Teleconsultas HD</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Salas virtuais integradas diretamente no navegador, sem precisar instalar aplicativos. Qualidade superior e zero atrasos.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group bg-background rounded-3xl p-8 shadow-sm border border-border/50 hover:shadow-premium hover:-translate-y-1 transition-all duration-300">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <CalendarHeart className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold font-heading mb-3">Agendamento Fácil</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Sincronização em tempo real. Marque, cancele ou reagende em segundos, com lembretes automáticos por WhatsApp.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group bg-background rounded-3xl p-8 shadow-sm border border-border/50 hover:shadow-premium hover:-translate-y-1 transition-all duration-300">
                <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold font-heading mb-3">Isolamento LGPD</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Prontuários eletrônicos protegidos. O médico só acessa o histórico se tiver um agendamento ativo com você.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* PREMIUM FOOTER */}
      <footer className="border-t border-border/50 bg-background/80 py-8 px-6 md:px-12 flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-sm text-muted-foreground font-medium">
          © 2026 Evah Health SaaS. Todos os direitos reservados.
        </p>
        <div className="flex gap-6">
          <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Termos de Uso
          </Link>
          <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Política de Privacidade
          </Link>
        </div>
      </footer>
    </div>
  );
}
