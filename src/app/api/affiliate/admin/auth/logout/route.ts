import { NextResponse } from 'next/server';
import { AFFILIATE_ADMIN_COOKIE, affiliateSessionCookieOptions, revokeCurrentAdminSession } from '@/lib/affiliate/admin-auth';
export async function POST(request:Request){await revokeCurrentAdminSession();const response=NextResponse.redirect(new URL('/admin/affiliates/login',request.url),303);response.cookies.set(AFFILIATE_ADMIN_COOKIE,'',{...affiliateSessionCookieOptions(),maxAge:0});return response;}
