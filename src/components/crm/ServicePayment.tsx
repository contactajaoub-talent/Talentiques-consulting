"use client";
import Link from "next/link";
import Script from "next/script";
import { useRef, useState } from "react";
export function ServicePayment({
  id,
  token,
  amount,
  currency,
  paid,
  name,
}: {
  id: string;
  token: string;
  amount: string;
  currency: string;
  paid: boolean;
  name: string;
}) {
  const ref = useRef(false),
    [done, setDone] = useState(paid),
    [error, setError] = useState("");
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  async function render() {
    if (!window.paypal || ref.current || done) return;
    ref.current = true;
    try {
      await window.paypal
        .Buttons({
          createOrder: async () => {
            const r = await fetch("/api/services/paypal/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  internalOrderId: id,
                  checkoutToken: token,
                }),
              }),
              v = await r.json();
            if (!r.ok) throw new Error(v.error);
            return v.id;
          },
          onApprove: async ({ orderID }) => {
            const r = await fetch("/api/services/paypal/capture-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: orderID }),
              }),
              v = await r.json();
            if (!r.ok || !v.ok)
              throw new Error(v.error || "Paiement non confirmé.");
            setDone(true);
          },
          onCancel: () =>
            setError("Paiement annulé. Votre commande reste en attente."),
          onError: () =>
            setError(
              "Paiement non confirmé. Contactez l’équipe si votre compte a été débité.",
            ),
        })
        .render("#crm-service-payment");
    } catch (e) {
      ref.current = false;
      setError(e instanceof Error ? e.message : "Paiement indisponible.");
    }
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F9FC] px-5">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-8">
        <p className="text-xs font-bold tracking-widest text-[#133960]">
          TALENTIQUES
        </p>
        <h1 className="mt-6 font-heading text-3xl font-semibold text-[#133960]">
          {done ? "Paiement confirmé." : "Votre accompagnement"}
        </h1>
        <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-600">
          {done
            ? "Notre équipe vérifiera les informations nécessaires avant le démarrage de la production."
            : name}
        </p>
        <p className="my-6 text-3xl font-semibold text-[#133960]">
          {new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency,
          }).format(Number(amount))}
        </p>
        {!done &&
          (clientId ? (
            <>
              <div id="crm-service-payment" />
              <Script
                src={`https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${currency}&intent=capture&components=buttons`}
                onReady={() => {
                  void render();
                }}
              />
            </>
          ) : (
            <p className="rounded-lg bg-amber-50 p-4 text-sm">
              Le paiement automatique n’est pas configuré. Contactez l’équipe
              pour un règlement et un rapprochement manuels.
            </p>
          ))}
        {error && (
          <p role="alert" className="mt-5 text-sm text-red-700">
            {error}
          </p>
        )}
        <Link
          className="mt-7 inline-block text-xs text-slate-500 underline"
          href="/"
        >
          Revenir au site
        </Link>
      </div>
    </main>
  );
}
