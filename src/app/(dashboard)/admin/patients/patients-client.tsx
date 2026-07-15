"use client";

import { HeartPulse, Search, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { adminDeleteUser } from "@/app/actions/admin";
import { PatientEditModal } from "@/components/patient-edit-modal";

type Patient = {
  id: string;
  name: string;
  createdAt: string;
  cpf: string;
  birth_date?: string | null;
  phone?: string | null;
  address?: string | null;
  lgpdConsent: boolean;
};

export default function PatientsClient({ initialPatients }: { initialPatients: Patient[] }) {
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Atenção (LGPD - Direito ao Esquecimento): Tem certeza que deseja deletar os dados clínicos de ${name} PERMANENTEMENTE?`)) {
      startTransition(async () => {
        const res = await adminDeleteUser(id);
        if (res?.error) alert(res.error);
      });
    }
  };

  const filteredPatients = initialPatients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.cpf.includes(search)
  );

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b gap-4">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-primary" />
            Pacientes Cadastrados ({initialPatients.length})
          </CardTitle>
          <CardDescription>Base centralizada de dados reais com consentimento LGPD.</CardDescription>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar paciente por nome ou CPF..." 
            className="pl-9" 
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
                <th className="px-6 py-4 font-medium">Paciente / CPF</th>
                <th className="px-6 py-4 font-medium">Data de Cadastro</th>
                <th className="px-6 py-4 font-medium">LGPD Consentimento</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-muted-foreground">Nenhum paciente encontrado.</td>
                </tr>
              ) : filteredPatients.map((p) => (
                <tr key={p.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.cpf}</div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(p.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-6 py-4">
                    {p.lgpdConsent ? (
                      <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded-full text-xs font-semibold">Aceito</span>
                    ) : (
                      <span className="px-2 py-1 bg-orange-500/10 text-orange-500 rounded-full text-xs font-semibold">Pendente</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <PatientEditModal patient={p} triggerVariant="button" />
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="h-8"
                        onClick={() => handleDelete(p.id, p.name)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remover
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
