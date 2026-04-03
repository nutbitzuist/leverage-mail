"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Mail, 
  Tag as TagIcon,
  Download,
  Upload,
  Trash2,
  Loader2,
  Users,
  X,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard-layout";

interface Lead {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  status: string;
  created_at: string;
  tags: { name: string, color: string }[];
}

export default function LeadsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Import modal state
  const [showImport, setShowImport] = useState(false);
  const [csvRows, setCsvRows] = useState<{email: string; first_name: string; last_name: string}[]>([]);
  const [importTag, setImportTag] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{success: boolean; imported: number; skipped: number; duplicatesRemoved: number} | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // Add lead modal state
  const [showAddLead, setShowAddLead] = useState(false);
  const [newLead, setNewLead] = useState({email: "", first_name: "", last_name: ""});
  const [isAddingLead, setIsAddingLead] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/leads");
      const data = await res.json();
      if (Array.isArray(data)) {
        setLeads(data);
      }
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportResult(null);
    setImportError(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split(/\r?\n/).filter(line => line.trim());
      if (lines.length < 2) {
        setImportError("CSV must have a header row and at least one data row.");
        return;
      }

      const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/["']/g, ""));
      const emailIdx = headers.findIndex(h => h === "email" || h === "email address" || h === "email_address");
      const fnIdx = headers.findIndex(h => h === "first_name" || h === "first name" || h === "firstname" || h === "name");
      const lnIdx = headers.findIndex(h => h === "last_name" || h === "last name" || h === "lastname" || h === "surname");

      if (emailIdx === -1) {
        setImportError("CSV must have an 'email' column. Found columns: " + headers.join(", "));
        return;
      }

      const rows = lines.slice(1).map(line => {
        const cols = line.split(",").map(c => c.trim().replace(/^"|"$/g, ""));
        return {
          email: cols[emailIdx] || "",
          first_name: fnIdx >= 0 ? (cols[fnIdx] || "") : "",
          last_name: lnIdx >= 0 ? (cols[lnIdx] || "") : "",
        };
      }).filter(r => r.email.includes("@"));

      setCsvRows(rows);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (csvRows.length === 0) return;
    setIsImporting(true);
    setImportError(null);
    setImportResult(null);

    try {
      const res = await fetch("/api/leads/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leads: csvRows,
          tags: importTag ? [importTag.trim()] : [],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      setImportResult(data);
      fetchLeads();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Import failed";
      setImportError(message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleAddSingleLead = async () => {
    if (!newLead.email) return;
    setIsAddingLead(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLead),
      });
      if (!res.ok) throw new Error("Failed to add lead");
      setShowAddLead(false);
      setNewLead({email: "", first_name: "", last_name: ""});
      fetchLeads();
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingLead(false);
    }
  };

  const handleExportCsv = () => {
    if (leads.length === 0) return;
    const header = "email,first_name,last_name,status,subscribed_at";
    const rows = leads.map(l => `${l.email},${l.first_name || ""},${l.last_name || ""},${l.status},${l.created_at}`);
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leveragemail-leads-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLeads = leads.filter(l => 
    l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${l.first_name} ${l.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: "Total Leads", value: leads.length.toLocaleString(), delta: "+0%" },
    { label: "Active Subscriptions", value: leads.filter(l => l.status === 'active').length.toLocaleString(), delta: "+0%" },
    { label: "Unsubscribed", value: leads.filter(l => l.status === 'unsubscribed').length.toLocaleString(), delta: "0%" },
    { label: "Growth Rate", value: "0%", delta: "Neutral" },
  ];

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
            <Button variant="outline" className="gap-2" onClick={() => setShowImport(true)}>
              <Upload className="w-4 h-4" />
              Import CSV
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleExportCsv}>
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Button className="gap-2" onClick={() => setShowAddLead(true)}>
              <Plus className="w-4 h-4" />
              Add Lead
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="p-6 border border-[hsl(var(--border))] rounded-2xl glass">
              <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">{stat.label}</p>
              <div className="flex items-end gap-2 mt-2">
                <h3 className="text-2xl font-bold">{stat.value}</h3>
                <span className={`text-[10px] font-bold pb-1 ${stat.delta.startsWith("+") ? "text-green-500" : stat.delta.startsWith("-") ? "text-red-500" : "text-slate-400"}`}>
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
            <Button variant="outline" size="sm" className="gap-2" onClick={fetchLeads}>
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <TagIcon className="w-4 h-4" />
              Manage Tags
            </Button>
          </div>
        </div>

        {/* Leads Table */}
        <div className="border border-[hsl(var(--border))] rounded-2xl overflow-hidden glass min-h-[400px] flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center opacity-50">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="mt-4 font-medium">Loading audience...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center opacity-50 px-6 text-center">
              <Users className="w-12 h-12 mb-4" />
              <p className="font-bold text-lg">Your audience list is empty</p>
              <p className="text-sm max-w-xs">Start collecting leads via your AI Landing Pages or the Integration Script.</p>
            </div>
          ) : (
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
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[hsl(var(--accent)/0.3)] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-base">
                          {lead.first_name || lead.last_name ? `${lead.first_name} ${lead.last_name}`.trim() : "Anonymous Lead"}
                        </span>
                        <span className="text-xs text-[hsl(var(--muted-foreground))]">{lead.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        lead.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {lead.tags?.length > 0 ? lead.tags.map((tag, i) => (
                          <span key={i} className="bg-[hsl(var(--secondary))] px-2 py-0.5 rounded text-[10px] border border-[hsl(var(--border))]">
                            {tag.name}
                          </span>
                        )) : <span className="text-[10px] text-[hsl(var(--muted-foreground))] italic">No tags</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[hsl(var(--muted-foreground))]">
                      {new Date(lead.created_at).toLocaleDateString()}
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
          )}
        </div>
      </div>
      {/* Import CSV Modal */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => !isImporting && setShowImport(false)}>
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-[hsl(var(--primary))]" />
                <h2 className="text-lg font-bold">Import Leads from CSV</h2>
              </div>
              <button onClick={() => !isImporting && setShowImport(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {importResult ? (
                <div className="text-center py-8 space-y-4">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                  <h3 className="text-xl font-bold">Import Complete!</h3>
                  <div className="space-y-1 text-sm text-slate-600">
                    <p><strong>{importResult.imported}</strong> leads imported successfully</p>
                    {importResult.skipped > 0 && <p><strong>{importResult.skipped}</strong> rows skipped (errors)</p>}
                    {importResult.duplicatesRemoved > 0 && <p><strong>{importResult.duplicatesRemoved}</strong> duplicates merged</p>}
                  </div>
                  <Button onClick={() => { setShowImport(false); setCsvRows([]); setImportResult(null); }}>Done</Button>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-slate-600 mb-3">Upload a CSV file with columns: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">email</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">first_name</code>, <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">last_name</code> (only email is required).</p>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCsvUpload}
                      className="w-full border border-dashed border-slate-300 rounded-xl p-4 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[hsl(var(--primary)/0.1)] file:text-[hsl(var(--primary))] hover:file:bg-[hsl(var(--primary)/0.15)] cursor-pointer"
                    />
                  </div>

                  {importError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {importError}
                    </div>
                  )}

                  {csvRows.length > 0 && (
                    <>
                      <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
                        <strong>{csvRows.length}</strong> valid leads found and ready to import.
                      </div>

                      <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl">
                        <table className="w-full text-xs">
                          <thead className="bg-slate-50 sticky top-0">
                            <tr><th className="px-3 py-2 text-left">Email</th><th className="px-3 py-2 text-left">First Name</th><th className="px-3 py-2 text-left">Last Name</th></tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {csvRows.slice(0, 50).map((r, i) => (
                              <tr key={i}><td className="px-3 py-1.5">{r.email}</td><td className="px-3 py-1.5">{r.first_name}</td><td className="px-3 py-1.5">{r.last_name}</td></tr>
                            ))}
                            {csvRows.length > 50 && (
                              <tr><td colSpan={3} className="px-3 py-2 text-center text-slate-400">...and {csvRows.length - 50} more</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1 block">Tag these leads (optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. imported, newsletter, vip"
                          className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                          value={importTag}
                          onChange={e => setImportTag(e.target.value)}
                        />
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {!importResult && csvRows.length > 0 && (
              <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
                <Button variant="outline" onClick={() => { setShowImport(false); setCsvRows([]); }} disabled={isImporting}>Cancel</Button>
                <Button onClick={handleImport} disabled={isImporting} className="gap-2">
                  {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Import {csvRows.length} Leads
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Single Lead Modal */}
      {showAddLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowAddLead(false)}>
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Add Lead</h2>
              <button onClick={() => setShowAddLead(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <input type="email" required placeholder="Email *" value={newLead.email} onChange={e => setNewLead({...newLead, email: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
              <input type="text" placeholder="First Name" value={newLead.first_name} onChange={e => setNewLead({...newLead, first_name: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
              <input type="text" placeholder="Last Name" value={newLead.last_name} onChange={e => setNewLead({...newLead, last_name: e.target.value})} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowAddLead(false)}>Cancel</Button>
              <Button onClick={handleAddSingleLead} disabled={isAddingLead || !newLead.email} className="gap-2">
                {isAddingLead ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add Lead
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
