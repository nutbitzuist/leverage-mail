"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowUpRight, 
  Users, 
  Mail, 
  BarChart, 
  Zap,
  TrendingUp,
  Clock,
  ExternalLink,
  Loader2,
  Inbox
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard-layout";

interface StatCardProps {
  title: string;
  value: string;
  delta: string;
  icon: React.ElementType;
}

interface Broadcast {
  subject: string;
  created_at: string;
  status: string;
}

interface DashboardStats {
  totalLeads: number;
  avgOpenRate: string;
  ctr: string;
  activeAutomations: number;
  growth: number[];
  recentBroadcasts: Broadcast[];
}

function StatCard({ title, value, delta, icon: Icon }: StatCardProps) {
  const isPositive = delta.startsWith("+");
  return (
    <div className="p-6 rounded-2xl border border-[hsl(var(--border))] glass space-y-3">
      <div className="flex items-center justify-between">
        <div className="p-2 bg-[hsl(var(--primary)/0.1)] rounded-lg">
          <Icon className="w-5 h-5 text-[hsl(var(--primary))]" />
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {delta}
        </span>
      </div>
      <div>
        <h3 className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{title}</h3>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/dashboard/stats");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] opacity-50">
          <Loader2 className="w-10 h-10 animate-spin" />
          <p className="mt-4 font-bold">Assembling your cockpit...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
            <p className="text-[hsl(var(--muted-foreground))] mt-1">Here&apos;s how your marketing leverage is growing.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2" onClick={fetchStats}>
              <Clock className="w-4 h-4" />
              Refresh Data
            </Button>
            <Link href="/dashboard/leads">
              <Button className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Audience CRM
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard title="Total Subscribers" value={stats!.totalLeads.toLocaleString()} delta="+0%" icon={Users} />
          <StatCard title="Avg. Open Rate" value={stats!.avgOpenRate} delta="0%" icon={Mail} />
          <StatCard title="Click-Through Rate" value={stats!.ctr} delta="0%" icon={BarChart} />
          <StatCard title="Active Automations" value={stats!.activeAutomations.toString()} delta="+0" icon={Zap} />
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Growth Chart Area */}
          <div className="lg:col-span-8 p-8 border border-[hsl(var(--border))] rounded-3xl glass min-h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-bold">Subscribers Over Time</h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Recent growth performance (Last 6 Months).</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--primary))]" /> Growth</span>
              </div>
            </div>
            
            <div className="flex-1 flex items-end justify-between gap-1 mt-4">
              {stats!.growth.length > 0 ? stats!.growth.map((count: number, i: number) => (
                <div key={i} className="flex-1 group relative">
                  <div 
                    style={{ height: `${Math.max(count * 5, 2)}%` }} 
                    className={`w-full ${count > 0 ? 'bg-[hsl(var(--primary)/0.2)] group-hover:bg-[hsl(var(--primary))]' : 'bg-slate-100'} rounded-t-lg transition-all duration-300 relative`}
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-white text-black text-[10px] p-1.5 rounded-md shadow-xl border border-slate-100 font-bold whitespace-nowrap transition-all z-10">
                      {count} leads
                    </div>
                  </div>
                </div>
              )) : (
                <div className="flex-1 flex items-center justify-center mb-10 opacity-30">
                  <BarChart className="w-12 h-12" />
                  <p className="ml-4 font-bold">Gathering data...</p>
                </div>
              )}
            </div>
            <div className="flex justify-between pt-6 text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest px-1">
              <span>M-5</span><span>M-4</span><span>M-3</span><span>M-2</span><span>M-1</span><span>Today</span>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 border border-[hsl(var(--border))] rounded-3xl glass h-[400px] flex flex-col">
              <h2 className="text-lg font-bold mb-4">Recent Broadcasts</h2>
              <div className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {stats!.recentBroadcasts.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                    <Inbox className="w-8 h-8 mb-2" />
                    <p className="text-xs font-bold">No broadcasts sent yet</p>
                  </div>
                ) : stats!.recentBroadcasts.map((item: { subject: string, created_at: string, status: string }, i: number) => (
                  <div key={i} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] flex items-center justify-center group-hover:bg-[hsl(var(--primary)/0.05)] transition-colors">
                        <Mail className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate group-hover:text-[hsl(var(--primary))] transition-colors">{item.subject}</p>
                        <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-widest truncate">
                          {new Date(item.created_at).toLocaleDateString()} • {item.status}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/dashboard/broadcasts" className="mt-4">
                <Button variant="outline" size="sm" className="w-full gap-2">
                  All Campaigns
                  <ArrowUpRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>

            <div className="bg-[hsl(var(--primary))] p-6 rounded-3xl text-[hsl(var(--primary-foreground))] shadow-xl relative overflow-hidden group">
               <Zap className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform duration-500" />
               <h3 className="text-lg font-bold mb-1">Scale Your Growth</h3>
               <p className="text-xs text-[hsl(var(--primary-foreground)/0.8)] mb-4">Integrate LeverageMail directly into your website for seamless capture.</p>
               <Link href="/dashboard/settings">
                 <Button variant="secondary" size="sm" className="gap-2 bg-white text-black hover:bg-slate-100">
                   View Setup
                   <ExternalLink className="w-3 h-3" />
                 </Button>
               </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
