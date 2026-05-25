// apps/web/app/(dashboard)/dashboard/analytics/page.tsx
"use client";
import { useDashboardSummary } from "~/hooks/api/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { Progress } from "~/components/ui/progress";
import { BarChart2, Eye, Users, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function GlobalAnalyticsPage() {
  const { data, isLoading } = useDashboardSummary();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics Overview</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Total Forms",     value: data?.totalForms ?? 0,     icon: BarChart2 },
          { label: "Total Responses", value: data?.totalResponses ?? 0, icon: Users },
          { label: "Total Views",     value: data?.totalViews ?? 0,     icon: Eye },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-7 w-20" /> : <p className="text-2xl font-bold">{value}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Top Performing Forms</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12" />)}</div>
          ) : !data?.topForms?.length ? (
            <p className="text-sm text-muted-foreground text-center py-8">No forms yet.</p>
          ) : (
            <div className="space-y-4">
              {data.topForms.map((form: any) => (
                <div key={form.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <Link href={`/dashboard/forms/${form.id}/analytics`}
                      className="font-medium hover:underline truncate flex-1">{form.title}</Link>
                    <span className="text-muted-foreground ml-3 shrink-0">{form.totalResponses} responses</span>
                  </div>
                  <Progress
                    value={form.totalResponses}
                    max={Math.max(...data.topForms.map((f: any) => f.totalResponses), 1)}
                    className="h-1.5"
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>Select a specific form to see detailed analytics.</p>
        <Button variant="link" asChild><Link href="/dashboard/forms">Go to Forms →</Link></Button>
      </div>
    </div>
  );
}
