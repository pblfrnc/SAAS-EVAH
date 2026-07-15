"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Printer, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getClinicSettings } from "@/app/actions/clinic";

interface PrescriptionData {
  patientName: string;
  patientCpf: string;
  patientBirthDate?: string;
  patientAddress?: string;
  patientPhone?: string;
  date: string;
  hash: string;
  medications: { id: number; name: string; dosage: string; quantity: string }[];
}

export default function PrintPrescriptionPage() {
  const [data, setData] = useState<PrescriptionData | null>(null);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    // 1. Buscar configs da clínica
    getClinicSettings().then(res => setSettings(res));

    // 2. Buscar dados da receita da sessão
    const storedData = sessionStorage.getItem("prescription_data");
    if (storedData) {
      setData(JSON.parse(storedData));
      sessionStorage.removeItem("prescription_data");
    }
  }, []);

  if (!data || !settings) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/20">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Carregando dados estruturais da receita...</p>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans print:bg-white p-4 sm:p-8">
      {/* Botões de Ação (Escondidos na Impressão) */}
      <div className="print:hidden flex justify-between items-center mb-8 max-w-4xl mx-auto bg-muted/20 p-4 rounded-xl border">
        <Button variant="outline" onClick={() => window.close()} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <Button onClick={handlePrint} className="gap-2 shadow-premium hover:shadow-premium-hover rounded-full">
          <Printer className="h-4 w-4" /> Assinar Digitalmente e Imprimir
        </Button>
      </div>

      {/* A4 Container */}
      <div className="max-w-4xl mx-auto bg-white sm:border sm:shadow-lg p-8 sm:p-16 min-h-[1000px] print:border-none print:shadow-none print:p-0">
        
        {/* Cabeçalho da Clínica */}
        <div className="border-b-2 border-black pb-6 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{settings.clinic_name}</h1>
            <p className="text-gray-600 mt-1">CNPJ: {settings.cnpj}</p>
            <p className="text-gray-600 text-sm">{settings.address}</p>
            <p className="text-gray-600 text-sm">Tel: {settings.phone} | {settings.email}</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-semibold tracking-wide">RECEITUÁRIO</h2>
          </div>
        </div>

        {/* Dados do Paciente */}
        <div className="mb-12">
          <p className="text-lg"><strong>Para:</strong> {data.patientName}</p>
          <div className="grid grid-cols-2 gap-4 mt-2">
            {data.patientCpf && <p className="text-sm text-gray-700"><strong>CPF:</strong> {data.patientCpf}</p>}
            {data.patientBirthDate && <p className="text-sm text-gray-700"><strong>Nascimento:</strong> {new Date(data.patientBirthDate).toLocaleDateString('pt-BR')}</p>}
            {data.patientPhone && <p className="text-sm text-gray-700"><strong>Telefone:</strong> {data.patientPhone}</p>}
            {data.patientAddress && <p className="text-sm text-gray-700 col-span-2"><strong>Endereço:</strong> {data.patientAddress}</p>}
          </div>
          <p className="text-sm text-gray-600 mt-4">Data de Emissão: {data.date}</p>
        </div>

        {/* Prescrições */}
        <div className="space-y-8 min-h-[400px]">
          {data.medications.map((med, idx) => (
            <div key={med.id || idx} className="flex gap-4">
              <span className="font-bold text-lg">{idx + 1}.</span>
              <div className="flex-1">
                <div className="flex justify-between items-end border-b border-gray-300 pb-1 mb-2">
                  <span className="font-bold text-lg">{med.name}</span>
                  <span className="font-medium text-gray-700">{med.quantity}</span>
                </div>
                <p className="text-gray-800 ml-2 whitespace-pre-wrap">Uso: {med.dosage}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Assinatura Digital Mockada */}
        <div className="mt-20 pt-8 border-t border-black flex justify-between items-end">
          <div className="flex items-center gap-3 text-gray-600">
            <ShieldCheck className="h-16 w-16" />
            <div>
              <p className="font-bold text-sm text-black">Documento Assinado Digitalmente</p>
              <p className="text-xs">Validação ICP-Brasil Cenográfica</p>
              <p className="text-xs font-mono mt-1">Hash: {data.hash}</p>
            </div>
          </div>
          
          <div className="text-center w-80">
            <div className="border-b border-black mb-2 h-8"></div>
            <p className="font-bold text-sm">Assinatura do Médico Responsável</p>
            <p className="text-xs text-gray-600">{settings.clinic_name}</p>
            <p className="text-xs text-gray-500 mt-2 font-medium">RT: {settings.tech_responsible_name} ({settings.tech_responsible_crm})</p>
          </div>
        </div>

        {/* Rodapé Legal Anvisa */}
        <div className="mt-8 text-center text-xs text-gray-400 border-t pt-4">
          <p>Prescrição emitida via Telemedicina em conformidade com as resoluções do CFM e ANVISA.</p>
          <p>A validade deste documento pode ser verificada através do Hash criptográfico ICP-Brasil (Simulado).</p>
        </div>
      </div>
    </div>
  );
}
