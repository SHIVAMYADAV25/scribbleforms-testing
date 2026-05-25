// apps/web/components/topbar.tsx
"use client";
import { useUIStore } from "~/stores/ui.store";
import { Badge } from "~/components/ui/badge";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";

export function Topbar({ title }: { title?: string }) {
  const { autosaveStatus } = useUIStore();

  return (
    <header className="h-14 border-b flex items-center justify-between px-6 bg-background shrink-0">
      {title && <h1 className="text-base font-semibold">{title}</h1>}
      <div className="ml-auto flex items-center gap-3">
        {autosaveStatus === "saving" && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> Saving...
          </span>
        )}
        {autosaveStatus === "saved" && (
          <span className="flex items-center gap-1.5 text-xs text-green-600">
            <CheckCircle className="h-3 w-3" /> Saved
          </span>
        )}
        {autosaveStatus === "error" && (
          <span className="flex items-center gap-1.5 text-xs text-destructive">
            <AlertCircle className="h-3 w-3" /> Save failed
          </span>
        )}
      </div>
    </header>
  );
}
