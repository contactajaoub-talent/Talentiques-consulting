import { NextResponse } from 'next/server';
import { adminReturnTo, createAdminLoginToken } from '@/lib/affiliate/admin-auth';
import { sendAffiliateAdminLoginEmail } from '@/lib/affiliate/emails';

function normalizeOrigin(value:string){
  const trimmed=value.trim().replace(/\/$/,'');
  return /^https?:\/\//i.test(trimmed)?trimmed:`https://${trimmed}`;
}

export async function POST(request:Request){
  try{
    const body=await request.json() as Record<string,unknown>;
    const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';
    const returnTo=adminReturnTo(typeof body.returnTo==='string'?body.returnTo:null);
    const created=await createAdminLoginToken(email);
    if(created){
      const configured=process.env.NEXT_PUBLIC_APP_URL||'https://talentiques.com';
      const preview=process.env.VERCEL_ENV==='preview'&&process.env.VERCEL_URL?process.env.VERCEL_URL:null;
      const origin=normalizeOrigin(preview||configured);
      const verifyUrl=`${origin}/api/affiliate/admin/auth/verify?token=${encodeURIComponent(created.rawToken)}&returnTo=${encodeURIComponent(returnTo)}`;
      await sendAffiliateAdminLoginEmail(created.email,verifyUrl);
    }
  }catch(error){
    console.error('Admin login request error',error);
  }
  return NextResponse.json({ok:true,message:'Si cette adresse est autorisée, vous recevrez un lien de connexion.'});
}
