import {
  Activity,
  ClipboardList,
  Clock,
  ThumbsUp,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const iconMap = {
  sessions: Activity,
  hours: Clock,
  programs: ClipboardList,
  avgPrograms: ThumbsUp,
  attempts: Activity,
  independence: ThumbsUp,
  learners: ClipboardList,
  attendance: Activity,
} as const;

const accentMap = {
  emerald: "bg-emerald-500",
  sky: "bg-sky-400",
  slate: "bg-slate-600",
  muted: "bg-muted-foreground/50",
  primary: "bg-primary",
} as const;

type DashboardMetricCardProps = {
  label: string;
  value: string;
  icon: keyof typeof iconMap;
  accent?: keyof typeof accentMap;
  className?: string;
  compactValue?: boolean;
};

export function DashboardMetricCard({
  label,
  value,
  icon,
  accent = "primary",
  className,
  compactValue = false,
}: DashboardMetricCardProps) {
  const Icon: LucideIcon = iconMap[icon];

  return (
    <Card
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-xl border-border/70 shadow-sm transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-md",
        className
      )}
    >
      <span className={cn("absolute inset-y-0 left-0 w-1", accentMap[accent])} aria-hidden />
      <CardContent className="flex flex-1 items-start justify-between gap-3 p-5 sm:p-6">
        <div className="min-w-0 flex-1 space-y-2">
          <p className="min-h-10 text-sm font-medium leading-snug text-muted-foreground">
            {label}
          </p>
          <p
            className={cn(
              "font-semibold tracking-tight text-foreground",
              compactValue
                ? "text-lg leading-snug sm:text-xl"
                : "text-2xl sm:text-3xl"
            )}
          >
            {value}
          </p>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted/70 text-primary">
          <Icon className="size-5" aria-hidden />
        </div>
      </CardContent>
    </Card>
  );
}
