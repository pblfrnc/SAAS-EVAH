import { createClient } from "@/lib/supabase/server";
import { DoctorAvailabilitySettings } from "@/components/doctor-availability-settings";
import { DoctorFeeSettings } from "@/components/doctor-fee-settings";
import { updateDoctorAvailability } from "@/app/actions/doctor";

export const dynamic = "force-dynamic";

export default async function DoctorSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: doctor } = await supabase
    .from("doctors")
    .select("availability, consultation_fee")
    .eq("id", user?.id)
    .single();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold font-heading tracking-tight">Configurações de Agenda</h1>
        <p className="text-muted-foreground">Gerencie seus horários de atendimento e pausas.</p>
      </div>

      <div className="max-w-2xl bg-card border rounded-xl shadow-sm p-6 flex flex-col mb-6">
        <h2 className="text-xl font-semibold mb-4">Valor da Consulta</h2>
        <DoctorFeeSettings initialFee={doctor?.consultation_fee} />
      </div>

      <div className="max-w-2xl min-h-[600px] bg-card border rounded-xl shadow-sm p-6 flex flex-col">
        <h2 className="text-xl font-semibold mb-4">Agenda e Disponibilidade</h2>
        <DoctorAvailabilitySettings 
          initialData={doctor?.availability} 
          onSave={updateDoctorAvailability} 
        />
      </div>
    </div>
  );
}
