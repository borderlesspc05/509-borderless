import { formatCareModalities } from "@/lib/care-modality";
import {
  buildDocumentFooterHtml,
  buildDocumentHeaderHtml,
  DEFAULT_DOCUMENT_BRANDING,
  DOCUMENT_BRAND_COLORS,
  escapeDocumentHtml,
  resolveDocumentLogoUrl,
  type DocumentBranding,
} from "@/lib/document-branding";
import { getHealthPlanLabel, healthPlanItems } from "@/lib/patient-form";
import { patientStatusLabels } from "@/lib/patient-format";
import type { PatientRow } from "@/lib/supabase/database.types";

export type PatientRegistryReportPdfInput = {
  patients: PatientRow[];
  branding?: DocumentBranding;
};

function formatGeneratedAt() {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function groupPatientsByModality(patients: PatientRow[]) {
  const aba = patients.filter((patient) => patient.care_modalities?.includes("ABA"));
  const conventional = patients.filter((patient) =>
    patient.care_modalities?.includes("CONVENTIONAL")
  );
  const both = patients.filter(
    (patient) =>
      patient.care_modalities?.includes("ABA") &&
      patient.care_modalities?.includes("CONVENTIONAL")
  );

  return { aba, conventional, both };
}

function groupPatientsByPlan(patients: PatientRow[]) {
  return healthPlanItems.map((plan) => ({
    plan,
    patients: patients.filter((patient) => patient.health_plan === plan.value),
  }));
}

function buildSummaryCards(patients: PatientRow[]) {
  const { aba, conventional, both } = groupPatientsByModality(patients);

  const cards = [
    { label: "Total de aprendizes", value: String(patients.length) },
    { label: "ABA", value: String(aba.length) },
    { label: "Convencional", value: String(conventional.length) },
    { label: "ABA + Convencional", value: String(both.length) },
  ];

  for (const group of groupPatientsByPlan(patients)) {
    cards.push({
      label: group.plan.label,
      value: String(group.patients.length),
    });
  }

  return cards
    .map(
      (card) => `
        <div style="padding:12px 14px;background:#F7FAFC;border:1px solid ${DOCUMENT_BRAND_COLORS.border};border-radius:8px;">
          <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${DOCUMENT_BRAND_COLORS.muted};font-family:Helvetica,Arial,sans-serif;">${escapeDocumentHtml(card.label)}</p>
          <p style="margin:0;font-size:20px;font-weight:700;color:${DOCUMENT_BRAND_COLORS.text};font-family:Helvetica,Arial,sans-serif;">${escapeDocumentHtml(card.value)}</p>
        </div>
      `
    )
    .join("");
}

function buildPatientTable(title: string, rows: PatientRow[]) {
  const body =
    rows.length === 0
      ? `<tr><td colspan="4" style="padding:10px 8px;border:1px solid ${DOCUMENT_BRAND_COLORS.border};color:${DOCUMENT_BRAND_COLORS.muted};">Nenhum aprendiz registrado.</td></tr>`
      : rows
          .map(
            (patient) => `
              <tr>
                <td style="padding:8px;border:1px solid ${DOCUMENT_BRAND_COLORS.border};font-size:12px;">${escapeDocumentHtml(patient.full_name)}</td>
                <td style="padding:8px;border:1px solid ${DOCUMENT_BRAND_COLORS.border};font-size:12px;">${escapeDocumentHtml(patientStatusLabels[patient.status])}</td>
                <td style="padding:8px;border:1px solid ${DOCUMENT_BRAND_COLORS.border};font-size:12px;">${escapeDocumentHtml(formatCareModalities(patient.care_modalities))}</td>
                <td style="padding:8px;border:1px solid ${DOCUMENT_BRAND_COLORS.border};font-size:12px;">${escapeDocumentHtml(getHealthPlanLabel(patient.health_plan) ?? "—")}</td>
              </tr>
            `
          )
          .join("");

  return `
    <section style="margin-top:24px;">
      <h2 style="margin:0 0 10px;font-size:15px;color:${DOCUMENT_BRAND_COLORS.text};font-family:Helvetica,Arial,sans-serif;">${escapeDocumentHtml(title)}</h2>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#EDF2F7;">
            <th style="padding:8px;border:1px solid ${DOCUMENT_BRAND_COLORS.border};text-align:left;font-size:11px;">Nome</th>
            <th style="padding:8px;border:1px solid ${DOCUMENT_BRAND_COLORS.border};text-align:left;font-size:11px;">Status</th>
            <th style="padding:8px;border:1px solid ${DOCUMENT_BRAND_COLORS.border};text-align:left;font-size:11px;">Modalidade</th>
            <th style="padding:8px;border:1px solid ${DOCUMENT_BRAND_COLORS.border};text-align:left;font-size:11px;">Plano</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </section>
  `;
}

function buildReportHtml(
  input: PatientRegistryReportPdfInput,
  branding: DocumentBranding,
  logoDataUrl: string
) {
  const patients = input.patients;
  const { aba, conventional } = groupPatientsByModality(patients);
  const planSections = groupPatientsByPlan(patients)
    .map((group) =>
      buildPatientTable(
        `Aprendizes — ${group.plan.label} (${group.patients.length})`,
        group.patients
      )
    )
    .join("");

  return `
    <div id="patient-registry-report" style="width:794px;padding:28px 32px 36px;background:#fff;color:${DOCUMENT_BRAND_COLORS.text};font-family:Helvetica,Arial,sans-serif;">
      ${buildDocumentHeaderHtml(branding, {
        logoUrl: logoDataUrl,
        documentTitle: "Relatório de Aprendizes",
      })}
      <p style="margin:-8px 0 20px;font-size:12px;color:${DOCUMENT_BRAND_COLORS.muted};">
        Quantitativos por modalidade e plano · Gerado em ${escapeDocumentHtml(formatGeneratedAt())}
      </p>
      <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;">
        ${buildSummaryCards(patients)}
      </div>
      ${buildPatientTable(`Aprendizes — ABA (${aba.length})`, aba)}
      ${buildPatientTable(`Aprendizes — Convencional (${conventional.length})`, conventional)}
      ${planSections}
      ${buildDocumentFooterHtml(formatGeneratedAt())}
    </div>
  `;
}

function buildIsolatedReportDocument(bodyHtml: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8" /></head><body style="margin:0;padding:0;background:#fff;">${bodyHtml}</body></html>`;
}

async function loadImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { cache: "force-cache" });
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(typeof reader.result === "string" ? reader.result : null);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

