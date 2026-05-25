// apps/web/app/pricing/page.tsx
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { CheckCircle, X, ArrowLeft } from "lucide-react";

const PLANS = [
  {
    name: "Free",    price: "$0",  period: "forever", highlight: false, cta: "Get Started",    href: "/signup",
    features: [
      { label: "3 forms",               included: true },
      { label: "100 responses/month",   included: true },
      { label: "10 fields per form",    included: true },
      { label: "Basic analytics",       included: true },
      { label: "Custom slug",           included: false },
      { label: "Password protection",   included: false },
      { label: "CSV export",            included: false },
      { label: "File uploads",          included: false },
      { label: "Webhooks",              included: false },
      { label: "API access",            included: false },
    ],
  },
  {
    name: "Creator", price: "$9",  period: "/month",  highlight: true,  cta: "Start Free Trial", href: "/signup",
    features: [
      { label: "20 forms",              included: true },
      { label: "1,000 responses/month", included: true },
      { label: "50 fields per form",    included: true },
      { label: "Full analytics",        included: true },
      { label: "Custom slug",           included: true },
      { label: "Password protection",   included: true },
      { label: "CSV export",            included: true },
      { label: "File uploads",          included: true },
      { label: "Webhooks",              included: false },
      { label: "API access",            included: false },
    ],
  },
  {
    name: "Studio",  price: "$29", period: "/month",  highlight: false, cta: "Start Free Trial", href: "/signup",
    features: [
      { label: "Unlimited forms",       included: true },
      { label: "Unlimited responses",   included: true },
      { label: "Unlimited fields",      included: true },
      { label: "Full analytics",        included: true },
      { label: "Custom slug",           included: true },
      { label: "Password protection",   included: true },
      { label: "CSV export",            included: true },
      { label: "File uploads",          included: true },
      { label: "Webhooks",              included: true },
      { label: "API access",            included: true },
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-muted/20">
      {/* Nav */}
      <header className="border-b bg-background">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/"><ArrowLeft className="h-4 w-4 mr-1" />Home</Link>
          </Button>
          <span className="font-bold">ScribbleForms Pricing</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-16 space-y-12">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold">Simple, transparent pricing</h1>
          <p className="text-muted-foreground">Start free. No credit card required. Upgrade anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map(plan => (
            <Card key={plan.name} className={plan.highlight ? "border-primary ring-1 ring-primary shadow-lg relative" : ""}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="text-xs px-3">Most Popular</Badge>
                </div>
              )}
              <CardContent className="p-6 space-y-5">
                <div>
                  <h2 className="font-bold text-xl">{plan.name}</h2>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                </div>
                <Button className="w-full" variant={plan.highlight ? "default" : "outline"} asChild>
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
                <ul className="space-y-2.5">
                  {plan.features.map(f => (
                    <li key={f.label} className={`flex items-center gap-2 text-sm ${!f.included ? "text-muted-foreground" : ""}`}>
                      {f.included
                        ? <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                        : <X className="h-4 w-4 text-muted-foreground/50 shrink-0" />}
                      {f.label}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-xl font-bold text-center">FAQ</h2>
          {[
            { q: "Can I cancel anytime?",            a: "Yes, cancel anytime from your billing settings. No questions asked." },
            { q: "Is there a free trial?",            a: "Creator and Studio plans include a 14-day free trial." },
            { q: "What payment methods do you accept?", a: "All major credit cards via Stripe." },
            { q: "Can I change plans later?",         a: "Upgrade or downgrade anytime from Settings → Billing." },
          ].map(({ q, a }) => (
            <Card key={q}>
              <CardContent className="p-4">
                <p className="font-medium text-sm">{q}</p>
                <p className="text-sm text-muted-foreground mt-1">{a}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">Have questions? <Link href="/signup" className="underline">Contact us</Link></p>
        </div>
      </div>
    </div>
  );
}
