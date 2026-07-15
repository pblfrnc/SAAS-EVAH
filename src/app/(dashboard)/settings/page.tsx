import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/server";
import { User, Mail, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user?.id).single();

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pt-8 pb-12">
      <div className="flex items-center gap-4">
        <Link href={`/${profile?.role || ''}`}>
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">Alterar Dados</h1>
          <p className="text-muted-foreground">Gerencie suas informações pessoais e credenciais de acesso.</p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" /> Perfil Público
          </CardTitle>
          <CardDescription>Como você aparece dentro da plataforma Evah.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input id="name" defaultValue={profile?.full_name || ""} placeholder="Seu nome completo" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" /> E-mail de Acesso
            </Label>
            <Input id="email" defaultValue={user?.email || ""} disabled className="bg-muted/50 text-muted-foreground cursor-not-allowed" />
            <p className="text-xs text-muted-foreground">O e-mail é a sua chave primária e não pode ser alterado por aqui.</p>
          </div>

          <Button className="w-full sm:w-auto">Salvar Alterações</Button>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-destructive/20 mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Shield className="h-5 w-5" /> Segurança
          </CardTitle>
          <CardDescription>Gerencie sua senha e métodos de autenticação.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nova Senha</Label>
            <Input id="password" type="password" placeholder="••••••••" />
          </div>
          <Button variant="outline" className="w-full sm:w-auto text-destructive border-destructive/30 hover:bg-destructive/10">Atualizar Senha</Button>
        </CardContent>
      </Card>
    </div>
  );
}
