// apps/web/app/(dashboard)/dashboard/page.tsx
"use client";
import { useDashboardSummary } from "~/hooks/api/analytics";
import { useFormList } from "~/hooks/api/forms";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { FileText, Users, BarChart2, Eye, Plus } from "lucide-react";
import Link from "next/link";

function StatCard({ title, value, icon: Icon, loading }: {
  title: string; value: string | number; icon: any; loading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton className="h-7 w-20" /> : (
          <p className="text-2xl font-bold">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: summary, isLoading } = useDashboardSummary();
  const { data: formsData, isLoading: formsLoading } = useFormList();
  const recentForms = formsData?.pages?.[0]?.forms?.slice(0, 5) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground text-sm">Welcome back! Here's your overview.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/forms"><Plus className="h-4 w-4 mr-2" />New Form</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Forms"     value={summary?.totalForms ?? 0}     icon={FileText}  loading={isLoading} />
        <StatCard title="Total Responses" value={summary?.totalResponses ?? 0} icon={Users}     loading={isLoading} />
        <StatCard title="Total Views"     value={summary?.totalViews ?? 0}     icon={Eye}       loading={isLoading} />
        <StatCard title="Top Forms"       value={summary?.topForms?.length ?? 0} icon={BarChart2} loading={isLoading} />
      </div>

      {/* Recent Forms */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Forms</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/forms">View all →</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {formsLoading ? (
            <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : recentForms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No forms yet. Create your first one!</p>
              <Button className="mt-3" size="sm" asChild>
                <Link href="/dashboard/forms">Create Form</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {recentForms.map((form: (typeof recentForms)[number]) => (
                <div key={form.id} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{form.title}</p>
                    <p className="text-xs text-muted-foreground">{form.totalResponses} responses</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <Badge variant={form.status === "published" ? "default" : "secondary"} className="text-xs">
                      {form.status}
                    </Badge>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/forms/${form.id}/build`}>Edit</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
