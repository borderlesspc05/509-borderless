"use client";

import { ToastProvider } from "@/contexts/toast-context";
import { ThemeProvider } from "@/components/theme/theme-provider";

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="h-full min-h-0">{children}</div>
      </ToastProvider>
    </ThemeProvider>
  );
}
