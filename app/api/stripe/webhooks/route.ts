import { constructWebhookEvent } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  try {
    const event = constructWebhookEvent(payload, signature);
    if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.async_payment_failed") {
      return NextResponse.json({ received: true });
    }
    const session = event.data.object;
    const reportId = session.metadata?.reportId;
    if (!reportId) return NextResponse.json({ received: true });
    const supabase = createAdminClient();
    if (event.type === "checkout.session.completed" && session.payment_status === "paid") {
      const { error } = await supabase.from("payments").update({ status: "paid" }).eq("stripe_session_id", session.id);
      if (error) throw error;
      await supabase.from("reports").update({ is_paid: true }).eq("id", reportId).eq("stripe_session_id", session.id);
      await supabase.from("audit_logs").insert({ action: "report.paid", actor: "stripe", target_id: reportId, metadata: { stripe_session_id: session.id } });
    } else {
      await supabase.from("payments").update({ status: "failed" }).eq("stripe_session_id", session.id);
      await supabase.from("audit_logs").insert({ action: "payment.failed", actor: "stripe", target_id: reportId, metadata: { stripe_session_id: session.id } });
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[stripe/webhooks]", error);
    return NextResponse.json({ error: "Invalid webhook." }, { status: 400 });
  }
}
