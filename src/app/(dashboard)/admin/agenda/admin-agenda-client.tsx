"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DoctorAvailabilitySettings } from "@/components/doctor-availability-settings";
import { adminUpdateDoctorAvailability } from "@/app/actions/admin";
import { DoctorAvailability } from "@/app/actions/doctor";
import { CalendarDays, Clock } from "lucide-react";

type Doctor = {
  id: string;
  name: string;
  crm: string;
  specialization: string;
  availability: DoctorAvailability | null;
};

export function AdminAgendaClient({ doctors }: { doctors: Doctor[] }) {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  
  const handleSave = async (availability: DoctorAvailability) => {
    if (!selectedDoctor) return { error: "Nenhum médico selecionado" };
    
    const res = await adminUpdateDoctorAvailability(selectedDoctor.id, availability);
    if (res.success) {
      setSelectedDoctor(null);
    }
    return res;
  };

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {doctors.map(doc => (
          <Card key={doc.id} className="hover:border-primary/50 transition-all cursor-pointer shadow-sm" onClick={() => setSelectedDoctor(doc)}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex justify-between items-start">
                <span className="line-clamp-1">{doc.name}</span>
              </CardTitle>
              <CardDescription>{doc.specialization}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground gap-2">
                <Clock className="h-4 w-4" />
                {Array.isArray(doc.availability) ? (
                  <span>
                    {doc.availability.filter((d: any) => d.isActive).length} dias ativos
                  </span>
                ) : doc.availability ? (
                  <span>Migração pendente (Salve a agenda para atualizar)</span>
                ) : (
                  <span>Padrão (Seg a Sex, 08:00 - 17:30)</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedDoctor} onOpenChange={(open) => !open && setSelectedDoctor(null)}>
        <DialogContent className="max-w-2xl min-h-[600px] max-h-[85vh] flex flex-col overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" /> 
              Agenda: {selectedDoctor?.name}
            </DialogTitle>
            <DialogDescription>
              Ajuste os dias, horário de atendimento e os intervalos de almoço deste profissional.
            </DialogDescription>
          </DialogHeader>
          
          {selectedDoctor && (
            <DoctorAvailabilitySettings 
              initialData={selectedDoctor.availability} 
              onSave={handleSave} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
