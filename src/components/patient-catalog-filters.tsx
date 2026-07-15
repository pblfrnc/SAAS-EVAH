"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useTransition } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function PatientCatalogFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("q") || "";
  const currentSpecialty = searchParams.get("esp") || "todas";

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    
    startTransition(() => {
      router.replace(`?${params.toString()}`);
    });
  };

  const handleSpecialty = (val: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (val && val !== "todas") {
      params.set("esp", val);
    } else {
      params.delete("esp");
    }
    
    startTransition(() => {
      router.replace(`?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-card p-4 rounded-xl shadow-sm border">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar médico por nome..." 
          className="pl-9 h-11"
          defaultValue={currentSearch}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
      <div className="w-full sm:w-[250px]">
        <Select defaultValue={currentSpecialty} onValueChange={handleSpecialty}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Especialidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as Especialidades</SelectItem>
            <SelectItem value="Cardiologista">Cardiologista</SelectItem>
            <SelectItem value="Dermatologista">Dermatologista</SelectItem>
            <SelectItem value="Endocrinologista">Endocrinologista</SelectItem>
            <SelectItem value="Ginecologista">Ginecologista</SelectItem>
            <SelectItem value="Neurologista">Neurologista</SelectItem>
            <SelectItem value="Ortopedista">Ortopedista</SelectItem>
            <SelectItem value="Pediatra">Pediatra</SelectItem>
            <SelectItem value="Psiquiatra">Psiquiatra</SelectItem>
            <SelectItem value="Clínico Geral">Clínico Geral</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
