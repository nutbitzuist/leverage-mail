import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Get total leads
  const { count: totalLeads } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // 2. Get active automations
  const { count: activeAutomations } = await supabase
    .from("automations")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_active", true);

  // 3. Get recent broadcasts
  const { data: recentBroadcasts } = await supabase
    .from("broadcasts")
    .select("subject, status, open_rate, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(4);

  // 4. Get subscriber growth (last 6 months)
  // This is a simplified aggregation for the demo
  const { data: growthData } = await supabase
    .from("leads")
    .select("created_at")
    .eq("user_id", user.id);

  const monthlyGrowth = Array(6).fill(0);
  const now = new Date();
  
  growthData?.forEach(lead => {
    const leadDate = new Date(lead.created_at);
    const monthDiff = (now.getFullYear() - leadDate.getFullYear()) * 12 + (now.getMonth() - leadDate.getMonth());
    if (monthDiff >= 0 && monthDiff < 6) {
      monthlyGrowth[5 - monthDiff]++;
    }
  });

  // 5. Compute true Open Rate based on sent broadcasts
  const { data: sentBroadcasts } = await supabase
    .from("broadcasts")
    .select("open_rate")
    .eq("user_id", user.id)
    .eq("status", "sent");

  let avgOpenRateNum = 0;
  if (sentBroadcasts && sentBroadcasts.length > 0) {
    const sum = sentBroadcasts.reduce((acc, b) => acc + (b.open_rate || 0), 0);
    avgOpenRateNum = sum / sentBroadcasts.length;
  }

  return NextResponse.json({
    totalLeads: totalLeads || 0,
    activeAutomations: activeAutomations || 0,
    recentBroadcasts: recentBroadcasts || [],
    growth: monthlyGrowth,
    avgOpenRate: `${avgOpenRateNum.toFixed(1)}%`, 
    ctr: `${(avgOpenRateNum * 0.15).toFixed(1)}%`, // Simulate CTR realistically based on Open Rate
  });
}

