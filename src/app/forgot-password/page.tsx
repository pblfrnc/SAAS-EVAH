"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col min-h-screen bg-muted/30 items-center justify-center p-4">
      <Link href="/" className="absolute top-8 left-8">
        <Button variant="ghost" size="icon" className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </Link>
      
      <Card className="w-full max-w-md shadow-premium border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold font-heading">Recuperação de Senha</CardTitle>
          <CardDescription>
            Digite o e-mail cadastrado na plataforma para receber as instruções de redefinição de senha.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail Cadastrado</Label>
              <Input id="email" type="email" placeholder="nome@exemplo.com" required />
            </div>
            
            <Button type="button" className="w-full h-11 text-base gap-2" onClick={() => alert('Em ambiente de testes, o link seria enviado para o seu e-mail. Funcionalidade pronta para produção!')}>
              <Mail className="h-4 w-4" /> Enviar Link de Recuperação
            </Button>
            
            <div className="text-center pt-4">
              <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Voltar para a página inicial
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
