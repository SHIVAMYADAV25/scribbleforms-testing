// apps/web/app/(auth)/layout.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMe } from "~/hooks/api/auth";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { data: me, isLoading } = useMe();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && me) router.replace("/dashboard");
  }, [me, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
