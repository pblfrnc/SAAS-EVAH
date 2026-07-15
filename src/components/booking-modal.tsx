"use client";

import { useState, useTransition, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { createCheckoutSession } from "@/app/actions/payments";
import { getDoctorBookedSlots } from "@/app/actions/appointments";
import { DoctorAvailability } from "@/app/actions/doctor";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

function generateTimeSlots(date: Date, availability?: any) {
  let dayConfig;
  
  if (Array.isArray(availability)) {
    dayConfig = availability.find(d => d.dayId === date.getDay());
  } else if (availability) {
    dayConfig = availability; // fallback antigo
  }

  const start = dayConfig?.start || "08:00";
  const end = dayConfig?.end || "17:30";
  const blockedSlots = dayConfig?.blockedSlots || [];

  const slots = [];
  let [h, m] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);

  while (h < eh || (h === eh && m < em)) {
    const slotStr = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    
    if (!blockedSlots.includes(slotStr)) {
      slots.push(slotStr);
    }
    
    m += 30;
    if (m >= 60) {
      h += 1;
      m -= 60;
    }
  }
  return slots;
}

export function BookingModal({ doctorId, doctorName, fee, availability }: { doctorId: string, doctorName: string, fee: number, availability?: DoctorAvailability }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tcleConsent, setTcleConsent] = useState(false);
  const [lgpdConsent, setLgpdConsent] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Carrega os slots preenchidos sempre que o paciente trocar a data
  useEffect(() => {
    if (!date) return;
    let isMounted = true;
    setTime(""); // Limpa o horário se mudar de dia
    setIsLoadingSlots(true);
    
    const dateStr = format(date, "yyyy-MM-dd");
    getDoctorBookedSlots(doctorId, dateStr).then((slots) => {
      if (isMounted) {
        setBookedSlots(slots);
        setIsLoadingSlots(false);
      }
    });

    return () => { isMounted = false; };
  }, [date, doctorId]);

  const handleBook = () => {
    if (!date || !time) {
      setError("Por favor, selecione uma data e um horário.");
      return;
    }
    
    if (!tcleConsent || !lgpdConsent) {
      setError("Você deve aceitar o Termo de Telemedicina (TCLE) e a Política de Dados (LGPD) para prosseguir.");
      return;
    }
    
    setError(null);
    startTransition(async () => {
      const dateStr = format(date, "yyyy-MM-dd");
      // Gera o link de pagamento do Mercado Pago
      const res = await createCheckoutSession(doctorId, doctorName, fee, dateStr, time);
      if (res?.error) {
        setError(res.error);
      } else if (res?.init_point) {
        // Redireciona o paciente para a tela de Checkout
        window.location.href = res.init_point;
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="w-full shadow-premium hover:shadow-premium-hover transition-all rounded-full" />}>
        Agendar Consulta
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-heading">Agendar com {doctorName}</DialogTitle>
          <DialogDescription>
            Teleconsulta com duração aproximada de 30 minutos.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {error && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm font-medium animate-in fade-in zoom-in">
              {error}
            </div>
          )}
          
          <div className="space-y-2 flex flex-col">
            <span className="text-sm font-medium">1. Escolha a data</span>
            <Popover>
              <PopoverTrigger render={
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal rounded-xl",
                    !date && "text-muted-foreground"
                  )}
                />
              }>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => {
                    const isPast = date < new Date(new Date().setHours(0,0,0,0));
                    
                    if (Array.isArray(availability)) {
                      const dayConfig = availability.find((d: any) => d.dayId === date.getDay());
                      if (!dayConfig || !dayConfig.isActive) return true;
                    } else if ((availability as any)?.days) {
                      if (!(availability as any).days.includes(date.getDay())) return true;
                    } else {
                      // Se não tem configuração, bloqueia fds por padrão
                      if (date.getDay() === 0 || date.getDay() === 6) return true;
                    }
                    
                    return isPast;
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          {date && (
            <div className="space-y-2 animate-in fade-in zoom-in duration-300 relative">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">2. Escolha o horário</span>
                {isLoadingSlots && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </div>
              <div className={cn("grid grid-cols-4 gap-2 transition-opacity", isLoadingSlots ? "opacity-50 pointer-events-none" : "opacity-100")}>
                {generateTimeSlots(date, availability).map((t) => {
                  const isBooked = bookedSlots.includes(t);
                  return (
                    <Button
                      key={t}
                      variant={time === t ? "default" : "outline"}
                      className={cn(
                        "rounded-xl transition-all", 
                        time === t ? "shadow-md" : "",
                        isBooked ? "opacity-30 line-through cursor-not-allowed bg-muted hover:bg-muted" : ""
                      )}
                      onClick={() => !isBooked && setTime(t)}
                      disabled={isBooked}
                    >
                      {t}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
          
          {date && time && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 bg-muted/30 p-4 rounded-xl border">
              <span className="text-sm font-bold text-foreground">3. Termos Legais (Resolução CFM nº 2.314/2022)</span>
              
              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="tcle" 
                  checked={tcleConsent} 
                  onCheckedChange={(c) => setTcleConsent(c as boolean)} 
                  className="mt-1"
                />
                <div className="space-y-1 leading-none">
                  <Label htmlFor="tcle" className="text-sm font-medium cursor-pointer">
                    Termo de Consentimento Livre e Esclarecido (TCLE)
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Declaro que li e concordo com o atendimento por Telemedicina, ciente de suas limitações em relação ao atendimento presencial.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox 
                  id="lgpd" 
                  checked={lgpdConsent} 
                  onCheckedChange={(c) => setLgpdConsent(c as boolean)} 
                  className="mt-1"
                />
                <div className="space-y-1 leading-none">
                  <Label htmlFor="lgpd" className="text-sm font-medium cursor-pointer">
                    Política de Privacidade e Tratamento de Dados (LGPD)
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Autorizo o tratamento dos meus dados sensíveis de saúde de acordo com a LGPD, garantido o sigilo médico e criptografia ponta-a-ponta (NGS2).
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4">
            <Button 
              onClick={handleBook} 
              className="w-full h-12 text-base gap-2 rounded-full shadow-premium hover:shadow-premium-hover transition-all" 
              disabled={isPending || !date || !time || !tcleConsent || !lgpdConsent}
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirmar Agendamento e Prosseguir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
