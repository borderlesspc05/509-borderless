"use client";

import { useState } from "react";
import { Building2, CreditCard, Settings2 } from "lucide-react";

import { InstitutionalSettingsForm } from "@/components/settings/institutional-settings-form";
import { PaymentIntegrationsForm } from "@/components/settings/payment-integrations-form";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { PageContainer } from "@/components/layout/page-container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ClinicSettingsPublic } from "@/lib/clinic-settings";

type ClinicSettingsPageViewProps = {
  initialSettings: ClinicSettingsPublic;
};

export function ClinicSettingsPageView({
  initialSettings,
}: ClinicSettingsPageViewProps) {
  const [settings, setSettings] = useState(initialSettings);

  return (
    <PageContainer size="wide" className="space-y-6">
      <DashboardPageHeader
        title="Configurações Globais"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Configurações" },
        ]}
      />

      <section className="app-surface-card p-4 text-sm text-muted-foreground sm:p-5">
        <div className="flex items-start gap-3">
          <Settings2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <p>
            Gerencie os dados institucionais da clínica e as credenciais de
            pagamento. Apenas administradores podem visualizar e alterar estas
            configurações.
          </p>
        </div>
      </section>

      <Tabs defaultValue="institutional" className="gap-6">
        <TabsList className="flex !h-12 w-full max-w-2xl items-stretch gap-1 rounded-2xl bg-muted p-1">
          <TabsTrigger
            value="institutional"
            className="h-full min-h-0 flex-1 gap-2 rounded-xl border-0 px-4 py-0 text-xs font-bold tracking-wide uppercase data-active:bg-primary data-active:text-primary-foreground data-active:shadow-none sm:text-sm"
          >
            <Building2 className="size-4" aria-hidden />
            Dados Institucionais
          </TabsTrigger>
          <TabsTrigger
            value="payments"
            className="h-full min-h-0 flex-1 gap-2 rounded-xl border-0 px-4 py-0 text-xs font-bold tracking-wide uppercase data-active:bg-primary data-active:text-primary-foreground data-active:shadow-none sm:text-sm"
          >
            <CreditCard className="size-4" aria-hidden />
            Integrações de Pagamento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="institutional" className="mt-0">
          <InstitutionalSettingsForm
            settings={settings}
            onSettingsChange={setSettings}
          />
        </TabsContent>

        <TabsContent value="payments" className="mt-0">
          <PaymentIntegrationsForm
            settings={settings}
            onSettingsChange={setSettings}
          />
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
