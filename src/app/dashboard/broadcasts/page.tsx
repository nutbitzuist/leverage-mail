"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Mail, 
  Send,
  Clock,
  MoreHorizontal,
  ChevronRight,
  Loader2,
  Inbox
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard-layout";

interface Broadcast {
  id: string;
  subject: string;
  status: string;
  total_recipients: number;
  open_rate: number;
  created_at: string;
}

export default function BroadcastsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const fetchBroadcasts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/broadcasts");
      const data = await res.json();
      if (Array.isArray(data)) {
        setBroadcasts(data);
      }
    } catch (error) {
      console.error("Failed to fetch broadcasts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBroadcasts = broadcasts.filter(b => 
    b.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <Button variant="outline" size="sm" className="gap-2" onClick={fetchBroadcasts}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Broadcasts List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="mt-4 font-medium">Loading broadcasts...</p>
            </div>
          ) : filteredBroadcasts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-[hsl(var(--border))] rounded-3xl opacity-50">
              <Inbox className="w-12 h-12 mb-4" />
              <p className="font-bold text-lg">No broadcasts found</p>
              <p className="text-sm">Create your first campaign to get started.</p>
              <Link href="/dashboard/broadcasts/new" className="mt-6">
                <Button variant="outline">Create Broadcast</Button>
              </Link>
            </div>
          ) : (
            filteredBroadcasts.map((broadcast) => (
              <div 
                key={broadcast.id} 
                className="flex items-center justify-between p-6 border border-[hsl(var(--border))] rounded-2xl glass hover:border-[hsl(var(--primary))] transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    broadcast.status === "sent" ? "bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]" : "bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]"
                  }`}>
                    {broadcast.status === "sent" ? <Send className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{broadcast.subject}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full ${
                        broadcast.status === "sent" ? "bg-green-100 text-green-700" : broadcast.status === "draft" ? "bg-slate-100 text-slate-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {broadcast.status}
                      </span>
                      <span className="text-xs text-[hsl(var(--muted-foreground))] tracking-tight">
                        • {new Date(broadcast.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-12">
                  {broadcast.status === "sent" && (
                    <>
                      <div className="text-center">
                        <p className="text-[10px] uppercase font-bold text-[hsl(var(--muted-foreground))]">Recipients</p>
                        <p className="font-bold">{broadcast.total_recipients}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] uppercase font-bold text-[hsl(var(--muted-foreground))]">Open Rate</p>
                        <p className="font-bold">{broadcast.open_rate}%</p>
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
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
