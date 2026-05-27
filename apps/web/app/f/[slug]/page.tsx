// apps/web/app/f/[slug]/page.tsx
"use client";
import { use, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePublicForm } from "~/hooks/api/forms";
import { useTrackEvent } from "~/hooks/api/analytics";
import { applyConditions, buildFieldSchema } from "@repo/validators";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Progress } from "~/components/ui/progress";
import { Skeleton } from "~/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Checkbox } from "~/components/ui/checkbox";
import { AlertCircle, Lock } from "lucide-react";
import { getErrorMessage } from "~/lib/errors";
import { toast } from "sonner";

// ── Individual field renderers ──────────────────────────────────────
function FieldRenderer({ field, value, onChange, error }: {
  field: any; value: any; onChange: (v: any) => void; error?: string;
}) {
  const base = "space-y-1.5";

  switch (field.type) {
    case "short_text":
    case "phone":
      return (
        <div className={base}>
          <Label>{field.label}{field.required && <span className="text-destructive ml-0.5">*</span>}</Label>
          {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}
          <Input placeholder={field.placeholder ?? ""} value={value ?? ""} onChange={e => onChange(e.target.value)} />
          {error && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3"/>{error}</p>}
        </div>
      );

    case "long_text":
      return (
        <div className={base}>
          <Label>{field.label}{field.required && <span className="text-destructive ml-0.5">*</span>}</Label>
          {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}
          <Textarea placeholder={field.placeholder ?? ""} value={value ?? ""} onChange={e => onChange(e.target.value)} rows={4} />
          {error && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3"/>{error}</p>}
        </div>
      );

    case "email":
      return (
        <div className={base}>
          <Label>{field.label}{field.required && <span className="text-destructive ml-0.5">*</span>}</Label>
          {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}
          <Input type="email" placeholder={field.placeholder ?? "you@example.com"} value={value ?? ""} onChange={e => onChange(e.target.value)} />
          {error && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3"/>{error}</p>}
        </div>
      );

    case "number":
      return (
        <div className={base}>
          <Label>{field.label}{field.required && <span className="text-destructive ml-0.5">*</span>}</Label>
          {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}
          <Input type="number" placeholder={field.placeholder ?? "0"} value={value ?? ""} onChange={e => onChange(e.target.value ? Number(e.target.value) : "")} />
          {error && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3"/>{error}</p>}
        </div>
      );

    case "date":
      return (
        <div className={base}>
          <Label>{field.label}{field.required && <span className="text-destructive ml-0.5">*</span>}</Label>
          {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}
          <Input type="date" value={value ?? ""} onChange={e => onChange(e.target.value)} />
          {error && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3"/>{error}</p>}
        </div>
      );

    case "single_select": {
      const opts: string[] = (field.config?.options ?? []).map((o: any) => typeof o === "string" ? o : o.value ?? String(o));
      return (
        <div className={base}>
          <Label>{field.label}{field.required && <span className="text-destructive ml-0.5">*</span>}</Label>
          {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}
          <RadioGroup value={value ?? ""} onValueChange={onChange} className="space-y-1.5">
            {opts.map(opt => (
              <div key={opt} className="flex items-center gap-2">
                <RadioGroupItem value={opt} id={`${field.id}-${opt}`} />
                <Label htmlFor={`${field.id}-${opt}`} className="font-normal cursor-pointer">{opt}</Label>
              </div>
            ))}
          </RadioGroup>
          {error && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3"/>{error}</p>}
        </div>
      );
    }

    case "multi_select": {
      const opts: string[] = (field.config?.options ?? []).map((o: any) => typeof o === "string" ? o : o.value ?? String(o));
      const selected: string[] = Array.isArray(value) ? value : [];
      return (
        <div className={base}>
          <Label>{field.label}{field.required && <span className="text-destructive ml-0.5">*</span>}</Label>
          {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}
          <div className="space-y-1.5">
            {opts.map(opt => (
              <div key={opt} className="flex items-center gap-2">
                <Checkbox id={`${field.id}-${opt}`}
                  checked={selected.includes(opt)}
                  onCheckedChange={(checked: boolean | "indeterminate") => {
                    onChange(checked ? [...selected, opt] : selected.filter(s => s !== opt));
                  }} />
                <Label htmlFor={`${field.id}-${opt}`} className="font-normal cursor-pointer">{opt}</Label>
              </div>
            ))}
          </div>
          {error && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3"/>{error}</p>}
        </div>
      );
    }

    case "checkbox":
      return (
        <div className="flex items-start gap-2">
          <Checkbox id={field.id} checked={!!value}
            onCheckedChange={(v: boolean | "indeterminate") => onChange(!!v)} className="mt-0.5" />
          <div>
            <Label htmlFor={field.id} className="font-normal cursor-pointer">
              {field.label}{field.required && <span className="text-destructive ml-0.5">*</span>}
            </Label>
            {error && <p className="text-xs text-destructive flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3"/>{error}</p>}
          </div>
        </div>
      );

    case "rating": {
      const max   = Number(field.config?.max ?? 5);
      const stars = Array.from({ length: max }, (_, i) => i + 1);
      return (
        <div className={base}>
          <Label>{field.label}{field.required && <span className="text-destructive ml-0.5">*</span>}</Label>
          {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}
          <div className="flex gap-1">
            {stars.map(n => (
              <button key={n} type="button"
                className={`text-2xl transition-transform hover:scale-110 ${Number(value) >= n ? "text-yellow-400" : "text-muted-foreground/30"}`}
                onClick={() => onChange(n)}>★</button>
            ))}
          </div>
          {error && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3"/>{error}</p>}
        </div>
      );
    }

    case "divider":
      return <hr className="my-2 border-border" />;

    case "section_title":
      return (
        <div className="pt-2">
          <h3 className="text-base font-semibold">{field.label}</h3>
          {field.description && <p className="text-sm text-muted-foreground">{field.description}</p>}
        </div>
      );

    default:
      return (
        <div className={base}>
          <Label>{field.label}</Label>
          <Input value={value ?? ""} onChange={e => onChange(e.target.value)} />
        </div>
      );
  }
}

// ── Password gate ──────────────────────────────────────────────────
function PasswordGate({ slug, onUnlock }: { slug: string; onUnlock: (pw: string) => void }) {
  const [pw, setPw] = useState("");
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2"><Lock className="h-8 w-8 text-muted-foreground" /></div>
        <CardTitle>Password Required</CardTitle>
        <CardDescription>This form is password protected.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input type="password" placeholder="Enter password" value={pw} onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === "Enter" && pw && onUnlock(pw)} />
        <Button className="w-full" onClick={() => pw && onUnlock(pw)}>Unlock Form</Button>
      </CardContent>
    </Card>
  );
}

// ── Main public form page ──────────────────────────────────────────
export default function PublicFormPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug }  = use(params);
  const router    = useRouter();
  const apiUrl    = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  const [password, setPassword]   = useState<string | undefined>(undefined);
  const [answers, setAnswers]     = useState<Record<string, unknown>>({});
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formClosed, setFormClosed] = useState(false);
  const hasViewed = useRef(false);
  const startTimeRef = useRef(Date.now());
  const hasStarted = useRef(false);
  const hasSubmitted = useRef(false);

  const trackEvent = useTrackEvent();
  const { data: form, isLoading, error } = usePublicForm(slug);

  // Track form_view once on mount
  useEffect(() => {
    if (  form &&
  !("requiresPassword" in form) &&
  !hasViewed.current) {
      trackEvent.mutate({
        formId: form.id,
        eventType: "form_view",
      });
    }

    return () => {
      if (
        hasStarted.current &&
        !hasSubmitted.current &&
        form
      ) {
        trackEvent.mutate({
          formId: form.id,
          eventType: "form_abandon",
        });
      }
    };
  }, [form?.id]);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-xl space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );

  if (error || !form) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="py-12 text-center space-y-2">
          <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto" />
          <p className="font-semibold">Form not available</p>
          <p className="text-sm text-muted-foreground">
            {getErrorMessage(error) ?? "This form doesn't exist or has been removed."}
          </p>
        </CardContent>
      </Card>
    </div>
  );

  if (formClosed) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="py-12 text-center space-y-2">
          <p className="font-semibold">Form Closed</p>
          <p className="text-sm text-muted-foreground">This form is no longer accepting responses.</p>
        </CardContent>
      </Card>
    </div>
  );

  // Password gate
  if ((form as any).requiresPassword && password === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <PasswordGate slug={slug} onUnlock={pw => setPassword(pw)} />
      </div>
    );
  }

  const allFields     = (form as any).fields ?? [];
  const activeFields  = applyConditions(allFields, answers as Record<string, unknown>);
  const inputFields   = activeFields.filter((f: any) => f.type !== "divider" && f.type !== "section_title");
  const answered      = inputFields.filter((f: any) => answers[f.id] !== undefined && answers[f.id] !== "").length;
  const progressPct   = inputFields.length > 0 ? Math.round((answered / inputFields.length) * 100) : 0;

  async function handleSubmit() {
    // Client-side validation using shared schema
    const schema     = buildFieldSchema(inputFields as any);
    const validation = schema.safeParse(answers);

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      for (const [key, issues] of Object.entries(validation.error.flatten().fieldErrors)) {
        fieldErrors[key] = (issues as string[])[0] ?? "Invalid";
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const res = await fetch(`${apiUrl}/f/${slug}/submit`, {
        method:      "POST",
        headers:     { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          formVersionId: (form as any).currentVersionId,
          answers:       validation.data,
          metadata: {
            timeToCompleteMs: Date.now() - startTimeRef.current,
            referrer: typeof window !== "undefined" ? document.referrer : "",
          },
          __hp: "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "FORM_VERSION_OUTDATED") {
          toast.error(getErrorMessage(data));
          window.location.reload();
          return;
        }
        if (data.code === "FORM_EXPIRED" || data.code === "FORM_RESPONSE_LIMIT") {
          setFormClosed(true); return;
        }
        if (data.code === "VALIDATION_FAILED") {
          setErrors(data.errors ?? {}); return;
        }
        alert(getErrorMessage(data));
        return;
      }

      if (!hasSubmitted.current) {
        hasSubmitted.current = true;
      }

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        router.push(`/f/${slug}/success`);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 py-10 px-4">
      <div className="max-w-xl mx-auto space-y-4">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{form.title}</h1>
          {form.description && <p className="text-sm text-muted-foreground">{form.description}</p>}
        </div>

        {/* Progress */}
        {inputFields.length > 0 && (
          <div className="space-y-1">
            <Progress value={progressPct} className="h-1.5" />
            <p className="text-xs text-muted-foreground text-right">{answered}/{inputFields.length} answered</p>
          </div>
        )}

        {/* Fields */}
        <Card>
          <CardContent className="pt-6 space-y-6">
            {activeFields.map((field: any) => (
              <FieldRenderer
                key={field.id}
                field={field}
                value={answers[field.id]}
                onChange={v => {
                  if (!hasStarted.current) {
                    hasStarted.current = true;

                    trackEvent.mutate({
                      formId: form.id,
                      eventType: "form_start",
                    });
                  }

                  setAnswers(prev => ({
                    ...prev,
                    [field.id]: v,
                  }));
                }}
                error={errors[field.id]}
              />
            ))}

            {/* Honeypot */}
            <input type="text" name="__hp" style={{ display: "none" }} tabIndex={-1} readOnly value="" />

            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={submitting}>
              {submitting ? "Submitting…" : "Submit"}
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">Powered by ScribbleForms</p>
      </div>
    </div>
  );
}
