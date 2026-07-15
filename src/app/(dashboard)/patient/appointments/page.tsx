import { getPatientAppointments } from "@/app/actions/appointments";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Clock, Video, CheckCircle2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function PatientAppointmentsPage() {
  const appointments = await getPatientAppointments();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold font-heading tracking-tight">Minhas Consultas</h1>
        <p className="text-muted-foreground">Gerencie suas agendas e acesse as salas de telemedicina.</p>
      </div>

      <section className="space-y-4">
        {appointments.length === 0 ? (
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground text-center">
              <CalendarDays className="h-10 w-10 mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhuma consulta agendada no momento.</p>
              <p className="text-sm mt-1">Navegue até a aba "Agendar Consulta" para marcar com um especialista.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {appointments.map((app: any) => {
              const startDate = parseISO(app.start_time);
              const isCompleted = app.status === 'completed';
              
              return (
                <Card key={app.id} className={`shadow-sm hover:shadow-md transition-all border-l-4 ${isCompleted ? 'border-l-muted opacity-80' : 'border-l-primary'}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg line-clamp-1 flex items-center gap-2">
                      {isCompleted && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      {app.doctors.profiles.full_name}
                    </CardTitle>
                    <CardDescription>{app.doctors.specialization}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium bg-muted/30 p-2 rounded-md">
                      <Clock className="h-4 w-4 text-primary" />
                      {format(startDate, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                    </div>
                    <div className="flex gap-2">
                      <Link href={app.telemedicine_url || "#"} target="_blank" className="flex-1">
                        <Button className="w-full gap-2 rounded-xl" variant={isCompleted ? "outline" : "default"}>
                          <Video className="h-4 w-4" /> {isCompleted ? 'Rever Sala' : 'Entrar na Sala'}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
