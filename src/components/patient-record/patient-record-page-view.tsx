"use client";

import { Suspense } from "react";

import { PatientRecordView } from "@/components/patient-record/patient-record-view";
import { PageContainer } from "@/components/layout/page-container";
import type { PatientRecordData } from "@/app/actions/patient-record-actions";

type PatientRecordPageViewProps = {
  record: PatientRecordData;
};

function PatientRecordViewFallback() {
  return (
    <div className="flex min-h-[240px] items-center justify-center text-sm text-muted-foreground">
      Carregando prontuário...
    </div>
  );
}

export function PatientRecordPageView({ record }: PatientRecordPageViewProps) {
  return (
    <PageContainer size="wide">
      <Suspense fallback={<PatientRecordViewFallback />}>
        <PatientRecordView record={record} />
      </Suspense>
    </PageContainer>
  );
}
