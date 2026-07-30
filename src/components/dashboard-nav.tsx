"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Menu, LayoutDashboard, Users, Calendar, DollarSign, Settings, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

export function DashboardNav({ role }: { role: string }) {
  const pathname = usePathname();

  let links = [];

  if (role === "admin") {
    links = [
      { href: "/admin", label: "Visão Geral", icon: LayoutDashboard },
      { href: "/admin/doctors", label: "Médicos", icon: Stethoscope },
      { href: "/admin/patients", label: "Pacientes", icon: Users },
      { href: "/admin/finances", label: "Financeiro", icon: DollarSign },
    ];
  } else if (role === "doctor") {
    links = [
      { href: "/doctor", label: "Agenda", icon: Calendar },
      { href: "/doctor/patients", label: "Meus Pacientes", icon: Users },
      { href: "/doctor/finances", label: "Financeiro", icon: DollarSign },
    ];
  } else if (role === "patient") {
    links = [
      { href: "/patient", label: "Agendar", icon: Calendar },
      { href: "/patient/appointments", label: "Minhas Consultas", icon: Activity },
      { href: "/patient/history", label: "Histórico e LGPD", icon: Settings },
    ];
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-6 ml-6">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive ? "text-primary border-b-2 border-primary pb-5 pt-5" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Mobile Navigation */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden ml-2">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px]">
          <SheetHeader className="text-left mb-6 mt-4">
            <SheetTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Evah Health
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-2">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <SheetClose asChild key={link.href}>
                  <Link
                    href={link.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                </SheetClose>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
