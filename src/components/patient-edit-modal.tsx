"use client";

import { useState, useTransition } from "react";
import { Loader2, Edit3, UserPen } from "lucide-react";
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
import { updatePatientDetails } from "@/app/actions/patients";

interface PatientEditModalProps {
  patient: {
    id: string;
    name: string;
    cpf?: string;
    birth_date?: string;
    phone?: string;
    address?: string;
  };
  triggerVariant?: "icon" | "button";
}

export function PatientEditModal({ patient, triggerVariant = "icon" }: PatientEditModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleEditPatient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updatePatientDetails(patient.id, formData);
      if (res.success) {
        setIsOpen(false);
        window.location.reload(); 
      } else {
        alert(res.error || "Erro ao atualizar");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerVariant === "icon" ? (
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full shrink-0" title="Editar Paciente">
            <Edit3 className="h-4 w-4 text-muted-foreground" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="gap-2 rounded-full" title="Ver e Editar Informações">
            <UserPen className="h-4 w-4" /> Editar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ficha do Paciente</DialogTitle>
          <DialogDescription>
            Informações completas do paciente. Atualize os dados se necessário.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleEditPatient} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nome Completo</Label>
            <Input name="fullName" defaultValue={patient.name} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>CPF (Apenas números)</Label>
              <Input name="cpf" defaultValue={patient.cpf || ""} placeholder="00011122233" />
            </div>
            <div className="space-y-2">
              <Label>Data de Nascimento</Label>
              <Input name="birthDate" type="date" defaultValue={patient.birth_date || ""} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input name="phone" defaultValue={patient.phone || ""} placeholder="(11) 99999-9999" />
          </div>
          <div className="space-y-2">
            <Label>Endereço Completo</Label>
            <Input name="address" defaultValue={patient.address || ""} placeholder="Rua, Número, Cidade, UF" />
          </div>
          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={isPending} className="shadow-premium">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
