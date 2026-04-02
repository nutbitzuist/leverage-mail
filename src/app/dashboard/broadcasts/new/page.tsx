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
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard-layout";

export default function NewBroadcastPage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isPolishing, setIsPolishing] = useState<"subject" | "body" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAIPolish = async (type: "subject" | "body") => {
    const contentToPolish = type === "subject" ? subject : content;
    if (!contentToPolish) return;

    setIsPolishing(type);
    setError(null);
    try {
      const res = await fetch("/api/ai/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: contentToPolish, type }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      if (type === "subject") setSubject(data.polished);
      else setContent(data.polished);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "AI Polish failed";
      setError(`AI Polish failed: ${message}. Check your OpenAI API Key.`);
    } finally {
      setIsPolishing(null);
    }
  };

  const handleSend = async (status: 'draft' | 'sent' = 'sent') => {
    if (!subject || !content) {
      setError("Please fill in both subject and content.");
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const res = await fetch("/api/broadcasts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          content_html: content,
          status,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save broadcast");
      }

      router.push("/dashboard/broadcasts");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/broadcasts">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">New Broadcast</h1>
              <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-widest">Create manual campaign</p>
            </div>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="gap-2" onClick={() => setIsPreview(!isPreview)}>
               {isPreview ? <Settings className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
               {isPreview ? "Edit Content" : "Preview"}
             </Button>
             <Button 
               className="gap-2 px-8" 
               disabled={isSending}
               onClick={() => handleSend("sent")}
             >
               {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
               Send Campaign
             </Button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="p-8 border border-[hsl(var(--border))] rounded-3xl glass space-y-6">
               <div className="space-y-2">
                 <div className="flex items-center justify-between ml-1">
                   <label className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Email Subject Line</label>
                   <Button 
                     variant="ghost" 
                     size="sm" 
                     className="h-auto py-1 px-2 text-[10px] uppercase font-bold text-[hsl(var(--primary))] gap-1.5"
                     onClick={() => handleAIPolish("subject")}
                     disabled={!!isPolishing}
                   >
                     {isPolishing === "subject" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                     AI Polish
                   </Button>
                 </div>
                 <input 
                   type="text" 
                   value={subject}
                   onChange={(e) => setSubject(e.target.value)}
                   placeholder="e.g. Your Weekly Leverage Update..."
                   className="w-full text-lg p-4 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-2xl outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] transition-all"
                 />
               </div>

               <div className="space-y-2">
                 <div className="flex items-center justify-between ml-1">
                   <label className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Email Content</label>
                   <div className="flex items-center gap-1 border border-[hsl(var(--border))] rounded-lg p-1 bg-[hsl(var(--secondary)/0.5)]">
                     <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => document.execCommand('bold', false)}><Bold className="w-3.5 h-3.5" /></Button>
                     <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => document.execCommand('italic', false)}><Italic className="w-3.5 h-3.5" /></Button>
                     <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                       const url = prompt('Enter link URL:');
                       if (url) document.execCommand('createLink', false, url);
                     }}><LinkIcon className="w-3.5 h-3.5" /></Button>
                     <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => document.execCommand('insertUnorderedList', false)}><List className="w-3.5 h-3.5" /></Button>
                   </div>
                 </div>
                 
                 <div className="relative">
                   <div
                     className="w-full min-h-[400px] p-6 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-2xl outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] transition-all font-serif text-lg leading-relaxed resize-none"
                     contentEditable
                     onInput={(e) => setContent(e.currentTarget.innerHTML)}
                     dangerouslySetInnerHTML={{ __html: content || '' }}
                     onBlur={(e) => {
                       // prevent React cursor jumping
                       if (e.currentTarget.innerHTML !== content) {
                         setContent(e.currentTarget.innerHTML);
                       }
                     }}
                   />
                   <Button 
                    type="button"
                    variant="outline" 
                    size="sm" 
                    className="absolute bottom-4 right-4 gap-2 bg-white/50 backdrop-blur-sm border-[hsl(var(--primary)/0.2)]"
                    onClick={() => handleAIPolish("body")}
                    disabled={!!isPolishing}
                   >
                     {isPolishing === "body" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />}
                     AI Polish
                   </Button>
                 </div>
               </div>
            </div>
          </div>

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
                       <option>All Subscribers</option>
                       <option disabled>SaaS Founders (Coming Soon)</option>
                    </select>
                  </div>
               </div>
            </div>

            <div className="p-6 border border-[hsl(var(--border))] rounded-3xl glass bg-[hsl(var(--primary)/0.05)] border-[hsl(var(--primary)/0.1)]">
               <h3 className="font-bold mb-4">Actions</h3>
               <div className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2"
                    onClick={() => handleSend("draft")}
                    disabled={isSending}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Save as Draft
                  </Button>
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-tighter">Drafts can be edited later.</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
