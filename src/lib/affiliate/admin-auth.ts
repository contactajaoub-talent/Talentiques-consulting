import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AFFILIATE_SESSION_TTL_MS, LOGIN_TOKEN_TTL_MS, affiliateSessionCookieOptions, createSecureToken, hashAffiliateToken } from './auth-core.ts';
import { consumeAdminTokenHash, findAdminSession, hasRecentAdminToken, insertAdminLoginToken, insertAdminSession, revokeAdminSession } from './admin-supabase.ts';

export const AFFILIATE_ADMIN_COOKIE='tq_affiliate_admin_session';
export async function createAdminLoginToken(email:string){const allowed=process.env.AFFILIATE_ADMIN_EMAIL?.trim().toLowerCase();if(!allowed||email.trim().toLowerCase()!==allowed)return null;if(await hasRecentAdminToken(allowed,new Date(Date.now()-2*60_000).toISOString()))return null;const rawToken=createSecureToken();await insertAdminLoginToken({email:allowed,token_hash:hashAffiliateToken(rawToken),expires_at:new Date(Date.now()+LOGIN_TOKEN_TTL_MS).toISOString()});return {rawToken,email:allowed};}
export async function consumeAdminLoginToken(raw:string){if(!/^[A-Za-z0-9_-]{40,100}$/.test(raw))return null;const row=await consumeAdminTokenHash(hashAffiliateToken(raw));if(!row||typeof row.email!=='string'||row.email.toLowerCase()!==process.env.AFFILIATE_ADMIN_EMAIL?.trim().toLowerCase())return null;const rawSession=createSecureToken();await insertAdminSession({email:row.email,session_hash:hashAffiliateToken(rawSession),expires_at:new Date(Date.now()+AFFILIATE_SESSION_TTL_MS).toISOString(),last_seen_at:new Date().toISOString()});return {rawSession,email:row.email};}
export async function getAdminSession(){const raw=(await cookies()).get(AFFILIATE_ADMIN_COOKIE)?.value;if(!raw)return null;const session=await findAdminSession(hashAffiliateToken(raw));if(!session||session.email!==process.env.AFFILIATE_ADMIN_EMAIL?.trim().toLowerCase())return null;return session;}
export async function requireAdminSession(){const session=await getAdminSession();if(!session)redirect('/admin/affiliates/login');return session;}
export async function revokeCurrentAdminSession(){const raw=(await cookies()).get(AFFILIATE_ADMIN_COOKIE)?.value;if(raw)await revokeAdminSession(hashAffiliateToken(raw));}
export { affiliateSessionCookieOptions };
