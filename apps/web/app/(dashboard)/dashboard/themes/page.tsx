// apps/web/app/(dashboard)/dashboard/themes/page.tsx
"use client";
import { useState } from "react";
import { useThemeList } from "~/hooks/api/themes";
import { useFormList, useUpdateForm } from "~/hooks/api/forms";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "~/components/ui/select";
import { Search, Palette, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "~/trpc/client";
import { getErrorMessage } from "~/lib/errors";

// Theme preview: coloured circles from tokensJson
function ThemePreview({ tokensJson, colors }: { tokensJson: Record<string, string>; colors: string[] }) {
  const bg = tokensJson["--sf-bg"] ?? "#fff";
  const primary = tokensJson["--sf-primary"] ?? "#000";
  return (
    <div className="h-20 rounded-md flex flex-col items-center justify-center gap-2 mb-3"
      style={{ background: bg }}>
      <div className="flex gap-1.5">
        {(colors.length ? colors : [primary]).slice(0, 4).map((c, i) => (
          <div key={i} className="h-4 w-4 rounded-full border border-black/10" style={{ background: c }} />
        ))}
      </div>
      <div className="text-xs font-medium" style={{ color: tokensJson["--sf-text"] ?? "#000" }}>
        Aa Bb Cc
      </div>
    </div>
  );
}

export default function ThemesPage() {
  const [search, setSearch]   = useState("");
  const [formId, setFormId]   = useState<string>("");
  const [applying, setApplying] = useState<string | null>(null);

  const { data: themesData, isLoading } = useThemeList({ search: search || undefined });
  const { data: formsData } = useFormList();
  const applyTheme = trpc.themes.applyToForm.useMutation({
    onSuccess: () => {
      toast.success("Theme applied!");
      setApplying(null);
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err));
      setApplying(null);
    },
  });

  const themes = ((themesData as any)?.themes ?? []) as Array<{
  id: string;
  name: string;
  tokensJson: Record<string, string>;
  colors: string[];
  isSystem?: boolean;
  category?: string;
  usageCount: number;
}>;
  
const forms =
  formsData?.pages.flatMap(
    (p: { forms: typeof formsData.pages[number]["forms"] }) =>
      p.forms
  ) ?? [];

  function handleApply(themeId: string) {
    if (!formId) { toast.error("Select a form first."); return; }
    setApplying(themeId);
    applyTheme.mutate({ formId, themeId });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Themes</h2>
        <Palette className="h-5 w-5 text-muted-foreground" />
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search themes…" value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={formId} onValueChange={setFormId}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Apply to form…" />
          </SelectTrigger>
          <SelectContent>
            {forms.map((f: (typeof forms)[number]) => (
              <SelectItem key={f.id} value={f.id}>{f.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-52" />)}
        </div>
      ) : themes.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No themes found.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {themes.map(theme => (
            <Card key={theme.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <ThemePreview
                  tokensJson={theme.tokensJson as Record<string, string>}
                  colors={theme.colors as string[]}
                />
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-sm font-semibold truncate">{theme.name}</p>
                    {theme.isSystem && <Badge variant="outline" className="text-xs shrink-0">System</Badge>}
                  </div>
                  {theme.category && (
                    <Badge variant="secondary" className="text-xs capitalize">{theme.category}</Badge>
                  )}
                  <p className="text-xs text-muted-foreground">{theme.usageCount} uses</p>
                  <Button size="sm" variant="outline" className="w-full"
                    disabled={applying === theme.id || !formId}
                    onClick={() => handleApply(theme.id)}>
                    {applying === theme.id
                      ? "Applying…"
                      : formId
                        ? "Apply Theme"
                        : "Select a form first"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
