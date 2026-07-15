"use client";

import { Users, Shield, LayoutDashboard, Activity, ChevronRight, DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminDashboardOverview() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading tracking-tight">Dashboard Administrativo</h1>
          <p className="text-muted-foreground">Visão geral da plataforma Evah Health (Admin Master).</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Médicos Ativos</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">12</div>
            <p className="text-xs text-muted-foreground mt-1">+2 cadastrados este mês</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes na Base</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1.248</div>
            <p className="text-xs text-muted-foreground mt-1">+148 nos últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Consultas</CardTitle>
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">843</div>
            <p className="text-xs text-muted-foreground mt-1">Realizadas via Telemedicina</p>
          </CardContent>
        </Card>

        <Card className="bg-green-500/5 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status LGPD</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500 mt-1">Compliance</div>
            <p className="text-xs text-green-500/80 mt-1">100% de aceites registrados</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Acesse rapidamente as funções principais do sistema.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Link href="/admin/doctors" className="w-full">
              <Button variant="outline" className="h-24 w-full flex flex-col items-center justify-center gap-2 group">
                <Users className="h-6 w-6 group-hover:scale-110 transition-transform text-primary" />
                <span>Gerenciar Médicos</span>
              </Button>
            </Link>
            <Link href="/admin/finances" className="w-full">
              <Button variant="outline" className="h-24 w-full flex flex-col items-center justify-center gap-2 group">
                <DollarSign className="h-6 w-6 group-hover:scale-110 transition-transform text-green-500" />
                <span>Extrato Financeiro</span>
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimas Atividades</CardTitle>
            <CardDescription>Auditoria do sistema e eventos recentes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { time: "Há 10 min", event: "Novo médico cadastrado: Dra. Amanda Souza" },
                { time: "Há 1 hora", event: "Consulta finalizada: Dr. Teste Silva" },
                { time: "Há 2 horas", event: "Consentimento LGPD atualizado (v1.2)" },
              ].map((log, i) => (
                <div key={i} className="flex items-center gap-4 text-sm">
                  <div className="w-20 text-muted-foreground text-xs">{log.time}</div>
                  <div className="flex-1 font-medium">{log.event}</div>
                </div>
              ))}
              <Button variant="link" className="px-0 w-full justify-start text-primary">Ver log completo <ChevronRight className="h-4 w-4 ml-1" /></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
