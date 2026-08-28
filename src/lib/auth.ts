import { ROLES, type Role } from "@/lib/rbac";

export const userProfileOptions = [
  {
    value: ROLES.ADMIN,
    label: "Administrador",
    description: "Acesso geral à clínica",
  },
  {
    value: ROLES.COLABORADOR,
    label: "Colaborador",
    description: "Mesmos acessos do admin, sem atendimento convencional",
  },
  {
    value: ROLES.COORDENADOR,
    label: "Coordenador",
    description: "Cadastra profissionais/aprendizes e agenda na sua área",
  },
  {
    value: ROLES.SUPERVISOR,
    label: "Supervisor",
    description: "Supervisão clínica e cadastro de programas",
  },
  {
    value: ROLES.AT1,
    label: "AT",
    description: "Coletas clínicas: evolução, sessões, checklists e relatórios",
  },
  {
    value: ROLES.AT2,
    label: "AT 2",
    description: "Assistente terapêutico — coletas e registros clínicos",
  },
  {
    value: ROLES.RECEPCAO,
    label: "Recepção",
    description: "Cadastrar/editar aprendizes e agendar na agenda",
  },
  {
    value: ROLES.FAMILIA,
    label: "Família / Responsável",
    description: "Acesso somente leitura ao portal da família",
  },
] as const;

export type UserProfile = Role;

export { signOutAction as signOut } from "@/app/actions/auth-actions";
