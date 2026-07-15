import { getDoctorAppointments } from "@/app/actions/appointments";
import CalendarClient from "./calendar-client";

export default async function DoctorDashboard() {
  const appointments = await getDoctorAppointments();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">Agenda Médica</h1>
          <p className="text-muted-foreground">Planeje seu dia e acesse as teleconsultas diretamente pelo calendário.</p>
        </div>
      </div>

      <CalendarClient appointments={appointments} />
    </div>
  );
}
