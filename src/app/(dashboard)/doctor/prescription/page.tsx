import { getDoctorPatients } from "@/app/actions/prescriptions";
import { getOrCreateMemedToken } from "@/app/actions/memed";
import { createClient } from "@/lib/supabase/server";
import { PrescriptionForm } from "@/components/prescription-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function PrescriptionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const patients = await getDoctorPatients();

  let memedToken = "";
  if (user) {
    const memedRes = await getOrCreateMemedToken(user.id);
    if (memedRes.token) {
      memedToken = memedRes.token;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/doctor">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold font-heading tracking-tight">Prescrição Digital</h1>
            <p className="text-muted-foreground">Emita receitas e atestados com assinatura digital (ICP-Brasil simulada).</p>
          </div>
        </div>
        <Link href="/doctor/prescriptions-history">
          <Button variant="outline" className="gap-2 rounded-full shadow-premium">
            Histórico de Emissões
          </Button>
        </Link>
      </div>

      <PrescriptionForm patients={patients} memedToken={memedToken} />
    </div>
  );
}
