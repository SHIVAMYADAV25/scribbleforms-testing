// apps/web/app/(dashboard)/dashboard/forms/page.tsx
"use client";
import { useState } from "react";
import { useFormList, useCreateForm, useDeleteForm, useDuplicateForm } from "~/hooks/api/forms";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger
} from "~/components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, Edit, Copy, Trash2, BarChart2, Share2 } from "lucide-react";
import Link from "next/link";

export default function FormsPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useFormList({ search: search || undefined });
  const createForm   = useCreateForm();
  const deleteForm   = useDeleteForm();
  const duplicateForm = useDuplicateForm();

  const allForms = data?.pages.flatMap(p => p.forms) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Forms</h2>
        <Button onClick={() => createForm.mutate({ title: "Untitled Form", visibility: "public" })}
          disabled={createForm.isPending}>
          <Plus className="h-4 w-4 mr-2" />
          {createForm.isPending ? "Creating..." : "New Form"}
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search forms..." value={search}
          onChange={e => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : allForms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <p className="mb-3">No forms found.</p>
            <Button onClick={() => createForm.mutate({ title: "My First Form", visibility: "public" })}>
              Create your first form
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allForms.map(form => (
              <Card key={form.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <Link href={`/dashboard/forms/${form.id}/build`}
                      className="font-semibold text-sm hover:underline truncate flex-1">{form.title}</Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/forms/${form.id}/build`}><Edit className="h-4 w-4 mr-2" />Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/forms/${form.id}/analytics`}><BarChart2 className="h-4 w-4 mr-2" />Analytics</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/forms/${form.id}/share`}><Share2 className="h-4 w-4 mr-2" />Share</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => duplicateForm.mutate({ id: form.id })}>
                          <Copy className="h-4 w-4 mr-2" />Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive"
                          onClick={() => { if (confirm("Delete this form?")) deleteForm.mutate({ id: form.id }); }}>
                          <Trash2 className="h-4 w-4 mr-2" />Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant={form.status === "published" ? "default" : "secondary"} className="text-xs">
                      {form.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">{form.visibility}</Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{form.totalResponses} responses</span>
                    <span>{form.totalViews} views</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {hasNextPage && (
            <div className="text-center pt-2">
              <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                {isFetchingNextPage ? "Loading..." : "Load more"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
