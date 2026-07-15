"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2, DollarSign } from "lucide-react";
import { updateConsultationFee } from "@/app/actions/doctor";

export function DoctorFeeSettings({ initialFee }: { initialFee: number }) {
  const [fee, setFee] = useState<string>(initialFee?.toString() || "150.00");
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    setError(null);
    setSuccess(false);
    
    const numFee = parseFloat(fee);
    if (isNaN(numFee) || numFee <= 0) {
      setError("Insira um valor válido para a consulta.");
      return;
    }

    startTransition(async () => {
      const res = await updateConsultationFee(numFee);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fee" className="text-sm font-semibold flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-green-600" />
          Valor da Consulta (R$)
        </Label>
        <div className="flex items-center gap-3">
          <div className="relative max-w-[200px]">
            <span className="absolute left-3 top-2.5 text-muted-foreground">R$</span>
            <Input 
              id="fee" 
              type="number" 
              step="10.00"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              className="pl-9"
              placeholder="150.00"
            />
          </div>
          <Button onClick={handleSave} disabled={isPending} className="w-32 shadow-sm rounded-full">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar Valor"}
          </Button>
        </div>
      </div>
      
      {error && <p className="text-sm text-destructive font-medium">{error}</p>}
      {success && (
        <p className="text-sm text-green-600 font-medium flex items-center gap-1 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4" /> Atualizado com sucesso!
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        Esse valor será cobrado no momento do agendamento pelo paciente via Checkout (Mercado Pago).
      </p>
    </div>
  );
}
