// apps/web/app/(dashboard)/dashboard/forms/[id]/analytics/page.tsx
"use client";
import { use, useState } from "react";
import { useFormStats } from "~/hooks/api/analytics";
import { useFormDetail } from "~/hooks/api/forms";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { ArrowLeft, TrendingUp, Users, Eye, Clock } from "lucide-react";
import Link from "next/link";

type ResponsePoint = {
  date: string;
  count: number;
};

type FunnelStage = {
  stage: string;
  count: number;
};

type FieldAnalytics = {
  fieldId: string;
  fieldLabel: string;
  dropOffRate: number;
  value?: unknown;
};
function toISO(d: Date) { return d.toISOString(); }

export default function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: formId } = use(params);
  const [days, setDays] = useState(30);

  const [dateRange, setDateRange] = useState(() => {
  const end = new Date();
  const start = new Date(Date.now() - 30 * 86_400_000);

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
});

  const { data: form }  = useFormDetail(formId);
  const { data: stats, isLoading } = useFormStats(
  formId,
  dateRange.startDate,
  dateRange.endDate
);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/forms/${formId}/build`}><ArrowLeft className="h-4 w-4 mr-1" />Back</Link>
        </Button>
        <h2 className="text-xl font-bold">{form?.title ?? "Analytics"}</h2>
      </div>

      {/* Date range */}
      <div className="flex gap-2">
        {[7, 30, 90].map(d => (
          <Button key={d} size="sm" variant={days === d ? "default" : "outline"}
            onClick={() => setDays(d)}>
            Last {d}d
          </Button>
        ))}
      </div>

      {/* Stat cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Responses",        value: stats?.totalResponses ?? 0,      icon: Users },
            { label: "Views",            value: stats?.totalViews ?? 0,           icon: Eye },
            { label: "Completion Rate",  value: `${stats?.completionRate ?? 0}%`, icon: TrendingUp },
            { label: "Avg. Time",        value: stats?.avgTimeToCompleteMs
                ? `${Math.round((stats.avgTimeToCompleteMs)/1000)}s` : "—",        icon: Clock },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{value}</p>
                {stats?.previousPeriod && (
                  <p className="text-xs text-muted-foreground mt-1">
                    vs {label === "Responses" ? stats.previousPeriod.totalResponses
                      : label === "Views"     ? stats.previousPeriod.totalViews
                      : label === "Completion Rate" ? `${stats.previousPeriod.completionRate}%`
                      : "—"} prev period
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Responses over time */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Responses Over Time</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-32" /> : (
              stats?.responsesOverTime?.length ? (
                <div className="space-y-1.5">
                  {stats.responsesOverTime.slice(-10).map((d : ResponsePoint) => (
                    <div key={d.date} className="flex items-center gap-2 text-xs">
                      <span className="w-24 text-muted-foreground shrink-0">{d.date}</span>
                      <Progress value={d.count} max={Math.max(...stats.responsesOverTime.map((x:ResponsePoint)=>x.count), 1)} className="flex-1 h-2" />
                      <span className="w-6 text-right">{d.count}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground text-center py-8">No data yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Completion funnel */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Funnel</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-32" /> : (
              stats?.completionFunnel?.length ? (
                <div className="space-y-3">
                  {stats.completionFunnel.map((stage : FunnelStage) => (
                    <div key={stage.stage} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{stage.stage}</span>
                        <span className="font-medium">{stage.count}</span>
                      </div>
                      <Progress
                        value={stage.count}
                        max={Math.max(...stats.completionFunnel.map((s:FunnelStage) => s.count), 1)}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground text-center py-8">No data yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Device breakdown */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Devices</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-24" /> : stats?.deviceBreakdown ? (
              <div className="space-y-2">
                {Object.entries(stats.deviceBreakdown).map(([device, count]) => (
                  <div key={device} className="flex items-center gap-2 text-sm">
                    <span className="w-20 capitalize text-muted-foreground text-xs">{device}</span>
                    <Progress value={Number(count)}
                      max={Math.max(...Object.values(stats.deviceBreakdown).map(Number), 1)}
                      className="flex-1 h-2" />
                    <span className="text-xs w-6 text-right">{Number(count)}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground py-4 text-center">No data.</p>}
          </CardContent>
        </Card>

        {/* Field drop-off */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Field Drop-off</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-24" /> : (
              stats?.fieldDropOff?.length ? (
                <div className="space-y-2">
                  {stats.fieldDropOff.map((f:FieldAnalytics) => (
                    <div key={f.fieldId} className="flex items-center gap-2 text-xs">
                      <span className="truncate flex-1 text-muted-foreground">{f.fieldLabel}</span>
                      <Badge variant={f.dropOffRate > 30 ? "destructive" : "secondary"} className="text-xs">
                        {f.dropOffRate}%
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground text-center py-8">No drop-off data.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
