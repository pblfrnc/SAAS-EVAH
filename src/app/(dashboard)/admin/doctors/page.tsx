import { adminGetDoctors } from "@/app/actions/admin";
import DoctorsClient from "./doctors-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DoctorsPage() {
  const doctors = await adminGetDoctors();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">Gestão do Corpo Clínico</h1>
          <p className="text-muted-foreground">Cadastre novos profissionais, visualize o quadro médico e gerencie valores.</p>
        </div>
      </div>

      <DoctorsClient initialDoctors={doctors} />
    </div>
  );
}
