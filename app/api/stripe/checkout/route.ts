import { createAdminClient } from "@/lib/supabase/admin";
import { stripe, stripeAccountOptions } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { reportId } = (await request.json()) as { reportId?: string };
    if (!reportId) return NextResponse.json({ error: "A report is required." }, { status: 400 });
    const supabase = createAdminClient();
    const { data: report } = await supabase.from("reports").select("id,is_paid").eq("id", reportId).single();
    if (!report) return NextResponse.json({ error: "Report not found." }, { status: 404 });
    if (report.is_paid) return NextResponse.json({ error: "This report is already unlocked." }, { status: 409 });
    const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL;
    if (!origin) throw new Error("NEXT_PUBLIC_APP_URL is not configured.");
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "usd",
          unit_amount: 29900,
          product_data: { name: "Full Financial Blueprint", description: "Unlock every recommendation in your personal blueprint." },
        },
        quantity: 1,
      }],
      metadata: { reportId },
      success_url: `${origin}/reports/${reportId}?checkout=success`,
      cancel_url: `${origin}/reports/${reportId}?checkout=cancelled`,
    }, stripeAccountOptions());
    await supabase.from("payments").insert({ report_id: reportId, stripe_session_id: session.id, amount: 299, currency: "USD", status: "pending" });
    await supabase.from("reports").update({ stripe_session_id: session.id }).eq("id", reportId);
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[stripe/checkout]", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Checkout is unavailable." }, { status: 500 });
  }
}
