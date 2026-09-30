import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/affiliate/admin-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type ProspectInput = {
  firstName?: string;
  lastName?: string;
  email?: string;
  linkedinUrl?: string;
  company?: string;
  jobTitle?: string;
  city?: string;
  country?: string;
};

type ApolloPerson = {
  id?: string;
  first_name?: string;
  last_name?: string;
  linkedin_url?: string;
  title?: string;
  email?: string;
  email_status?: string;
  city?: string;
  country?: string;
  match_confidence?: 'high' | 'medium' | 'low' | 'none';
  organization?: {
    name?: string;
    primary_domain?: string;
  } | null;
  employment_history?: Array<{
    current?: boolean;
    organization_name?: string;
    title?: string;
  }>;
};

function clean(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function POST(request: NextRequest) {
  if (!await getAdminSession()) {
    return NextResponse.json(
      { error: 'Authentification administrateur requise.' },
      { status: 401 },
    );
  }

  const apiKey = process.env.APOLLO_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Apollo n’est pas configuré côté serveur.' },
      { status: 503 },
    );
  }

  try {
    const body = await request.json() as { prospect?: ProspectInput };
    const prospect = body.prospect ?? {};

    const firstName = clean(prospect.firstName);
    const lastName = clean(prospect.lastName);
    const email = clean(prospect.email);
    const linkedinUrl = clean(prospect.linkedinUrl);
    const company = clean(prospect.company);

    const hasStrongSignal =
      Boolean(linkedinUrl) ||
      Boolean(email) ||
      Boolean((firstName || lastName) && company);

    if (!hasStrongSignal) {
      return NextResponse.json(
        {
          error:
            'Ajoutez au minimum un profil LinkedIn, un e-mail, ou le nom accompagné de l’entreprise avant l’enrichissement.',
        },
        { status: 400 },
      );
    }

    const params = new URLSearchParams({
      reveal_personal_emails: 'false',
      reveal_phone_number: 'false',
      run_waterfall_email: 'false',
      run_waterfall_phone: 'false',
      poll_only: 'false',
    });

    if (firstName) params.set('first_name', firstName);
    if (lastName) params.set('last_name', lastName);
    if (email) params.set('email', email);
    if (linkedinUrl) params.set('linkedin_url', linkedinUrl);
    if (company) params.set('organization_name', company);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let response: Response;

    try {
      response = await fetch(
        `https://api.apollo.io/api/v1/people/match?${params.toString()}`,
        {
          method: 'POST',
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'x-api-key': apiKey,
          },
          cache: 'no-store',
          signal: controller.signal,
        },
      );
    } finally {
      clearTimeout(timeout);
    }

    if (response.status === 401 || response.status === 403) {
      return NextResponse.json(
        { error: 'Apollo a refusé la clé API ou les permissions de people/match.' },
        { status: 502 },
      );
    }

    if (response.status === 429) {
      return NextResponse.json(
        { error: 'Limite Apollo atteinte. Réessayez plus tard.' },
        { status: 429 },
      );
    }

    if (!response.ok) {
      const detail = await response.text().catch(() => '');

      console.error('Apollo enrichment failed', {
        status: response.status,
        detail: detail.slice(0, 500),
      });

      return NextResponse.json(
        { error: `Apollo a retourné une erreur (${response.status}).` },
        { status: 502 },
      );
    }

    const result = await response.json() as {
      person?: ApolloPerson | null;
    };

    const person = result.person;

    if (!person || person.match_confidence === 'none') {
      return NextResponse.json(
        {
          matched: false,
          matchConfidence: person?.match_confidence ?? 'none',
          message: 'Apollo n’a trouvé aucun profil suffisamment correspondant.',
        },
      );
    }

    const confidence = person.match_confidence ?? 'low';

    if (confidence === 'low') {
      return NextResponse.json({
        matched: true,
        applied: false,
        matchConfidence: confidence,
        message:
          'Apollo a trouvé un résultat avec une confiance faible. Les données n’ont pas été appliquées automatiquement.',
      });
    }

    const currentEmployment =
      person.employment_history?.find((item) => item.current) ?? null;

    const patch = {
      firstName: person.first_name || firstName,
      lastName: person.last_name || lastName,
      linkedinUrl: person.linkedin_url || linkedinUrl,
      jobTitle:
        person.title ||
        currentEmployment?.title ||
        clean(prospect.jobTitle),
      company:
        person.organization?.name ||
        currentEmployment?.organization_name ||
        company,
      email: person.email || email,
      city: person.city || clean(prospect.city),
      country: person.country || clean(prospect.country),
      verificationStatus: 'Vérifié' as const,
      dataSource: 'Apollo API',
    };

    return NextResponse.json({
      matched: true,
      applied: true,
      matchConfidence: confidence,
      apolloPersonId: person.id ?? null,
      emailStatus: person.email_status ?? null,
      patch,
      message: `Profil enrichi avec une confiance ${confidence}.`,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Apollo met trop de temps à répondre.' },
        { status: 504 },
      );
    }

    console.error('Apollo enrichment exception', error);

    return NextResponse.json(
      { error: 'Enrichissement Apollo impossible.' },
      { status: 500 },
    );
  }
}