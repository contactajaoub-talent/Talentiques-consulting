import { NextResponse } from 'next/server';
import { fetchEscoContext } from '@/lib/cv-analysis/esco';
import { MAX_JOB_OFFER_LENGTH, parseCvInput } from '@/lib/cv-analysis/input';
import { calculateJobMatch } from '@/lib/cv-analysis/job-match';
import { CvModelError, analyzeCvWithModels } from '@/lib/cv-analysis/openai';
import { recommendOffer } from '@/lib/cv-analysis/recommendation';
import { calculateAtsReadiness } from '@/lib/cv-analysis/scoring';
import type { CvAnalysisResult, CvIssue } from '@/lib/cv-analysis/types';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const startedAt = Date.now();
  try {
    const form = await request.formData();
    if (clean(form.get('website'))) return NextResponse.json({ success: false }, { status: 400 });

    const locale = clean(form.get('locale')) === 'en' ? 'en' : 'fr';
    const targetRole = clean(form.get('targetRole')).slice(0, 160);
    const jobOffer = clean(form.get('jobOffer'));
    const currentStatus = clean(form.get('currentStatus')).slice(0, 120);
    const parsedInput = await parseCvInput(form);

    if (!parsedInput.ok) {
      return NextResponse.json({ error: parsedInput.error }, { status: 400 });
    }
    if (jobOffer.length > MAX_JOB_OFFER_LENGTH) {
      return NextResponse.json({ error: 'L’offre d’emploi est trop longue.' }, { status: 400 });
    }

    const esco = await fetchEscoContext(targetRole, locale);
    const model = await analyzeCvWithModels({
      input: parsedInput.input,
      targetRole,
      jobOffer,
      locale,
      esco,
    });

    if (!model.observations.is_cv) {
      return NextResponse.json({
        error: 'Le document transmis ne semble pas être un CV. Vérifiez son contenu puis réessayez.',
      }, { status: 422 });
    }

    const atsReadiness = calculateAtsReadiness(model.observations);
    const jobMatch = jobOffer.trim()
      ? calculateJobMatch(model.observations.job_match_observations)
      : null;
    const priorities = prioritized(model.observations.issues);
    const recommendation = recommendOffer({
      atsScore: atsReadiness.total,
      experienceLevel: model.observations.candidate.experience_level,
      currentStatus,
    });
    const detected = new Set(model.observations.skills.detected.map(normalize));
    const escoSkills = esco.skills
      .filter((skill) => !detected.has(normalize(skill)))
      .slice(0, 8);

    const analysis: CvAnalysisResult = {
      atsReadiness,
      jobMatch,
      strengths: model.observations.strengths,
      priorities,
      removeOrReduce: model.observations.remove_or_reduce,
      addOrStrengthen: model.observations.add_or_strengthen,
      rewrites: model.observations.issues.filter((issue) => issue.evidence && issue.example_rewrite).slice(0, 6),
      esco: { used: esco.used, occupation: esco.occupation, skills: escoSkills },
      recommendation,
      profile: { experienceLevel: model.observations.candidate.experience_level, currentStatus },
      layoutAssessed: model.observations.document.layout_assessable,
      modelUsed: model.modelUsed,
      fallbackUsed: model.fallbackUsed,
    };

    console.info('CV analysis completed', {
      model_used: model.modelUsed,
      fallback_used: model.fallbackUsed,
      input_tokens: model.usage.input_tokens,
      output_tokens: model.usage.output_tokens,
      total_tokens: model.usage.total_tokens,
      duration_ms: Date.now() - startedAt,
      esco_used: esco.used,
    });

    return NextResponse.json({
      success: true,
      analysis,
      model_used: model.modelUsed,
      fallback_used: model.fallbackUsed,
    });
  } catch (error) {
    const kind = error instanceof CvModelError ? error.kind : 'unavailable';
    console.error('CV analysis failed', { kind, duration_ms: Date.now() - startedAt });
    const message = kind === 'timeout'
      ? 'L’analyse a pris trop de temps. Veuillez réessayer.'
      : kind === 'invalid'
        ? 'La réponse d’analyse est incomplète. Veuillez réessayer.'
        : 'Le service d’analyse est temporairement indisponible. Veuillez réessayer plus tard.';
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

function clean(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : '';
}

function prioritized(issues: CvIssue[]) {
  const weight = { high: 3, medium: 2, low: 1 };
  return [...issues].sort((a, b) => weight[b.severity] - weight[a.severity]).slice(0, 3);
}

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
}
