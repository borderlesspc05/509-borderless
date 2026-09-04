import type { MasterProntuarioData } from "@/app/actions/master-prontuario-actions";
import {
  ALTERACAO_MUSCULOESQUELETICA_OPTIONS,
  COMPORTAMENTO_OPTIONS,
  COMPONENTES_MOTORES_OPTIONS,
  DESENVOLVIMENTO_MOTOR_OPTIONS,
} from "@/lib/anamnesis-fisioterapia";
import { ANAMNESIS_TYPE_OPTIONS } from "@/lib/anamnesis-types";
import {
  getBodyLateralityLabel,
  getBodyMarkTypeLabel,
  getBodyViewSideLabel,
} from "@/lib/body-map-format";
import { parseNotes3D } from "@/lib/body-map-3d/proportions";
import { getPatientDocumentTypeLabel } from "@/lib/clinical-files";
import {
  CLINICAL_AREA_LABELS,
  getClinicalAreasForRole,
} from "@/lib/clinical-areas";
import { DEMUCA_INSTRUMENT } from "@/lib/demuca";
import {
  ARTICULACAO_OBSERVACAO_OPTIONS,
  DIADOCOCINESIA_OPTIONS,
  DICCAO_INSTRUMENT,
  MOBILIDADE_LABIOS_ITEMS,
  MOBILIDADE_LINGUA_ITEMS,
} from "@/lib/diccao";
import {
  buildDocumentFooterHtml,
  buildDocumentHeaderHtml,
  DEFAULT_DOCUMENT_BRANDING,
  DOCUMENT_BRAND_COLORS,
  escapeDocumentHtml,
  resolveDocumentLogoUrl,
  type DocumentBranding,
} from "@/lib/document-branding";
import { EBAI_INSTRUMENT } from "@/lib/ebai";
import { PEDI_AREA_LABELS, PEDI_INSTRUMENT } from "@/lib/pedi";
import type { PediArea } from "@/lib/pedi";
import {
  calculatePatientAge,
  formatPatientDate,
  formatPatientDateTime,
  patientStatusLabels,
} from "@/lib/patient-format";
import { SENSORY_PROFILE_INSTRUMENT } from "@/lib/sensory-profile";
import { SENSORY_QUADRANT_LABELS } from "@/lib/sensory-profile/constants";
import type { SensoryQuadrant } from "@/lib/sensory-profile/types";

const COLORS = DOCUMENT_BRAND_COLORS;

function formatGeneratedAt() {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function sectionHeading(title: string) {
  return `
    <h2 style="margin:32px 0 14px;padding-bottom:8px;border-bottom:2px solid ${COLORS.teal};font-size:15px;font-family:Helvetica,Arial,sans-serif;text-transform:uppercase;letter-spacing:0.05em;color:${COLORS.navy};">
      ${escapeDocumentHtml(title)}
    </h2>
  `;
}

function subHeading(title: string) {
  return `
    <h3 style="margin:20px 0 10px;font-size:13px;font-family:Helvetica,Arial,sans-serif;text-transform:uppercase;letter-spacing:0.04em;color:${COLORS.navy};">
      ${escapeDocumentHtml(title)}
    </h3>
  `;
}

function metaCell(label: string, value: string) {
  return `
    <div style="padding:10px 12px;background:#F7FAFC;border:1px solid ${COLORS.border};border-radius:8px;">
      <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${COLORS.muted};font-family:Helvetica,Arial,sans-serif;">${escapeDocumentHtml(label)}</p>
      <p style="margin:0;font-size:13px;color:${COLORS.text};font-family:Georgia,'Times New Roman',serif;">${escapeDocumentHtml(value || "—")}</p>
    </div>
  `;
}

function narrativeBox(html: string) {
  const content =
    html.trim() && html.trim() !== "<br>"
      ? html
      : "<p><em>Sem conteúdo registrado.</em></p>";

  return `
    <div style="padding:14px 16px;border:1px solid ${COLORS.border};border-left:4px solid ${COLORS.teal};border-radius:8px;font-size:13px;line-height:1.6;color:${COLORS.text};background:#FBFDFF;">
      ${content}
    </div>
  `;
}

function kvRow(label: string, value: string) {
  if (!value.trim()) return "";
  return `
    <p style="margin:0 0 8px;font-size:13px;line-height:1.55;">
      <strong style="color:${COLORS.navy};">${escapeDocumentHtml(label)}:</strong>
      ${escapeDocumentHtml(value)}
    </p>
  `;
}

function listBlock(title: string, items: string[]) {
  if (items.length === 0) return "";
  return `
    <p style="margin:0 0 6px;font-size:13px;">
      <strong style="color:${COLORS.navy};">${escapeDocumentHtml(title)}:</strong>
      ${escapeDocumentHtml(items.join(", "))}
    </p>
  `;
}

function tryParseJson(value: string): unknown | null {
  const trimmed = value.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
    return null;
  }

  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown) {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return "";
}

function humanizeKey(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/^\w/, (char) => char.toUpperCase());
}

function getAnamnesisTypeLabel(type: string) {
  return (
    ANAMNESIS_TYPE_OPTIONS.find((option) => option.value === type)?.label ??
    humanizeKey(type)
  );
}

function selectedBooleanLabels(
  map: unknown,
  options: readonly { key: string; label: string }[]
) {
  if (!isRecord(map)) return [];
  return options
    .filter((option) => map[option.key] === true)
    .map((option) => option.label);
}

