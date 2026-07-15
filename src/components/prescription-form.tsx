"use client";

import { useState, useEffect } from "react";
import { Pill, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { savePrescription } from "@/app/actions/prescriptions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Patient {
  id: string;
  cpf: string;
  birth_date?: string;
  address?: string;
  phone?: string;
  profiles: { full_name: string } | { full_name: string }[] | null;
}

const getFullName = (profiles: Patient['profiles']) => {
  if (!profiles) return 'Paciente Desconhecido';
  if (Array.isArray(profiles)) return profiles[0]?.full_name || 'Paciente Desconhecido';
  return profiles.full_name || 'Paciente Desconhecido';
};

export function PrescriptionForm({ patients, memedToken }: { patients: Patient[], memedToken?: string }) {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients.length === 1 ? patients[0].id : "");
  const [isMemedReady, setIsMemedReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  const handleMemedLoad = () => {
    // Apenas marca como pronto quando o módulo core:moduleInit da Memed disparar
    setIsMemedReady(true);
    
    // Registrar listener para salvar no nosso banco quando a receita for emitida via Memed
    const mdHub = (window as any).MdHub;
    if (mdHub) {
      // Remove listeners antigos para evitar duplicidade
      if (mdHub.server) {
        mdHub.server.unbind('prescricaoSalva');
        mdHub.server.on('prescricaoSalva', async (idPrescricao: string) => {
          setIsSaving(true);
          const docHash = `MEMED-${idPrescricao}`;
          await savePrescription(selectedPatientId, docHash, [{ name: "Prescrição Gerada via Memed", dosage: "Ver PDF", quantity: "1" }]);
          setIsSaving(false);
        });
      }
    }
  };

  useEffect(() => {
    // Se não tiver token, não podemos inicializar o script
    if (!memedToken) {
      console.warn("Memed token is missing.");
      return;
    }

    const scriptId = "memed-script";
    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      if ((window as any).MdHub) {
        handleMemedLoad();
      } else {
        // Script is still downloading from previous mount
        existingScript.addEventListener("load", () => {
          if ((window as any).MdHub) {
            handleMemedLoad();
            return;
          }
          const MdSinapsePrescricao = (window as any).MdSinapsePrescricao;
          if (MdSinapsePrescricao && MdSinapsePrescricao.event) {
            MdSinapsePrescricao.event.add("core:moduleInit", function (module: any) {
              if (module.name === "plataforma.prescricao") {
                handleMemedLoad();
              }
            });
          }
        });
      }
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://sandbox.integrations.memed.com.br/modulos/plataforma.sinapse-prescricao/build/sinapse-prescricao.min.js";
    script.setAttribute("data-color", "#14B8A6");
    script.setAttribute("data-token", memedToken);
    
    script.onload = () => {
      if ((window as any).MdHub) {
        handleMemedLoad();
        return;
      }
      const MdSinapsePrescricao = (window as any).MdSinapsePrescricao;
      if (MdSinapsePrescricao && MdSinapsePrescricao.event) {
        MdSinapsePrescricao.event.add("core:moduleInit", function (module: any) {
          if (module.name === "plataforma.prescricao") {
            handleMemedLoad();
          }
        });
      }
    };
    
    document.body.appendChild(script);

    return () => {
      // Limpeza opcional se necessário (normalmente a Memed prefere que o script fique vivo)
    };
  }, [memedToken, selectedPatientId]);

  const openMemed = async () => {
    if (!selectedPatient) return;
    
    const mdHub = (window as any).MdHub;
    if (!mdHub) {
      alert("O módulo da Memed ainda não foi carregado.");
      return;
    }

    try {
      // Configurar dados do paciente na Memed
      await mdHub.command.send('plataforma.prescricao', 'setPaciente', {
        idExterno: selectedPatient.id,
        nome: getFullName(selectedPatient.profiles),
        cpf: (selectedPatient.cpf || "").replace(/\D/g, ''),
        telefone: (selectedPatient.phone || "").replace(/\D/g, ''),
        endereco: selectedPatient.address || ""
      });

      // Abrir o módulo de prescrição após configurar o paciente
      mdHub.module.show("plataforma.prescricao");
    } catch (error) {
      console.error("Erro ao abrir Memed:", error);
      alert("Houve um erro ao inicializar o receituário da Memed.");
    }
  };

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto">
        <Card className="shadow-premium border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-heading">Ecossistema Memed</CardTitle>
            <CardDescription>
              Prescreva com mais de 60.000 medicamentos atualizados e assinatura ICP-Brasil.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {patients.length > 1 && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">1. Selecione o Paciente</Label>
                <Select onValueChange={(val) => setSelectedPatientId(val || "")} value={selectedPatientId}>
                  <SelectTrigger className="w-full h-14 rounded-xl text-base shadow-sm">
                    <SelectValue placeholder="Busque um paciente dos seus prontuários..." />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map(p => (
                      <SelectItem key={p.id} value={p.id} className="py-3">
                        {getFullName(p.profiles)} {p.cpf ? `- CPF: ${p.cpf}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="pt-6 border-t flex flex-col items-center justify-center space-y-4">
              <Button 
                onClick={openMemed} 
                disabled={!selectedPatientId || !isMemedReady || isSaving}
                className="h-14 px-8 text-lg shadow-premium hover:shadow-premium-hover transition-all gap-3 rounded-full w-full max-w-sm"
              >
                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Pill className="h-6 w-6" />}
                Abrir Prescritor Memed
              </Button>
              {!isMemedReady && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" /> Conectando aos servidores da Memed...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