async function addCanvasToPdf(canvas: HTMLCanvasElement, fileName: string) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const printableWidth = pageWidth - margin * 2;
  const printableHeight = pageHeight - margin * 2;
  const imageData = canvas.toDataURL("image/png");
  const imageHeight = (canvas.height * printableWidth) / canvas.width;

  let offsetY = 0;
  let pageIndex = 0;

  while (offsetY < imageHeight) {
    if (pageIndex > 0) pdf.addPage();
    pdf.addImage(
      imageData,
      "PNG",
      margin,
      margin - offsetY,
      printableWidth,
      imageHeight
    );
    offsetY += printableHeight;
    pageIndex += 1;
  }

  pdf.save(fileName);
}

export async function generatePatientRegistryReportPdf(
  input: PatientRegistryReportPdfInput
) {
  const branding = input.branding ?? DEFAULT_DOCUMENT_BRANDING;
  const logoUrl = resolveDocumentLogoUrl(branding);
  const logoDataUrl =
    (await loadImageAsDataUrl(logoUrl)) ??
    (await loadImageAsDataUrl(resolveDocumentLogoUrl(DEFAULT_DOCUMENT_BRANDING))) ??
    logoUrl;

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText =
    "position:fixed;left:-10000px;top:0;width:794px;height:0;border:0;visibility:hidden;";
  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
    if (!doc) throw new Error("Não foi possível preparar o documento do relatório.");

    doc.open();
    doc.write(
      buildIsolatedReportDocument(
        buildReportHtml(input, branding, logoDataUrl)
      )
    );
    doc.close();

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });

    const reportElement = doc.getElementById("patient-registry-report");
    if (!reportElement) {
      throw new Error("Conteúdo do relatório não encontrado.");
    }

    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(reportElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const fileName = `relatorio-aprendizes-${new Date().toISOString().slice(0, 10)}.pdf`;
    await addCanvasToPdf(canvas, fileName);
  } finally {
    iframe.remove();
  }
}
