// apps/web/app/(dashboard)/dashboard/forms/[id]/share/page.tsx
"use client";
import { use, useState } from "react";
import { useFormDetail, usePublishForm, useUnpublishForm, useUpdateForm } from "~/hooks/api/forms";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { Separator } from "~/components/ui/separator";
import { Switch } from "~/components/ui/switch";
import { ArrowLeft, Copy, ExternalLink, Globe, Lock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: formId } = use(params);
  const { data: form, isLoading } = useFormDetail(formId);
  const publishForm   = usePublishForm(formId);
  const unpublishForm = useUnpublishForm(formId);
  const updateForm    = useUpdateForm(formId);
  const [copied, setCopied]     = useState(false);
  const [pwEnabled, setPwEnabled] = useState(false);

  const apiUrl   = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const formSlug = form?.customSlug ?? form?.slug ?? "";
  const formUrl  = `${appUrl}/f/${formSlug}`;

  function copyLink() {
    navigator.clipboard.writeText(formUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link copied!");
  }

  if (isLoading) return (
    <div className="space-y-4 max-w-2xl">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64" />
    </div>
  );
  if (!form) return <div className="text-muted-foreground">Form not found.</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/forms/${formId}/build`}><ArrowLeft className="h-4 w-4 mr-1" />Back</Link>
        </Button>
        <h2 className="text-xl font-bold">Share & Publish</h2>
        <Badge variant={form.status === "published" ? "default" : "secondary"}>{form.status}</Badge>
      </div>

      {/* Publish toggle */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Status</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {form.status === "published" ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Live — accepting responses</span>
              </div>
              <Button variant="outline" size="sm"
                onClick={() => unpublishForm.mutate({ id: formId })}
                disabled={unpublishForm.isPending}>
                Unpublish
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Form is a draft. Publish to accept responses.</p>
              <Button size="sm" onClick={() => publishForm.mutate({ id: formId })}
                disabled={publishForm.isPending}>
                {publishForm.isPending ? "Publishing…" : "Publish"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Share link */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Share Link</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input readOnly value={formUrl} className="font-mono text-xs" />
            <Button variant="outline" size="sm" onClick={copyLink} className="shrink-0">
              {copied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
            {form.status === "published" && (
              <Button variant="outline" size="sm" asChild className="shrink-0">
                <Link href={formUrl} target="_blank"><ExternalLink className="h-4 w-4" /></Link>
              </Button>
            )}
          </div>
          {form.publishedAt && (
            <p className="text-xs text-muted-foreground">
              Live since {new Date(form.publishedAt).toLocaleDateString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Visibility */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Visibility</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => updateForm.mutate({ id: formId, data: { visibility: "public" } })}
              className={`p-3 rounded-lg border text-left transition-colors ${form.visibility === "public" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}>
              <Globe className="h-4 w-4 mb-1" />
              <p className="text-sm font-medium">Public</p>
              <p className="text-xs text-muted-foreground">Appears in explore page</p>
            </button>
            <button
              onClick={() => updateForm.mutate({ id: formId, data: { visibility: "unlisted" } })}
              className={`p-3 rounded-lg border text-left transition-colors ${form.visibility === "unlisted" ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}>
              <Lock className="h-4 w-4 mb-1" />
              <p className="text-sm font-medium">Unlisted</p>
              <p className="text-xs text-muted-foreground">Link only, not in explore</p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Advanced Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Custom Slug</Label>
            <Input className="h-8 text-sm font-mono" placeholder={form.slug}
              defaultValue={form.customSlug ?? ""}
              onBlur={e => updateForm.mutate({ id: formId, data: { customSlug: e.target.value || null } })} />
            <p className="text-xs text-muted-foreground">Leave blank to use auto-generated slug</p>
          </div>
          <Separator />
          <div className="space-y-1.5">
            <Label className="text-xs">Response Limit</Label>
            <Input className="h-8 text-sm" type="number" placeholder="Unlimited"
              defaultValue={form.responseLimit ?? ""}
              onBlur={e => updateForm.mutate({ id: formId, data: { responseLimit: e.target.value ? Number(e.target.value) : null } })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Expiry Date</Label>
            <Input className="h-8 text-sm" type="datetime-local"
              defaultValue={form.expiresAt ? form.expiresAt.slice(0,16) : ""}
              onBlur={e => updateForm.mutate({ id: formId, data: { expiresAt: e.target.value ? new Date(e.target.value).toISOString() : null } })} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Password protect</Label>
            <Switch checked={pwEnabled} onCheckedChange={setPwEnabled} />
          </div>
          {pwEnabled && (
            <Input className="h-8 text-sm" type="password" placeholder="Set password…"
              onBlur={e => e.target.value && updateForm.mutate({ id: formId, data: { password: e.target.value } })} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
