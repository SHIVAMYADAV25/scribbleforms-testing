// apps/web/hooks/api/forms/index.ts
"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { trpc } from "~/trpc/client";
import { getErrorMessage } from "~/lib/errors";
import { useUIStore } from "~/stores/ui.store";

export function useFormList(filters: { status?: "draft" | "published" | "archived"; search?: string } = {}) {
  return trpc.forms.list.useInfiniteQuery(
    { limit: 20, ...filters },
    { getNextPageParam: (last) => last.nextCursor ?? undefined }
  );
}

export function useFormDetail(formId: string) {
  return trpc.forms.getById.useQuery({ id: formId }, { staleTime: 0, enabled: !!formId });
}

export function usePublicForm(slug: string) {
  return trpc.forms.getPublic.useQuery({ slug }, { staleTime: 60_000, retry: false });
}

export function useExplore(filters = {}) {
  return trpc.forms.explore.useInfiniteQuery(
    { limit: 12, ...filters },
    { getNextPageParam: (last) => last.nextCursor ?? undefined }
  );
}

export function useCreateForm() {
  const utils  = trpc.useUtils();
  const router = useRouter();

  return trpc.forms.create.useMutation({
    onSuccess: (form) => {
      utils.forms.list.invalidate();
      router.push(`/dashboard/forms/${form.id}/build`);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateForm(formId: string) {
  const utils = trpc.useUtils();
  const { setAutosaveStatus } = useUIStore();

  return trpc.forms.update.useMutation({
    onMutate:  () => setAutosaveStatus("saving"),
    onSuccess: () => {
      setAutosaveStatus("saved");
      utils.forms.getById.invalidate({ id: formId });
    },
    onError: () => setAutosaveStatus("error"),
  });
}

export function usePublishForm(formId: string) {
  const utils = trpc.useUtils();

  return trpc.forms.publish.useMutation({
    onSuccess: ({ version }) => {
      utils.forms.getById.invalidate({ id: formId });
      utils.forms.list.invalidate();
      toast.success(`Published! Version ${version} is now live.`);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUnpublishForm(formId: string) {
  const utils = trpc.useUtils();

  return trpc.forms.unpublish.useMutation({
    onSuccess: () => {
      utils.forms.getById.invalidate({ id: formId });
      utils.forms.list.invalidate();
      toast.success("Form unpublished.");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteForm() {
  const utils = trpc.useUtils();

  return trpc.forms.delete.useMutation({
    onSuccess: () => {
      utils.forms.list.invalidate();
      toast.success("Form deleted.");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDuplicateForm() {
  const utils = trpc.useUtils();

  return trpc.forms.duplicate.useMutation({
    onSuccess: () => {
      utils.forms.list.invalidate();
      toast.success("Form duplicated!");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// Fields
export function useAddField(formId: string) {
  const utils = trpc.useUtils();
  return trpc.fields.addField.useMutation({
    onSuccess: () => utils.forms.getById.invalidate({ id: formId }),
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateField(formId: string) {
  const utils = trpc.useUtils();
  const { setAutosaveStatus } = useUIStore();
  return trpc.fields.updateField.useMutation({
    onMutate:  () => setAutosaveStatus("saving"),
    onSuccess: () => {
      setAutosaveStatus("saved");
      utils.forms.getById.invalidate({ id: formId });
    },
    onError: () => setAutosaveStatus("error"),
  });
}

export function useDeleteField(formId: string) {
  const utils = trpc.useUtils();
  return trpc.fields.deleteField.useMutation({
    onSuccess: () => utils.forms.getById.invalidate({ id: formId }),
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useReorderFields(formId: string) {
  const utils = trpc.useUtils();
  return trpc.fields.reorder.useMutation({
    onSuccess: () => utils.forms.getById.invalidate({ id: formId }),
  });
}

export function useDuplicateField(formId: string) {
  const utils = trpc.useUtils();
  return trpc.fields.duplicate.useMutation({
    onSuccess: () => utils.forms.getById.invalidate({ id: formId }),
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