function renderGenericFormData(
  value: unknown,
  depth = 0,
  knownLabels: Record<string, string> = {}
): string {
  if (value == null) return "";

  if (typeof value === "string" || typeof value === "number") {
    const text = String(value).trim();
    return text ? `<p style="margin:0 0 8px;font-size:13px;">${escapeDocumentHtml(text)}</p>` : "";
  }

  if (typeof value === "boolean") {
    return value
      ? `<p style="margin:0 0 8px;font-size:13px;">Sim</p>`
      : "";
  }

  if (Array.isArray(value)) {
    const items = value
      .map((item) => renderGenericFormData(item, depth + 1, knownLabels))
      .filter(Boolean);
    return items.join("");
  }

  if (!isRecord(value)) return "";

  const entries = Object.entries(value);
  const booleanEntries = entries.filter(([, v]) => typeof v === "boolean");
  const otherEntries = entries.filter(([, v]) => typeof v !== "boolean");

  const selectedBooleans = booleanEntries
    .filter(([, v]) => v === true)
    .map(([key]) => knownLabels[key] ?? humanizeKey(key));

  let html = "";
  if (selectedBooleans.length > 0) {
    html += `<p style="margin:0 0 8px;font-size:13px;">${escapeDocumentHtml(selectedBooleans.join(", "))}</p>`;
  }

  for (const [key, nested] of otherEntries) {
    if (nested == null || nested === "") continue;
    if (typeof nested === "boolean") continue;

    const label = knownLabels[key] ?? humanizeKey(key);

    if (typeof nested === "string" || typeof nested === "number") {
      html += kvRow(label, String(nested));
      continue;
    }

    if (isRecord(nested) || Array.isArray(nested)) {
      const nestedHtml = renderGenericFormData(nested, depth + 1, knownLabels);
      if (!nestedHtml) continue;
      html += `
        <div style="margin:10px 0 12px;padding-left:${depth === 0 ? 0 : 10}px;">
          <p style="margin:0 0 6px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:${COLORS.muted};font-family:Helvetica,Arial,sans-serif;">
            ${escapeDocumentHtml(label)}
          </p>
          ${nestedHtml}
        </div>
      `;
    }
  }

  return html;
}

const FISIO_LABELS: Record<string, string> = {
  diagnosticoQueixaPrincipal: "Diagnóstico / queixa principal",
  queixaFuncional: "Queixa funcional",
  medicamentos: "Medicamentos",
  saude: "Saúde",
  historiaPregressa: "História pregressa",
  idadeGestacional: "Idade gestacional",
  peso: "Peso",
  altaJuntoDaMae: "Alta junto da mãe",
  desenvolvimento: "Desenvolvimento motor",
  alteracaoMusculoEsqueletica: "Alteração musculoesquelética",
  componentesMotores: "Componentes motores",
  dominancia: "Dominância",
  escola: "Escola",
  nome: "Nome",
  serie: "Série",
  contraturno: "Contraturno",
  queixas: "Queixas escolares",
  atendenteOuCuidador: "Atendente / cuidador",
  materialAdaptado: "Material adaptado",
  compreensao: "Compreensão",
  imitacaoMotora: "Imitação motora",
  comportamento: "Comportamento",
  avd: "AVDs",
  higiene: "Higiene",
  banho: "Banho",
  higieneBucal: "Higiene bucal",
  pentearCabelo: "Pentear cabelo",
  vestuario: "Vestuário",
  alimentacao: "Alimentação",
  nivel: "Nível",
  controleEsfincter: "Controle esfincteriano",
  pedeBanheiro: "Pede banheiro",
  postura: "Postura",
  seguraEscova: "Segura escova",
  escovaDentes: "Escova os dentes",
  levaPente: "Leva o pente",
  desembaraça: "Desembaraça",
  amarra: "Amarra",
  vesteSozinho: "Veste sozinho",
  despeSozinho: "Despe sozinho",
  rotina: "Rotina",
  geral: "Geral",
  acordar: "Acordar",
  brincarTv: "Brincar / TV",
  sono: "Sono",
  tempoTelas: "Tempo de telas",
  brincar: "Brincar",
  objetivosFamilia: "Objetivos da família",
  objetivosFuncionais: "Objetivos funcionais",
};

const TO_LABELS: Record<string, string> = {
  queixaPrincipal: "Queixa principal",
  medicamentos: "Medicamentos",
  historiaPregressa: "História pregressa",
  alergias: "Alergias",
  desenvolvimento: "Desenvolvimento",
  controleCervical: "Controle cervical",
  rolou: "Rolou",
  arrastou: "Arrastou",
  segurouObjetos: "Segurou objetos",
  sentouSemApoio: "Sentou sem apoio",
  engatinhou: "Engatinhou",
  andouSemApoio: "Andou sem apoio",
  explorarBoca: "Explorou a boca",
  falou: "Falou",
  sono: "Sono",
  dificuldades: "Dificuldades",
  bebeAgitado: "Bebê agitado",
  choravaMuito: "Chorava muito",
  excessivamentePassivo: "Excessivamente passivo",
  alimentacaoInfo: "Alimentação (histórico)",
  idadeIntroducao: "Idade de introdução",
  comoOfertava: "Como ofertava",
  engasgava: "Engasgava",
  desfralde: "Desfralde",
  observacoesDesenvolvimento: "Observações do desenvolvimento",
  observacoesSono: "Observações do sono",
  observacoesMusculoEsqueletico: "Observações músculo-esqueléticas",
  componentesMotores: "Componentes motores",
  observacoesMotores: "Observações motoras",
  dominancia: "Dominância",
  cognitivoSocial: "Cognitivo e social",
  observacoesCognitivoSocial: "Observações cognitivo-sociais",
  alteracaoMusculoEsqueletica: "Alteração musculoesquelética",
  forca: "Força",
  controlePostural: "Controle postural",
  tonusMuscular: "Tônus muscular",
  alinhamentoPostural: "Alinhamento postural",
  adm: "ADM",
  controleMotorPraxia: "Controle motor / praxia",
  escorregaCadeira: "Escorrega da cadeira",
  escola: "Escola",
  higiene: "Higiene",
  banho: "Banho",
  vestuario: "Vestuário",
  alimentacao: "Alimentação",
  rotina: "Rotina",
  objetivosFamilia: "Objetivos da família",
};

