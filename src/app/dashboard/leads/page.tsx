"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  Tag as TagIcon,
  Download,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard-layout";

const MOCK_LEADS = [
  { id: 1, email: "alex@example.com", name: "Alex Rivera", status: "Active", tags: ["SaaS", "High Value"], date: "2024-04-01" },
  { id: 2, email: "sarah.j@company.io", name: "Sarah Jenkins", status: "Active", tags: ["Newsletter"], date: "2024-03-28" },
  { id: 3, email: "m.chen@tech.com", name: "Michael Chen", status: "Unsubscribed", tags: ["Form A"], date: "2024-03-25" },
  { id: 4, email: "jessica@pixel.com", name: "Jessica Smith", status: "Active", tags: ["Lead Magnet"], date: "2024-03-20" },
];

export default function LeadsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Audience</h1>
            <p className="text-[hsl(var(--muted-foreground))] mt-1">
              Manage your leads, segments, and customer relationships.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Lead
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total Leads", value: "2,543", delta: "+12%" },
            { label: "Active Subscriptions", value: "1,892", delta: "+5%" },
            { label: "Avg. Open Rate", value: "42.8%", delta: "-2%" },
            { label: "Form Conversions", value: "8.4%", delta: "+1.2%" },
          ].map((stat, i) => (
            <div key={i} className="p-6 border border-[hsl(var(--border))] rounded-2xl glass">
              <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">{stat.label}</p>
              <div className="flex items-end gap-2 mt-2">
                <h3 className="text-2xl font-bold">{stat.value}</h3>
                <span className={`text-[10px] font-bold pb-1 ${stat.delta.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
                  {stat.delta}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
            <input 
              type="text" 
              placeholder="Search leads by name or email..." 
              className="w-full bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <TagIcon className="w-4 h-4" />
              Manage Tags
            </Button>
          </div>
        </div>

        {/* Leads Table */}
        <div className="border border-[hsl(var(--border))] rounded-2xl overflow-hidden glass">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)]">
                <th className="px-6 py-4 font-semibold text-[hsl(var(--muted-foreground))]">Lead</th>
                <th className="px-6 py-4 font-semibold text-[hsl(var(--muted-foreground))]">Status</th>
                <th className="px-6 py-4 font-semibold text-[hsl(var(--muted-foreground))]">Tags</th>
                <th className="px-6 py-4 font-semibold text-[hsl(var(--muted-foreground))]">Subscribed At</th>
                <th className="px-6 py-4 font-semibold text-[hsl(var(--muted-foreground))]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {MOCK_LEADS.map((lead) => (
                <tr key={lead.id} className="hover:bg-[hsl(var(--accent)/0.3)] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-base">{lead.name}</span>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">{lead.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      lead.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      {lead.tags.map((tag, i) => (
                        <span key={i} className="bg-[hsl(var(--secondary))] px-2 py-0.5 rounded text-[10px] border border-[hsl(var(--border))]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[hsl(var(--muted-foreground))]">
                    {lead.date}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
