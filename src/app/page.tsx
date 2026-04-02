import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="w-20 h-20 bg-[hsl(var(--primary))] rounded-3xl mx-auto flex items-center justify-center rotate-3 shadow-2xl">
          <span className="text-4xl text-white font-black italic tracking-tighter">LM</span>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl font-black tracking-tighter text-[hsl(var(--foreground))]">
            LeverageMail <span className="text-[hsl(var(--primary))]">OS</span>
          </h1>
          <p className="text-xl text-[hsl(var(--muted-foreground))] font-medium leading-relaxed">
            The AI-powered marketing engine for the one-person business.
          </p>
        </div>

        <div className="pt-8">
          <a href="/login" className="block">
            <button className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] h-16 rounded-2xl text-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[hsl(var(--primary)/0.2)]">
              Enter Dashboard
            </button>
          </a>
          <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] mt-6 uppercase tracking-[0.2em]">
            Connect. Automate. Scale.
          </p>
        </div>
      </div>
    </div>
  );
}