function renderAnamnesisFormData(type: string, formData: unknown) {
  if (type === "fisioterapia" && isRecord(formData)) {
    let html = "";
    html += kvRow(
      "Diagnóstico / queixa principal",
      asString(formData.diagnosticoQueixaPrincipal)
    );
    html += kvRow("Queixa funcional", asString(formData.queixaFuncional));
    html += kvRow("Medicamentos", asString(formData.medicamentos));
    html += listBlock(
      "Desenvolvimento motor",
      selectedBooleanLabels(formData.desenvolvimento, DESENVOLVIMENTO_MOTOR_OPTIONS)
    );
    html += listBlock(
      "Alteração musculoesquelética",
      selectedBooleanLabels(
        formData.alteracaoMusculoEsqueletica,
        ALTERACAO_MUSCULOESQUELETICA_OPTIONS
      )
    );
    html += listBlock(
      "Componentes motores",
      selectedBooleanLabels(formData.componentesMotores, COMPONENTES_MOTORES_OPTIONS)
    );
    html += listBlock(
      "Comportamento",
      selectedBooleanLabels(formData.comportamento, COMPORTAMENTO_OPTIONS)
    );
    html += kvRow("Dominância", asString(formData.dominancia));
    html += kvRow("Compreensão", asString(formData.compreensao));
    html += kvRow("Imitação motora", asString(formData.imitacaoMotora));
    html += kvRow("Objetivos da família", asString(formData.objetivosFamilia));
    html += kvRow(
      "Objetivos funcionais",
      asString(formData.objetivosFuncionais)
    );

    const nested = renderGenericFormData(
      {
        saude: formData.saude,
        escola: formData.escola,
        avd: formData.avd,
        rotina: formData.rotina,
      },
      0,
      FISIO_LABELS
    );
    html += nested;
    return html || "<p><em>Sem dados preenchidos.</em></p>";
  }

  if (type === "terapia_ocupacional") {
    return (
      renderGenericFormData(formData, 0, TO_LABELS) ||
      "<p><em>Sem dados preenchidos.</em></p>"
    );
  }

  return (
    renderGenericFormData(formData) ||
    "<p><em>Sem dados preenchidos.</em></p>"
  );
}

function renderDiccaoSummary(payload: Record<string, unknown>) {
  const form = isRecord(payload.formData) ? payload.formData : payload;
  let html = "";

  if (isRecord(form.articulacao)) {
    html += kvRow(
      "Repetições UI / s",
      asString(form.articulacao.uiRepeticoesSegundos)
    );
    html += kvRow(
      "Repetições P / s",
      asString(form.articulacao.pRepeticoesSegundos)
    );
    html += listBlock(
      "Observações de articulação",
      selectedBooleanLabels(
        form.articulacao.observacoes,
        ARTICULACAO_OBSERVACAO_OPTIONS
      )
    );
    html += kvRow(
      "Outras observações (articulação)",
      asString(form.articulacao.outrasObservacoes)
    );
  }

  html += kvRow("Intensidade vocal", asString(form.intensidadeVocal));

  const tempoMaximoFonacao = form.tempoMaximoFonacao;
  if (isRecord(tempoMaximoFonacao)) {
    html += kvRow(
      "TMF",
      ["a", "i", "s", "z"]
        .map(
          (key) =>
            `${key.toUpperCase()}: ${asString(tempoMaximoFonacao[key]) || "—"}`
        )
        .join(" · ")
    );
  }

  html += listBlock(
    "Diadocinesia",
    selectedBooleanLabels(form.diadocinesia, DIADOCOCINESIA_OPTIONS)
  );

  if (isRecord(form.falaAutomatica)) {
    html += kvRow("Omissão", asString(form.falaAutomatica.omissao));
    html += kvRow("Substituição", asString(form.falaAutomatica.substituicao));
    html += kvRow("Distorção", asString(form.falaAutomatica.distorcao));
  }

  const mobilidadeLabios = form.mobilidadeLabios;
  if (isRecord(mobilidadeLabios)) {
    const lips = MOBILIDADE_LABIOS_ITEMS.map((item) => {
      const score = mobilidadeLabios[item.key];
      return score == null ? null : `${item.label}: ${String(score)}`;
    }).filter(Boolean) as string[];
    html += listBlock("Mobilidade de lábios", lips);
  }

  const mobilidadeLingua = form.mobilidadeLingua;
  if (isRecord(mobilidadeLingua)) {
    const tongue = MOBILIDADE_LINGUA_ITEMS.map((item) => {
      const score = mobilidadeLingua[item.key];
      return score == null ? null : `${item.label}: ${String(score)}`;
    }).filter(Boolean) as string[];
    html += listBlock("Mobilidade de língua", tongue);
  }

  html += kvRow("Observações gerais", asString(form.observacoesGerais));
  return html || "<p><em>Sem dados estruturados.</em></p>";
}

