"use client";

import React, { useState, useEffect } from "react";
import { 
  Mail, 
  UserPlus, 
  Clock, 
  Split, 
  Plus, 
  Play,
  Trash2,
  ArrowDown,
  Loader2,
  Pause,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard-layout";

type StepType = "trigger" | "email" | "delay" | "condition";

interface AutomationStep {
  id: string;
  type: StepType;
  title: string;
  description: string;
}

const getStepIcon = (type: StepType) => {
  switch (type) {
    case "trigger": return <UserPlus className="w-4 h-4" />;
    case "email": return <Mail className="w-4 h-4" />;
    case "delay": return <Clock className="w-4 h-4" />;
    case "condition": return <Split className="w-4 h-4" />;
    default: return <Plus className="w-4 h-4" />;
  }
};

function StepCard({ step, isLast, onRemove }: { step: AutomationStep, isLast: boolean, onRemove: () => void }) {
  return (
    <div className="flex flex-col items-center w-full max-w-sm">
      <div className={`p-6 w-full rounded-2xl border border-[hsl(var(--border))] glass flex items-center gap-4 group transition-all hover:border-[hsl(var(--primary))] hover:shadow-lg ${step.type === "trigger" ? "bg-[hsl(var(--primary)/0.05)] border-[hsl(var(--primary)/0.3)]" : ""}`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${step.type === "trigger" ? "bg-[hsl(var(--primary))] text-white" : "bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]"}`}>
          {getStepIcon(step.type)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold truncate">{step.title}</h4>
          <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-widest truncate">{step.description}</p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
           <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRemove}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
        </div>
      </div>
      
      {!isLast && (
        <div className="flex flex-col items-center py-4">
          <div className="w-px h-8 bg-[hsl(var(--border))]" />
          <div className="w-4 h-4 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--background))] flex items-center justify-center -my-1">
            <Plus className="w-2 h-2 text-[hsl(var(--muted-foreground))]" />
          </div>
          <div className="w-px h-8 bg-[hsl(var(--border))]" />
        </div>
      )}
    </div>
  );
}

export default function AutomationsPage() {
  const [steps, setSteps] = useState<AutomationStep[]>([
    { id: "1", type: "trigger", title: "When a lead joins", description: "Default Trigger" }
  ]);
  const [name, setName] = useState("New Automation");
  const [isActive, setIsActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAutomations();
  }, []);

  const fetchAutomations = async () => {
    try {
      const res = await fetch("/api/automations");
      const data = await res.json();
      if (data && data.length > 0) {
        // Just load the first one for the demo
        const latest = data[0];
        setName(latest.name);
        setSteps(latest.workflow_steps || []);
        setIsActive(latest.is_active);
      }
    } catch (err) {
      console.error("Failed to fetch automations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const addStep = (type: StepType) => {
    const newStep: AutomationStep = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title: type === "email" ? "Send Welcome Email" : type === "delay" ? "Wait for 1 day" : "New Step",
      description: type === "email" ? "Select a campaign" : "Configure logic",
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (id: string) => {
    if (steps.find(s => s.id === id)?.type === "trigger") return; // Keep trigger
    setSteps(steps.filter(s => s.id !== id));
  };

  const handleSave = async (activeOverride?: boolean) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          trigger_config: { type: "lead_added" },
          workflow_steps: steps,
          is_active: activeOverride !== undefined ? activeOverride : isActive,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      if (activeOverride !== undefined) setIsActive(activeOverride);
    } catch (err) {
      console.error(err);
      alert("Failed to save automation");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex items-center justify-center opacity-50">
          <Loader2 className="w-10 h-10 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-160px)] flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-3xl font-bold tracking-tight bg-transparent border-none outline-none focus:ring-0 w-full mb-1"
            />
            <p className="text-[hsl(var(--muted-foreground))]">
              Automate your workflows with logical triggers and actions.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2" onClick={() => handleSave()} disabled={isSaving}>
               {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
               Save Workflow
            </Button>
            <Button 
              className={`gap-2 ${isActive ? "bg-amber-600 hover:bg-amber-700" : "bg-green-600 hover:bg-green-700"} text-white`}
              onClick={() => handleSave(!isActive)}
              disabled={isSaving}
            >
               {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
               {isActive ? "Deactivate" : "Activate Automation"}
            </Button>
          </div>
        </div>

        {/* Builder Canvas Area */}
        <div className="flex-1 border border-[hsl(var(--border))] rounded-3xl glass relative overflow-hidden flex flex-col items-center p-12 overflow-y-auto bg-[radial-gradient(hsla(var(--border)/0.5)_1px,transparent_1px)] bg-[length:32px_32px]">
          
          <div className="mb-12 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))] mb-2">Automation Start</p>
            <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--primary))] mx-auto animate-pulse" />
          </div>

          <div className="w-full flex flex-col items-center max-w-2xl animate-in space-y-0 pb-32">
             {steps.map((step, i) => (
                <StepCard 
                  key={step.id} 
                  step={step} 
                  isLast={i === steps.length - 1} 
                  onRemove={() => removeStep(step.id)}
                />
             ))}
             
             <div className="flex flex-col items-center pt-8 text-center opacity-60">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-[hsl(var(--border))] flex items-center justify-center text-[hsl(var(--muted-foreground))] mb-4">
                  <ArrowDown className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold">Automation End</h3>
                <p className="text-[10px] uppercase tracking-widest mt-1">Workflow Complete</p>
             </div>
          </div>

          {/* Floating Action Menu */}
          <div className="absolute right-8 bottom-8 p-4 bg-white border border-[hsl(var(--border))] rounded-2xl shadow-2xl space-y-4 w-48 animate-in delay-200">
             <h5 className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] border-b border-[hsl(var(--border))] pb-2">Add New Step</h5>
             <div className="space-y-1">
                {[
                  { icon: <Mail className="w-3.5 h-3.5" />, label: "Send Email", type: "email" as StepType },
                  { icon: <Clock className="w-3.5 h-3.5" />, label: "Wait / Delay", type: "delay" as StepType },
                  { icon: <Split className="w-3.5 h-3.5" />, label: "Condition", type: "condition" as StepType },
                ].map((action, i) => (
                  <button 
                    key={i} 
                    className="w-full flex items-center gap-3 px-2 py-1.5 rounded-lg text-xs font-medium hover:bg-[hsl(var(--accent))] transition-colors"
                    onClick={() => addStep(action.type)}
                  >
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
