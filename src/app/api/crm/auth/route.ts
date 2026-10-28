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
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.access_token) {
        const code = String(result?.code || result?.error_code || result?.error || "").toLowerCase();
        const detail = String(result?.message || result?.msg || "").toLowerCase();

        if (detail.includes("api key") || code.includes("api_key"))
          throw new CrmError("Configuration Supabase : cle API refusee.", 503);

        if (code === "invalid_credentials" || detail.includes("invalid login credentials"))
          throw new CrmError("Email ou mot de passe incorrect.", 401);

        if (code === "email_not_confirmed" || detail.includes("email not confirmed"))
          throw new CrmError("Adresse email Supabase non confirmee.", 401);

        throw new CrmError(
          `Supabase Auth : HTTP ${response.status}, code ${/^[a-z0-9_]+$/.test(code) ? code : "indisponible"}.`,
          502,
        );
      }
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
