"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { signupPatient } from "@/app/actions/auth";

export function RegisterDialog() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const res = await signupPatient(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="lg" className="rounded-full h-14 px-8 text-lg font-medium shadow-premium hover:shadow-premium-hover transition-all" />}>
        Começar Agora
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-heading">Criar sua conta</DialogTitle>
          <DialogDescription>
            Comece a cuidar da sua saúde de forma inteligente e segura.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm font-medium">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name-patient">Nome Completo</Label>
            <Input id="name-patient" name="full_name" placeholder="João da Silva" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-patient">E-mail</Label>
            <Input id="email-patient" name="email" type="email" placeholder="nome@exemplo.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-patient">Senha</Label>
            <Input id="password-patient" name="password" type="password" required minLength={6} />
          </div>
          
          <div className="pt-4 flex flex-col gap-3">
            <Button type="submit" className="w-full h-11 text-base gap-2" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Cadastrar Paciente
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Ao se cadastrar, você concorda com nossos termos de uso e com a política de privacidade (LGPD).
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
