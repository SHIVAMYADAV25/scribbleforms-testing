// apps/web/app/(dashboard)/explore/page.tsx
"use client";
import { useExplore } from "~/hooks/api/forms";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { Globe, ExternalLink, Users } from "lucide-react";
import Link from "next/link";

export default function ExplorePage() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useExplore();
  const forms = data?.pages.flatMap(p => p.forms) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Explore</h2>
        <p className="text-sm text-muted-foreground">Discover public forms from the community.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-36" />)}
        </div>
      ) : forms.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Globe className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No public forms yet.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {forms.map((form: any) => (
              <Card key={form.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold leading-tight">{form.title}</p>
                    <Badge variant="outline" className="text-xs shrink-0">public</Badge>
                  </div>

                  {form.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{form.description}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{form.totalResponses} responses</span>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/f/${form.customSlug ?? form.slug}`} target="_blank">
                        <ExternalLink className="h-3 w-3 mr-1" />Open
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {hasNextPage && (
            <div className="text-center">
              <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                {isFetchingNextPage ? "Loading…" : "Load more"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
