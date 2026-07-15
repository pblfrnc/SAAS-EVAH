import { DollarSign, TrendingUp, CreditCard, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getGlobalFinances } from "@/app/actions/appointments";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const AdminFinanceChart = dynamic(
  () => import("@/components/admin-finance-chart").then(mod => mod.AdminFinanceChart),
  { loading: () => <Skeleton className="h-[400px] w-full rounded-2xl" /> }
);
export default async function FinancesPage() {
  const globalFinances = await getGlobalFinances();
  
  let totalGrossRevenue = 0;
  const totalAppointments = globalFinances.length;
  const dailyData: Record<string, { gross: number, platform: number }> = {};

  globalFinances.forEach(app => {
    // any cast because doctor relation is returned dynamically
    const doctorObj = app.doctors as any;
    const fee = doctorObj?.consultation_fee || 150.00;
    
    totalGrossRevenue += fee;

    const dateStr = new Date(app.start_time).toLocaleDateString('pt-BR');
    if (!dailyData[dateStr]) {
      dailyData[dateStr] = { gross: 0, platform: 0 };
    }
    dailyData[dateStr].gross += fee;
    dailyData[dateStr].platform += fee * 0.2; // 20% platform fee
  });

  const averageTicket = totalAppointments > 0 ? (totalGrossRevenue / totalAppointments) : 0;
  
  const chartData = Object.keys(dailyData).map(date => ({
    date,
    grossRevenue: dailyData[date].gross,
    platformFee: dailyData[date].platform
  }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">Visão Financeira</h1>
          <p className="text-muted-foreground">Controle de valores das consultas, faturamento e extratos globais.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Exportar Relatório
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Receita Bruta (Acumulado)</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-heading text-primary">
              R$ {totalGrossRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" /> Histórico total gerado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Consultas Faturadas</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-heading">{totalAppointments}</div>
            <p className="text-xs text-muted-foreground mt-1">Total na plataforma</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio (Valor Consulta)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-heading">
              R$ {averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <Button variant="link" className="h-auto p-0 text-xs mt-1 text-primary">Visualizar por Especialidade</Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <AdminFinanceChart data={chartData} />
      </div>
    </div>
  );
}
