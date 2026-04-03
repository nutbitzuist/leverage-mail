"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");
  const email = searchParams.get("email");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const handleUnsubscribe = async () => {
    if (!uid || !email) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/leads/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, email }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  if (!uid || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Invalid Link</h1>
          <p className="text-slate-500 text-sm">This unsubscribe link is malformed or expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="text-center max-w-sm space-y-6">
        {status === "done" ? (
          <>
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <h1 className="text-2xl font-bold">Unsubscribed</h1>
            <p className="text-slate-500 text-sm">
              <strong>{email}</strong> has been removed from future emails. You can close this page.
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-slate-400" />
            </div>
            <h1 className="text-2xl font-bold">Unsubscribe</h1>
            <p className="text-slate-500 text-sm">
              Click below to unsubscribe <strong>{email}</strong> from all future emails.
            </p>
            {status === "error" && (
              <p className="text-red-500 text-sm font-medium">Something went wrong. Please try again.</p>
            )}
            <button
              onClick={handleUnsubscribe}
              disabled={status === "loading"}
              className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition-all disabled:opacity-50 inline-flex items-center gap-2"
            >
              {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Confirm Unsubscribe
            </button>
          </>
        )}
      </div>
    </div>
  );
}
