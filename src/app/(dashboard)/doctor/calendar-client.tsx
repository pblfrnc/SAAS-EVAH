"use client";

import { useState } from "react";
import { format, parseISO, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Video, Bell } from "lucide-react";
import Link from "next/link";
import { PepSheet } from "@/components/pep-sheet";
import { triggerAppointmentReminder } from "@/app/actions/appointments";
import { useTransition } from "react";

export default function CalendarClient({ appointments }: { appointments: any[] }) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isPending, startTransition] = useTransition();
  const [remindedApps, setRemindedApps] = useState<Set<string>>(new Set());

  const handleRemind = (appId: string) => {
    startTransition(async () => {
      const res = await triggerAppointmentReminder(appId);
      if (res?.error) {
        alert(res.error);
      } else {
        alert("Lembretes enviados com sucesso por E-mail e SMS (simulado)!");
        setRemindedApps(prev => new Set(prev).add(appId));
      }
    });
  };

  const getPatientName = (patientsData: any) => {
    if (!patientsData) return 'Paciente Desconhecido';
    const patientObj = Array.isArray(patientsData) ? patientsData[0] : patientsData;
    if (!patientObj || !patientObj.profiles) return 'Paciente Desconhecido';
    if (Array.isArray(patientObj.profiles)) return patientObj.profiles[0]?.full_name || 'Paciente Desconhecido';
    return patientObj.profiles.full_name || 'Paciente Desconhecido';
  };

  const getPatientCpf = (patientsData: any) => {
    if (!patientsData) return null;
    const patientObj = Array.isArray(patientsData) ? patientsData[0] : patientsData;
    return patientObj?.cpf || null;
  };
  
  const getPatientId = (patientsData: any) => {
    if (!patientsData) return null;
    const patientObj = Array.isArray(patientsData) ? patientsData[0] : patientsData;
    return patientObj?.id || null;
  };

  // Filtra as consultas para o dia selecionado
  const selectedAppointments = selectedDate 
    ? appointments.filter(app => isSameDay(parseISO(app.start_time), selectedDate))
    : [];

  // Mapeia todas as datas que possuem consultas para destacar no calendário
  const bookedDates = appointments.map(app => parseISO(app.start_time));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* Coluna do Calendário */}
      <div className="lg:col-span-4 lg:col-start-1">
        <Card className="h-full">
          <CardHeader className="pb-4 border-b">
            <CardTitle>Visão Mensal</CardTitle>
            <CardDescription>Selecione um dia para ver sua agenda.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md"
              locale={ptBR}
              modifiers={{ booked: bookedDates }}
              modifiersStyles={{
                booked: { fontWeight: 'bold', textDecoration: 'underline' }
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Coluna de Agendamentos do Dia */}
      <div className="lg:col-span-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold font-heading">
            {selectedDate ? format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR }) : 'Selecione uma data'}
          </h2>
          <span className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
            {selectedAppointments.length} consulta(s)
          </span>
        </div>

        {selectedAppointments.length === 0 ? (
          <Card className="bg-muted/30 border-dashed h-48 flex items-center justify-center">
            <p className="text-muted-foreground text-center">
              Você não tem consultas agendadas para este dia.<br/>
              Aproveite para descansar! ☕
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {selectedAppointments.map((app) => {
              const startDate = parseISO(app.start_time);
              return (
                <Card key={app.id} className="shadow-sm border-l-4 border-l-primary hover:shadow-md transition-all animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex flex-col sm:flex-row p-4 sm:p-6 gap-4 sm:gap-6 items-start sm:items-center">
                    
                    {/* Horário */}
                    <div className="flex flex-col items-center justify-center shrink-0 w-20 bg-muted/50 rounded-lg p-2">
                      <Clock className="h-4 w-4 text-primary mb-1" />
                      <span className="font-bold text-lg">{format(startDate, "HH:mm")}</span>
                    </div>

                    {/* Dados do Paciente */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        {getPatientName(app.patients)}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        CPF: {getPatientCpf(app.patients) || 'Não informado'}
                      </p>
                      {app.status === 'completed' && (
                        <span className="inline-block mt-2 px-2 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-semibold">
                          Finalizada
                        </span>
                      )}
                    </div>

                    {/* Ações */}
                    <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
                      <Link href={app.telemedicine_url || "#"} target="_blank" className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto gap-2" variant={app.status === 'completed' ? 'outline' : 'default'}>
                          <Video className="h-4 w-4" /> 
                          {app.status === 'completed' ? 'Rever Chamada' : 'Atender Paciente'}
                        </Button>
                      </Link>
                      
                      {app.status !== 'completed' && (
                        <>
                          <Button 
                            variant="outline" 
                            className="gap-2 w-full sm:w-auto"
                            onClick={() => handleRemind(app.id)}
                            disabled={isPending || remindedApps.has(app.id)}
                          >
                            <Bell className="h-4 w-4 text-amber-500" />
                            {remindedApps.has(app.id) ? "Lembrete Enviado" : "Lembrar Paciente"}
                          </Button>

                          <PepSheet 
                            appointmentId={app.id} 
                            patientId={getPatientId(app.patients) || app.patient_id} 
                            patientName={getPatientName(app.patients)} 
                          />
                        </>
                      )}
                    </div>

                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
