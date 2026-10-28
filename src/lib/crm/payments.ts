import "server-only";
import { paypalFetch } from "@/lib/store/paypal";
import { CrmError, verifyCapture, type PayPalOrder } from "./core";
import { backend, rows, rpc } from "./db";
import { hash } from "./http";

export async function checkoutOrder(id: string, token: string) {
  if (!/^[a-f0-9]{64}$/.test(token))
    throw new CrmError("Lien de paiement invalide.", 403);
  const order = (
    await rows(
      "service_orders",
      `id=eq.${id}&checkout_hash=eq.${hash(token)}&checkout_expires_at=gt.${encodeURIComponent(new Date().toISOString())}&limit=1`,
    )
  )[0];
  if (!order?.crm_request_id)
    throw new CrmError("Lien de paiement expiré ou invalide.", 403);
  if (order.crm_proposal_id) {
    const proposal = (
      await rows("crm_proposals", `id=eq.${order.crm_proposal_id}&limit=1`)
    )[0];
    if (!proposal || ["rejected", "expired"].includes(proposal.status))
      throw new CrmError("Proposition indisponible.", 409);
  }
  return order;
}
export async function createPayment(order: Record<string, unknown>) {
  if (!process.env.PAYPAL_MERCHANT_ID)
    throw new CrmError(
      "Paiement automatique non configuré. Contactez l’équipe pour une vérification manuelle.",
      503,
    );
  if (order.status === "paid" || order.status === "refunded")
    throw new CrmError("Cette commande est déjà réglée ou remboursée.", 409);
  if (order.paypal_order_id) return { id: order.paypal_order_id };
  const response = await paypalFetch("/v2/checkout/orders", {
    method: "POST",
    headers: { "PayPal-Request-Id": `service-create-${order.id}` },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          custom_id: order.id,
          reference_id: `talentiques-service-${order.id}`,
          description: String(order.service_name).slice(0, 120),
          payee: { merchant_id: process.env.PAYPAL_MERCHANT_ID },
          amount: {
            currency_code: order.currency,
            value: Number(order.amount).toFixed(2),
          },
        },
      ],
      application_context: {
        brand_name: "TALENTIQUES",
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
      },
    }),
  });
  const result = await response.json();
  if (!response.ok || !result.id)
    throw new CrmError(
      "Création du paiement impossible. La commande reste en attente.",
      502,
    );
  await backend(
    `/rest/v1/service_orders?id=eq.${order.id}&status=in.(pending,paypal_create_failed,verification_needed)`,
    {
      method: "PATCH",
      body: JSON.stringify({ paypal_order_id: result.id, status: "pending" }),
    },
  );
  return { id: result.id };
}
export async function confirmPayment(paypalOrderId: string, eventId?: string) {
  const response = await paypalFetch(
    `/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`,
  );
  const order = (await response.json()) as PayPalOrder;
  if (!response.ok || !order.id)
    throw new CrmError("Commande PayPal introuvable.", 409);
  const stored = (
    await rows(
      "service_orders",
      `paypal_order_id=eq.${encodeURIComponent(paypalOrderId)}&limit=1`,
    )
  )[0];
  if (!stored?.crm_request_id)
    throw new CrmError("Commande CRM non reconnue.", 409);
  const capture = verifyCapture(
    stored,
    order,
    process.env.PAYPAL_MERCHANT_ID || "",
  );
  await rpc("crm_confirm_payment", {
    p_order: stored.id,
    p_event: eventId || `capture:${capture.id}`,
    p_capture: capture.id,
  });
  return { ok: true, status: "COMPLETED" };
}
