import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { MasterProntuarioPageView } from "@/components/master-prontuario/master-prontuario-page-view";
import { requirePermission } from "@/lib/auth-guard";
import { getAccessDeniedRedirectPath, PERMISSIONS } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Prontuário consolidado",
  description:
    "Visão MASTER do prontuário completo do aprendiz para exportação e envio à família.",
};

export default async function MasterProntuarioPage() {
  const session = await requirePermission(PERMISSIONS.PATIENTS_VIEW);

  if (!session.isMaster) {
    redirect(getAccessDeniedRedirectPath(session.profile));
  }

  return <MasterProntuarioPageView />;
}
