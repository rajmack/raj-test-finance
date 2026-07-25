import { buildRecommendations, calculateMetrics, formatINR, type LineItem } from "@/lib/finance";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { profileId } = (await request.json()) as { profileId?: string };
    if (!profileId) return NextResponse.json({ error: "A profile is required." }, { status: 400 });
    const supabase = createAdminClient();
    const { data: profile, error: profileError } = await supabase.from("profiles").select("id,goal_label").eq("id", profileId).single();
    if (profileError || !profile) return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    const { data: rows, error: itemError } = await supabase.from("line_items").select("id,profile_id,kind,label,amount,frequency").eq("profile_id", profileId);
    if (itemError) throw itemError;
    const items = (rows ?? []).map((row) => ({ ...row, amount: Number(row.amount) })) as LineItem[];
    if (!items.length) return NextResponse.json({ error: "Add at least one financial item first." }, { status: 400 });
    const metrics = calculateMetrics(items);
    const recommendations = buildRecommendations(metrics);
    const goal = profile.goal_label ? ` toward “${profile.goal_label}”` : "";
    const summary = `Your net worth is ${formatINR(metrics.netWorth)} and you currently have ${formatINR(metrics.monthlySurplus)} left each month. That is a ${metrics.savingsRate.toFixed(1)}% savings rate. Your blueprint focuses on the clearest next steps${goal}, starting with ${recommendations[0].title.toLowerCase()}.`;
    const { data: report, error: reportError } = await supabase.from("reports").insert({
      profile_id: profileId,
      net_worth: metrics.netWorth,
      monthly_income: metrics.monthlyIncome,
      monthly_expense: metrics.monthlyExpense,
      monthly_surplus: metrics.monthlySurplus,
      savings_rate: metrics.savingsRate,
      summary_text: summary,
      summary_source: "template",
      summary_confidence: 1,
      recommendations,
      review_status: "unreviewed",
    }).select("id").single();
    if (reportError) throw reportError;
    await supabase.from("audit_logs").insert({ action: "report.generated", actor: "anonymous", target_id: report.id, metadata: { profile_id: profileId } });
    return NextResponse.json({ id: report.id });
  } catch (error) {
    console.error("[reports]", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not generate report." }, { status: 500 });
  }
}
