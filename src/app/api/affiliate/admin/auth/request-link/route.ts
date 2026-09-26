import { NextResponse } from 'next/server';
import { createAdminLoginToken } from '@/lib/affiliate/admin-auth';
import { sendAffiliateAdminLoginEmail } from '@/lib/affiliate/emails';

export async function POST(request:Request){try{const body=await request.json() as Record<string,unknown>;const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';const created=await createAdminLoginToken(email);if(created){const configured=process.env.NEXT_PUBLIC_APP_URL||'https://talentiques.com';const origin=/^https?:\/\//i.test(configured)?configured.replace(/\/$/,''):`https://${configured}`;await sendAffiliateAdminLoginEmail(created.email,`${origin}/api/affiliate/admin/auth/verify?token=${encodeURIComponent(created.rawToken)}`);}}catch(error){console.error('Admin login request error',error);}return NextResponse.json({ok:true,message:'Si cette adresse est autorisée, vous recevrez un lien de connexion.'});}