function renderEvaluationBody(contentHtml: string, instrument: string | null) {
  const parsed = tryParseJson(contentHtml);

  if (!parsed || !isRecord(parsed)) {
    return narrativeBox(contentHtml);
  }

  const instrumentName = asString(parsed.instrument) || instrument || "";

  if (instrumentName === SENSORY_PROFILE_INSTRUMENT || instrument === SENSORY_PROFILE_INSTRUMENT) {
    const scores = isRecord(parsed.scores) ? parsed.scores : null;
    const quadrants = Array.isArray(scores?.quadrants) ? scores.quadrants : [];
    let html = kvRow("Faixa etária", asString(parsed.ageBand));
    html += `<ul style="margin:0;padding-left:18px;font-size:13px;">`;
    for (const item of quadrants) {
      if (!isRecord(item)) continue;
      const quadrant = asString(item.quadrant) as SensoryQuadrant;
      const label =
        SENSORY_QUADRANT_LABELS[quadrant] ??
        (asString(item.quadrant) || "Quadrante");
      const classification =
        asString(item.classificationLabel) || asString(item.classification);
      html += `<li style="margin-bottom:4px;"><strong>${escapeDocumentHtml(label)}</strong>: ${escapeDocumentHtml(classification || "—")}</li>`;
    }
    html += `</ul>`;
    return narrativeBox(html);
  }

  if (instrumentName === DEMUCA_INSTRUMENT || instrument === DEMUCA_INSTRUMENT) {
    const scores = isRecord(parsed.scores) ? parsed.scores : null;
    const domains = Array.isArray(scores?.domains) ? scores.domains : [];
    const overall =
      typeof scores?.overallScore === "number"
        ? `${Math.round(scores.overallScore * 100)}%`
        : "—";
    let html = kvRow("Escore geral", overall);
    html += `<ul style="margin:0;padding-left:18px;font-size:13px;">`;
    for (const domain of domains) {
      if (!isRecord(domain)) continue;
      const pct =
        typeof domain.finalScore === "number"
          ? `${Math.round(domain.finalScore * 100)}%`
          : "—";
      html += `<li style="margin-bottom:4px;"><strong>${escapeDocumentHtml(asString(domain.domainLabel) || "Domínio")}</strong>: ${escapeDocumentHtml(pct)}</li>`;
    }
    html += `</ul>`;
    if (asString(parsed.notes)) {
      html += kvRow("Observações", asString(parsed.notes));
    }
    return narrativeBox(html);
  }

  if (instrumentName === EBAI_INSTRUMENT || instrument === EBAI_INSTRUMENT) {
    const scores = isRecord(parsed.scores) ? parsed.scores : null;
    let html = "";
    html += kvRow("Escore bruto", asString(scores?.rawScore));
    html += kvRow("Escore T", asString(scores?.tScore));
    html += kvRow(
      "Classificação",
      asString(scores?.classificationLabel) || asString(scores?.classification)
    );
    return narrativeBox(html);
  }

  if (instrumentName === PEDI_INSTRUMENT || instrument === PEDI_INSTRUMENT) {
    const scores = isRecord(parsed.scores) ? parsed.scores : null;
    const areas = Array.isArray(scores?.areas) ? scores.areas : [];
    const caregiverAreas = Array.isArray(scores?.caregiverAreas)
      ? scores.caregiverAreas
      : [];
    let html = kvRow(
      "Idade (meses)",
      asString(parsed.ageMonths) || asString(scores?.ageMonths)
    );

    const renderPediAreas = (list: unknown[], title: string) => {
      if (list.length === 0) return "";
      let block = `<p style="margin:8px 0 4px;font-size:12px;font-weight:700;color:${COLORS.navy};">${escapeDocumentHtml(title)}</p><ul style="margin:0;padding-left:18px;font-size:13px;">`;
      for (const area of list) {
        if (!isRecord(area)) continue;
        const areaKey = asString(area.area) as PediArea;
        const name =
          PEDI_AREA_LABELS[areaKey] ??
          (asString(area.areaLabel) || asString(area.area) || "Área");
        const continuous = asString(area.continuousScore);
        const normative = asString(area.normativeScore);
        block += `<li style="margin-bottom:4px;"><strong>${escapeDocumentHtml(name)}</strong>: contínuo ${escapeDocumentHtml(continuous || "—")}${normative ? ` · normativo ${escapeDocumentHtml(normative)}` : ""}</li>`;
      }
      block += `</ul>`;
      return block;
    };

    html += renderPediAreas(areas, "Parte I — Habilidade funcional");
    html += renderPediAreas(
      caregiverAreas,
      "Parte II — Assistência do cuidador"
    );

    if (!areas.length && !caregiverAreas.length) {
      html += renderGenericFormData(scores ?? parsed);
    }
    return narrativeBox(html);
  }

  if (instrumentName === DICCAO_INSTRUMENT || instrument === DICCAO_INSTRUMENT) {
    return narrativeBox(renderDiccaoSummary(parsed));
  }

  return narrativeBox(renderGenericFormData(parsed));
}

function buildIdentificationSection(data: MasterProntuarioData) {
  const patient = data.record.patient;
  const status =
    patient.status in patientStatusLabels
      ? patientStatusLabels[patient.status as keyof typeof patientStatusLabels]
      : patient.status;

  return `
    ${sectionHeading("1. Identificação do aprendiz")}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
      ${metaCell("Nome", patient.full_name)}
      ${metaCell("Data de nascimento", formatPatientDate(patient.birth_date))}
      ${metaCell("Idade", calculatePatientAge(patient.birth_date))}
      ${metaCell("Status", status)}
      ${metaCell("Diagnóstico", patient.diagnosis ?? "—")}
      ${metaCell("Nível de suporte", patient.support_level ?? "—")}
      ${metaCell("Responsável 1", patient.guardian_name ?? "—")}
      ${metaCell("Responsável 2", patient.guardian_name_2 ?? "—")}
      ${metaCell("Contato", patient.guardian_phone || patient.phone || patient.contact || "—")}
      ${metaCell("E-mail", patient.guardian_email ?? "—")}
      ${metaCell("Plano de saúde", patient.health_plan ?? "—")}
      ${metaCell("CPF", patient.cpf ?? "—")}
    </div>
    ${
      patient.notes?.trim()
        ? `${subHeading("Observações cadastrais")}${narrativeBox(`<p>${escapeDocumentHtml(patient.notes)}</p>`)}`
        : ""
    }
  `;
}

