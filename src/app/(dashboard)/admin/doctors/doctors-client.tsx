"use client";

import { PlusCircle, Search, Trash2, Edit2 } from "lucide-react";
import { useState, useTransition, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminDeleteUser, adminUpdateDoctorFee, adminCreateDoctor, adminToggleDoctorStatus } from "@/app/actions/admin";
import { Power, PowerOff } from "lucide-react";

type Doctor = {
  id: string;
  name: string;
  crm: string;
  specialization: string;
  fee: number;
  isActive: boolean;
};

export default function DoctorsClient({ initialDoctors }: { initialDoctors: Doctor[] }) {
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  
  // Usar state local para garantir que a UI mude instantaneamente (Optimistic Update) e quando receber novos props do servidor
  const [localDoctors, setLocalDoctors] = useState<Doctor[]>(initialDoctors);

  // Sincroniza o state local com as mudanças vindas do servidor
  useEffect(() => {
    setLocalDoctors(initialDoctors);
  }, [initialDoctors]);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const res = await adminCreateDoctor(formData);
    if (res?.error) setError(res.error);
    else {
      (e.target as HTMLFormElement).reset();
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja deletar o Dr(a). ${name} PERMANENTEMENTE?`)) {
      startTransition(async () => {
        const res = await adminDeleteUser(id);
        if (res?.error) alert(res.error);
      });
    }
  };

  const handleUpdateFee = (id: string, currentFee: number) => {
    const newFeeStr = prompt("Informe o novo valor da consulta (R$):", currentFee.toString());
    if (newFeeStr) {
      const newFee = parseFloat(newFeeStr.replace(",", "."));
      if (!isNaN(newFee)) {
        startTransition(async () => {
          const res = await adminUpdateDoctorFee(id, newFee);
          if (res?.error) alert(res.error);
        });
      } else {
        alert("Valor inválido.");
      }
    }
  };

  const handleToggleStatus = (id: string, currentStatus: boolean, name: string) => {
    if (confirm(`Deseja ${currentStatus ? 'DESATIVAR' : 'ATIVAR'} o médico(a) ${name}? ${currentStatus ? 'Ele sairá do catálogo de pacientes.' : 'Ele voltará ao catálogo.'}`)) {
      // Optimistic Update: já muda a UI na hora
      setLocalDoctors(prev => prev.map(d => d.id === id ? { ...d, isActive: !currentStatus } : d));
      
      startTransition(async () => {
        const res = await adminToggleDoctorStatus(id, currentStatus);
        if (res?.error) {
          alert(res.error);
          // Reverte se der erro
          setLocalDoctors(prev => prev.map(d => d.id === id ? { ...d, isActive: currentStatus } : d));
        }
      });
    }
  };

  const filteredDoctors = localDoctors.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.crm.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Formulário de Cadastro */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PlusCircle className="h-5 w-5 text-primary" />
              Novo Médico
            </CardTitle>
            <CardDescription>
              Adicione as credenciais de acesso para a plataforma.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm font-medium">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" name="full_name" placeholder="Dr. Nome Sobrenome" required disabled={isPending} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="crm">Número CRM</Label>
                  <Input id="crm" name="crm" placeholder="123456" required disabled={isPending} />
                </div>
                <div className="space-y-2 col-span-1">
                  <Label htmlFor="crm_state">UF</Label>
                  <select 
                    id="crm_state" 
                    name="crm_state" 
                    className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    required
                    disabled={isPending}
                  >
                    <option value="SP">SP</option>
                    <option value="RJ">RJ</option>
                    <option value="MG">MG</option>
                    <option value="RS">RS</option>
                    <option value="PR">PR</option>
                    <option value="SC">SC</option>
                    <option value="BA">BA</option>
                    <option value="DF">DF</option>
                    <option value="GO">GO</option>
                    <option value="PE">PE</option>
                    <option value="CE">CE</option>
                    <option value="ES">ES</option>
                    <option value="MT">MT</option>
                    <option value="MS">MS</option>
                    <option value="PB">PB</option>
                    <option value="RN">RN</option>
                    <option value="AL">AL</option>
                    <option value="SE">SE</option>
                    <option value="PI">PI</option>
                    <option value="MA">MA</option>
                    <option value="PA">PA</option>
                    <option value="AM">AM</option>
                    <option value="RO">RO</option>
                    <option value="RR">RR</option>
                    <option value="AC">AC</option>
                    <option value="AP">AP</option>
                    <option value="TO">TO</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">Especialidade Principal</Label>
                <Input id="specialization" name="specialization" placeholder="Ex: Cardiologista" required disabled={isPending} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail Profissional</Label>
                <Input id="email" name="email" type="email" placeholder="medico@clinica.com" required disabled={isPending} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha Provisória</Label>
                <Input id="password" name="password" type="password" required disabled={isPending} />
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Registrando..." : "Registrar Médico"}
              </Button>
            </CardContent>
          </form>
        </Card>
      </div>

      {/* Tabela de Médicos */}
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b gap-4">
            <div>
              <CardTitle className="text-lg">Médicos Ativos ({initialDoctors.length})</CardTitle>
              <CardDescription>Lista de médicos reais integrados à clínica.</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar médico..." 
                className="pl-9 h-9" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/50 uppercase">
                  <tr>
                    <th className="px-6 py-3 font-medium">Nome / CRM</th>
                    <th className="px-6 py-3 font-medium">Valor Consulta</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDoctors.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-muted-foreground">Nenhum médico encontrado.</td>
                    </tr>
                  ) : filteredDoctors.map((doc) => (
                    <tr key={doc.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{doc.name}</div>
                        <div className="text-xs text-muted-foreground">{doc.crm}</div>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        R$ {doc.fee.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        {doc.isActive ? (
                          <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-semibold">Ativo</span>
                        ) : (
                          <span className="px-2 py-1 bg-muted/50 text-muted-foreground rounded-full text-xs font-semibold">Inativo</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        <Button 
                          variant={doc.isActive ? "secondary" : "default"} 
                          size="sm" 
                          className={doc.isActive ? "h-8 text-muted-foreground" : "h-8 bg-green-600 hover:bg-green-700"}
                          onClick={() => handleToggleStatus(doc.id, doc.isActive, doc.name)}
                          disabled={isPending}
                          title={doc.isActive ? "Desativar Médico" : "Ativar Médico"}
                        >
                          {doc.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8"
                          onClick={() => handleUpdateFee(doc.id, doc.fee)}
                          disabled={isPending}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="h-8"
                          onClick={() => handleDelete(doc.id, doc.name)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
