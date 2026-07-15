"use client";

import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AppointmentData {
  id: string;
  start_time: string;
  status: string;
}

interface DoctorFinanceChartProps {
  appointments: AppointmentData[];
  fee: number;
}

export function DoctorFinanceChart({ appointments, fee }: DoctorFinanceChartProps) {
  const chartData = useMemo(() => {
    // Agrupar consultas confirmadas/pagas por dia
    const dailyData: Record<string, number> = {};
    
    // Considerar todos os agendamentos (para mock), na vida real filtraríamos por status = 'completed' ou 'paid'
    appointments.forEach(app => {
      // Pega apenas a data local (YYYY-MM-DD)
      const dateStr = new Date(app.start_time).toLocaleDateString('pt-BR');
      if (!dailyData[dateStr]) {
        dailyData[dateStr] = 0;
      }
      dailyData[dateStr] += fee * 0.8; // 80% do ticket repassado ao médico
    });

    // Ordenar as chaves (datas) para que a linha faça sentido da esquerda para a direita
    const sortedDates = Object.keys(dailyData).sort((a, b) => {
      const [dayA, monthA, yearA] = a.split('/');
      const [dayB, monthB, yearB] = b.split('/');
      return new Date(Number(yearA), Number(monthA)-1, Number(dayA)).getTime() - 
             new Date(Number(yearB), Number(monthB)-1, Number(dayB)).getTime();
    });

    return sortedDates.map(date => ({
      date,
      revenue: dailyData[date]
    }));
  }, [appointments, fee]);

  return (
    <Card className="col-span-1 md:col-span-3 shadow-sm border-primary/20">
      <CardHeader>
        <CardTitle>Evolução de Repasses (Mês)</CardTitle>
        <CardDescription>Acompanhe sua receita líquida gerada por dia de atendimento.</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
            Nenhuma consulta agendada ainda.
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  tickFormatter={(value) => `R$${value}`}
                />
                <Tooltip 
                  formatter={(value: any) => [`R$ ${Number(value || 0).toFixed(2)}`, "Receita Líquida"]}
                  labelFormatter={(label) => `Data: ${label}`}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
