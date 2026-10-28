import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, cookieOptions, requireSession } from "@/lib/crm/auth";
import { backend, rows, config } from "@/lib/crm/db";
import { CrmError } from "@/lib/crm/core";
import { failure, json, rateLimit, sameOrigin } from "@/lib/crm/http";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    await rateLimit(request, "login", 12);
    const body = await json(request, 8000);
    let token = typeof body.access_token === "string" ? body.access_token : "";
    if (!token) {
      const email = String(body.email || "")
        .trim()
        .toLowerCase();
      const response = await fetch(
        `${config().url}/auth/v1/token?grant_type=password`,
        {
          method: "POST",
          headers: { apikey: config().key, "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password: String(body.password || ""),
          }),
          cache: "no-store",
        },
      );
      const result = await response.json();
      if (!response.ok || !result.access_token)
        throw new CrmError(
          "Identifiants invalides ou accès non approuvé.",
          401,
        );
      token = result.access_token;
    }
    const user = await backend("/auth/v1/user", {}, token);
    if (
      !(
        await rows(
          "crm_members",
          `user_id=eq.${encodeURIComponent(user.id)}&active=eq.true`,
          token,
        )
      )[0]
    )
      throw new CrmError("Accès CRM non approuvé.", 403);
    (await cookies()).set(COOKIE, token, cookieOptions);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}
export async function DELETE(request: Request) {
  try {
    sameOrigin(request);
    const store = await cookies();
    const token = store.get(COOKIE)?.value;
    store.delete(COOKIE);
    if (token)
      await backend("/auth/v1/logout", { method: "POST" }, token).catch(
        () => {},
      );
    return NextResponse.json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}
export async function PUT(request: Request) {
  try {
    sameOrigin(request);
    const current = await requireSession(),
      body = await json(request);
    if (
      typeof body.password !== "string" ||
      body.password.length < 12 ||
      body.password.length > 128
    )
      throw new CrmError("Utilisez un mot de passe de 12 à 128 caractères.");
    await backend(
      "/auth/v1/user",
      { method: "PUT", body: JSON.stringify({ password: body.password }) },
      current.token,
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    return failure(error);
  }
}
