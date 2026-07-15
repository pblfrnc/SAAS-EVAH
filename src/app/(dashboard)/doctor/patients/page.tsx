import { getDoctorAppointments } from "@/app/actions/appointments";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PepSheet } from "@/components/pep-sheet";
import { PatientEditModal } from "@/components/patient-edit-modal";

export default async function DoctorPatientsPage() {
  const appointments = await getDoctorAppointments();
  
  // Extrai pacientes únicos baseado nas consultas
  const uniquePatientsMap = new Map();
  appointments.forEach((app: any) => {
    const patientId = app.patients?.id || app.patients?.[0]?.id || app.patient_id;
    if (!uniquePatientsMap.has(patientId)) {
      uniquePatientsMap.set(patientId, {
        id: patientId,
        name: app.patients?.profiles?.full_name || app.patients?.[0]?.profiles?.full_name || "Desconhecido",
        cpf: app.patients?.cpf || app.patients?.[0]?.cpf,
        birth_date: app.patients?.birth_date || app.patients?.[0]?.birth_date,
        phone: app.patients?.phone || app.patients?.[0]?.phone,
        address: app.patients?.address || app.patients?.[0]?.address,
        lastAppointment: app.start_time,
        appIdForHistory: app.id // Podemos usar um appId para abrir o PEP focado no paciente
      });
    } else {
      // Atualiza para a consulta mais recente
      const existing = uniquePatientsMap.get(patientId);
      if (new Date(app.start_time) > new Date(existing.lastAppointment)) {
        uniquePatientsMap.set(patientId, { ...existing, lastAppointment: app.start_time, appIdForHistory: app.id });
      }
    }
  });

  const patients = Array.from(uniquePatientsMap.values());

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold font-heading tracking-tight">Meus Pacientes</h1>
        <p className="text-muted-foreground">Histórico de pacientes atendidos e acesso ao Prontuário Eletrônico (PEP).</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Pacientes Ativos ({patients.length})
          </CardTitle>
          <CardDescription>
            Lista de todos os pacientes que já realizaram ou possuem consultas agendadas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {patients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              Você ainda não possui pacientes vinculados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 rounded-t-lg">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Paciente</th>
                    <th className="px-4 py-3">CPF</th>
                    <th className="px-4 py-3">Última Consulta</th>
                    <th className="px-4 py-3 text-right rounded-tr-lg">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p) => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-4 font-medium">{p.name}</td>
                      <td className="px-4 py-4">{p.cpf || "Não informado"}</td>
                      <td className="px-4 py-4">
                        {format(parseISO(p.lastAppointment), "dd/MM/yyyy", { locale: ptBR })}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <PatientEditModal patient={p} triggerVariant="button" />
                          <PepSheet 
                            appointmentId={p.appIdForHistory} 
                            patientId={p.id} 
                            patientName={p.name} 
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
