import React from "react";
import { 
  ArrowUpRight, 
  Users, 
  Mail, 
  BarChart, 
  Zap,
  TrendingUp,
  Clock,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard-layout";

function StatCard({ title, value, delta, icon: Icon }: { title: string, value: string, delta: string, icon: any }) {
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
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
            <p className="text-[hsl(var(--muted-foreground))] mt-1">Here's how your marketing leverage is growing.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Clock className="w-4 h-4" />
              Last 30 Days
            </Button>
            <Button className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Growth Report
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard title="Total Subscribers" value="4,821" delta="+12.4%" icon={Users} />
          <StatCard title="Avg. Open Rate" value="48.2%" delta="+5.2%" icon={Mail} />
          <StatCard title="Click-Through Rate" value="9.4%" delta="-0.8%" icon={BarChart} />
          <StatCard title="Active Automations" value="12" delta="+2" icon={Zap} />
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Growth Chart Placeholder Area */}
          <div className="lg:col-span-8 p-8 border border-[hsl(var(--border))] rounded-3xl glass min-h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-bold">Subscribers Over Time</h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Visualizing your channel growth.</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--primary))]" /> Direct</span>
                <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--primary)/0.4)]" /> Forms</span>
              </div>
            </div>
            
            <div className="flex-1 flex items-end justify-between gap-1 mt-4">
              {[40, 25, 45, 30, 50, 35, 60, 40, 75, 55, 80, 65, 90, 70, 100].map((height, i) => (
                <div key={i} className="flex-1 group relative">
                  <div 
                    style={{ height: `${height}%` }} 
                    className="w-full bg-[hsl(var(--primary)/0.2)] rounded-t-lg group-hover:bg-[hsl(var(--primary))] transition-all duration-300 relative"
                  >
                    {/* Tooltip-like effect */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-white text-black text-[10px] p-1.5 rounded-md shadow-xl border border-slate-100 font-bold whitespace-nowrap transition-all">
                      {Math.floor(height * 48)} leads
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-6 text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest px-1">
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
            </div>
          </div>

          {/* Recent Activity / Side Panels */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 border border-[hsl(var(--border))] rounded-3xl glass h-[400px] flex flex-col">
              <h2 className="text-lg font-bold mb-4">Recent Broadcasts</h2>
              <div className="space-y-4 flex-1">
                {[
                  { title: "Weekly Newsletter #42", status: "Sent", rate: "48%", date: "2d ago" },
                  { title: "New Product Launch", status: "Draft", rate: "-", date: "Today" },
                  { title: "Spring Sale Reminder", status: "Sent", rate: "32%", date: "4d ago" },
                  { title: "Monthly Insights", status: "Sent", rate: "51%", date: "1w ago" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] flex items-center justify-center group-hover:bg-[hsl(var(--primary)/0.05)] transition-colors">
                        <Mail className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold group-hover:text-[hsl(var(--primary))] transition-colors">{item.title}</p>
                        <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-widest">{item.date} • {item.status}</p>
                      </div>
                    </div>
                    {item.rate !== "-" && <span className="text-xs font-bold">{item.rate}</span>}
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4 gap-2">
                All Broadcasts
                <ArrowUpRight className="w-3 h-3" />
              </Button>
            </div>

            <div className="bg-[hsl(var(--primary))] p-6 rounded-3xl text-[hsl(var(--primary-foreground))] shadow-xl relative overflow-hidden group">
               <Zap className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform duration-500" />
               <h3 className="text-lg font-bold mb-1">Scale Your Growth</h3>
               <p className="text-xs text-[hsl(var(--primary-foreground)/0.8)] mb-4">Integrate LeverageMail directly into your website for seamless capture.</p>
               <Button variant="secondary" size="sm" className="gap-2 bg-white text-black hover:bg-slate-100">
                 View Instructions
                 <ExternalLink className="w-3 h-3" />
               </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
