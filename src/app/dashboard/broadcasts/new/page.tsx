"use client";

import React, { useState } from "react";
import { 
  Send, 
  ChevronLeft, 
  Bold, 
  Italic, 
  Link as LinkIcon, 
  List, 
  Eye, 
  Settings,
  Users,
  Sparkles,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard-layout";

export default function NewBroadcastPage() {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/broadcasts">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <input 
                type="text" 
                placeholder="Name your broadcast..." 
                className="text-2xl font-bold bg-transparent border-none outline-none focus:ring-0 placeholder:text-[hsl(var(--muted-foreground)/0.4)]"
              />
              <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-widest">New Broadcast Campaign</p>
            </div>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="gap-2" onClick={() => setIsPreview(!isPreview)}>
               {isPreview ? <Settings className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
               {isPreview ? "Edit Content" : "Preview"}
             </Button>
             <Button className="gap-2 px-8" disabled={isSending}>
               {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
               Send Campaign
             </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="p-8 border border-[hsl(var(--border))] rounded-3xl glass space-y-6">
               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] ml-1">Email Subject Line</label>
                 <input 
                   type="text" 
                   value={subject}
                   onChange={(e) => setSubject(e.target.value)}
                   placeholder="e.g. Your Weekly Leverage Update: New Case Study Inside!"
                   className="w-full text-lg p-4 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-2xl outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] transition-all"
                 />
               </div>

               <div className="space-y-2">
                 <div className="flex items-center justify-between ml-1">
                   <label className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Email Content</label>
                   <div className="flex items-center gap-1 border border-[hsl(var(--border))] rounded-lg p-1 bg-[hsl(var(--secondary)/0.5)]">
                     <Button variant="ghost" size="icon" className="h-7 w-7"><Bold className="w-3.5 h-3.5" /></Button>
                     <Button variant="ghost" size="icon" className="h-7 w-7"><Italic className="w-3.5 h-3.5" /></Button>
                     <Button variant="ghost" size="icon" className="h-7 w-7"><LinkIcon className="w-3.5 h-3.5" /></Button>
                     <Button variant="ghost" size="icon" className="h-7 w-7"><List className="w-3.5 h-3.5" /></Button>
                   </div>
                 </div>
                 
                 <div className="relative">
                   <textarea 
                     value={content}
                     onChange={(e) => setContent(e.target.value)}
                     className="w-full min-h-[400px] p-6 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-2xl outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] transition-all font-serif text-lg leading-relaxed resize-none"
                     placeholder="Hello friend, today I want to share..."
                   />
                   <Button variant="outline" size="sm" className="absolute bottom-4 right-4 gap-2 bg-white/50 backdrop-blur-sm border-[hsl(var(--primary)/0.2)]">
                     <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />
                     AI Polish
                   </Button>
                 </div>
               </div>
            </div>
          </div>

          {/* Sidebar Settings */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 border border-[hsl(var(--border))] rounded-3xl glass space-y-6">
               <h3 className="font-bold flex items-center gap-2">
                 <Users className="w-5 h-5 text-[hsl(var(--primary))]" />
                 Target Audience
               </h3>
               
               <div className="space-y-4">
                  <div className="p-4 border border-[hsl(var(--border))] rounded-2xl bg-[hsl(var(--muted)/0.3)]">
                    <p className="text-xs font-bold text-[hsl(var(--muted-foreground))] mb-2 uppercase">Subscribers Segment</p>
                    <select className="bg-transparent w-full font-medium outline-none">
                       <option>All Subscribers (4,821)</option>
                       <option>SaaS Founders (1,240)</option>
                       <option>Recent Lead Magnets (452)</option>
                       <option>High Engagement (891)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-medium">Include Tags?</span>
                    <Button variant="ghost" size="sm" className="h-auto py-1 px-2 text-[10px] uppercase font-bold text-[hsl(var(--primary))]">Add Filter</Button>
                  </div>
               </div>
            </div>

            <div className="p-6 border border-[hsl(var(--border))] rounded-3xl glass bg-[hsl(var(--primary)/0.05)] border-[hsl(var(--primary)/0.1)]">
               <h3 className="font-bold mb-4">Scheduling</h3>
               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input type="radio" name="schedule" defaultChecked className="accent-[hsl(var(--primary))]" />
                    <label className="text-sm font-medium">Send Immediately</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="schedule" className="accent-[hsl(var(--primary))]" />
                    <label className="text-sm font-medium">Schedule for later...</label>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
