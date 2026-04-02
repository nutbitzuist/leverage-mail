"use client";

import React, { useState } from "react";
import { Sparkles, Loader2, Globe, Save, ExternalLink, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard-layout";
import { LandingPageContent } from "@/lib/ai/prompts";

export default function FormsPage() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<LandingPageContent | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setPublishedUrl(null);
    try {
      const res = await fetch("/api/ai/generate-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setGeneratedContent(data);
    } catch (err) {
      console.error(err);
      alert("Failed to generate page. Make sure OPENAI_API_KEY is set.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!generatedContent) return;
    setIsPublishing(true);
    try {
      // Generate a random slug for the demo
      const slug = Math.random().toString(36).substring(2, 10);
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: generatedContent.hero.headline,
          content_json: generatedContent,
          slug,
        }),
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      
      const fullUrl = `${window.location.origin}/p/${slug}`;
      setPublishedUrl(fullUrl);
    } catch (err) {
      console.error(err);
      alert("Failed to publish page.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Landing Pages</h1>
            <p className="text-[hsl(var(--muted-foreground))] mt-1">
              Create high-conversion pages with AI in seconds.
            </p>
          </div>
          <div className="flex gap-3">
             {publishedUrl && (
               <a href={publishedUrl} target="_blank" rel="noopener noreferrer">
                 <Button variant="outline" className="gap-2 text-green-600 border-green-200">
                    <ExternalLink className="w-4 h-4" />
                    View Live Page
                 </Button>
               </a>
             )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Prompt Section */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 border border-[hsl(var(--border))] rounded-2xl glass space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">What are you offering?</label>
                <textarea
                  className="w-full min-h-[120px] bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl p-3 text-sm focus:ring-2 focus:ring-[hsl(var(--ring))] outline-none transition-all placeholder:text-[hsl(var(--muted-foreground)/0.5)]"
                  placeholder="e.g. A 7-day email course on scaling SaaS business to $10k MRR..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
              <Button 
                className="w-full gap-2 py-6 text-base" 
                onClick={handleGenerate}
                disabled={isGenerating || !prompt}
              >
                {isGenerating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                {generatedContent ? "Regenerate Content" : "Generate Magic"}
              </Button>
            </div>

            {generatedContent && !publishedUrl && (
              <div className="p-6 border border-[hsl(var(--border))] rounded-2xl glass space-y-4 animate-in">
                <h3 className="font-semibold">Ready to Launch?</h3>
                <div className="space-y-2">
                  <Button 
                    className="w-full justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={handlePublish}
                    disabled={isPublishing}
                  >
                    {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                    Publish to Public URL
                  </Button>
                  <Button variant="outline" className="w-full justify-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Draft
                  </Button>
                </div>
              </div>
            )}

            {publishedUrl && (
              <div className="p-6 border border-green-200 bg-green-50/50 rounded-2xl space-y-4 animate-in zoom-in-95">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="w-5 h-5" />
                  <h3 className="font-bold">Page is Live!</h3>
                </div>
                <div className="bg-white p-3 rounded-xl border border-green-100 font-mono text-[10px] break-all">
                  {publishedUrl}
                </div>
                <p className="text-xs text-green-700/70">
                  Share this URL with your audience to start capturing leads instantly.
                </p>
              </div>
            )}
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-8">
            <div className="border border-[hsl(var(--border))] rounded-2xl h-[700px] bg-[hsl(var(--secondary)/0.3)] relative overflow-hidden flex flex-col">
              <div className="h-12 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--destructive)/0.5)]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))] font-mono">
                    preview.leveragemail.com/untiltled
                  </span>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto bg-white text-slate-900">
                {generatedContent ? (
                  <div className="animate-in">
                    {/* Simulated Hero */}
                    <div className="py-16 px-12 text-center space-y-6">
                      <div 
                        className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white mb-4"
                        style={{ backgroundColor: generatedContent.theme.primaryColor }}
                      >
                        Exclusive Offer
                      </div>
                      <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                        {generatedContent.hero.headline}
                      </h2>
                      <p className="max-w-xl mx-auto text-lg text-slate-600">
                        {generatedContent.hero.subheadline}
                      </p>
                      
                      <div className="max-w-md mx-auto p-8 rounded-2xl shadow-xl border border-slate-100 mt-12 bg-white">
                        <div className="space-y-4">
                          <input 
                            type="email" 
                            placeholder="Enter your work email" 
                            className="w-full h-12 px-4 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-400 outline-none"
                            readOnly
                          />
                          <button 
                            className="w-full h-12 rounded-lg font-bold text-white transition-all hover:scale-[1.02]"
                            style={{ backgroundColor: generatedContent.theme.primaryColor }}
                          >
                            {generatedContent.form.buttonLabel}
                          </button>
                          <p className="text-xs text-slate-400 text-center">
                            By joining, you agree to our privacy policy.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="bg-slate-50 py-12 px-12 grid grid-cols-3 gap-6">
                      {generatedContent.benefits.map((benefit: { title: string, description: string }, i: number) => (
                        <div key={i} className="text-center space-y-2">
                           <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center bg-white shadow-sm mb-2">
                             <Sparkles className="w-5 h-5" style={{ color: generatedContent.theme.primaryColor }} />
                           </div>
                           <h4 className="font-bold text-sm">{benefit.title}</h4>
                           <p className="text-xs text-slate-500 leading-relaxed">{benefit.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-50">
                    <Sparkles className="w-12 h-12 mb-4 text-[hsl(var(--muted-foreground))]" />
                    <h3 className="text-xl font-semibold">Ready to create?</h3>
                    <p className="text-sm">Describe your offer on the left to generate your landing page.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
