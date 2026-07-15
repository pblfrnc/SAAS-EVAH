"use client";

import { useState, useTransition } from "react";
import { Loader2, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { createMedicalRecord } from "@/app/actions/medical-records";

interface PepSheetProps {
  appointmentId: string;
  patientId: string;
  patientName: string;
}

export function PepSheet({ appointmentId, patientId, patientName }: PepSheetProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.append("appointment_id", appointmentId);
    formData.append("patient_id", patientId);
    
    startTransition(async () => {
      const res = await createMedicalRecord(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setTimeout(() => setOpen(false), 2000);
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="secondary" className="rounded-xl gap-2 shadow-sm" title="Preencher Prontuário" />}>
        <FileText className="h-4 w-4" /> PEP
      </SheetTrigger>
      <SheetContent className="sm:max-w-md w-[90vw] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-heading font-bold">Prontuário Eletrônico</SheetTitle>
          <SheetDescription>
            Paciente: <strong className="text-foreground">{patientName}</strong>
          </SheetDescription>
        </SheetHeader>
        
        {success ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4 animate-in zoom-in duration-300">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <div className="text-center">
              <p className="font-medium text-lg">Prontuário salvo e assinado!</p>
              <p className="text-sm text-muted-foreground mt-1">A consulta foi marcada como finalizada.</p>
            </div>
            
            <div className="mt-4 p-3 bg-muted/30 border border-green-500/20 rounded-lg text-center w-full max-w-xs mx-auto">
              <p className="text-xs font-semibold text-green-600 flex items-center justify-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Assinado Digitalmente (ICP-Brasil)
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">Trilha de auditoria gerada com NGS2 (CFM 2.314/2022)</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm font-medium">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="diagnosis" className="text-base font-semibold">Diagnóstico Principal</Label>
              <Input 
                id="diagnosis" 
                name="diagnosis" 
                placeholder="Ex: Amigdalite aguda" 
                required 
                className="h-11"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-base font-semibold">Evolução Clínica / Anamnese</Label>
              <Textarea 
                id="notes" 
                name="notes" 
                placeholder="Descreva os sintomas relatados, exame físico (se aplicável), e conduta..." 
                required 
                className="min-h-[300px] resize-none"
              />
            </div>
            
            <div className="pt-4 border-t">
              <Button type="submit" className="w-full h-12 text-base gap-2" disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Assinar e Salvar Prontuário
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-3">
                Atenção: Uma vez salvo, este documento não poderá ser alterado por motivos legais (LGPD e CFM).
              </p>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
