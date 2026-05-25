// apps/web/app/f/[slug]/success/page.tsx
"use client";
import { use } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function SuccessPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="py-12 text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Thank you!</h1>
            <p className="text-muted-foreground text-sm">Your response has been submitted successfully.</p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Button variant="outline" asChild>
              <Link href={`/f/${slug}`}>Submit another response</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
