import { getAvailableDoctors } from "@/app/actions/appointments";
import { BookingModal } from "@/components/booking-modal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PatientCatalogFilters } from "@/components/patient-catalog-filters";
import { Stethoscope } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PatientCatalogPage(
  props: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }
) {
  const searchParams = await props.searchParams;
  const search = typeof searchParams?.q === "string" ? searchParams.q : undefined;
  const specialty = typeof searchParams?.esp === "string" ? searchParams.esp : undefined;

  const doctors = await getAvailableDoctors(search, specialty);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold font-heading tracking-tight">Agendar Consulta</h1>
        <p className="text-muted-foreground">Escolha o especialista ideal para você e agende sua telemedicina na hora.</p>
      </div>

      <PatientCatalogFilters />

      {doctors.length === 0 ? (
        <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed">
          <Stethoscope className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground">Nenhum médico encontrado</h3>
          <p className="text-muted-foreground mt-1">Tente ajustar seus filtros de busca para encontrar o especialista ideal.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doc: any) => (
          <Card key={doc.id} className="overflow-hidden hover:border-primary/50 transition-all hover:shadow-md flex flex-col h-full">
            <div className="h-2 bg-gradient-to-r from-primary to-primary/60"></div>
            <CardHeader className="text-center pb-4 flex-grow">
              <Avatar className="h-20 w-20 mx-auto mb-4 border-4 border-background shadow-sm">
                <AvatarImage src={doc.profiles.avatar_url || ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                  {doc.profiles.full_name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl line-clamp-1">{doc.profiles.full_name}</CardTitle>
              <CardDescription className="text-primary text-sm font-medium mt-1">
                {doc.specialization}
              </CardDescription>
              {doc.crm && (
                <p className="text-xs text-muted-foreground mt-2">CRM: {doc.crm}</p>
              )}
            </CardHeader>
            <CardContent className="mt-auto">
              <div className="bg-muted/30 p-3 rounded-lg mb-4 text-center">
                <span className="text-sm text-muted-foreground block">Valor da Consulta</span>
                <span className="text-lg font-bold text-foreground">
                  R$ {doc.consultation_fee ? Number(doc.consultation_fee).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '150,00'}
                </span>
              </div>
              <BookingModal doctorId={doc.id} doctorName={doc.profiles.full_name} fee={doc.consultation_fee || 150} availability={doc.availability} />
            </CardContent>
          </Card>
        ))}
      </div>
      )}
    </div>
  );
}
