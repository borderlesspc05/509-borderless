export const TO_ASSISTANCE_LEVELS = [
  { code: "IND", label: "IND (Independente)" },
  { code: "DV", label: "DV (Dica Verbal)" },
  { code: "DVA", label: "DVA (Dica Verbal Atrasada)" },
  { code: "DVI", label: "DVI (Dica Verbal Imediata)" },
  { code: "DG", label: "DG (Dica Gestual)" },
  { code: "MOD", label: "MOD (Modelação)" },
  { code: "AFP", label: "AFP (Ajuda Física Parcial)" },
  { code: "AFT", label: "AFT (Ajuda Física Total)" },
] as const;

export type ToEvolutionFormState = {
  sessionTime: string;
  occupationalDiagnosis: string;
  resourcesUsed: string;
  sessionGoals: string;
  receptionAndContext: string;
  engagementAndResponse: string;
  interferingBehaviors: string;
  functionalPerformance: string;
  clinicalObservations: string;
  motorSensoryCognitive: string;
  contextualFactors: string;
  assistanceLevels: string[];
  nextSessionGuidelines: string;
  familySchoolGuidance: string;
};

export const emptyToEvolutionFormState: ToEvolutionFormState = {
  sessionTime: "",
  occupationalDiagnosis: "",
  resourcesUsed: "",
  sessionGoals: "",
  receptionAndContext: "",
  engagementAndResponse: "",
  interferingBehaviors: "",
  functionalPerformance: "",
  clinicalObservations: "",
  motorSensoryCognitive: "",
  contextualFactors: "",
  assistanceLevels: [],
  nextSessionGuidelines: "",
  familySchoolGuidance: "",
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function paragraphHtml(label: string, value: string) {
  const content = value.trim()
    ? escapeHtml(value).replaceAll("\n", "<br />")
    : "<em>Não informado</em>";

  return `
    <section style="margin-bottom:18px;">
      <h3 style="margin:0 0 8px;font-size:14px;font-family:Helvetica,Arial,sans-serif;color:#1a365d;">
        ${escapeHtml(label)}
      </h3>
      <p style="margin:0;font-size:13px;line-height:1.6;font-family:Georgia,'Times New Roman',serif;color:#1f2937;">
        ${content}
      </p>
    </section>
  `;
}

export function buildToEvolutionHtml(
  state: ToEvolutionFormState,
  meta: {
    sessionDate: string;
    patientName: string;
    professionalName: string;
    professionalRole: string;
    professionalCouncil?: string;
  }
) {
  const assistance =
    state.assistanceLevels.length > 0
      ? state.assistanceLevels.join(" · ")
      : "Não informado";

  return `
    <article data-to-evolution="true">
      <h2 style="margin:0 0 16px;font-size:18px;font-family:Helvetica,Arial,sans-serif;color:#1a365d;">
        Evolução — Terapia Ocupacional
      </h2>
      <p style="margin:0 0 20px;font-size:13px;color:#4a5568;font-family:Helvetica,Arial,sans-serif;">
        <strong>Paciente:</strong> ${escapeHtml(meta.patientName)} ·
        <strong>Data:</strong> ${escapeHtml(meta.sessionDate)}
        ${state.sessionTime ? ` · <strong>Hora:</strong> ${escapeHtml(state.sessionTime)}` : ""}
        <br />
        <strong>Profissional:</strong> ${escapeHtml(meta.professionalName)} (${escapeHtml(meta.professionalRole)})
        ${meta.professionalCouncil ? ` · ${escapeHtml(meta.professionalCouncil)}` : ""}
      </p>
      ${paragraphHtml("Diagnóstico Terapêutico Ocupacional", state.occupationalDiagnosis)}
      ${paragraphHtml("Recursos utilizados", state.resourcesUsed)}
      ${paragraphHtml("Objetivo da sessão | Metas funcionais", state.sessionGoals)}
      ${paragraphHtml(
        "Descrição do atendimento — recepção e contexto",
        state.receptionAndContext
      )}
      ${paragraphHtml(
        "Engajamento e resposta à intervenção e setting",
        state.engagementAndResponse
      )}
      ${paragraphHtml(
        "Comportamentos interferentes e/ou manejo",
        state.interferingBehaviors
      )}
      ${paragraphHtml(
        "Desempenho funcional / desempenho ocupacional e processos",
        state.functionalPerformance
      )}
      ${paragraphHtml(
        "Observações clínicas estruturadas e não estruturadas",
        state.clinicalObservations
      )}
      ${paragraphHtml(
        "Aspectos motores, sensoriais, cognitivos e socioemocionais",
        state.motorSensoryCognitive
      )}
      ${paragraphHtml(
        "Intercorrências ou fatores contextuais",
        state.contextualFactors
      )}
      ${paragraphHtml("Nível de assistência requerido", assistance)}
      ${paragraphHtml("Diretriz para a próxima sessão", state.nextSessionGuidelines)}
      ${paragraphHtml(
        "Orientações à família / escola",
        state.familySchoolGuidance
      )}
    </article>
  `;
}

export function isToEvolutionHtml(contentHtml: string) {
  return contentHtml.includes('data-to-evolution="true"');
}
