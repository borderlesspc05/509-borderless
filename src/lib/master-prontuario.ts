import {
  escapeDocumentHtml,
  DOCUMENT_BRAND_COLORS,
} from "@/lib/document-branding";
import type { MasterProntuarioData } from "@/app/actions/master-prontuario-actions";
import { formatPatientDateTime } from "@/lib/patient-format";

function stripHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildMasterProntuarioSummaryHtml(
  data: MasterProntuarioData
): string {
  const { record, anamneses, therapeuticPlan, bodyMarksCount } = data;
  const patient = record.patient;

  const sections: string[] = [
    `<h2>Prontuário consolidado</h2>`,
    `<p><strong>Aprendiz:</strong> ${escapeDocumentHtml(patient.full_name)}</p>`,
    patient.diagnosis
      ? `<p><strong>Diagnóstico:</strong> ${escapeDocumentHtml(patient.diagnosis)}</p>`
      : "",
    `<h3>Resumo quantitativo</h3>`,
    `<ul>
      <li>Evoluções ABA: ${record.evolutions.length}</li>
      <li>Evoluções convencionais: ${record.conventionalEvolutions.length}</li>
      <li>Avaliações: ${record.evaluations.length}</li>
      <li>Anamneses: ${anamneses.length}</li>
      <li>Documentos: ${record.documents.length}</li>
      <li>Marcas no mapa corporal: ${bodyMarksCount}</li>
      <li>Orientações à família: ${record.parentOrientations.length}</li>
    </ul>`,
  ];

  if (therapeuticPlan) {
    sections.push(
      `<h3>Planejamento terapêutico</h3>`,
      `<p><strong>Curto prazo:</strong> ${escapeDocumentHtml(therapeuticPlan.shortTermGoals || "—")}</p>`,
      `<p><strong>Médio prazo:</strong> ${escapeDocumentHtml(therapeuticPlan.mediumTermGoals || "—")}</p>`,
      `<p><strong>Longo prazo:</strong> ${escapeDocumentHtml(therapeuticPlan.longTermGoals || "—")}</p>`
    );
  }

  if (record.evaluations.length > 0) {
    sections.push(`<h3>Avaliações recentes</h3><ul>`);
    for (const evaluation of record.evaluations.slice(0, 10)) {
      sections.push(
        `<li>${escapeDocumentHtml(evaluation.title || evaluation.instrument || "Avaliação")} — ${escapeDocumentHtml(evaluation.evaluation_date)}</li>`
      );
    }
    sections.push(`</ul>`);
  }

  if (anamneses.length > 0) {
    sections.push(`<h3>Anamneses</h3><ul>`);
    for (const anamnese of anamneses.slice(0, 10)) {
      sections.push(
        `<li>${escapeDocumentHtml(anamnese.anamnesisType)} — ${escapeDocumentHtml(formatPatientDateTime(anamnese.createdAt))}</li>`
      );
    }
    sections.push(`</ul>`);
  }

  if (record.evolutions.length > 0) {
    sections.push(`<h3>Últimas evoluções ABA</h3><ul>`);
    for (const evolution of record.evolutions.slice(0, 5)) {
      const preview = stripHtml(evolution.content_html ?? "").slice(0, 180);
      sections.push(
        `<li><strong>${escapeDocumentHtml(evolution.session_date)}</strong> — ${escapeDocumentHtml(preview || "Sem conteúdo")}</li>`
      );
    }
    sections.push(`</ul>`);
  }

  if (record.documents.length > 0) {
    sections.push(`<h3>Documentos</h3><ul>`);
    for (const document of record.documents.slice(0, 10)) {
      sections.push(
        `<li>${escapeDocumentHtml(document.title)} (${escapeDocumentHtml(document.document_type)})</li>`
      );
    }
    sections.push(`</ul>`);
  }

  return sections.filter(Boolean).join("\n");
}

export async function downloadMasterProntuarioPdf(
  data: MasterProntuarioData
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  const maxWidth = 515;
  let y = margin;

  const patientName = data.record.patient.full_name;
  const generatedAt = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  const writeLine = (text: string, options?: { bold?: boolean; size?: number }) => {
    const size = options?.size ?? 11;
    doc.setFont("helvetica", options?.bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(DOCUMENT_BRAND_COLORS.text);

    const lines = doc.splitTextToSize(text, maxWidth) as string[];
    for (const line of lines) {
      if (y > 780) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += size + 6;
    }
  };

  writeLine("Prontuário consolidado", { bold: true, size: 18 });
  writeLine(`Aprendiz: ${patientName}`, { bold: true, size: 13 });
  writeLine(`Gerado em ${generatedAt}`, { size: 10 });
  y += 8;

  const summaryText = stripHtml(buildMasterProntuarioSummaryHtml(data));
  writeLine(summaryText, { size: 11 });

  const fileName = `prontuario-consolidado-${patientName
    .toLowerCase()
    .replace(/\s+/g, "-")}.pdf`;
  doc.save(fileName);
}