function buildTeamSection(data: MasterProntuarioData) {
  if (data.team.length === 0) return "";

  const rows = data.team
    .map((professional) => {
      const areas = getClinicalAreasForRole(professional.professionalRole)
        .filter((area) => area !== "geral")
        .map((area) => CLINICAL_AREA_LABELS[area])
        .join(", ");

      return `
        <tr>
          <td style="padding:8px 10px;border:1px solid ${COLORS.border};">${escapeDocumentHtml(professional.fullName)}</td>
          <td style="padding:8px 10px;border:1px solid ${COLORS.border};">${escapeDocumentHtml(professional.professionalRole ?? "—")}</td>
          <td style="padding:8px 10px;border:1px solid ${COLORS.border};">${escapeDocumentHtml(areas || "—")}</td>
          <td style="padding:8px 10px;border:1px solid ${COLORS.border};">${escapeDocumentHtml(professional.professionalCouncil ?? "—")}</td>
        </tr>
      `;
    })
    .join("");

  return `
    ${sectionHeading("2. Equipe terapêutica")}
    <table style="width:100%;border-collapse:collapse;font-size:12px;font-family:Helvetica,Arial,sans-serif;">
      <thead>
        <tr style="background:#F7FAFC;">
          <th style="text-align:left;padding:8px 10px;border:1px solid ${COLORS.border};color:${COLORS.navy};">Profissional</th>
          <th style="text-align:left;padding:8px 10px;border:1px solid ${COLORS.border};color:${COLORS.navy};">Cargo</th>
          <th style="text-align:left;padding:8px 10px;border:1px solid ${COLORS.border};color:${COLORS.navy};">Área</th>
          <th style="text-align:left;padding:8px 10px;border:1px solid ${COLORS.border};color:${COLORS.navy};">Registro</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function buildAnamnesesSection(data: MasterProntuarioData) {
  if (data.anamneses.length === 0) return "";

  const blocks = data.anamneses
    .map((anamnese, index) => {
      return `
        <article style="margin-bottom:18px;">
          ${subHeading(`${index + 1}. ${getAnamnesisTypeLabel(anamnese.anamnesisType)}`)}
          <p style="margin:0 0 10px;font-size:12px;color:${COLORS.muted};font-family:Helvetica,Arial,sans-serif;">
            Registrada em ${escapeDocumentHtml(formatPatientDateTime(anamnese.createdAt))}
          </p>
          ${narrativeBox(renderAnamnesisFormData(anamnese.anamnesisType, anamnese.formData))}
        </article>
      `;
    })
    .join("");

  return `${sectionHeading("3. Anamneses")}${blocks}`;
}

function buildPlanningSection(data: MasterProntuarioData) {
  const panel = data.therapeuticPlan;
  const htmlPlans = data.record.therapeuticPlans;
  if (!panel && htmlPlans.length === 0) return "";

  let html = sectionHeading("4. Planejamento terapêutico");

  if (panel) {
    html += subHeading("Metas (painel do prontuário)");
    html += narrativeBox(`
      ${kvRow("Curto prazo", panel.shortTermGoals)}
      ${kvRow("Médio prazo", panel.mediumTermGoals)}
      ${kvRow("Longo prazo", panel.longTermGoals)}
      ${kvRow("Observações", panel.notes ?? "")}
    `);
  }

  for (const plan of htmlPlans) {
    html += subHeading(plan.title || "Plano terapêutico");
    html += `
      <p style="margin:0 0 8px;font-size:12px;color:${COLORS.muted};font-family:Helvetica,Arial,sans-serif;">
        ${escapeDocumentHtml(plan.professional_name)} · ${escapeDocumentHtml(plan.status)} · ${escapeDocumentHtml(formatPatientDate(plan.start_date))}
        ${plan.end_date ? ` até ${escapeDocumentHtml(formatPatientDate(plan.end_date))}` : ""}
      </p>
    `;
    if (plan.goals_html?.trim()) {
      html += `<p style="margin:0 0 4px;font-size:12px;font-weight:700;color:${COLORS.navy};font-family:Helvetica,Arial,sans-serif;">Objetivos</p>`;
      html += narrativeBox(plan.goals_html);
    }
    if (plan.strategies_html?.trim()) {
      html += `<p style="margin:12px 0 4px;font-size:12px;font-weight:700;color:${COLORS.navy};font-family:Helvetica,Arial,sans-serif;">Estratégias</p>`;
      html += narrativeBox(plan.strategies_html);
    }
  }

  return html;
}

function buildEvaluationsSection(data: MasterProntuarioData) {
  if (data.record.evaluations.length === 0) return "";

  const blocks = data.record.evaluations
    .map((evaluation, index) => {
      const score =
        evaluation.total_score != null
          ? ` · Escore: ${evaluation.total_score}`
          : "";

      return `
        <article style="margin-bottom:18px;">
          ${subHeading(`${index + 1}. ${evaluation.title || evaluation.instrument || "Avaliação"}`)}
          <p style="margin:0 0 10px;font-size:12px;color:${COLORS.muted};font-family:Helvetica,Arial,sans-serif;">
            ${escapeDocumentHtml(formatPatientDate(evaluation.evaluation_date))} ·
            ${escapeDocumentHtml(evaluation.professional_name)}
            ${evaluation.professional_role ? ` (${escapeDocumentHtml(evaluation.professional_role)})` : ""}
            · ${escapeDocumentHtml(evaluation.status)}${escapeDocumentHtml(score)}
          </p>
          ${renderEvaluationBody(evaluation.content_html ?? "", evaluation.instrument)}
        </article>
      `;
    })
    .join("");

  return `${sectionHeading("5. Avaliações")}${blocks}`;
}

function buildEvolutionsSection(
  title: string,
  sectionNumber: string,
  evolutions: MasterProntuarioData["record"]["evolutions"]
) {
  if (evolutions.length === 0) return "";

  const blocks = evolutions
    .map((evolution, index) => {
      return `
        <article style="margin-bottom:18px;">
          ${subHeading(`${index + 1}. Sessão ${formatPatientDate(evolution.session_date)}`)}
          <p style="margin:0 0 10px;font-size:12px;color:${COLORS.muted};font-family:Helvetica,Arial,sans-serif;">
            ${escapeDocumentHtml(evolution.professional_name)}
            ${evolution.professional_role ? ` · ${escapeDocumentHtml(evolution.professional_role)}` : ""}
            ${evolution.professional_council ? ` · ${escapeDocumentHtml(evolution.professional_council)}` : ""}
            · ${escapeDocumentHtml(evolution.status)}
          </p>
          ${narrativeBox(evolution.content_html ?? "")}
        </article>
      `;
    })
    .join("");

  return `${sectionHeading(`${sectionNumber}. ${title}`)}${blocks}`;
}

function buildBodyMapSection(data: MasterProntuarioData) {
  if (data.bodyMarks.length === 0) return "";

  const items = data.bodyMarks
    .map((mark) => {
      const { meta, userNotes } = parseNotes3D(mark.notes);
      const laterality = getBodyLateralityLabel(meta?.laterality);
      const parts = [
        getBodyMarkTypeLabel(mark.mark_type),
        getBodyViewSideLabel(mark.view_side),
        meta?.part ? `região: ${meta.part}` : null,
        laterality ? `lateralidade: ${laterality}` : null,
        mark.severity != null ? `intensidade: ${mark.severity}/10` : null,
      ].filter(Boolean);

      return `
        <li style="margin-bottom:8px;font-size:13px;">
          <strong>${escapeDocumentHtml(parts.join(" · "))}</strong>
          ${userNotes ? `<br /><span>${escapeDocumentHtml(userNotes)}</span>` : ""}
        </li>
      `;
    })
    .join("");

  return `
    ${sectionHeading("8. Mapa corporal")}
    <ul style="margin:0;padding-left:18px;">${items}</ul>
  `;
}

function buildProgramsSection(data: MasterProntuarioData) {
  if (data.record.programs.length === 0) return "";

  const blocks = data.record.programs
    .map((program, index) => {
      return `
        <article style="margin-bottom:14px;">
          ${subHeading(`${index + 1}. ${program.name}`)}
          ${narrativeBox(`
            ${kvRow("Protocolo", program.protocol ?? "")}
            ${kvRow("Especialidade", program.specialty ?? "")}
            ${kvRow("Habilidade", program.skill ?? "")}
            ${kvRow("Tipo de ensino", program.teaching_type)}
            ${kvRow("Status", program.status)}
            ${kvRow("Objetivo", program.objective ?? "")}
            ${kvRow("Instrução (Sd)", program.instruction_sd ?? "")}
            ${kvRow("Procedimento de ensino", program.teaching_procedure ?? "")}
            ${kvRow("Passo da dica", program.hint_step ?? "")}
            ${kvRow("Procedimento de correção", program.correction_procedure ?? "")}
            ${kvRow("Critério de aprendizado", program.learning_criterion ?? "")}
            ${kvRow("Materiais", program.materials_used ?? "")}
            ${kvRow("Observações", program.observations ?? "")}
          `)}
        </article>
      `;
    })
    .join("");

  return `${sectionHeading("9. Programas terapêuticos")}${blocks}`;
}

function buildDocumentsSection(data: MasterProntuarioData) {
  if (data.record.documents.length === 0) return "";

  const items = data.record.documents
    .map((document) => {
      return `
        <li style="margin-bottom:8px;font-size:13px;">
          <strong>${escapeDocumentHtml(document.title)}</strong>
          — ${escapeDocumentHtml(getPatientDocumentTypeLabel(document.document_type))}
          · ${escapeDocumentHtml(formatPatientDateTime(document.created_at))}
          ${document.uploaded_by ? ` · ${escapeDocumentHtml(document.uploaded_by)}` : ""}
          ${document.notes ? `<br /><span style="color:${COLORS.muted};">${escapeDocumentHtml(document.notes)}</span>` : ""}
        </li>
      `;
    })
    .join("");

  return `
    ${sectionHeading("10. Documentos clínicos")}
    <ul style="margin:0;padding-left:18px;">${items}</ul>
  `;
}

function buildHomeActivitiesSection(data: MasterProntuarioData) {
  if (data.record.homeActivities.length === 0) return "";

  const blocks = data.record.homeActivities
    .map((activity, index) => {
      return `
        <article style="margin-bottom:14px;">
          ${subHeading(`${index + 1}. ${activity.title}`)}
          <p style="margin:0 0 8px;font-size:12px;color:${COLORS.muted};font-family:Helvetica,Arial,sans-serif;">
            ${escapeDocumentHtml(activity.created_by_name)}
            ${activity.due_date ? ` · prazo ${escapeDocumentHtml(formatPatientDate(activity.due_date))}` : ""}
            · ${activity.is_published ? "publicada" : "rascunho"}
          </p>
          ${narrativeBox(`
            ${activity.description ? `<p>${escapeDocumentHtml(activity.description)}</p>` : ""}
            ${activity.instructions ? `<p><strong>Instruções:</strong> ${escapeDocumentHtml(activity.instructions)}</p>` : ""}
          `)}
        </article>
      `;
    })
    .join("");

  return `${sectionHeading("11. Atividades domiciliares")}${blocks}`;
}

function buildParentOrientationsSection(data: MasterProntuarioData) {
  if (data.record.parentOrientations.length === 0) return "";

  const blocks = data.record.parentOrientations
    .map((orientation, index) => {
      return `
        <article style="margin-bottom:14px;">
          ${subHeading(`${index + 1}. ${orientation.title}`)}
          <p style="margin:0 0 8px;font-size:12px;color:${COLORS.muted};font-family:Helvetica,Arial,sans-serif;">
            ${escapeDocumentHtml(orientation.author_name)} · ${escapeDocumentHtml(formatPatientDateTime(orientation.created_at))}
            · ${orientation.is_published ? "publicada" : "rascunho"}
          </p>
          ${narrativeBox(orientation.content_html ?? "")}
        </article>
      `;
    })
    .join("");

  return `${sectionHeading("12. Orientações à família")}${blocks}`;
}

function buildAttendancesSection(data: MasterProntuarioData) {
  if (data.record.attendances.length === 0) return "";

  const rows = data.record.attendances
    .map((attendance) => {
      return `
        <tr>
          <td style="padding:7px 8px;border:1px solid ${COLORS.border};">${escapeDocumentHtml(formatPatientDate(attendance.event_date))}</td>
          <td style="padding:7px 8px;border:1px solid ${COLORS.border};">${escapeDocumentHtml(`${attendance.start_time?.slice(0, 5) ?? "—"}–${attendance.end_time?.slice(0, 5) ?? "—"}`)}</td>
          <td style="padding:7px 8px;border:1px solid ${COLORS.border};">${escapeDocumentHtml(attendance.professional_name)}</td>
          <td style="padding:7px 8px;border:1px solid ${COLORS.border};">${escapeDocumentHtml(attendance.care_type ?? "—")}</td>
          <td style="padding:7px 8px;border:1px solid ${COLORS.border};">${escapeDocumentHtml(attendance.status)}</td>
        </tr>
      `;
    })
    .join("");

  return `
    ${sectionHeading("13. Histórico de atendimentos")}
    <p style="margin:0 0 10px;font-size:12px;color:${COLORS.muted};font-family:Helvetica,Arial,sans-serif;">
      Até os 100 atendimentos mais recentes.
    </p>
    <table style="width:100%;border-collapse:collapse;font-size:11px;font-family:Helvetica,Arial,sans-serif;">
      <thead>
        <tr style="background:#F7FAFC;">
          <th style="text-align:left;padding:7px 8px;border:1px solid ${COLORS.border};color:${COLORS.navy};">Data</th>
          <th style="text-align:left;padding:7px 8px;border:1px solid ${COLORS.border};color:${COLORS.navy};">Horário</th>
          <th style="text-align:left;padding:7px 8px;border:1px solid ${COLORS.border};color:${COLORS.navy};">Profissional</th>
          <th style="text-align:left;padding:7px 8px;border:1px solid ${COLORS.border};color:${COLORS.navy};">Tipo</th>
          <th style="text-align:left;padding:7px 8px;border:1px solid ${COLORS.border};color:${COLORS.navy};">Status</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function buildIndexSection(data: MasterProntuarioData) {
  const items = [
    ["Equipe terapêutica", data.team.length],
    ["Anamneses", data.anamneses.length],
    [
      "Planejamentos",
      (data.therapeuticPlan ? 1 : 0) + data.record.therapeuticPlans.length,
    ],
    ["Avaliações", data.record.evaluations.length],
    ["Evoluções ABA", data.record.evolutions.length],
    ["Evoluções convencionais", data.record.conventionalEvolutions.length],
    ["Marcas no mapa corporal", data.bodyMarks.length],
    ["Programas", data.record.programs.length],
    ["Documentos", data.record.documents.length],
    ["Atividades domiciliares", data.record.homeActivities.length],
    ["Orientações à família", data.record.parentOrientations.length],
    ["Atendimentos", data.record.attendances.length],
  ].filter(([, count]) => Number(count) > 0);

  if (items.length === 0) {
    return `
      ${sectionHeading("Sumário clínico")}
      <p style="font-size:13px;color:${COLORS.muted};">Nenhum registro clínico encontrado para este aprendiz.</p>
    `;
  }

  return `
    ${sectionHeading("Sumário clínico")}
    <ul style="margin:0;padding-left:18px;font-size:13px;columns:2;column-gap:24px;">
      ${items
        .map(
          ([label, count]) =>
            `<li style="margin-bottom:4px;"><strong>${escapeDocumentHtml(String(label))}:</strong> ${count}</li>`
        )
        .join("")}
    </ul>
  `;
}

/** HTML do corpo clínico completo (sem cabeçalho institucional). */
export function buildMasterProntuarioSummaryHtml(
  data: MasterProntuarioData
): string {
  return [
    buildIndexSection(data),
    buildIdentificationSection(data),
    buildTeamSection(data),
    buildAnamnesesSection(data),
    buildPlanningSection(data),
    buildEvaluationsSection(data),
    buildEvolutionsSection(
      "Evoluções ABA",
      "6",
      data.record.evolutions
    ),
    buildEvolutionsSection(
      "Evoluções convencionais",
      "7",
      data.record.conventionalEvolutions
    ),
    buildBodyMapSection(data),
    buildProgramsSection(data),
    buildDocumentsSection(data),
    buildHomeActivitiesSection(data),
    buildParentOrientationsSection(data),
    buildAttendancesSection(data),
  ]
    .filter(Boolean)
    .join("\n");
}

function buildFullDocumentHtml(
  data: MasterProntuarioData,
  branding: DocumentBranding,
  logoDataUrl: string
) {
  const generatedAt = formatGeneratedAt();
  const patient = data.record.patient;

  return `
    <div id="master-prontuario-report" style="width:794px;padding:40px 44px;font-family:Georgia,'Times New Roman',serif;color:${COLORS.text};background:${COLORS.background};line-height:1.65;">
      ${buildDocumentHeaderHtml(branding, {
        logoUrl: logoDataUrl,
        documentTitle: "Prontuário Clínico Consolidado",
      })}

      <section style="margin-bottom:20px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          ${metaCell("Aprendiz", patient.full_name)}
          ${metaCell("Gerado em", generatedAt)}
          ${metaCell("Diagnóstico", patient.diagnosis ?? "—")}
          ${metaCell("Data de nascimento", formatPatientDate(patient.birth_date))}
        </div>
      </section>

      ${buildMasterProntuarioSummaryHtml(data)}

      <footer style="margin-top:40px;">
        ${buildDocumentFooterHtml(generatedAt)}
      </footer>
    </div>
  `;
}

function buildIsolatedReportDocument(html: string) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <style>
      * { box-sizing: border-box; }
      html, body {
        margin: 0;
        padding: 0;
        background: #ffffff;
        color: ${COLORS.text};
      }
      h1, h2, h3, p, ul, ol, li, strong, em, table, td, th {
        color: inherit;
      }
      img { max-width: 100%; }
    </style>
  </head>
  <body>${html}</body>
</html>`;
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

async function renderReportToCanvas(reportElement: HTMLElement) {
  const html2canvas = (await import("html2canvas")).default;

  return html2canvas(reportElement, {
    scale: 2,
    backgroundColor: "#ffffff",
    logging: false,
    useCORS: true,
    allowTaint: false,
    foreignObjectRendering: false,
    onclone: (clonedDocument) => {
      clonedDocument.documentElement.style.background = "#ffffff";
      clonedDocument.body.style.background = "#ffffff";
      clonedDocument.body.style.color = COLORS.text;
    },
  });
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
    if (pageIndex > 0) {
      pdf.addPage();
    }

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

function stripHtmlToText(html: string) {
  const container = document.createElement("div");
  container.innerHTML = html;
  return container.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

async function generatePdfWithTextLayout(
  data: MasterProntuarioData,
  branding: DocumentBranding,
  fileName: string
) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const margin = 48;
  const maxWidth = 515;
  let y = margin;

  const writeLine = (text: string, options?: { bold?: boolean; size?: number }) => {
    const size = options?.size ?? 11;
    pdf.setFont("helvetica", options?.bold ? "bold" : "normal");
    pdf.setFontSize(size);
    pdf.setTextColor(COLORS.text);

    const lines = pdf.splitTextToSize(text, maxWidth) as string[];
    for (const line of lines) {
      if (y > 780) {
        pdf.addPage();
        y = margin;
      }
      pdf.text(line, margin, y);
      y += size + 6;
    }
  };

  writeLine(branding.clinicName, { bold: true, size: 16 });
  writeLine("Prontuário Clínico Consolidado", { bold: true, size: 14 });
  writeLine(`Aprendiz: ${data.record.patient.full_name}`, { bold: true, size: 12 });
  writeLine(`Gerado em ${formatGeneratedAt()}`, { size: 10 });
  y += 8;
  writeLine(stripHtmlToText(buildMasterProntuarioSummaryHtml(data)), { size: 10 });
  pdf.save(fileName);
}

export async function downloadMasterProntuarioPdf(
  data: MasterProntuarioData,
  branding: DocumentBranding = DEFAULT_DOCUMENT_BRANDING
): Promise<void> {
  const logoUrl = resolveDocumentLogoUrl(branding);
  const logoDataUrl =
    (await loadImageAsDataUrl(logoUrl)) ??
    (await loadImageAsDataUrl(
      resolveDocumentLogoUrl(DEFAULT_DOCUMENT_BRANDING)
    )) ??
    logoUrl;

  const patientName = data.record.patient.full_name;
  const fileName = `prontuario-consolidado-${patientName
    .toLowerCase()
    .replace(/\s+/g, "-")}.pdf`;

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText =
    "position:fixed;left:-10000px;top:0;width:794px;height:0;border:0;visibility:hidden;";
  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
    if (!doc) {
      throw new Error("Não foi possível preparar o documento do prontuário.");
    }

    doc.open();
    doc.write(
      buildIsolatedReportDocument(
        buildFullDocumentHtml(data, branding, logoDataUrl)
      )
    );
    doc.close();

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });

    const reportElement = doc.getElementById("master-prontuario-report");
    if (!reportElement) {
      throw new Error("Estrutura do prontuário não encontrada.");
    }

    try {
      const canvas = await renderReportToCanvas(reportElement);
      await addCanvasToPdf(canvas, fileName);
    } catch (canvasError) {
      console.warn(
        "[master-prontuario-pdf] html2canvas falhou, usando layout textual.",
        canvasError
      );
      await generatePdfWithTextLayout(data, branding, fileName);
    }
  } finally {
    iframe.remove();
  }
}
