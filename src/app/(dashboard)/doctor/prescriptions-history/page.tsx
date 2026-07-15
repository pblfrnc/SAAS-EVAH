import { getDoctorPrescriptionsHistory } from "@/app/actions/prescriptions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Calendar } from "lucide-react";

export default async function PrescriptionsHistoryPage() {
  const history = await getDoctorPrescriptionsHistory();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold font-heading tracking-tight">Histórico de Prescrições</h1>
        <p className="text-muted-foreground">Consulte todas as receitas emitidas digitalmente (ICP-Brasil) para seus pacientes.</p>
      </div>

      <div className="grid gap-6">
        {history.length === 0 ? (
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <FileText className="h-10 w-10 mb-4 opacity-20" />
              <p>Nenhuma prescrição emitida ainda.</p>
            </CardContent>
          </Card>
        ) : (
          history.map((record: any) => {
            const patientName = Array.isArray(record.patients?.profiles)
              ? record.patients.profiles[0]?.full_name
              : record.patients?.profiles?.full_name || "Paciente Desconhecido";

            return (
              <Card key={record.id} className="shadow-premium hover:shadow-premium-hover transition-all">
                <CardHeader className="pb-3 border-b border-muted">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        {patientName}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        Emitida em: {new Date(record.created_at).toLocaleDateString('pt-BR')} às {new Date(record.created_at).toLocaleTimeString('pt-BR')}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded-md">Hash: {record.doc_hash}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <h4 className="font-semibold text-sm mb-3">Medicamentos Prescritos:</h4>
                  <ul className="space-y-3">
                    {record.medications.map((med: any, idx: number) => (
                      <li key={idx} className="bg-muted/40 p-3 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-2 border border-primary/5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-primary">{idx + 1}.</span>
                          <span className="font-medium">{med.name}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <strong>Uso:</strong> {med.dosage} <span className="mx-2">|</span> <strong>Qtd:</strong> {med.quantity}
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
