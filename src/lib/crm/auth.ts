import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { backend, rows } from "./db";
import { CrmError, type Member } from "./core";

export const COOKIE = "tq_crm_access";
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 3600,
};
export const session = cache(async () => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const user = await backend("/auth/v1/user", {}, token);
    const members = await rows(
      "crm_members",
      `user_id=eq.${encodeURIComponent(user.id)}&active=eq.true&select=user_id,name,role,active`,
      token,
    );
    if (!members[0]) return null;
    return { token, member: members[0] as Member };
  } catch {
    return null;
  }
});
export async function requireSession() {
  const current = await session();
  if (!current) throw new CrmError("Connexion nécessaire.", 401);
  return current;
}
