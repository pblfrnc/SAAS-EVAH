import { getPatientMedicalRecords } from "@/app/actions/medical-records";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Stethoscope } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default async function PatientHistoryPage() {
  const records = await getPatientMedicalRecords();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold font-heading tracking-tight">Histórico Clínico</h1>
        <p className="text-muted-foreground">Acesse seus prontuários eletrônicos (PEP) e prescrições médicas.</p>
      </div>

      <section className="space-y-4 max-w-4xl">
        {records.length === 0 ? (
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground text-center">
              <ClipboardList className="h-10 w-10 mb-4 opacity-50" />
              <p className="text-lg font-medium">Seu histórico está vazio.</p>
              <p className="text-sm mt-1">Os registros das suas consultas e prescrições aparecerão aqui após o atendimento médico.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" /> Prontuários
              </CardTitle>
              <CardDescription>
                Clique sobre o registro para visualizar as anotações do seu médico.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Accordion className="w-full">
                {records.map((rec: any) => {
                  const doctorProfile = Array.isArray(rec.doctors?.profiles) 
                    ? rec.doctors?.profiles[0] 
                    : rec.doctors?.profiles;
                  const doctorName = doctorProfile?.full_name || "Médico não encontrado";
                  
                  return (
                  <AccordionItem key={rec.id} value={rec.id} className="border-b px-6">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex flex-col items-start text-left">
                        <div className="font-bold text-base">{rec.diagnosis}</div>
                        <div className="text-sm text-muted-foreground font-medium flex gap-2 items-center mt-1">
                          <span>Dr(a). {doctorName}</span>
                          <span className="text-primary">•</span> 
                          <span>{format(parseISO(rec.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6 pt-2">
                      <div className="bg-muted/30 p-4 rounded-xl border border-muted text-foreground whitespace-pre-wrap leading-relaxed shadow-inner">
                        {rec.notes}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )})}
              </Accordion>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
