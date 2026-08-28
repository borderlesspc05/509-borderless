"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatFullDate } from "@/lib/calendar-utils";
import type { BulkStatus } from "@/lib/appointment-status-utils";
import { appointmentStatusLabels } from "@/lib/appointment-status";

type AppointmentBulkStatusDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName: string;
  dateKey: string;
  status: BulkStatus;
  affectedCount: number;
  isLoading?: boolean;
  onConfirm: (applyToAll: boolean) => void;
};

function getBulkDescription(
  status: BulkStatus,
  patientName: string,
  formattedDate: string,
  affectedCount: number
) {
  const statusLabel = appointmentStatusLabels[status];

  if (status === "em_espera") {
    return (
      <>
        Deseja marcar todos os atendimentos de{" "}
        <span className="font-medium text-foreground">{patientName}</span> em{" "}
        <span className="font-medium text-foreground capitalize">
          {formattedDate}
        </span>{" "}
        como <span className="font-medium text-foreground">{statusLabel}</span>?
        {affectedCount > 1 ? (
          <>
            {" "}
            Os demais horários do dia também serão atualizados para{" "}
            <span className="font-medium text-foreground">{statusLabel}</span>,
            totalizando{" "}
            <span className="font-medium text-foreground">
              {affectedCount} atendimentos
            </span>
            .
          </>
        ) : null}
      </>
    );
  }

  return (
    <>
      Deseja aplicar esta situação a todos os atendimentos de{" "}
      <span className="font-medium text-foreground">{patientName}</span> em{" "}
      <span className="font-medium text-foreground capitalize">
        {formattedDate}
      </span>
      ?
      {affectedCount > 1 ? (
        <>
          {" "}
          Isso afetará{" "}
          <span className="font-medium text-foreground">
            {affectedCount} atendimentos
          </span>
          .
        </>
      ) : null}
    </>
  );
}

export function AppointmentBulkStatusDialog({
  open,
  onOpenChange,
  patientName,
  dateKey,
  status,
  affectedCount,
  isLoading = false,
  onConfirm,
}: AppointmentBulkStatusDialogProps) {
  const statusLabel = appointmentStatusLabels[status];
  const formattedDate = formatFullDate(dateKey);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Aplicar situação em massa?</DialogTitle>
          <DialogDescription>
            {getBulkDescription(
              status,
              patientName,
              formattedDate,
              affectedCount
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => onConfirm(false)}
          >
            {isLoading ? "Aplicando..." : "Apenas este atendimento"}
          </Button>
          <Button
            type="button"
            disabled={isLoading}
            onClick={() => onConfirm(true)}
          >
            {isLoading
              ? "Aplicando..."
              : `Aplicar a todos (${statusLabel})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
