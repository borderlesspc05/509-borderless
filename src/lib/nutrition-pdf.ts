import {
  buildDocumentFooterHtml,
  buildDocumentHeaderHtml,
  DEFAULT_DOCUMENT_BRANDING,
  DOCUMENT_BRAND_COLORS,
  escapeDocumentHtml,
  resolveDocumentLogoUrl,
  type DocumentBranding,
} from "@/lib/document-branding";

export type NutritionPdfInput = {
  patientName: string;
  birthDate?: string | null;
  title: string;
  contentHtml: string;
  professionalName: string;
  professionalRole: string;
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

function buildNutritionPdfHtml(input: NutritionPdfInput, logoDataUrl: string | null) {
  const branding = input.branding ?? DEFAULT_DOCUMENT_BRANDING;
  const header = buildDocumentHeaderHtml(branding, {
    logoUrl: logoDataUrl ?? undefined,
    documentTitle: input.title,
  });

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <style>
          body { margin: 0; padding: 24px; font-family: Georgia, 'Times New Roman', serif; color: ${DOCUMENT_BRAND_COLORS.text}; background: #fff; }
          .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
          .meta-item { padding: 10px 12px; background: #F7FAFC; border: 1px solid ${DOCUMENT_BRAND_COLORS.border}; border-radius: 8px; }
          .meta-label { margin: 0 0 4px; font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: ${DOCUMENT_BRAND_COLORS.muted}; font-family: Helvetica, Arial, sans-serif; }
          .meta-value { margin: 0; font-size: 13px; }
          .content { line-height: 1.65; font-size: 14px; }
          .content p { margin: 0 0 12px; }
        </style>
      </head>
      <body>
        ${header}
        <div class="meta">
          <div class="meta-item">
            <p class="meta-label">Paciente</p>
            <p class="meta-value">${escapeDocumentHtml(input.patientName)}</p>
          </div>
          <div class="meta-item">
            <p class="meta-label">Profissional</p>
            <p class="meta-value">${escapeDocumentHtml(input.professionalName)} — ${escapeDocumentHtml(input.professionalRole)}</p>
          </div>
        </div>
        <div class="content">${input.contentHtml}</div>
        ${buildDocumentFooterHtml(formatGeneratedAt())}
      </body>
    </html>
  `;
}

export async function generateNutritionPdf(input: NutritionPdfInput) {
  const branding = input.branding ?? DEFAULT_DOCUMENT_BRANDING;
  const logoUrl = resolveDocumentLogoUrl(branding);
  let logoDataUrl: string | null = null;

  if (logoUrl) {
    try {
      const response = await fetch(logoUrl, { cache: "force-cache" });
      if (response.ok) {
        const blob = await response.blob();
        logoDataUrl = await new Promise<string | null>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () =>
            resolve(typeof reader.result === "string" ? reader.result : null);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        });
      }
    } catch {
      logoDataUrl = null;
    }
  }

  const html = buildNutritionPdfHtml(input, logoDataUrl);
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.left = "-9999px";
  iframe.style.width = "794px";
  iframe.style.height = "1123px";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  if (!doc) {
    document.body.removeChild(iframe);
    throw new Error("Não foi possível preparar o documento.");
  }

  doc.open();
  doc.write(html);
  doc.close();

  await new Promise((resolve) => setTimeout(resolve, 300));

  const html2canvas = (await import("html2canvas")).default;
  const canvas = await html2canvas(doc.body, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const imgData = canvas.toDataURL("image/png");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save(`${input.title.replace(/\s+/g, "-").toLowerCase()}.pdf`);

  document.body.removeChild(iframe);
}
