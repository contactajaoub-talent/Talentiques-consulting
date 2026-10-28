import { NextResponse } from "next/server";
import { uuid } from "@/lib/crm/core";
import { checkoutOrder, createPayment } from "@/lib/crm/payments";
import { failure, json, rateLimit, sameOrigin } from "@/lib/crm/http";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    await rateLimit(request, "payment-create", 20);
    const body = await json(request);
    return NextResponse.json(
      await createPayment(
        await checkoutOrder(
          uuid(body.internalOrderId),
          String(body.checkoutToken || ""),
        ),
      ),
    );
  } catch (error) {
    return failure(error);
  }
}
