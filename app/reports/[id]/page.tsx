import { createAdminClient } from "@/lib/supabase/admin";
import { formatUSD, type Recommendation } from "@/lib/finance";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UnlockButton } from "@/app/components/unlock-button";

export const dynamic = "force-dynamic";

export default async function ReportPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ checkout?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const supabase = createAdminClient();
  const { data: report } = await supabase.from("reports").select("*,profiles(display_name,goal_label,target_year)").eq("id", id).single();
  if (!report) notFound();
  const recommendations = (report.recommendations ?? []) as Recommendation[];
  return (
    <main className="report-page">
      <div className="report-shell">
        <nav><Link href="/">← Edit my numbers</Link><span>FINANCIAL BLUEPRINT</span></nav>
        {query.checkout === "cancelled" && <div className="notice error">Checkout was cancelled. Your free report is still saved.</div>}
        {query.checkout === "success" && !report.is_paid && <div className="notice">Payment received. Your report will unlock as soon as Stripe confirms it—refresh in a moment.</div>}
        <header className="report-head">
          <span className="eyebrow">YOUR PERSONAL BLUEPRINT</span>
          <h1>{report.profiles?.display_name}</h1>
          <p>{report.profiles?.goal_label}{report.profiles?.target_year ? ` · Target ${report.profiles.target_year}` : ""}</p>
          <small>Generated {new Date(report.created_at).toLocaleDateString("en-IN", { dateStyle: "long" })}</small>
        </header>
        <section className="report-metrics">
          <div><span>Net worth</span><strong>{formatUSD(Number(report.net_worth))}</strong></div>
          <div><span>Monthly surplus</span><strong>{formatUSD(Number(report.monthly_surplus))}</strong></div>
          <div><span>Savings rate</span><strong>{Number(report.savings_rate).toFixed(1)}%</strong></div>
        </section>
        <section className="report-section">
          <span className="eyebrow">WHAT YOUR NUMBERS SAY</span>
          <h2>A clear read on where you stand</h2>
          <p className="summary-text">{report.summary_text}</p>
        </section>
        <section className="report-section">
          <span className="eyebrow">YOUR NEXT MOVES</span>
          <h2>Recommendations, in priority order</h2>
          <div className="recommendations">
            {recommendations.map((recommendation, index) => {
              const locked = !report.is_paid && index > 0;
              return <article className={`recommendation ${locked ? "locked" : ""}`} key={`${recommendation.title}-${index}`}>
                <div className={`priority ${recommendation.priority}`}>{index + 1}</div>
                <div><span>{recommendation.priority}</span><h3>{recommendation.title}</h3><p>{recommendation.detail}</p></div>
              </article>;
            })}
          </div>
          {!report.is_paid && (
            <div className="paywall">
              <span>🔐</span><h2>Unlock your complete action plan</h2>
              <p>See every recommendation and keep this private link for future reference.</p>
              <UnlockButton reportId={id} />
              <small>Secure one-time payment via Stripe</small>
            </div>
          )}
          {report.is_paid && <div className="unlocked">✓ Full blueprint unlocked</div>}
        </section>
        <footer>Educational guidance only — not regulated financial advice.</footer>
      </div>
    </main>
  );
}
