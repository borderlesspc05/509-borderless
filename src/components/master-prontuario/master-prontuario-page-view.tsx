"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  Download,
  FileStack,
  Loader2,
  Send,
} from "lucide-react";

import { getDocumentBrandingAction } from "@/app/actions/document-branding-actions";
import {
  getMasterProntuarioAction,
  listPatientsForMasterProntuarioAction,
  sendMasterProntuarioToFamilyAction,
  type MasterProntuarioData,
} from "@/app/actions/master-prontuario-actions";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppToast } from "@/hooks/use-app-toast";
import {
  DEFAULT_DOCUMENT_BRANDING,
  type DocumentBranding,
} from "@/lib/document-branding";
import {
  buildMasterProntuarioSummaryHtml,
  downloadMasterProntuarioPdf,
} from "@/lib/master-prontuario";
import type { PatientRow } from "@/lib/supabase/database.types";

export function MasterProntuarioPageView() {
  const toast = useAppToast();
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [data, setData] = useState<MasterProntuarioData | null>(null);
  const [branding, setBranding] = useState<DocumentBranding>(
    DEFAULT_DOCUMENT_BRANDING
  );
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [isLoadingRecord, setIsLoadingRecord] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPatients() {
      setIsLoadingPatients(true);
      const [patientsResult, brandingResult] = await Promise.all([
        listPatientsForMasterProntuarioAction(),
        getDocumentBrandingAction(),
      ]);
      if (cancelled) return;

      if (!patientsResult.success) {
        setError(patientsResult.error ?? "Não foi possível listar aprendizes.");
        setPatients([]);
      } else {
        setPatients(patientsResult.data?.patients ?? []);
      }

      if (brandingResult.success) {
        setBranding(brandingResult.data);
      }

      setIsLoadingPatients(false);
    }

    void loadPatients();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedPatientId) {
      setData(null);
      return;
    }

    let cancelled = false;

    async function loadRecord() {
      setIsLoadingRecord(true);
      setError(null);
      const result = await getMasterProntuarioAction(selectedPatientId);
      if (cancelled) return;

      if (!result.success || !result.data) {
        setData(null);
        setError(result.error ?? "Não foi possível carregar o prontuário.");
      } else {
        setData(result.data);
      }
      setIsLoadingRecord(false);
    }

    void loadRecord();
    return () => {
      cancelled = true;
    };
  }, [selectedPatientId]);

  const documentHtml = useMemo(
    () => (data ? buildMasterProntuarioSummaryHtml(data) : ""),
    [data]
  );

  const stats = useMemo(() => {
    if (!data) return [];
    return [
      ["Equipe", data.team.length],
      ["Anamneses", data.anamneses.length],
      ["Avaliações", data.record.evaluations.length],
      ["Evoluções ABA", data.record.evolutions.length],
      ["Evoluções conv.", data.record.conventionalEvolutions.length],
      ["Mapa corporal", data.bodyMarks.length],
      ["Programas", data.record.programs.length],
      ["Documentos", data.record.documents.length],
      ["Atividades", data.record.homeActivities.length],
      ["Orientações", data.record.parentOrientations.length],
      ["Atendimentos", data.record.attendances.length],
      [
        "Planejamentos",
        (data.therapeuticPlan ? 1 : 0) + data.record.therapeuticPlans.length,
      ],
    ] as const;
  }, [data]);

  function handleExportPdf() {
    if (!data) return;
    startTransition(async () => {
      try {
        await downloadMasterProntuarioPdf(data, branding);
        toast.success({ title: "PDF gerado" });
      } catch (exportError) {
        toast.error({
          title: "Falha ao exportar PDF",
          description:
            exportError instanceof Error
              ? exportError.message
              : "Erro desconhecido",
        });
      }
    });
  }

  function handleSendToFamily() {
    if (!data || !selectedPatientId) return;

    startTransition(async () => {
      const result = await sendMasterProntuarioToFamilyAction({
        patientId: selectedPatientId,
        summaryHtml: documentHtml,
      });

      if (!result.success) {
        toast.error({
          title: "Falha no envio",
          description: result.error,
        });
        return;
      }

      toast.success({
        title: "Enviado à família",
        description:
          "O prontuário completo foi publicado nas orientações do portal da família.",
      });
    });
  }

  return (
    <PageContainer size="wide" className="space-y-6">
      <DashboardPageHeader
        title="Prontuário consolidado"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Cadastro" },
          { label: "Prontuário consolidado" },
        ]}
      />

      <p className="max-w-3xl text-sm text-muted-foreground">
        Documento clínico completo do aprendiz: identificação, equipe,
        anamneses, planejamento, avaliações, evoluções, mapa corporal,
        programas, documentos, atividades, orientações e atendimentos — apenas
        as áreas com registro.
      </p>

      <section className="app-surface-card space-y-4 p-5 sm:p-6">
        <div className="max-w-xl space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Aprendiz
          </label>
          {isLoadingPatients ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Carregando aprendizes...
            </div>
          ) : (
            <Select
              value={selectedPatientId || null}
              onValueChange={(value) => setSelectedPatientId(value ?? "")}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Selecione um aprendiz" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {error ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {!selectedPatientId ? (
          <EmptyState
            icon={FileStack}
            title="Selecione um aprendiz"
            description="O prontuário consolidado reúne o conteúdo clínico de todas as áreas em que o aprendiz tiver registros."
          />
        ) : isLoadingRecord ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Montando prontuário completo...
          </div>
        ) : data ? (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                className="gap-2"
                onClick={handleExportPdf}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Download className="size-4" aria-hidden />
                )}
                Exportar PDF completo
              </Button>
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={handleSendToFamily}
                disabled={isPending}
              >
                <Send className="size-4" aria-hidden />
                Enviar à família
              </Button>
              <Button
                type="button"
                variant="ghost"
                nativeButton={false}
                render={
                  <Link href={`/paciente/${data.record.patient.id}/prontuario`} />
                }
              >
                Abrir prontuário operacional
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
              {stats.map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3"
                >
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <article className="overflow-hidden rounded-xl border border-border/70">
              <div className="border-b border-border/70 bg-muted/20 px-4 py-3">
                <h2 className="text-base font-semibold">
                  Pré-visualização do documento
                </h2>
                <p className="text-sm text-muted-foreground">
                  Conteúdo integral que será exportado em PDF e enviado ao
                  portal da família.
                </p>
              </div>
              <div className="max-h-[70vh] overflow-auto bg-white p-4 sm:p-6">
                <div
                  className="mx-auto max-w-[794px] text-[13px] leading-relaxed text-foreground [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:border-b [&_h2]:border-[#5B9EA6] [&_h2]:pb-2 [&_h2]:text-[15px] [&_h2]:font-semibold [&_h2]:uppercase [&_h2]:tracking-wide [&_h2]:text-[#1B2A4A] [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-[13px] [&_h3]:font-semibold [&_h3]:uppercase [&_h3]:tracking-wide [&_h3]:text-[#1B2A4A] [&_table]:w-full [&_td]:border [&_td]:border-border/70 [&_td]:p-2 [&_th]:border [&_th]:border-border/70 [&_th]:bg-muted/30 [&_th]:p-2 [&_th]:text-left"
                  dangerouslySetInnerHTML={{ __html: documentHtml }}
                />
              </div>
            </article>
          </div>
        ) : null}
      </section>
    </PageContainer>
  );
}
