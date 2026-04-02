"use client";

import React, { useState } from "react";
import { 
  Zap, 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2,
  CheckCircle2,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate Magic Link send
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[hsl(var(--primary)/0.15)] rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[hsl(var(--primary)/0.1)] rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-[hsl(var(--primary))] rounded-2xl flex items-center justify-center shadow-2xl shadow-[hsl(var(--primary)/0.2)] mb-4">
            <Zap className="w-10 h-10 text-white fill-current" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter italic">LEVERAGE<span className="text-[hsl(var(--primary))]">MAIL</span></h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-2 font-medium tracking-tight">The AI Marketing OS for Scale.</p>
        </div>

        {/* Login Card */}
        <div className="p-8 border border-[hsl(var(--border))] rounded-3xl glass shadow-2xl space-y-8">
          {!isSent ? (
            <>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Welcome Back</h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Sign in to your marketing headquarters.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] ml-1">Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                    <input 
                      type="email" 
                      required
                      placeholder="name@company.com" 
                      className="w-full bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-2xl pl-12 pr-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-2xl text-base font-bold gap-2 group shadow-xl shadow-[hsl(var(--primary)/0.2)]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Send Magic Link
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[hsl(var(--border))]"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#fff]/80 backdrop-blur-sm px-2 text-[hsl(var(--muted-foreground))] font-bold tracking-widest">or secure login</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-11 rounded-2xl gap-2 text-xs font-bold">
                  <Lock className="w-4 h-4" />
                  SSO Login
                </Button>
                <Button variant="outline" className="h-11 rounded-2xl gap-2 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  Two-Factor
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center space-y-6 py-4 animate-in fade-in zoom-in-95">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Check your email</h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  We&apos;ve sent a magic link to <span className="text-[hsl(var(--foreground))] font-bold">{email}</span>. Click it to log in instantly.
                </p>
              </div>
              <Button 
                variant="ghost" 
                className="text-sm font-bold text-[hsl(var(--primary))]" 
                onClick={() => setIsSent(false)}
              >
                Try a different email
              </Button>
            </div>
          )}
        </div>

        {/* Footer Links */}
        <div className="mt-10 flex items-center justify-between px-4 text-xs font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
          <Link href="#" className="hover:text-[hsl(var(--primary))] transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-[hsl(var(--primary))] transition-colors">Terms of Service</Link>
          <Link href="#" className="hover:text-[hsl(var(--primary))] transition-colors">Support</Link>
        </div>
      </div>
    </div>
  );
}
