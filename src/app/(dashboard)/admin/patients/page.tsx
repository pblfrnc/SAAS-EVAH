import { adminGetPatients } from "@/app/actions/admin";
import PatientsClient from "./patients-client";

export default async function PatientsPage() {
  const patients = await adminGetPatients();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">Gestão de Pacientes</h1>
          <p className="text-muted-foreground">Visualize e gerencie a base de pacientes cadastrados na plataforma.</p>
        </div>
      </div>

      <PatientsClient initialPatients={patients} />
    </div>
  );
}
