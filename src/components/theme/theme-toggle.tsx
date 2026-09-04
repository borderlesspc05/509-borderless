"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ inverse = false }: { inverse?: boolean }) {
  const { resolved, toggleDark } = useTheme();
  const isDark = resolved === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={
        inverse
          ? "app-header-icon-btn text-primary-foreground hover:bg-white/15"
          : undefined
      }
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      title={isDark ? "Modo claro" : "Modo escuro"}
      onClick={toggleDark}
    >
      {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </Button>
  );
}
