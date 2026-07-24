import { ShieldAlert } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";

export function AuditAccessDenied() {
  return (
    <EmptyState
      icon={ShieldAlert}
      title="Acesso restrito"
      description="O log de auditoria está disponível apenas para o perfil de Administração."
      className="min-h-64"
    />
  );
}
