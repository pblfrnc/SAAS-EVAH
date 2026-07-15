"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock } from "lucide-react";
import { DoctorAvailability, DailyAvailability } from "@/app/actions/doctor";
import { cn } from "@/lib/utils";

const DAYS_OF_WEEK = [
  { id: 1, name: "Seg", fullName: "Segunda-feira" },
  { id: 2, name: "Ter", fullName: "Terça-feira" },
  { id: 3, name: "Qua", fullName: "Quarta-feira" },
  { id: 4, name: "Qui", fullName: "Quinta-feira" },
  { id: 5, name: "Sex", fullName: "Sexta-feira" },
  { id: 6, name: "Sáb", fullName: "Sábado" },
  { id: 0, name: "Dom", fullName: "Domingo" },
];

function generateTimeSlots(start: string, end: string) {
  if (!start || !end) return [];
  const slots = [];
  let [h, m] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);

  while (h < eh || (h === eh && m < em)) {
    slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
    m += 30;
    if (m >= 60) {
      h += 1;
      m -= 60;
    }
  }
  return slots;
}

export function DoctorAvailabilitySettings({ 
  initialData, 
  onSave 
}: { 
  initialData: any; 
  onSave: (data: DoctorAvailability) => Promise<{error?: string, success?: boolean}>;
}) {
  const generateDefaultWeek = (): DoctorAvailability => {
    return DAYS_OF_WEEK.map(day => {
      if (initialData && !Array.isArray(initialData)) {
        const isActive = initialData.days?.includes(day.id) ?? (day.id >= 1 && day.id <= 5);
        return {
          dayId: day.id,
          isActive,
          start: initialData.start || "08:00",
          end: initialData.end || "17:30",
          blockedSlots: initialData.blockedSlots || []
        };
      }
      return {
        dayId: day.id,
        isActive: day.id >= 1 && day.id <= 5,
        start: "08:00",
        end: "17:30",
        blockedSlots: []
      };
    });
  };

  const getInitialState = (): DoctorAvailability => {
    if (Array.isArray(initialData) && initialData.length > 0) {
      const week = [...initialData];
      DAYS_OF_WEEK.forEach(day => {
        if (!week.find(w => w.dayId === day.id)) {
          week.push({
            dayId: day.id,
            isActive: false,
            start: "08:00",
            end: "17:30",
            blockedSlots: []
          });
        }
      });
      return week.sort((a, b) => {
        const aIndex = DAYS_OF_WEEK.findIndex(d => d.id === a.dayId);
        const bIndex = DAYS_OF_WEEK.findIndex(d => d.id === b.dayId);
        return aIndex - bIndex;
      });
    }
    return generateDefaultWeek();
  };

  const [schedule, setSchedule] = useState<DoctorAvailability>(getInitialState());
  const [activeTab, setActiveTab] = useState<string>("1");
  const [isPending, startTransition] = useTransition();

  const updateDay = (dayId: number, updates: Partial<DailyAvailability>) => {
    setSchedule(prev => prev.map(day => 
      day.dayId === dayId ? { ...day, ...updates } : day
    ));
  };

  const handleToggleSlot = (dayId: number, slot: string, currentBlocked: string[]) => {
    const newBlocked = currentBlocked.includes(slot) 
      ? currentBlocked.filter(s => s !== slot) 
      : [...currentBlocked, slot];
    updateDay(dayId, { blockedSlots: newBlocked });
  };

  const handleSave = () => {
    startTransition(async () => {
      const cleanSchedule = schedule.map(day => {
        if (!day.isActive) return day;
        const validSlots = generateTimeSlots(day.start, day.end);
        return {
          ...day,
          blockedSlots: day.blockedSlots.filter(s => validSlots.includes(s))
        };
      });
      
      const res = await onSave(cleanSchedule);
      if (res.error) {
        alert(res.error);
      } else {
        alert("Agenda atualizada com sucesso!");
      }
    });
  };

  return (
    <Card className="shadow-none border-0">
      <CardHeader className="pb-4 px-0 pt-0">
        <CardTitle className="flex items-center gap-2 text-primary text-lg">
          <Clock className="h-5 w-5" /> Escala de Atendimento Diário
        </CardTitle>
        <CardDescription className="text-xs">
          Selecione o dia na barra abaixo para configurar seus horários.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-0 pb-0">
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col">
          <TabsList className="flex flex-row w-full gap-1 overflow-x-auto justify-start p-1 bg-muted/50 rounded-lg mb-2">
            {DAYS_OF_WEEK.map(day => {
              const dayConfig = schedule.find(d => d.dayId === day.id);
              const isActive = dayConfig?.isActive;
              return (
                <TabsTrigger 
                  key={day.id} 
                  value={day.id.toString()}
                  className={cn(
                    "flex-1 rounded-md px-1.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all",
                    !isActive && "text-muted-foreground opacity-60"
                  )}
                >
                  {day.name}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {schedule.map(dayConfig => {
            const dayMeta = DAYS_OF_WEEK.find(d => d.id === dayConfig.dayId);
            const currentSlots = generateTimeSlots(dayConfig.start, dayConfig.end);
            
            return (
              <TabsContent key={dayConfig.dayId} value={dayConfig.dayId.toString()} className="space-y-4 mt-2 flex-1 flex flex-col">
                
                <div className="flex items-center justify-between bg-muted/20 p-3 rounded-lg border">
                  <span className="text-sm font-medium">
                    {dayConfig.isActive ? `Atendendo na ${dayMeta?.fullName}` : `Não atende na ${dayMeta?.fullName}`}
                  </span>
                  <Button 
                    variant={dayConfig.isActive ? "destructive" : "default"} 
                    size="sm"
                    className="h-8 text-xs px-3"
                    onClick={() => updateDay(dayConfig.dayId, { isActive: !dayConfig.isActive })}
                    disabled={isPending}
                  >
                    {dayConfig.isActive ? "Desativar Dia" : "Ativar Dia"}
                  </Button>
                </div>

                {dayConfig.isActive && (
                  <div className="animate-in fade-in duration-300 space-y-4 flex-1">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Início do Expediente</Label>
                        <Input 
                          type="time" 
                          className="h-9 text-sm"
                          value={dayConfig.start} 
                          onChange={(e) => updateDay(dayConfig.dayId, { start: e.target.value })}
                          disabled={isPending}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Fim do Expediente</Label>
                        <Input 
                          type="time" 
                          className="h-9 text-sm"
                          value={dayConfig.end} 
                          onChange={(e) => updateDay(dayConfig.dayId, { end: e.target.value })}
                          disabled={isPending}
                        />
                      </div>
                    </div>

                    {currentSlots.length > 0 && (
                      <div className="space-y-3 pt-3 border-t">
                        <div>
                          <Label className="text-xs">Bloquear Horários Específicos</Label>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Clique nos horários abaixo para remover da agenda (Pausas).
                          </p>
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                          {currentSlots.map((slot) => {
                            const isBlocked = dayConfig.blockedSlots.includes(slot);
                            return (
                              <Button
                                key={slot}
                                variant={isBlocked ? "outline" : "default"}
                                className={cn(
                                  "h-9 text-[12px] font-semibold transition-all px-0 rounded-md",
                                  isBlocked ? "opacity-50 line-through bg-muted text-muted-foreground border-dashed" : "shadow-sm"
                                )}
                                onClick={() => handleToggleSlot(dayConfig.dayId, slot, dayConfig.blockedSlots)}
                                disabled={isPending}
                              >
                                {slot}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>

        <div className="pt-3 mt-4 border-t">
          <Button onClick={handleSave} disabled={isPending} className="w-full h-9 text-sm font-medium">
            {isPending ? "Salvando Configurações..." : "Salvar Agenda da Semana"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
