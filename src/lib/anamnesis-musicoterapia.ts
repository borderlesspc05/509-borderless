export type AnamnesisMusicoterapiaFormData = {
  admissionDate: string;
  referencePerson: string;
  interviewedName: string;
  interviewedRelation: string;
  phone: string;
  clinical: {
    gestation: string;
    birthType: string;
    childhoodIllnesses: string;
    musicalExperiencesGestation: string;
    musicalExperiencesBirth: string;
  };
  general: {
    diagnosis: string;
    diagnosisSource: string;
    medication: string;
    allergy: string;
    safetyConcerns: string;
    therapies: string;
    aversions: string;
    hyperfocus: string;
    understandingAndComplaint: string;
  };
  musical: {
    caregiverPreferences: string;
    experience: string;
    likesListening: string;
    instrumentsAtHome: string;
    listeningFrequency: string;
    styleFavorite: string;
    reactionWhenListening: string;
    playedInstrument: string;
    musiciansInFamily: string;
  };
  motor: {
    grossRestriction: string;
    walksWell: string;
    physicalAssistance: string;
    usesAllLimbs: string;
    floorComfort: string;
    fineRestriction: string;
    bilateralFineTasks: string;
    holdingObjects: string;
  };
  oral: {
    verbalStatus: string;
    speechProcessing: string;
    speechOnsetAge: string;
    foodRestriction: string;
    breathingIssues: string;
  };
  sensory: {
    auditoryHypersensitivity: string;
    sensoryLoss: string;
    physicalContactRestriction: string;
    overstimulation: string;
  };
  emotional: {
    difficulties: string;
    expression: string;
    dysregulation: string;
    trauma: string;
    emotionalDiagnosis: string;
  };
  social: {
    siblings: string;
    primaryCaregiver: string;
    socialDifficulties: string;
    groups: string;
    significantIssues: string;
  };
  closing: {
    anythingElse: string;
    therapistNotes: string;
    suggestedPlan: string;
    focusCategories: Record<string, boolean>;
  };
};

export const MUSICOTERAPIA_FOCUS_OPTIONS = [
  { key: "motricidadeAmpla", label: "Motricidade ampla" },
  { key: "motricidadeFina", label: "Motricidade fina" },
  { key: "motricidadeOral", label: "Motricidade oral" },
  { key: "sensorial", label: "Sensorial" },
  { key: "comunicacaoReceptiva", label: "Comunicação receptiva / percepção auditiva" },
  { key: "comunicacaoExpressiva", label: "Comunicação expressiva" },
  { key: "cognitiva", label: "Cognitiva" },
  { key: "emocional", label: "Emocional" },
  { key: "social", label: "Social" },
  { key: "musicalidade", label: "Musicalidade" },
] as const;

const DEFAULT_PLAN =
  "Como plano para tratamento, sugere-se inicialmente intervenções musicais que estimulem o domínio da Musicalidade, assim como práticas musicais estimulantes às habilidades de Comunicação expressiva, Motricidade Oral e Sensorial.";

export function createEmptyAnamnesisMusicoterapiaFormData(): AnamnesisMusicoterapiaFormData {
  return {
    admissionDate: "",
    referencePerson: "",
    interviewedName: "",
    interviewedRelation: "",
    phone: "",
    clinical: {
      gestation: "",
      birthType: "",
      childhoodIllnesses: "",
      musicalExperiencesGestation: "",
      musicalExperiencesBirth: "",
    },
    general: {
      diagnosis: "",
      diagnosisSource: "",
      medication: "",
      allergy: "",
      safetyConcerns: "",
      therapies: "",
      aversions: "",
      hyperfocus: "",
      understandingAndComplaint: "",
    },
    musical: {
      caregiverPreferences: "",
      experience: "",
      likesListening: "",
      instrumentsAtHome: "",
      listeningFrequency: "",
      styleFavorite: "",
      reactionWhenListening: "",
      playedInstrument: "",
      musiciansInFamily: "",
    },
    motor: {
      grossRestriction: "",
      walksWell: "",
      physicalAssistance: "",
      usesAllLimbs: "",
      floorComfort: "",
      fineRestriction: "",
      bilateralFineTasks: "",
      holdingObjects: "",
    },
    oral: {
      verbalStatus: "",
      speechProcessing: "",
      speechOnsetAge: "",
      foodRestriction: "",
      breathingIssues: "",
    },
    sensory: {
      auditoryHypersensitivity: "",
      sensoryLoss: "",
      physicalContactRestriction: "",
      overstimulation: "",
    },
    emotional: {
      difficulties: "",
      expression: "",
      dysregulation: "",
      trauma: "",
      emotionalDiagnosis: "",
    },
    social: {
      siblings: "",
      primaryCaregiver: "",
      socialDifficulties: "",
      groups: "",
      significantIssues: "",
    },
    closing: {
      anythingElse: "",
      therapistNotes: "",
      suggestedPlan: DEFAULT_PLAN,
      focusCategories: Object.fromEntries(
        MUSICOTERAPIA_FOCUS_OPTIONS.map((option) => [option.key, false])
      ),
    },
  };
}
