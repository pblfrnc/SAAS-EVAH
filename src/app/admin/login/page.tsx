"use client";

import { useState, useTransition } from "react";
import { ShieldAlert, ArrowRight, Lock, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminLoginGateway } from "@/app/actions/auth";

export default function AdminGatewayPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleLogin = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const res = await adminLoginGateway(formData);
      if (res?.error) {
        setError(res.error);
      }
    });
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 selection:bg-white selection:text-black">
      {/* Elementos Decorativos */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        <div className="mb-10 text-center space-y-4">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto border border-white/20 backdrop-blur-md shadow-2xl">
            <ShieldAlert className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-heading font-bold text-white tracking-tight">Admin Gateway</h1>
          <p className="text-white/60">Acesso restrito à diretoria. Insira suas credenciais de cofre (Environment Variables) para prosseguir.</p>
        </div>

        <form action={handleLogin} className="space-y-6 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl">
          <div className="space-y-4">
            <div className="space-y-2 relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
              <Input 
                name="email" 
                type="email" 
                placeholder="E-mail Master" 
                required
                className="bg-black/50 border-white/10 text-white h-14 pl-12 rounded-xl focus-visible:ring-white/20 focus-visible:border-white/30 placeholder:text-white/30"
              />
            </div>
            <div className="space-y-2 relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
              <Input 
                name="password" 
                type="password" 
                placeholder="Senha do Cofre" 
                required
                className="bg-black/50 border-white/10 text-white h-14 pl-12 rounded-xl focus-visible:ring-white/20 focus-visible:border-white/30 placeholder:text-white/30"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium animate-in fade-in">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            disabled={isPending}
            className="w-full h-14 bg-white text-black hover:bg-white/90 rounded-xl text-lg font-bold gap-2 transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)]"
          >
            {isPending ? "Validando Cofre..." : (
              <>Autorizar Acesso <ArrowRight className="h-5 w-5" /></>
            )}
          </Button>

          <p className="text-center text-white/30 text-xs mt-6 font-mono">
            SECURE LOGIN • AES-256 • IP LOGGED
          </p>
        </form>
      </div>
    </div>
  );
}
