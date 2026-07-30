"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  Download,
  FileStack,
  Loader2,
  Send,
} from "lucide-react";

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
  buildMasterProntuarioSummaryHtml,
  downloadMasterProntuarioPdf,
} from "@/lib/master-prontuario";
import { formatPatientDateTime } from "@/lib/patient-format";
import type { PatientRow } from "@/lib/supabase/database.types";

export function MasterProntuarioPageView() {
  const toast = useAppToast();
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [data, setData] = useState<MasterProntuarioData | null>(null);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [isLoadingRecord, setIsLoadingRecord] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPatients() {
      setIsLoadingPatients(true);
      const result = await listPatientsForMasterProntuarioAction();
      if (cancelled) return;

      if (!result.success) {
        setError(result.error ?? "Não foi possível listar aprendizes.");
        setPatients([]);
      } else {
        setPatients(result.data?.patients ?? []);
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

  const summaryHtml = useMemo(
    () => (data ? buildMasterProntuarioSummaryHtml(data) : ""),
    [data]
  );

  function handleExportPdf() {
    if (!data) return;
    startTransition(async () => {
      try {
        await downloadMasterProntuarioPdf(data);
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
        summaryHtml,
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
          "O resumo consolidado foi publicado nas orientações do portal da família.",
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

      <p className="max-w-2xl text-sm text-muted-foreground">
        Visão MASTER de todas as áreas clínicas do aprendiz, com exportação e
        envio do resumo ao portal da família.
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
            description="O prontuário consolidado reúne evoluções, avaliações, anamneses, documentos e planejamento de todas as áreas."
          />
        ) : isLoadingRecord ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Carregando prontuário...
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
                <Download className="size-4" aria-hidden />
                Exportar PDF
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

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Evoluções ABA", data.record.evolutions.length],
                [
                  "Evoluções convencionais",
                  data.record.conventionalEvolutions.length,
                ],
                ["Avaliações", data.record.evaluations.length],
                ["Anamneses", data.anamneses.length],
                ["Documentos", data.record.documents.length],
                ["Mapa corporal", data.bodyMarksCount],
                ["Programas", data.record.programs.length],
                ["Orientações", data.record.parentOrientations.length],
              ].map(([label, value]) => (
                <div
                  key={String(label)}
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

            <div className="grid gap-4 lg:grid-cols-2">
              <article className="space-y-3 rounded-xl border border-border/70 p-4">
                <h2 className="text-base font-semibold">Avaliações</h2>
                {data.record.evaluations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma avaliação.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {data.record.evaluations.slice(0, 8).map((evaluation) => (
                      <li key={evaluation.id}>
                        <span className="font-medium">{evaluation.title}</span>
                        <span className="text-muted-foreground">
                          {" "}
                          · {evaluation.evaluation_date} ·{" "}
                          {evaluation.professional_name}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>

              <article className="space-y-3 rounded-xl border border-border/70 p-4">
                <h2 className="text-base font-semibold">Anamneses</h2>
                {data.anamneses.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma anamnese.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {data.anamneses.slice(0, 8).map((anamnese) => (
                      <li key={anamnese.id}>
                        <span className="font-medium">
                          {anamnese.anamnesisType}
                        </span>
                        <span className="text-muted-foreground">
                          {" "}
                          · {formatPatientDateTime(anamnese.createdAt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>

              <article className="space-y-3 rounded-xl border border-border/70 p-4">
                <h2 className="text-base font-semibold">Evoluções ABA</h2>
                {data.record.evolutions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma evolução.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {data.record.evolutions.slice(0, 8).map((evolution) => (
                      <li key={evolution.id}>
                        <span className="font-medium">
                          {evolution.session_date}
                        </span>
                        <span className="text-muted-foreground">
                          {" "}
                          · {evolution.professional_name} · {evolution.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>

              <article className="space-y-3 rounded-xl border border-border/70 p-4">
                <h2 className="text-base font-semibold">Planejamento</h2>
                {!data.therapeuticPlan ? (
                  <p className="text-sm text-muted-foreground">
                    Sem planejamento terapêutico registrado.
                  </p>
                ) : (
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium text-foreground">
                        Curto prazo:
                      </span>{" "}
                      {data.therapeuticPlan.shortTermGoals || "—"}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">
                        Médio prazo:
                      </span>{" "}
                      {data.therapeuticPlan.mediumTermGoals || "—"}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">
                        Longo prazo:
                      </span>{" "}
                      {data.therapeuticPlan.longTermGoals || "—"}
                    </p>
                  </div>
                )}
              </article>
            </div>

            <article className="space-y-3 rounded-xl border border-border/70 p-4">
              <h2 className="text-base font-semibold">Documentos</h2>
              {data.record.documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum documento.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {data.record.documents.slice(0, 12).map((document) => (
                    <li key={document.id}>
                      <span className="font-medium">{document.title}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        · {document.document_type}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </div>
        ) : null}
      </section>
    </PageContainer>
  );
}
