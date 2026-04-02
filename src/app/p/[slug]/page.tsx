"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";

interface PageContent {
  user_id: string;
  id: string;
  content_json: {
    theme?: { primaryColor?: string };
    hero?: { headline: string; subheadline: string };
    form?: { buttonLabel: string };
    successMessage?: string;
    submissionCount?: number;
    benefits?: { title: string; description: string }[];
  };
  username?: string;
}

export default function PublicLandingPage() {
  const { slug } = useParams();
  const [page, setPage] = useState<PageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await fetch(`/api/forms/${slug}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setPage(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPage();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: `landing-page-${slug}`,
          target_user_id: page!.user_id,
        }),
      });
      if (!res.ok) throw new Error("Failed to subscribe");
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-slate-500">Page not found or has been removed.</p>
      </div>
    );
  }

  const content = page.content_json;

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-200">
      <main className="max-w-6xl mx-auto px-6 py-20">
        {/* Success State Overlay */}
        {isSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm animate-in fade-in">
            <div className="text-center space-y-6 max-w-sm px-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight">You&apos;re in!</h2>
              <p className="text-slate-600">{content.successMessage || "Check your inbox for further instructions."}</p>
              <button 
                onClick={() => setIsSuccess(false)}
                className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col items-center text-center space-y-8 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div 
            className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white"
            style={{ backgroundColor: content.theme?.primaryColor || "#000" }}
          >
            Exclusive Offer
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[0.95]">
            {content.hero?.headline}
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl leading-relaxed">
            {content.hero?.subheadline}
          </p>

          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 pt-4">
            <div className="relative group">
              <input 
                type="email" 
                required
                placeholder="Enter your best email..." 
                className="w-full h-16 px-6 rounded-2xl border-2 border-slate-100 bg-slate-50 outline-none focus:border-slate-200 focus:bg-white transition-all text-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full h-16 rounded-2xl text-white font-bold text-xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              style={{ backgroundColor: content.theme?.primaryColor || "#000" }}
            >
              {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : content.form?.buttonLabel || "Get Instant Access"}
            </button>
            <p className="text-xs text-slate-400 flex items-center justify-center gap-2">
               Safe & Secure • {content.submissionCount || 0} Joined Already
            </p>
          </form>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12 border-t border-slate-100">
          {content.benefits?.map((benefit: { title: string; description: string }, i: number) => (
            <div key={i} className="space-y-4">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${content.theme?.primaryColor}15` || "#00015" }}
              >
                <Sparkles className="w-6 h-6" style={{ color: content.theme?.primaryColor || "#000" }} />
              </div>
              <h3 className="text-xl font-bold">{benefit.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-12 border-t border-slate-100 text-center text-xs text-slate-400 font-medium uppercase tracking-[0.1em]">
        &copy; {new Date().getFullYear()} {page.username || "Hosted via LeverageMail"} • Powered by AI
      </footer>
    </div>
  );
}
