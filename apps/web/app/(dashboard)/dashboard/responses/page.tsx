// apps/web/app/(dashboard)/dashboard/responses/page.tsx
"use client";
import { useFormList } from "~/hooks/api/forms";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { Users, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function GlobalResponsesPage() {
  const { data, isLoading } = useFormList();
  const forms =
  data?.pages.flatMap(
    (p: { forms: typeof data.pages[number]["forms"] }) =>
      p.forms
  ) ?? [];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Responses</h2>
      <p className="text-sm text-muted-foreground">Select a form to view its responses.</p>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
      ) : forms.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No forms yet.</p>
            <Button className="mt-3" size="sm" asChild><Link href="/dashboard/forms">Create a Form</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {forms.map((form: (typeof forms)[number]) => (
            <Card key={form.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="flex items-center justify-between py-4 px-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{form.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant={form.status === "published" ? "default" : "secondary"} className="text-xs">
                      {form.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{form.totalResponses} responses</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild className="shrink-0 ml-3">
                  <Link href={`/dashboard/forms/${form.id}/responses`}>
                    View <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
