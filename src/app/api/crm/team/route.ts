import { NextResponse } from "next/server";
import { requireSession } from "@/lib/crm/auth";
import { backend, rpc } from "@/lib/crm/db";
import { CrmError, text } from "@/lib/crm/core";
import { failure, json, sameOrigin } from "@/lib/crm/http";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const current = await requireSession();
    if (current.member.role !== "admin")
      throw new CrmError("Accès refusé.", 403);
    const data = await json(request);
    const email = text(data.email, 254).toLowerCase(),
      name = text(data.name, 150),
      role = text(data.role);
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !name ||
      !["admin", "sales", "production"].includes(role)
    )
      throw new CrmError("Invitation invalide.");
    const redirect = new URL(
      "/crm/login",
      process.env.NEXT_PUBLIC_APP_URL || request.url,
    ).toString();
    const result = await backend(
      `/auth/v1/invite?redirect_to=${encodeURIComponent(redirect)}`,
      { method: "POST", body: JSON.stringify({ email, data: { name } }) },
    );
    if (!result.id) throw new CrmError("Invitation non confirmée.");
    await rpc(
      "crm_action",
      {
        p_action: "member_save",
        p_id: result.id,
        p_data: { name, role, active: true },
      },
      current.token,
    );
    return NextResponse.json({
      ok: true,
      message:
        "Invitation acceptée par Supabase Auth. La réception dépend de son fournisseur email.",
    });
  } catch (error) {
    return failure(error);
  }
}
