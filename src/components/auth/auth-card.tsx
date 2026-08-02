import { ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";

type AuthCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export function AuthCard({
  title,
  description,
  children,
  footer,
  className,
}: AuthCardProps) {
  return (
    <div className={cn("app-auth-card overflow-hidden", className)}>
      <div className="space-y-3 px-5 pt-6 sm:px-8 sm:pt-8">
        <div className="h-1 w-10 rounded-full bg-primary" aria-hidden />
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground sm:text-[1.75rem]">{title}</h1>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <div className="px-5 py-6 sm:px-8">{children}</div>

      {footer ? (
        <div className="flex flex-col gap-4 px-5 pb-6 sm:px-8 sm:pb-8">
          {footer}
        </div>
      ) : null}

      <div className="flex items-center justify-center gap-1.5 border-t border-border/60 bg-muted/35 px-5 py-3 text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5 shrink-0 text-clinical-success" aria-hidden />
        <span>Conexão protegida e criptografada</span>
      </div>
    </div>
  );
}
