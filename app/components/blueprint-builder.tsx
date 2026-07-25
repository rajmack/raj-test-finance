"use client";

import { createClient } from "@/lib/supabase/client";
import { calculateMetrics, formatINR, type Frequency, type Kind, type LineItem } from "@/lib/finance";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Profile = {
  id: string;
  display_name: string;
  goal_label: string | null;
  target_year: number | null;
};

const kinds: { kind: Kind; title: string; hint: string }[] = [
  { kind: "income", title: "Income", hint: "Salary, freelance work or rent received" },
  { kind: "expense", title: "Expenses", hint: "Rent, groceries, bills or EMIs" },
  { kind: "asset", title: "Assets", hint: "Savings, investments, property or vehicles" },
  { kind: "liability", title: "Liabilities", hint: "Loans, credit cards or money owed" },
];

export function BlueprintBuilder() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [items, setItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const metrics = calculateMetrics(items);

  async function load(profileId?: string) {
    setLoading(true);
    setError("");
    const { data: available, error: profileError } = await supabase
      .from("profiles")
      .select("id,display_name,goal_label,target_year")
      .order("created_at");
    if (profileError || !available?.length) {
      setError(profileError?.message ?? "No profiles found. Create your first plan below.");
      setProfiles([]);
      setProfile(null);
      setItems([]);
      setLoading(false);
      return;
    }
    const selected = available.find((candidate) => candidate.id === profileId) ?? available[0];
    const { data: rows, error: itemError } = await supabase
      .from("line_items")
      .select("id,profile_id,kind,label,amount,frequency")
      .eq("profile_id", selected.id)
      .order("created_at");
    setProfiles(available);
    setProfile(selected);
    setItems((rows ?? []).map((row) => ({ ...row, amount: Number(row.amount) })) as LineItem[]);
    setError(itemError?.message ?? "");
    setLoading(false);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createProfile(formData: FormData) {
    setSaving(true);
    setError("");
    const { data, error: insertError } = await supabase
      .from("profiles")
      .insert({
        display_name: String(formData.get("display_name")),
        goal_label: String(formData.get("goal_label")),
        target_year: Number(formData.get("target_year")) || null,
      })
      .select("id")
      .single();
    setSaving(false);
    if (insertError) return setError(insertError.message);
    await load(data.id);
  }

  async function addItem(kind: Kind, formData: FormData) {
    if (!profile) return;
    setSaving(true);
    setError("");
    const { error: insertError } = await supabase.from("line_items").insert({
      profile_id: profile.id,
      kind,
      label: String(formData.get("label")),
      amount: Number(formData.get("amount")),
      frequency: String(formData.get("frequency")) as Frequency,
    });
    setSaving(false);
    if (insertError) return setError(insertError.message);
    await load(profile.id);
  }

  async function removeItem(id: string) {
    setSaving(true);
    const { error: deleteError } = await supabase.from("line_items").delete().eq("id", id);
    setSaving(false);
    if (deleteError) return setError(deleteError.message);
    setItems((current) => current.filter((item) => item.id !== id));
  }

  async function generate() {
    if (!profile || items.length === 0) return;
    setSaving(true);
    setError("");
    const response = await fetch("/api/reports", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ profileId: profile.id }),
    });
    const result = await response.json();
    setSaving(false);
    if (!response.ok) return setError(result.error ?? "Could not generate your blueprint.");
    router.push(`/reports/${result.id}`);
  }

  return (
    <main>
      <header className="hero">
        <div className="shell">
          <span className="eyebrow">₹ FINANCIAL BLUEPRINT</span>
          <h1>Make your money feel clear.</h1>
          <p>Lay out what comes in, what goes out and what you own. We’ll turn it into a plain-English next step.</p>
        </div>
      </header>

      <div className="shell workspace">
        {error && <div className="notice error" role="alert">{error}</div>}
        <section className="profile-bar card">
          <div>
            <span className="label">Current plan</span>
            {profile ? <><h2>{profile.display_name}</h2><p>{profile.goal_label || "A clearer financial future"}{profile.target_year ? ` · ${profile.target_year}` : ""}</p></> : <p>Create a plan to get started.</p>}
          </div>
          {profiles.length > 0 && (
            <label>
              <span className="sr-only">Choose a plan</span>
              <select value={profile?.id} onChange={(event) => void load(event.target.value)}>
                {profiles.map((item) => <option key={item.id} value={item.id}>{item.display_name}</option>)}
              </select>
            </label>
          )}
        </section>

        {!profile && !loading && (
          <form action={createProfile} className="card create-profile">
            <h2>Start your blueprint</h2>
            <input required name="display_name" placeholder="e.g. Raj’s Plan" aria-label="Plan name" />
            <input required name="goal_label" placeholder="e.g. Buy a home in five years" aria-label="Main money goal" />
            <input name="target_year" type="number" min="2026" max="2100" placeholder="Target year" aria-label="Target year" />
            <button disabled={saving}>Create plan</button>
          </form>
        )}

        {loading ? <div className="loading">Loading your financial picture…</div> : profile && (
          <div className="builder-grid">
            <div className="forms">
              {kinds.map(({ kind, title, hint }) => (
                <section className="card item-section" key={kind}>
                  <div className="section-title"><div><span className={`kind-dot ${kind}`} /><h2>{title}</h2><p>{hint}</p></div><strong>{formatINR(items.filter((item) => item.kind === kind).reduce((sum, item) => sum + item.amount, 0))}</strong></div>
                  <div className="item-list">
                    {items.filter((item) => item.kind === kind).map((item) => (
                      <div className="item-row" key={item.id}>
                        <span>{item.label}<small>{item.frequency.replace("_", " ")}</small></span>
                        <strong>{formatINR(item.amount)}</strong>
                        <button className="remove" aria-label={`Remove ${item.label}`} onClick={() => void removeItem(item.id)} disabled={saving}>×</button>
                      </div>
                    ))}
                    {!items.some((item) => item.kind === kind) && <p className="empty">Nothing added yet.</p>}
                  </div>
                  <form action={(formData) => addItem(kind, formData)} className="add-form">
                    <input required name="label" placeholder={`Add ${kind}`} aria-label={`${title} label`} />
                    <input required name="amount" type="number" min="1" step="0.01" placeholder="Amount ₹" aria-label={`${title} amount`} />
                    <select name="frequency" defaultValue={kind === "income" || kind === "expense" ? "monthly" : "one_time"} aria-label={`${title} frequency`}>
                      <option value="monthly">Monthly</option><option value="yearly">Yearly</option><option value="one_time">Current total</option>
                    </select>
                    <button disabled={saving}>Add</button>
                  </form>
                </section>
              ))}
            </div>

            <aside className="summary card">
              <span className="eyebrow">LIVE SUMMARY</span>
              <h2>Your money at a glance</h2>
              <div className="metric feature"><span>Net worth</span><strong>{formatINR(metrics.netWorth)}</strong><small>Assets minus liabilities</small></div>
              <div className="metric"><span>Monthly income</span><strong>{formatINR(metrics.monthlyIncome)}</strong></div>
              <div className="metric"><span>Monthly expenses</span><strong>{formatINR(metrics.monthlyExpense)}</strong></div>
              <div className="metric"><span>Monthly surplus</span><strong className={metrics.monthlySurplus < 0 ? "negative" : "positive"}>{formatINR(metrics.monthlySurplus)}</strong></div>
              <div className="rate">
                <div><span>Savings rate</span><strong>{metrics.savingsRate.toFixed(1)}%</strong></div>
                <div className="track"><span style={{ width: `${Math.max(0, Math.min(100, metrics.savingsRate))}%` }} /></div>
                <small>{metrics.savingsRate >= 20 ? "You’re above the healthy 20% benchmark." : "A 20% savings rate is a useful target."}</small>
              </div>
              <button className="generate" onClick={() => void generate()} disabled={saving || items.length === 0}>{saving ? "Working…" : "Generate my blueprint →"}</button>
              <p className="fine">Your calculations are deterministic. AI is optional and never changes the numbers.</p>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
