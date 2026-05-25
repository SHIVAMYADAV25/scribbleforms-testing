// apps/web/app/page.tsx
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { CheckCircle, FileText, BarChart2, Users, Palette, Lock, Zap } from "lucide-react";

const FEATURES = [
  { icon: FileText,  title: "Drag & Drop Builder",    desc: "Build forms in minutes with 13 field types." },
  { icon: Palette,   title: "Custom Themes",           desc: "5 beautiful system themes, fully customizable." },
  { icon: BarChart2, title: "Powerful Analytics",      desc: "Completion rates, drop-off, device breakdown." },
  { icon: Users,     title: "Unlimited Responses",     desc: "Collect as many responses as you need." },
  { icon: Zap,       title: "Instant Webhooks",        desc: "Real-time notifications to your systems." },
  { icon: Lock,      title: "Secure & Private",        desc: "Password protection, expiry dates, response limits." },
];

const PLANS = [
  {
    name: "Free", price: "$0", period: "forever",
    features: ["3 forms", "100 responses/month", "10 fields per form", "Basic analytics"],
    cta: "Get Started", href: "/signup", highlight: false,
  },
  {
    name: "Creator", price: "$9", period: "/month",
    features: ["20 forms", "1,000 responses/month", "50 fields per form", "Custom slugs", "CSV export", "File uploads"],
    cta: "Start Free Trial", href: "/signup", highlight: true,
  },
  {
    name: "Studio", price: "$29", period: "/month",
    features: ["Unlimited forms", "Unlimited responses", "Unlimited fields", "Webhooks", "API access", "Priority support"],
    cta: "Start Free Trial", href: "/signup", highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-lg">ScribbleForms</span>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="/pricing"  className="hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/explore"  className="hover:text-foreground transition-colors">Explore</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild><Link href="/login">Log in</Link></Button>
            <Button size="sm" asChild><Link href="/signup">Get Started Free</Link></Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-4 py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-2xl text-center space-y-6">
          <Badge variant="secondary" className="text-xs">✦ Open source form builder</Badge>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
            Forms that feel <span className="text-primary">human</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Build beautiful forms, collect responses, and analyse data — all in one place.
            No code required.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Button size="lg" asChild><Link href="/signup">Start Building Free →</Link></Button>
            <Button size="lg" variant="outline" asChild><Link href="/explore">View Examples</Link></Button>
          </div>
          <p className="text-xs text-muted-foreground">Free forever · No credit card required</p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 px-4 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">Everything you need</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 space-y-2">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-2">Simple pricing</h2>
          <p className="text-center text-muted-foreground text-sm mb-10">Start free, upgrade when you need more.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map(plan => (
              <Card key={plan.name} className={plan.highlight ? "border-primary shadow-md ring-1 ring-primary" : ""}>
                <CardContent className="p-6 space-y-4">
                  {plan.highlight && <Badge className="text-xs w-fit">Most Popular</Badge>}
                  <div>
                    <h3 className="font-bold text-lg">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-sm text-muted-foreground">{plan.period}</span>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={plan.highlight ? "default" : "outline"} asChild>
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 px-4 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} ScribbleForms · Built with Next.js, tRPC & ❤️</p>
        <div className="flex justify-center gap-4 mt-2">
          <Link href="/login"   className="hover:underline">Login</Link>
          <Link href="/signup"  className="hover:underline">Sign Up</Link>
          <Link href="/explore" className="hover:underline">Explore</Link>
          <Link href="/pricing" className="hover:underline">Pricing</Link>
        </div>
      </footer>
    </div>
  );
}
