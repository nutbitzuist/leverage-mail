"use client";

import React from "react";
import { 
  Settings, 
  User, 
  Bell, 
  Lock, 
  Globe, 
  Palette,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard-layout";

function SettingSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] ml-1">{title}</h3>
      <div className="p-8 border border-[hsl(var(--border))] rounded-3xl glass space-y-6">
        {children}
      </div>
    </div>
  );
}

function SettingItem({ icon: Icon, label, description, right }: { icon: any, label: string, description: string, right: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-4">
        <div className="p-2.5 bg-[hsl(var(--secondary))] rounded-xl border border-[hsl(var(--border))] group-hover:bg-[hsl(var(--primary)/0.1)] transition-colors">
          <Icon className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
        </div>
        <div>
          <p className="font-bold">{label}</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">{description}</p>
        </div>
      </div>
      <div>{right}</div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-[hsl(var(--muted-foreground))] mt-1">
              Customize your LeverageMail experience and brand.
            </p>
          </div>
          <Button className="gap-2 px-8">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>

        <div className="space-y-12 mt-4">
          <SettingSection title="Global Profile">
            <SettingItem 
              icon={User} 
              label="Admin Account" 
              description="email.nutty@gmail.com" 
              right={<Button variant="outline" size="sm">Manage Profile</Button>} 
            />
            <SettingItem 
              icon={Palette} 
              label="Brand Appearance" 
              description="Custom HSL theme tokens for your generated pages." 
              right={<div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-[hsl(var(--primary))]" />
                <div className="w-6 h-6 rounded-full bg-slate-200" />
              </div>} 
            />
          </SettingSection>

          <SettingSection title="Security & API">
             <SettingItem 
              icon={Lock} 
              label="API Access Keys" 
              description="Manage your OpenAI and Resend credentials." 
              right={<Button variant="outline" size="sm">Rotate Keys</Button>} 
            />
            <SettingItem 
              icon={Globe} 
              label="Verified Domains" 
              description="leverage100x.com is partially verified." 
              right={<span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded">Action Required</span>} 
            />
          </SettingSection>

          <SettingSection title="Notifications">
             <SettingItem 
              icon={Bell} 
              label="Daily Digest" 
              description="Get a summary of your new leads every morning." 
              right={<div className="w-10 h-5 bg-[hsl(var(--primary))] rounded-full relative"><div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" /></div>} 
            />
          </SettingSection>
        </div>
      </div>
    </DashboardLayout>
  );
}
