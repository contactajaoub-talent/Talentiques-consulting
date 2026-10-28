import { NextResponse } from "next/server";
import { paypalFetch } from "@/lib/store/paypal";
import { confirmPayment } from "@/lib/crm/payments";
import { CrmError } from "@/lib/crm/core";
import { failure, json } from "@/lib/crm/http";
import { rpc, rows } from "@/lib/crm/db";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const event = await json(request, 100000);
    const webhook = process.env.PAYPAL_SERVICE_WEBHOOK_ID;
    if (!webhook) throw new CrmError("Webhook non configuré.", 503);
    const response = await paypalFetch(
      "/v1/notifications/verify-webhook-signature",
      {
        method: "POST",
        body: JSON.stringify({
          auth_algo: request.headers.get("paypal-auth-algo"),
          cert_url: request.headers.get("paypal-cert-url"),
          transmission_id: request.headers.get("paypal-transmission-id"),
          transmission_sig: request.headers.get("paypal-transmission-sig"),
          transmission_time: request.headers.get("paypal-transmission-time"),
          webhook_id: webhook,
          webhook_event: event,
        }),
      },
    );
    const verification = await response.json();
    if (!response.ok || verification.verification_status !== "SUCCESS")
      throw new CrmError("Signature invalide.", 400);
    const resource = event.resource as Record<string, unknown>;
    if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
      const related = resource?.supplementary_data as {
        related_ids?: { order_id?: string };
      };
      const orderId = related?.related_ids?.order_id;
      if (!orderId) throw new CrmError("Référence manquante.");
      if (
        !(
          await rows(
            "service_orders",
            `paypal_order_id=eq.${encodeURIComponent(orderId)}&crm_request_id=not.is.null&limit=1`,
          )
        )[0]
      )
        return NextResponse.json({ ok: true, ignored: true });
      await confirmPayment(orderId, String(event.id));
    } else if (
      event.event_type === "PAYMENT.CAPTURE.REFUNDED" ||
      event.event_type === "PAYMENT.CAPTURE.REVERSED"
    ) {
      const related = resource?.supplementary_data as {
        related_ids?: { capture_id?: string };
      };
      const captureId = related?.related_ids?.capture_id;
      if (!captureId)
        throw new CrmError("Capture à rapprocher manuellement.", 409);
      await rpc("crm_refund_payment", {
        p_capture: captureId,
        p_event: String(event.id),
      });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}
