"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminFinanceChartProps {
  data: {
    date: string;
    grossRevenue: number;
    platformFee: number;
  }[];
}

export function AdminFinanceChart({ data }: AdminFinanceChartProps) {
  const chartData = useMemo(() => {
    // Ordenar por data corretamente
    return [...data].sort((a, b) => {
      const [dayA, monthA, yearA] = a.date.split('/');
      const [dayB, monthB, yearB] = b.date.split('/');
      return new Date(Number(yearA), Number(monthA)-1, Number(dayA)).getTime() - 
             new Date(Number(yearB), Number(monthB)-1, Number(dayB)).getTime();
    });
  }, [data]);

  return (
    <Card className="col-span-1 md:col-span-3 shadow-sm border-primary/20">
      <CardHeader>
        <CardTitle>Faturamento Global e Lucro da Plataforma</CardTitle>
        <CardDescription>Visão geral de Receita Bruta vs Margem Retida (20%).</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
            Nenhuma transação processada.
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  formatter={(value: any, name: any) => {
                    const numValue = Number(value) || 0;
                    const label = name === "grossRevenue" ? "Receita Bruta (R$)" : "Retenção EvaH (R$)";
                    return [`R$ ${numValue.toFixed(2)}`, label];
                  }}
                  labelFormatter={(label) => `Data: ${label}`}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                />
                <Bar 
                  dataKey="grossRevenue" 
                  fill="#93c5fd" // blue-300
                  radius={[4, 4, 0, 0]}
                  name="grossRevenue"
                />
                <Bar 
                  dataKey="platformFee" 
                  fill="#3b82f6" // blue-500
                  radius={[4, 4, 0, 0]}
                  name="platformFee"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
