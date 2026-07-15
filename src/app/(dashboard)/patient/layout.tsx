"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, CalendarDays, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PatientNestedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Agendar Consulta', href: '/patient', icon: Search },
    { name: 'Minhas Consultas', href: '/patient/appointments', icon: CalendarDays },
    { name: 'Histórico Clínico', href: '/patient/history', icon: ClipboardList },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar - Desktop & Mobile Friendly */}
      <aside className="w-full md:w-64 shrink-0">
        <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all whitespace-nowrap",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        <div className="bg-card rounded-2xl border shadow-sm p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
