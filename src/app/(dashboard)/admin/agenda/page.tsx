import { createClient } from "@/lib/supabase/server";
import { AdminAgendaClient } from "./admin-agenda-client";

export const dynamic = "force-dynamic";

export default async function AdminAgendaPage() {
  const supabase = await createClient();
  
  // We need to bypass RLS to fetch all doctors availability
  // Since we already have a service client in actions, we can fetch from there, 
  // or fetch directly using the admin client. Let's use standard admin client here.
  const supabaseAdmin = createClient(); // Wait, page is Server Component, we can fetch securely.
  
  const { data: doctors, error } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      doctors (
        crm,
        specialization,
        availability
      )
    `)
    .eq("role", "doctor");

  // Since profiles for doctors are public, we can fetch this with normal RLS.
  
  const formattedDoctors = doctors?.map((d: any) => ({
    id: d.id,
    name: d.full_name,
    crm: d.doctors?.[0]?.crm || "N/A",
    specialization: d.doctors?.[0]?.specialization || "N/A",
    availability: d.doctors?.[0]?.availability || null
  })) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold font-heading tracking-tight">Agenda Médica</h1>
        <p className="text-muted-foreground">Gerencie o horário de expediente e as pausas de todos os profissionais da clínica.</p>
      </div>
      
      <AdminAgendaClient doctors={formattedDoctors} />
    </div>
  );
}
