// apps/web/components/auth-guard.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMe } from "~/hooks/api/auth";
import { Skeleton } from "~/components/ui/skeleton";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: me, isLoading } = useMe();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !me) router.replace("/login");
  }, [me, isLoading, router]);

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="space-y-3 w-64">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );

  if (!me) return null;
  return <>{children}</>;
}
