"use client";

import { useEffect, useState, useTransition } from "react";
import { Clock3, Megaphone, Users } from "lucide-react";

import { getReceptionPanelDataAction } from "@/app/actions/reception-panel-actions";
import { APP_NAME } from "@/lib/app-brand";
import {
  formatQueueNumber,
  type ReceptionPanelData,
} from "@/lib/reception-panel";
import { cn } from "@/lib/utils";

const POLL_INTERVAL_MS = 5_000;

function formatClockValue(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

function formatCallTime(isoDate: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

function PanelSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm",
        className
      )}
    >
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function ReceptionDisplayPanel() {
  const [panelData, setPanelData] = useState<ReceptionPanelData | null>(null);
  const [clock, setClock] = useState(() => new Date());
  const [highlightKey, setHighlightKey] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function loadPanelData() {
    startTransition(async () => {
      const result = await getReceptionPanelDataAction();

      if (!result.success || !result.data) {
        return;
      }

      setPanelData((current) => {
        const nextCurrentId = result.data?.currentCall?.id ?? null;
        const previousCurrentId = current?.currentCall?.id ?? null;

        if (
          nextCurrentId &&
          nextCurrentId !== previousCurrentId &&
          result.data?.currentCall
        ) {
          setHighlightKey(`${nextCurrentId}-${result.data.currentCall.calledAt}`);
        }

        return result.data ?? null;
      });
    });
  }

  useEffect(() => {
    loadPanelData();

    const pollTimer = window.setInterval(loadPanelData, POLL_INTERVAL_MS);
    const clockTimer = window.setInterval(() => setClock(new Date()), 1_000);

    return () => {
      window.clearInterval(pollTimer);
      window.clearInterval(clockTimer);
    };
  }, []);

  useEffect(() => {
    if (!highlightKey) {
      return;
    }

    const timer = window.setTimeout(() => setHighlightKey(null), 4_000);

    return () => window.clearTimeout(timer);
  }, [highlightKey]);

  const currentCall = panelData?.currentCall ?? null;
  const isHighlighted =
    currentCall !== null &&
    highlightKey === `${currentCall.id}-${currentCall.calledAt}`;

  return (
    <div className="h-full overflow-y-auto overscroll-contain bg-[linear-gradient(160deg,#0f2744_0%,#12365f_45%,#0b1f38_100%)] text-white">
      <div className="mx-auto flex min-h-full max-w-[1600px] flex-col px-6 py-6 lg:px-10 lg:py-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/50">
              {APP_NAME}
            </p>
            <p className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Painel de Chamada
            </p>
          </div>
          <div className="flex items-center gap-3 text-right">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/60">
                Local
              </p>
              <p className="text-lg font-semibold">Recepção</p>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
              <Clock3 className="size-5 text-white/70" aria-hidden />
              <span className="font-mono text-2xl font-semibold tabular-nums">
                {formatClockValue(clock)}
              </span>
            </div>
          </div>
        </header>

        <div className="grid flex-1 gap-6 py-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.7fr)] lg:py-8">
          <PanelSection
            title="Chamada atual"
            className={cn(
              "flex min-h-[28rem] flex-col justify-center lg:min-h-[34rem]",
              isHighlighted && "ring-2 ring-amber-300/80"
            )}
          >
            {currentCall ? (
              <div className="space-y-8 text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-amber-200">
                  <Megaphone className="size-4" aria-hidden />
                  Senha chamada
                </div>

                <p className="font-mono text-[clamp(5rem,16vw,11rem)] font-black leading-none tracking-tight text-white">
                  {formatQueueNumber(currentCall.queueNumber)}
                </p>

                <div className="mx-auto grid max-w-2xl gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/10 px-5 py-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                      Sala
                    </p>
                    <p className="mt-2 text-2xl font-bold">{currentCall.roomName}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 px-5 py-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                      Profissional
                    </p>
                    <p className="mt-2 text-2xl font-bold">
                      {currentCall.professionalName}
                    </p>
                  </div>
                </div>

                <p className="text-lg text-white/70">
                  Dirija-se à {currentCall.roomName}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                <Megaphone className="size-16 text-white/25" aria-hidden />
                <p className="text-2xl font-semibold text-white/80">
                  Aguardando próxima chamada
                </p>
                <p className="max-w-md text-white/60">
                  Quando a recepção chamar um paciente, a senha, a sala e o
                  profissional aparecerão aqui.
                </p>
              </div>
            )}
          </PanelSection>

          <div className="grid gap-6">
            <PanelSection title="Próximas senhas">
              {panelData?.waitingQueue.length ? (
                <ul className="space-y-3">
                  {panelData.waitingQueue.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3"
                    >
                      <span className="font-mono text-3xl font-bold tabular-nums">
                        {formatQueueNumber(item.queueNumber)}
                      </span>
                      <span className="max-w-[55%] truncate text-right text-sm text-white/75">
                        {item.professionalName}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-6 text-white/60">
                  <Users className="size-5 shrink-0" aria-hidden />
                  <p>Nenhuma senha aguardando no momento.</p>
                </div>
              )}
            </PanelSection>

            <PanelSection title="Últimas chamadas">
              {panelData?.recentCalls.length ? (
                <ul className="space-y-3">
                  {panelData.recentCalls.map((call) => (
                    <li
                      key={`${call.id}-${call.calledAt}`}
                      className="rounded-2xl bg-white/10 px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-mono text-2xl font-bold tabular-nums">
                          {formatQueueNumber(call.queueNumber)}
                        </span>
                        <span className="text-sm text-white/60">
                          {formatCallTime(call.calledAt)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-white/80">
                        {call.roomName} · {call.professionalName}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-2xl bg-white/5 px-4 py-6 text-white/60">
                  As chamadas recentes aparecerão aqui.
                </p>
              )}
            </PanelSection>
          </div>
        </div>
      </div>
    </div>
  );
}
