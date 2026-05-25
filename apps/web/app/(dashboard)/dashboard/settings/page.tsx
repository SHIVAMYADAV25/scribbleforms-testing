// apps/web/app/(dashboard)/dashboard/settings/page.tsx
"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMe, useUpdateProfile } from "~/hooks/api/auth";
import { useApiKeyList, useCreateApiKey, useRevokeApiKey,
         useWebhookList, useCreateWebhook, useDeleteWebhook, useTestWebhook } from "~/hooks/api/settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { Separator } from "~/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "~/components/ui/dialog";
import { Copy, Trash2, Plus, Play, Key, Webhook, User } from "lucide-react";
import { toast } from "sonner";

// ── Profile tab ────────────────────────────────────────────────────
function ProfileTab() {
  const { data: me } = useMe();
  const updateProfile = useUpdateProfile();
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(z.object({
      fullName: z.string().min(1).max(255).optional(),
    })),
    values: { fullName: me?.fullName ?? "" },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Profile</CardTitle>
        <CardDescription>Update your display name.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(d => updateProfile.mutate(d))} className="space-y-4 max-w-sm">
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={me?.email ?? ""} disabled className="text-muted-foreground" />
          </div>
          <div className="space-y-1.5">
            <Label>Full Name</Label>
            <Input {...register("fullName")} placeholder="Your name" />
          </div>
          <div className="space-y-1.5">
            <Label>Plan</Label>
            <div><Badge variant="secondary" className="capitalize">{me?.plan}</Badge></div>
          </div>
          <Button type="submit" size="sm" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? "Saving…" : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ── API Keys tab ──────────────────────────────────────────────────
function ApiKeysTab() {
  const { data, isLoading }   = useApiKeyList();
  const createKey             = useCreateApiKey();
  const revokeKey             = useRevokeApiKey();
  const [keyName, setKeyName] = useState("");
  const [newKey, setNewKey]   = useState<string | null>(null);

  async function handleCreate() {
    if (!keyName.trim()) return;
    const result = await createKey.mutateAsync({ name: keyName.trim() });
    setNewKey(result.fullKey);
    setKeyName("");
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">API Keys</CardTitle>
          <CardDescription>Create API keys to access ScribbleForms programmatically.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input placeholder="Key name (e.g. My App)" value={keyName}
              onChange={e => setKeyName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleCreate()} />
            <Button size="sm" onClick={handleCreate} disabled={createKey.isPending || !keyName.trim()}>
              <Plus className="h-4 w-4 mr-1" />Create
            </Button>
          </div>

          {newKey && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
              <p className="text-xs font-medium text-amber-800">
                Copy this key now — it won't be shown again.
              </p>
              <div className="flex gap-2">
                <code className="text-xs bg-white border rounded px-2 py-1 flex-1 overflow-x-auto">{newKey}</code>
                <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(newKey); toast.success("Copied!"); }}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <Button size="sm" variant="ghost" className="text-xs" onClick={() => setNewKey(null)}>Dismiss</Button>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-2">{[1,2].map(i => <Skeleton key={i} className="h-12" />)}</div>
          ) : !data?.keys.length ? (
            <p className="text-sm text-muted-foreground text-center py-4">No API keys yet.</p>
          ) : (
            <div className="divide-y">
              {data.keys.map(key => (
                <div key={key.id} className="flex items-center gap-3 py-3">
                  <Key className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{key.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{key.keyPrefix}…</p>
                  </div>
                  <div className="text-xs text-muted-foreground shrink-0">
                    {key.lastUsedAt ? `Used ${new Date(key.lastUsedAt).toLocaleDateString()}` : "Never used"}
                  </div>
                  {key.revokedAt ? (
                    <Badge variant="destructive" className="text-xs">Revoked</Badge>
                  ) : (
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0"
                      onClick={() => { if (confirm("Revoke this key?")) revokeKey.mutate({ id: key.id }); }}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Webhooks tab ──────────────────────────────────────────────────
function WebhooksTab() {
  const { data, isLoading } = useWebhookList();
  const createWebhook       = useCreateWebhook();
  const deleteWebhook       = useDeleteWebhook();
  const testWebhook         = useTestWebhook();
  const [url, setUrl]       = useState("");
  const [open, setOpen]     = useState(false);

  const EVENTS = ["form.response.created", "form.published", "form.unpublished"] as const;

  async function handleCreate() {
    if (!url.trim()) return;
    await createWebhook.mutateAsync({ url: url.trim(), events: ["form.response.created"] });
    setUrl("");
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Webhooks</CardTitle>
            <CardDescription>Receive HTTP notifications when events occur.</CardDescription>
          </div>
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />Add Webhook
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[1,2].map(i => <Skeleton key={i} className="h-14" />)}</div>
          ) : !data?.webhooks.length ? (
            <p className="text-sm text-muted-foreground text-center py-6">No webhooks yet.</p>
          ) : (
            <div className="divide-y">
              {data.webhooks.map(wh => (
                <div key={wh.id} className="py-3 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Webhook className="h-4 w-4 text-muted-foreground shrink-0" />
                    <p className="text-sm font-mono truncate flex-1">{wh.url}</p>
                    <Button variant="ghost" size="sm" className="shrink-0"
                      onClick={() => testWebhook.mutate({ id: wh.id })} disabled={testWebhook.isPending}>
                      <Play className="h-3 w-3 mr-1" />Test
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0"
                      onClick={() => { if (confirm("Delete webhook?")) deleteWebhook.mutate({ id: wh.id }); }}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                  <div className="flex gap-1.5 pl-6">
                    {(wh.events as string[]).map(e => (
                      <Badge key={e} variant="outline" className="text-xs">{e}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Webhook</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>Endpoint URL</Label>
              <Input placeholder="https://your-app.com/webhook" value={url} onChange={e => setUrl(e.target.value)} />
            </div>
            <p className="text-xs text-muted-foreground">
              All events will be subscribed by default. You can customise later.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createWebhook.isPending || !url.trim()}>
              {createWebhook.isPending ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-4 max-w-2xl">
      <h2 className="text-2xl font-bold">Settings</h2>
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile"><User className="h-4 w-4 mr-1.5" />Profile</TabsTrigger>
          <TabsTrigger value="api-keys"><Key className="h-4 w-4 mr-1.5" />API Keys</TabsTrigger>
          <TabsTrigger value="webhooks"><Webhook className="h-4 w-4 mr-1.5" />Webhooks</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-4"><ProfileTab /></TabsContent>
        <TabsContent value="api-keys" className="mt-4"><ApiKeysTab /></TabsContent>
        <TabsContent value="webhooks" className="mt-4"><WebhooksTab /></TabsContent>
      </Tabs>
    </div>
  );
}
