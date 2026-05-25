// apps/web/hooks/api/responses/index.ts
"use client";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "~/trpc/client";
import { getErrorMessage } from "~/lib/errors";

export function useResponseList(formId: string) {
  return trpc.responses.list.useInfiniteQuery(
    { formId, limit: 25 },
    { getNextPageParam: (last) => last.nextCursor ?? undefined, enabled: !!formId }
  );
}

export function useResponseDetail(responseId: string, enabled: boolean) {
  return trpc.responses.getById.useQuery({ responseId }, { enabled, staleTime: 60_000 });
}

export function useDeleteResponse(formId: string) {
  const utils = trpc.useUtils();
  return trpc.responses.delete.useMutation({
    onSuccess: () => {
      utils.responses.list.invalidate({ formId });
      toast.success("Response deleted.");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useExportCsv(formId: string) {
  const [jobId, setJobId] = useState<string | null>(null);

  const exportMutation = trpc.responses.exportResponses.useMutation({
    onSuccess: ({ exportJobId }) => {
      setJobId(exportJobId);
      toast.info("Export started! We'll notify you when it's ready.");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  trpc.responses.getExportStatus.useQuery(
    { exportJobId: jobId! },
    {
      enabled: !!jobId,
      refetchInterval: 3000,
      select: (d) => d,
    }
  );

  return {
    startExport: () => exportMutation.mutate({ formId, format: "csv" }),
    isExporting: !!jobId,
    isPending: exportMutation.isPending,
  };
}
