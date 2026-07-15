import { getClinicSettings, updateClinicSettings } from "@/app/actions/clinic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Save } from "lucide-react";

export default async function AdminClinicSettingsPage() {
  const settings = await getClinicSettings();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold font-heading">Configurações da Clínica</h1>
        <p className="text-muted-foreground">Gerencie os dados oficiais da clínica para adequação Anvisa/CFM.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Building2 className="h-5 w-5 text-primary" />
            Dados Cadastrais e Legais
          </CardTitle>
          <CardDescription>
            Estas informações serão utilizadas na geração automática de Receituários e Atestados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={async (formData) => { "use server"; await updateClinicSettings(formData); }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="clinic_name">Nome da Clínica / Razão Social</Label>
                <Input id="clinic_name" name="clinic_name" defaultValue={settings?.clinic_name} required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input id="cnpj" name="cnpj" defaultValue={settings?.cnpj} required placeholder="00.000.000/0001-00" />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Endereço Completo</Label>
                <Input id="address" name="address" defaultValue={settings?.address} required placeholder="Rua, Número, Bairro - Cidade, UF" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone Principal</Label>
                <Input id="phone" name="phone" defaultValue={settings?.phone} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail Oficial</Label>
                <Input id="email" name="email" type="email" defaultValue={settings?.email} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tech_responsible_name">Nome do Responsável Técnico (RT)</Label>
                <Input id="tech_responsible_name" name="tech_responsible_name" defaultValue={settings?.tech_responsible_name} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tech_responsible_crm">CRM do RT (com UF)</Label>
                <Input id="tech_responsible_crm" name="tech_responsible_crm" defaultValue={settings?.tech_responsible_crm} required placeholder="CRM/SP 000000" />
              </div>
            </div>

            <div className="pt-4 border-t flex justify-end">
              <Button type="submit" className="gap-2 px-8 h-12 rounded-full shadow-premium hover:shadow-premium-hover transition-all">
                <Save className="h-4 w-4" />
                Salvar Configurações
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
