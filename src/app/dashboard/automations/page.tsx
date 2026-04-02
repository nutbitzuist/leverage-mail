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
  Save,
  Network,
  ListOrdered,
  Workflow
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard-layout";

type StepType = "trigger" | "email" | "delay" | "condition";
type TabType = "visual" | "sequences" | "rules";

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
    <div className="flex flex-col items-center w-full max-w-sm relative z-10">
      <div className={`p-6 w-full rounded-2xl border border-[hsl(var(--border))] bg-white/70 backdrop-blur-md flex items-center gap-4 group transition-all hover:border-[hsl(var(--primary))] hover:shadow-lg ${step.type === "trigger" ? "bg-[hsl(var(--primary)/0.05)] border-[hsl(var(--primary)/0.3)] shadow-sm" : ""}`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${step.type === "trigger" ? "bg-[hsl(var(--primary))] text-white" : "bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]"}`}>
           {getStepIcon(step.type)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold truncate text-slate-900">{step.title}</h4>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest truncate">{step.description}</p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
           <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50" onClick={onRemove}>
             <Trash2 className="w-3.5 h-3.5 text-red-500" />
           </Button>
        </div>
      </div>
      
      {!isLast && (
        <div className="flex flex-col items-center py-4">
          <div className="w-px h-8 bg-slate-200" />
          <div className="w-4 h-4 rounded-full border border-slate-200 bg-white flex items-center justify-center -my-1 z-20">
            <Plus className="w-2 h-2 text-slate-300" />
          </div>
          <div className="w-px h-8 bg-slate-200" />
        </div>
      )}
    </div>
  );
}

export default function AutomationsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("visual");
  const [steps, setSteps] = useState<AutomationStep[]>([
    { id: "1", type: "trigger", title: "When a lead joins", description: "Default Trigger" }
  ]);
  const [name, setName] = useState("New Automation");
  const [isActive, setIsActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Sequences State
  const [sequences, setSequences] = useState<{ id: string, name: string }[]>([]);
  
  // Rules State
  const [rules, setRules] = useState<any[]>([]);

  useEffect(() => {
    fetchAutomations();
    // Simulate fetching sequences and rules
    setSequences([
      { id: "seq_1", name: "Onboarding Nurture (7 Days)" },
      { id: "seq_2", name: "Abandoned Cart Push" }
    ]);
    setRules([
      { id: "1", trigger: "Purchased eBook", action: "Add Tag: Customer" },
      { id: "2", trigger: "Tag Added: VIP", action: "Subscribe to Onboarding Nurture" }
    ]);
  }, []);

  const fetchAutomations = async () => {
    try {
      const res = await fetch("/api/automations");
      const data = await res.json();
      if (data && data.length > 0) {
        const latest = data[0];
        setName(latest.name);
        setSteps(latest.workflow_steps || []);
        setIsActive(latest.is_active);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const addStep = (type: StepType) => {
    const newStep: AutomationStep = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title: type === "email" ? "Send Summary Email" : type === "delay" ? "Wait 2 Days" : "Split Path",
      description: type === "delay" ? "Pause workflow" : "Action",
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (id: string) => {
    if (steps.find(s => s.id === id)?.type === "trigger") return; 
    setSteps(steps.filter(s => s.id !== id));
  };

  const handleSave = async (activeOverride?: boolean) => {
    setIsSaving(true);
    try {
      await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          trigger_config: { type: "lead_added", value: "any" },
          workflow_steps: steps,
          is_active: activeOverride !== undefined ? activeOverride : isActive,
        }),
      });
      if (activeOverride !== undefined) setIsActive(activeOverride);
    } catch (err) {
      console.error(err);
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
      <div className="h-[calc(100vh-160px)] flex flex-col gap-6">
        
        {/* Universal Header with Navigation Tabs */}
        <div>
           <div className="flex items-center justify-between mb-6">
              <div>
                 <h1 className="text-3xl font-bold tracking-tight text-slate-900">Automate</h1>
                 <p className="text-slate-500 mt-1">Design subscriber journeys with Visual Automations, Drip Sequences, and Rules.</p>
              </div>
           </div>

           <div className="flex border-b border-slate-200">
             <button 
                onClick={() => setActiveTab('visual')}
                className={`py-3 px-6 font-medium text-sm border-b-2 transition-all ${activeTab === 'visual' ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))] font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
             >
                <div className="flex items-center gap-2"><Network className="w-4 h-4" /> Visual Automations</div>
             </button>
             <button 
                onClick={() => setActiveTab('sequences')}
                className={`py-3 px-6 font-medium text-sm border-b-2 transition-all ${activeTab === 'sequences' ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))] font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
             >
                <div className="flex items-center gap-2"><ListOrdered className="w-4 h-4" /> Drip Sequences</div>
             </button>
             <button 
                onClick={() => setActiveTab('rules')}
                className={`py-3 px-6 font-medium text-sm border-b-2 transition-all ${activeTab === 'rules' ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))] font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
             >
                <div className="flex items-center gap-2"><Workflow className="w-4 h-4" /> Rules</div>
             </button>
           </div>
        </div>

        {/* Tab 1: Visual Automations Builder */}
        {activeTab === 'visual' && (
           <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50 rounded-3xl border border-slate-200 overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-20 flex flex-col sm:flex-row items-center justify-between px-6">
                  <div className="flex-1">
                    <input 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="text-lg font-bold tracking-tight bg-transparent border-none outline-none focus:ring-0 w-full"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => handleSave()} disabled={isSaving}>
                      {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
                    </Button>
                    <Button size="sm"
                      className={`gap-2 ${isActive ? "bg-amber-600 hover:bg-amber-700" : "bg-green-600 hover:bg-green-700"} text-white`}
                      onClick={() => handleSave(!isActive)} disabled={isSaving}
                    >
                      {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      {isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
              </div>

              {/* Canvas */}
              <div className="flex-1 overflow-y-auto p-12 pt-28 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] flex flex-col items-center pb-40">
                  <div className="w-full flex flex-col items-center max-w-2xl animate-in space-y-0 relative z-10">
                    {steps.map((step, i) => (
                        <StepCard key={step.id} step={step} isLast={i === steps.length - 1} onRemove={() => removeStep(step.id)} />
                    ))}
                    
                    <div className="flex flex-col items-center pt-8 text-center opacity-60">
                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 mb-4 bg-white/50">
                          <ArrowDown className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-600">Workflow Complete</h3>
                    </div>
                  </div>
              </div>

              {/* Floating Toolbar */}
              <div className="absolute right-8 bottom-8 p-3 bg-white border border-slate-200 rounded-2xl shadow-xl w-56 z-50">
                  <h5 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2 mb-2 px-2">Add Step</h5>
                  <div className="space-y-0.5">
                    {[
                      { icon: <Mail className="w-3.5 h-3.5" />, label: "Send Email", type: "email" as StepType },
                      { icon: <Clock className="w-3.5 h-3.5" />, label: "Time Delay", type: "delay" as StepType },
                      { icon: <Split className="w-3.5 h-3.5" />, label: "Condition", type: "condition" as StepType },
                    ].map((action, i) => (
                      <button 
                        key={i} 
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                        onClick={() => addStep(action.type)}
                      >
                        {action.icon} {action.label}
                      </button>
                    ))}
                  </div>
              </div>
           </div>
        )}

        {/* Tab 2: Sequences */}
        {activeTab === 'sequences' && (
           <div className="flex-1 animate-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Drip Email Sequences</h3>
                <Button className="gap-2"><Plus className="w-4 h-4" /> Create Sequence</Button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sequences.map(seq => (
                  <div key={seq.id} className="p-6 bg-white border border-slate-200 rounded-2xl flex items-center justify-between hover:shadow-md transition-all cursor-pointer group">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                          <ListOrdered className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{seq.name}</h4>
                          <p className="text-xs text-slate-500 mt-1">Multi-day automated drip</p>
                        </div>
                     </div>
                     <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                ))}
             </div>
           </div>
        )}

        {/* Tab 3: Rules */}
        {activeTab === 'rules' && (
           <div className="flex-1 animate-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">If / Then Rules</h3>
                <Button className="gap-2"><Plus className="w-4 h-4" /> Add Rule</Button>
             </div>
             
             <div className="space-y-3 max-w-4xl">
                {rules.map(rule => (
                  <div key={rule.id} className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                     <div className="flex items-center gap-3 flex-1">
                        <div className="px-3 py-1 bg-slate-100 rounded-md text-xs font-bold text-slate-600">IF</div>
                        <div className="font-medium text-sm text-slate-800">{rule.trigger}</div>
                     </div>
                     <div className="hidden md:block">
                        <ArrowDown className="w-4 h-4 text-slate-300 -rotate-90" />
                     </div>
                     <div className="flex items-center gap-3 flex-1">
                        <div className="px-3 py-1 bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] rounded-md text-xs font-bold">THEN</div>
                        <div className="font-medium text-sm text-slate-800">{rule.action}</div>
                     </div>
                     <div>
                       <Button variant="ghost" size="icon"><Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" /></Button>
                     </div>
                  </div>
                ))}
             </div>
           </div>
        )}
      </div>
    </DashboardLayout>
  );
}
