"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  Send,
  Clock,
  MoreHorizontal,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard-layout";

const MOCK_BROADCASTS = [
  { id: 1, title: "Weekly Newsletter #24", status: "Sent", recipients: "4,821", openRate: "48.2%", date: "2 days ago" },
  { id: 2, title: "Product Update: AI Builder", status: "Sent", recipients: "4,780", openRate: "52.1%", date: "1 week ago" },
  { id: 3, title: "Spring Sale Launch", status: "Draft", recipients: "-", openRate: "-", date: "Opened 1h ago" },
  { id: 4, title: "Case Study: Scaling to $10k", status: "Scheduled", recipients: "1,240", openRate: "-", date: "Apr 5, 10:00 AM" },
];

export default function BroadcastsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Email Broadcasts</h1>
            <p className="text-[hsl(var(--muted-foreground))] mt-1">
              Send one-off email campaigns to your entire audience or specific segments.
            </p>
          </div>
          <Link href="/dashboard/broadcasts/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Broadcast
            </Button>
          </Link>
        </div>

        {/* Filters and search */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            <input 
              type="text" 
              placeholder="Search campaigns..." 
              className="w-full bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Show 10
            </Button>
          </div>
        </div>

        {/* Broadcasts List */}
        <div className="space-y-4">
          {MOCK_BROADCASTS.map((broadcast) => (
            <div 
              key={broadcast.id} 
              className="flex items-center justify-between p-6 border border-[hsl(var(--border))] rounded-2xl glass hover:border-[hsl(var(--primary))] transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  broadcast.status === "Sent" ? "bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]" : "bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]"
                }`}>
                  {broadcast.status === "Sent" ? <Send className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{broadcast.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full ${
                      broadcast.status === "Sent" ? "bg-green-100 text-green-700" : broadcast.status === "Draft" ? "bg-slate-100 text-slate-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {broadcast.status}
                    </span>
                    <span className="text-xs text-[hsl(var(--muted-foreground))] tracking-tight">
                      • {broadcast.date}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-12">
                {broadcast.status === "Sent" && (
                  <>
                    <div className="text-center">
                      <p className="text-[10px] uppercase font-bold text-[hsl(var(--muted-foreground))]">Recipients</p>
                      <p className="font-bold">{broadcast.recipients}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] uppercase font-bold text-[hsl(var(--muted-foreground))]">Open Rate</p>
                      <p className="font-bold">{broadcast.openRate}</p>
                    </div>
                  </>
                )}
                
                <div className="flex gap-2">
                   <Button variant="ghost" size="icon" className="h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-5 h-5" />
                   </Button>
                   <div className="w-10 h-10 rounded-full bg-[hsl(var(--secondary))] flex items-center justify-center text-[hsl(var(--muted-foreground))] group-hover:bg-[hsl(var(--primary))] group-hover:text-white transition-all">
                      <ChevronRight className="w-5 h-5" />
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
