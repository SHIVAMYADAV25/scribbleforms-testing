// apps/web/app/(dashboard)/dashboard/forms/[id]/build/page.tsx
"use client";
import { use, useState, useEffect } from "react";
import { useFormDetail, useUpdateForm, usePublishForm, useUnpublishForm,
         useAddField, useDeleteField, useUpdateField } from "~/hooks/api/forms";
import { useFormBuilderStore } from "~/stores/form-builder.store";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { Switch } from "~/components/ui/switch";
import { Separator } from "~/components/ui/separator";
import { Trash2, Plus, Eye, Globe, Lock } from "lucide-react";
import Link from "next/link";
import { useUIStore } from "~/stores/ui.store";

const FIELD_TYPES = [
  { type: "short_text",    label: "Short Text" },
  { type: "long_text",     label: "Long Text" },
  { type: "email",         label: "Email" },
  { type: "number",        label: "Number" },
  { type: "single_select", label: "Single Select" },
  { type: "multi_select",  label: "Multi Select" },
  { type: "checkbox",      label: "Checkbox" },
  { type: "rating",        label: "Rating" },
  { type: "date",          label: "Date" },
  { type: "phone",         label: "Phone" },
];

export default function BuildPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: formId } = use(params);
  const { data: form, isLoading } = useFormDetail(formId);
  const updateForm    = useUpdateForm(formId);
  const publishForm   = usePublishForm(formId);
  const unpublishForm = useUnpublishForm(formId);
  const addField      = useAddField(formId);
  const deleteField   = useDeleteField(formId);
  const updateField   = useUpdateField(formId);
  const { autosaveStatus } = useUIStore();

  const { selectedFieldId, setSelectedField } = useFormBuilderStore();
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleVal, setTitleVal] = useState("");

  useEffect(() => {
    if (form?.title) setTitleVal(form.title);
  }, [form?.title]);

  const fields = form?.fields ?? [];
  const selectedField = fields.find((f: any) => f.id === selectedFieldId);

  function saveTitle() {
    if (titleVal.trim() && titleVal !== form?.title) {
      updateForm.mutate({ id: formId, data: { title: titleVal.trim() } });
    }
    setEditingTitle(false);
  }

  function addNewField(type: string) {
    addField.mutate({
      formId,
      field: { type: type as any, label: `${type.replace(/_/g, " ")} field`, required: false, order: fields.length },
    });
  }

  if (isLoading) return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-3 gap-4"><Skeleton className="h-96" /><Skeleton className="h-96 col-span-1" /><Skeleton className="h-96" /></div>
    </div>
  );
  if (!form) return <div className="text-muted-foreground">Form not found.</div>;

  return (
    <div className="space-y-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {editingTitle ? (
            <Input className="text-xl font-bold h-9 w-64" value={titleVal}
              onChange={e => setTitleVal(e.target.value)}
              onBlur={saveTitle} onKeyDown={e => e.key === "Enter" && saveTitle()} autoFocus />
          ) : (
            <h2 className="text-xl font-bold cursor-pointer hover:opacity-70"
              onClick={() => setEditingTitle(true)}>{form.title}</h2>
          )}
          <Badge variant={form.status === "published" ? "default" : "secondary"}>{form.status}</Badge>
          {autosaveStatus === "saving" && <span className="text-xs text-muted-foreground">Saving…</span>}
          {autosaveStatus === "saved"  && <span className="text-xs text-green-600">Saved</span>}
        </div>

        <div className="flex items-center gap-2">
          {form.status === "published" && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/f/${form.slug}`} target="_blank"><Eye className="h-4 w-4 mr-1" />Preview</Link>
            </Button>
          )}
          {form.status === "published" ? (
            <Button variant="outline" size="sm" onClick={() => unpublishForm.mutate({ id: formId })}
              disabled={unpublishForm.isPending}>Unpublish</Button>
          ) : (
            <Button size="sm" onClick={() => publishForm.mutate({ id: formId })}
              disabled={publishForm.isPending}>
              {publishForm.isPending ? "Publishing…" : "Publish"}
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/forms/${formId}/share`}><Globe className="h-4 w-4 mr-1" />Share</Link>
          </Button>
        </div>
      </div>

      {/* 3-col layout */}
      <div className="grid grid-cols-[180px_1fr_220px] gap-4 h-[calc(100vh-180px)]">

        {/* Left: Field types */}
        <Card className="overflow-y-auto">
          <CardHeader className="py-3 px-3">
            <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">Add Fields</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2 space-y-1">
            {FIELD_TYPES.map(ft => (
              <Button key={ft.type} variant="ghost" size="sm"
                className="w-full justify-start text-xs h-8"
                disabled={addField.isPending}
                onClick={() => addNewField(ft.type)}>
                <Plus className="h-3 w-3 mr-2 shrink-0" />{ft.label}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Center: Canvas */}
        <Card className="overflow-y-auto">
          <CardHeader className="py-3">
            <p className="text-xs text-muted-foreground">{fields.length} fields</p>
          </CardHeader>
          <CardContent className="space-y-2 pb-4">
            {fields.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                <p className="text-sm">No fields yet.</p>
                <p className="text-xs mt-1">Click a field type on the left to add one.</p>
              </div>
            ) : (
              fields.map((field: any, idx: number) => (
                <div key={field.id}
                  onClick={() => setSelectedField(field.id === selectedFieldId ? null : field.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    field.id === selectedFieldId
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground"
                  }`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs text-muted-foreground shrink-0">#{idx+1}</span>
                      <span className="text-sm font-medium truncate">{field.label}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Badge variant="outline" className="text-xs">{field.type.replace(/_/g," ")}</Badge>
                      {field.required && <Badge variant="secondary" className="text-xs">req</Badge>}
                      <Button variant="ghost" size="icon" className="h-6 w-6"
                        onClick={e => { e.stopPropagation(); deleteField.mutate({ formId, fieldId: field.id }); }}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Right: Settings */}
        <Card className="overflow-y-auto">
          <CardHeader className="py-3 px-3">
            <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">
              {selectedField ? "Field Settings" : "Form Settings"}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 space-y-3">
            {selectedField ? (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs">Label</Label>
                  <Input className="h-8 text-sm" defaultValue={selectedField.label}
                    onBlur={e => updateField.mutate({ formId, fieldId: selectedField.id, data: { label: e.target.value } })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Placeholder</Label>
                  <Input className="h-8 text-sm" defaultValue={selectedField.placeholder ?? ""}
                    onBlur={e => updateField.mutate({ formId, fieldId: selectedField.id, data: { placeholder: e.target.value } })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Required</Label>
                  <Switch checked={selectedField.required}
                    onCheckedChange={v => updateField.mutate({ formId, fieldId: selectedField.id, data: { required: v } })} />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs">Title</Label>
                  <Input className="h-8 text-sm" defaultValue={form.title}
                    onBlur={e => updateForm.mutate({ id: formId, data: { title: e.target.value } })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Visibility</Label>
                  <div className="flex gap-2">
                    {["public","unlisted"].map(v => (
                      <Button key={v} size="sm" variant={form.visibility === v ? "default" : "outline"}
                        className="flex-1 text-xs h-8"
                        onClick={() => updateForm.mutate({ id: formId, data: { visibility: v as any } })}>
                        {v === "public" ? <Globe className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
                        {v}
                      </Button>
                    ))}
                  </div>
                </div>
                <Separator />
                <div className="space-y-1.5">
                  <Label className="text-xs">Success Message</Label>
                  <Input className="h-8 text-sm" placeholder="Thank you!"
                    defaultValue={(form as any).successMessage ?? ""}
                    onBlur={e => updateForm.mutate({ id: formId, data: { successMessage: e.target.value } })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Response Limit</Label>
                  <Input className="h-8 text-sm" type="number" placeholder="Unlimited"
                    defaultValue={(form as any).responseLimit ?? ""}
                    onBlur={e => updateForm.mutate({ id: formId, data: { responseLimit: e.target.value ? Number(e.target.value) : null } })} />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
