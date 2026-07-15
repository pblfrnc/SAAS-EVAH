import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Users, Wallet } from "lucide-react";
import { getDoctorAppointments } from "@/app/actions/appointments";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const DoctorFinanceChart = dynamic(
  () => import("@/components/doctor-finance-chart").then(mod => mod.DoctorFinanceChart),
  { loading: () => <Skeleton className="h-[400px] w-full rounded-2xl" /> }
);

export default async function DoctorFinancesPage() {
  const appointments = await getDoctorAppointments();
  
  // Buscar valor da consulta do médico atual
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );
  
  const { data: { user } } = await supabase.auth.getUser();
  const { data: doctor } = await supabase.from("doctors").select("consultation_fee").eq("id", user?.id).single();
  
  const fee = doctor?.consultation_fee || 150.00;
  
  // Buscar os repasses reais do banco de dados
  const { data: payouts } = await supabase
    .from("payouts")
    .select("*")
    .eq("doctor_id", user?.id);

  let actualRevenue = 0;
  let projectedRevenue = 0;
  let totalAppointments = appointments.length;

  if (payouts && payouts.length > 0) {
    actualRevenue = payouts.reduce((acc: number, p: any) => acc + Number(p.doctor_amount), 0);
    projectedRevenue = payouts.reduce((acc: number, p: any) => acc + Number(p.amount_total), 0);
  } else {
    // Fallback/Mock caso a tabela de payouts ainda não tenha dados ou a migração falte
    projectedRevenue = totalAppointments * fee;
    const repassePercent = 0.9; // 10% platform fee
    actualRevenue = projectedRevenue * repassePercent;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold font-heading tracking-tight">Receita Financeira</h1>
        <p className="text-muted-foreground">Métricas de consultas e controle de repasses (MVP).</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repasses a Receber</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              R$ {actualRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              80% do ticket médio (R$ {fee.toFixed(2)})
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas (Mês)</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAppointments}</div>
            <p className="text-xs text-muted-foreground mt-1 text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +2 neste mês
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Bruta Gerada</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              R$ {projectedRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Valor bruto retido pela plataforma
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <DoctorFinanceChart appointments={appointments as any[]} fee={fee} />
      </div>

    </div>
  );
}
