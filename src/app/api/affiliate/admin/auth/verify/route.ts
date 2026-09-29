import { NextResponse } from 'next/server';
import { AFFILIATE_ADMIN_COOKIE, adminReturnTo, affiliateSessionCookieOptions, consumeAdminLoginToken } from '@/lib/affiliate/admin-auth';

export async function GET(request:Request){
  const url=new URL(request.url);
  const returnTo=adminReturnTo(url.searchParams.get('returnTo'));
  try{
    const verified=await consumeAdminLoginToken(url.searchParams.get('token')||'');
    if(verified){
      const response=NextResponse.redirect(new URL(returnTo,url.origin));
      response.cookies.set(AFFILIATE_ADMIN_COOKIE,verified.rawSession,affiliateSessionCookieOptions());
      return response;
    }
  }catch(error){
    console.error('Admin verification error',error);
  }
  const login=new URL('/admin/affiliates/login',url.origin);
  login.searchParams.set('error','invalid');
  login.searchParams.set('returnTo',returnTo);
  return NextResponse.redirect(login);
}