import React from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { createClient } from "@/lib/supabase/server";

import { 
  Globe, 
  Code2, 
  Copy, 
  CheckCircle2, 
  Terminal,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const embedCode = `<!-- LeverageMail Lead Capture -->
<script src="https://leverage-mail.vercel.app/js/leverage-capture.js"></script>
<script>
  LeverageMail.init({
    type: "floating",
    userId: "${user?.id}",
    title: "Join the 1% Elite",
    subheadline: "Get weekly leverage strategies.",
    cta: "Join Now",
    primaryColor: "#6d28d9"
  });
</script>`;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 max-w-4xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Connect Your Business</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Integrate LeverageMail with your existing website in seconds.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 border border-[hsl(var(--border))] rounded-3xl glass flex flex-col gap-6">
            <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center text-[hsl(var(--primary))]">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Automated Capture</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                Add a floating subscription button to any website (Webflow, Framer, WordPress, or custom HTML). Leads flow directly into your CRM.
              </p>
            </div>
            <div className="mt-auto pt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[hsl(var(--primary))]">
              <CheckCircle2 className="w-4 h-4" />
              Real-time Sync Active
            </div>
          </div>

          <div className="p-8 border border-[hsl(var(--border))] rounded-3xl glass flex flex-col gap-6 bg-[hsl(var(--primary)/0.02)]">
            <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--secondary))] flex items-center justify-center text-[hsl(var(--foreground))]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">API Context</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                Your unique account identifier ensures all leads are correctly attributed and automation workflows trigger for your specific account.
              </p>
            </div>
            <div className="mt-auto pt-4 font-mono text-[10px] text-[hsl(var(--muted-foreground))] break-all bg-[hsl(var(--background))] p-2 rounded-lg border border-[hsl(var(--border))]">
              ID: {user?.id}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Code2 className="w-5 h-5 text-[hsl(var(--primary))]" />
              The Magic Script
            </h3>
            <Button variant="outline" size="sm" className="gap-2">
              <Copy className="w-4 h-4" />
              Copy All
            </Button>
          </div>

          <div className="relative group">
            <pre className="p-6 bg-[hsl(var(--secondary)/0.5)] border border-[hsl(var(--border))] rounded-2xl font-mono text-sm leading-relaxed overflow-x-auto text-[hsl(var(--foreground))]">
              {embedCode}
            </pre>
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
               <div className="bg-[hsl(var(--background))] px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-[hsl(var(--border))]">JavaScript</div>
            </div>
          </div>

          <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-2xl flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Terminal className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-blue-900">How to install:</h4>
              <p className="text-sm text-blue-700 leading-relaxed">
                Paste this code just before the closing <code className="bg-blue-100 px-1 rounded">&lt;/body&gt;</code> tag on your website. No other configuration required.
              </p>
              <div className="pt-2">
                <Button variant="ghost" size="sm" className="p-0 h-auto text-blue-600 font-bold text-xs gap-1 hover:bg-transparent hover:underline">
                  View Full Integration Guide <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
