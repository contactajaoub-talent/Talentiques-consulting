import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/affiliate/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!await getAdminSession()) {
    return NextResponse.json(
      { error: 'Authentification administrateur requise.' },
      { status: 401 },
    );
  }

  return NextResponse.json(
    {
      supabase: Boolean(
        process.env.SUPABASE_URL &&
        process.env.SUPABASE_SERVICE_ROLE_KEY
      ),
      openai: Boolean(process.env.OPENAI_API_KEY),
      apollo: Boolean(process.env.APOLLO_API_KEY),
      gmail: false,
      whatsapp: false,
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}