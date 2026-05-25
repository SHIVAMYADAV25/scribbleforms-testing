// apps/web/app/(dashboard)/dashboard/forms/[id]/responses/page.tsx
"use client";
import { use, useState } from "react";
import { useResponseList, useDeleteResponse, useExportCsv, useResponseDetail } from "~/hooks/api/responses";
import { useFormDetail } from "~/hooks/api/forms";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { Separator } from "~/components/ui/separator";
import { ArrowLeft, Download, Trash2, ChevronRight, X } from "lucide-react";
import Link from "next/link";

function ResponseDetail({ responseId, formId, onClose }: { responseId: string; formId: string; onClose: () => void }) {
  const { data, isLoading } = useResponseDetail(responseId, true);
  return (
    <Card className="h-full overflow-y-auto">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm">Response Detail</CardTitle>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? [1,2,3].map(i => <Skeleton key={i} className="h-12" />) :
        data ? (
          <>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>Submitted: {new Date(data.createdAt).toLocaleString()}</p>
              {data.timeToCompleteMs && <p>Time: {Math.round(data.timeToCompleteMs / 1000)}s</p>}
            </div>
            <Separator />
            <div className="space-y-3">
              {data.answers?.map((a: any) => (
                <div key={a.id} className="space-y-0.5">
                  <p className="text-xs font-medium text-muted-foreground capitalize">
                    {a.fieldType.replace(/_/g," ")}
                  </p>
                  <p className="text-sm break-words">
                    {a.valueText ?? a.valueNumber ?? JSON.stringify(a.valueArray ?? a.valueJson ?? "—")}
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : <p className="text-sm text-muted-foreground">Not found.</p>}
      </CardContent>
    </Card>
  );
}

export default function ResponsesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: formId } = use(params);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: form } = useFormDetail(formId);
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useResponseList(formId);
  const deleteResponse = useDeleteResponse(formId);
  const { startExport, isExporting, isPending } = useExportCsv(formId);

  const allResponses = data?.pages.flatMap(p => p.responses) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/forms/${formId}/build`}><ArrowLeft className="h-4 w-4 mr-1" />Back</Link>
          </Button>
          <h2 className="text-xl font-bold">{form?.title ?? "Responses"}</h2>
          <Badge variant="secondary">{total} total</Badge>
        </div>
        <Button variant="outline" size="sm" onClick={startExport}
          disabled={isExporting || isPending || allResponses.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? "Exporting…" : "Export CSV"}
        </Button>
      </div>

      <div className={`grid gap-4 ${selectedId ? "grid-cols-[1fr_320px]" : "grid-cols-1"}`}>
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-2">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14" />)}</div>
            ) : allResponses.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-sm">No responses yet.</p>
                <p className="text-xs mt-1">Share your form to start collecting responses.</p>
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <Link href={`/dashboard/forms/${formId}/share`}>Share Form</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="divide-y">
                  {allResponses.map((r) => (
                    <div key={r.id}
                      className={`flex items-center px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors gap-3 ${selectedId === r.id ? "bg-muted" : ""}`}
                      onClick={() => setSelectedId(r.id === selectedId ? null : r.id)}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {r.nameAnswer ?? r.emailAnswer ?? `Response #${r.id.slice(-6)}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(r.createdAt).toLocaleString()}
                          {r.timeToCompleteMs && ` · ${Math.round(r.timeToCompleteMs/1000)}s`}
                        </p>
                      </div>
                      <Badge variant={r.isComplete ? "default" : "secondary"} className="text-xs shrink-0">
                        {r.isComplete ? "complete" : "partial"}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0"
                        onClick={e => { e.stopPropagation(); if (confirm("Delete response?")) deleteResponse.mutate({ responseId: r.id }); }}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                  ))}
                </div>
                {hasNextPage && (
                  <div className="p-3 border-t text-center">
                    <Button variant="outline" size="sm" onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}>
                      {isFetchingNextPage ? "Loading…" : "Load more"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {selectedId && (
          <ResponseDetail responseId={selectedId} formId={formId} onClose={() => setSelectedId(null)} />
        )}
      </div>
    </div>
  );
}
