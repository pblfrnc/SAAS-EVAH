"use client";

import { useState, useTransition } from "react";
import { Loader2, CheckCircle2, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createMedicalRecord } from "@/app/actions/medical-records";
import { PrescriptionForm } from "@/components/prescription-form";
import { PatientEditModal } from "@/components/patient-edit-modal";

interface TelemedicineSidebarProps {
  appointmentId: string;
  patient: any;
  memedToken?: string;
}

export function TelemedicineSidebar({ appointmentId, patient, memedToken }: TelemedicineSidebarProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const patientName = Array.isArray(patient.profiles) ? patient.profiles[0]?.full_name : patient.profiles?.full_name;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.append("appointment_id", appointmentId);
    formData.append("patient_id", patient.id);
    
    startTransition(async () => {
      const res = await createMedicalRecord(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess(true);
      }
    });
  };

  return (
    <div className="h-full flex flex-col bg-card border-l overflow-hidden">
      <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-lg">Painel de Atendimento</h2>
          <p className="text-sm text-muted-foreground truncate">Paciente: {patientName}</p>
        </div>
        
        <PatientEditModal 
          patient={{
            id: patient.id,
            name: patientName,
            cpf: patient.cpf,
            birth_date: patient.birth_date,
            phone: patient.phone,
            address: patient.address
          }} 
          triggerVariant="icon" 
        />
      </div>

      <Tabs defaultValue="pep" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b h-12 bg-transparent px-4">
          <TabsTrigger value="pep" className="data-[state=active]:bg-muted/50 data-[state=active]:shadow-none rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary">
            Prontuário (PEP)
          </TabsTrigger>
          <TabsTrigger value="prescription" className="data-[state=active]:bg-muted/50 data-[state=active]:shadow-none rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary">
            Receita (Memed)
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-4">
          <TabsContent value="pep" className="m-0 h-full animate-in fade-in duration-300">
            {success ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4 text-center p-6">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
                <p className="font-medium text-lg">Prontuário salvo com sucesso!</p>
                <p className="text-sm text-muted-foreground">A evolução clínica foi registrada e a consulta marcada como finalizada.</p>
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
                    className="min-h-[250px] resize-none"
                  />
                </div>
                
                <div className="pt-2">
                  <Button type="submit" className="w-full h-12 text-base gap-2" disabled={isPending}>
                    {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    Assinar e Salvar Prontuário
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-3 leading-relaxed">
                    Atenção: Uma vez salvo, este documento não poderá ser alterado por motivos legais.
                  </p>
                </div>
              </form>
            )}
          </TabsContent>

          <TabsContent value="prescription" className="m-0 h-full animate-in fade-in duration-300">
            {/* Como o componente PrescriptionForm aceita um array de patients, passamos apenas o paciente atual */}
            <PrescriptionForm patients={[patient]} memedToken={memedToken} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
