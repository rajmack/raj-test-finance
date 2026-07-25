"use client";
import { useState } from "react";

export function UnlockButton({ reportId }: { reportId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function checkout() {
    setLoading(true);
    setError("");
    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ reportId }),
    });
    const result = await response.json();
    if (!response.ok) {
      setLoading(false);
      return setError(result.error ?? "Checkout is unavailable.");
    }
    window.location.assign(result.url);
  }
  return <><button className="unlock" onClick={() => void checkout()} disabled={loading}>{loading ? "Opening secure checkout…" : "Unlock full report — $299"}</button>{error && <p className="checkout-error">{error}</p>}</>;
}
