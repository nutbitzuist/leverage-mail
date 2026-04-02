"use client";

import React, { useState } from "react";
import { 
  Zap, 
  Mail, 
  UserPlus, 
  Clock, 
  Split, 
  Plus, 
  Play,
  Settings2,
  Trash2,
  ArrowDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard-layout";

type StepType = "trigger" | "email" | "delay" | "condition";

interface AutomationStep {
  id: string;
  type: StepType;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const INITIAL_STEPS: AutomationStep[] = [
  { id: "1", type: "trigger", title: "When a lead joins 'SaaS List'", description: "Triggered by Form ID: 4124", icon: <UserPlus className="w-4 h-4" /> },
  { id: "2", type: "delay", title: "Wait for 2 hours", description: "Strategic delay before first email", icon: <Clock className="w-4 h-4" /> },
  { id: "3", type: "email", title: "Send 'Welcome Guide'", description: "Email Campaign ID: 9812", icon: <Mail className="w-4 h-4" /> },
];

function StepCard({ step, isLast }: { step: AutomationStep, isLast: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`p-6 w-full max-w-sm rounded-2xl border border-[hsl(var(--border))] glass flex items-center gap-4 group transition-all hover:border-[hsl(var(--primary))] hover:shadow-lg ${step.type === "trigger" ? "bg-[hsl(var(--primary)/0.05)] border-[hsl(var(--primary)/0.3)]" : ""}`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${step.type === "trigger" ? "bg-[hsl(var(--primary))] text-white" : "bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]"}`}>
          {step.icon}
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold">{step.title}</h4>
          <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-widest">{step.description}</p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
           <Button variant="ghost" size="icon" className="h-8 w-8"><Settings2 className="w-3.5 h-3.5" /></Button>
           <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500"><Trash2 className="w-3.5 h-3.5" /></Button>
        </div>
      </div>
      
      {!isLast && (
        <div className="flex flex-col items-center py-4">
          <div className="w-px h-8 bg-[hsl(var(--border))]" />
          <div className="w-8 h-8 rounded-full border border-[hsl(var(--border))] glass flex items-center justify-center -my-1 group cursor-pointer hover:bg-[hsl(var(--primary))] hover:text-white transition-all">
            <Plus className="w-4 h-4" />
          </div>
          <div className="w-px h-8 bg-[hsl(var(--border))]" />
        </div>
      )}
    </div>
  );
}

export default function AutomationsPage() {
  const [steps, setSteps] = useState<AutomationStep[]>(INITIAL_STEPS);

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-160px)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Visual Automations</h1>
            <p className="text-[hsl(var(--muted-foreground))] mt-1">
              Automate your workflows with logical triggers and actions.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
               Save Draft
            </Button>
            <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white border-green-700">
               <Play className="w-4 h-4 fill-current" />
               Activate Automation
            </Button>
          </div>
        </div>

        {/* Builder Canvas Area */}
        <div className="flex-1 border border-[hsl(var(--border))] rounded-3xl glass relative overflow-hidden flex flex-col items-center p-12 overflow-y-auto bg-[radial-gradient(hsla(var(--border)/0.5)_1px,transparent_1px)] bg-[length:24px_24px]">
          
          <div className="mb-12 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))] mb-2">Automation Start</p>
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--primary))] mx-auto animate-pulse" />
          </div>

          <div className="w-full flex flex-col items-center max-w-2xl animate-in space-y-0">
             {steps.map((step, i) => (
                <StepCard key={step.id} step={step} isLast={i === steps.length - 1} />
             ))}
             
             <div className="flex flex-col items-center pt-8 text-center opacity-60">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-[hsl(var(--border))] flex items-center justify-center text-[hsl(var(--muted-foreground))] mb-4">
                  <ArrowDown className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold">Automation End</h3>
                <p className="text-[10px] uppercase tracking-widest mt-1">Lead is marked as finished</p>
             </div>
          </div>

          {/* Floating Action Menu Placeholder */}
          <div className="absolute right-8 bottom-8 p-4 bg-white border border-[hsl(var(--border))] rounded-2xl shadow-2xl space-y-4 w-48 animate-in delay-200">
             <h5 className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] border-b border-[hsl(var(--border))] pb-2">Add New Step</h5>
             <div className="space-y-1">
                {[
                  { icon: <Mail className="w-3.5 h-3.5" />, label: "Send Email" },
                  { icon: <Clock className="w-3.5 h-3.5" />, label: "Wait / Delay" },
                  { icon: <Split className="w-3.5 h-3.5" />, label: "Condition" },
                  { icon: <Zap className="w-3.5 h-3.5" />, label: "Action" },
                ].map((action, i) => (
                  <button key={i} className="w-full flex items-center gap-3 px-2 py-1.5 rounded-lg text-xs font-medium hover:bg-[hsl(var(--accent))] transition-colors">
                    {action.icon}
                    {action.label}
                  </button>
                ))}
             </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
