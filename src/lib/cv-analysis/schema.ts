import type { CvObservations } from './types.ts';

const stringArray = { type: 'array', items: { type: 'string' } } as const;

export const CV_OBSERVATIONS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'is_cv', 'language', 'confidence', 'document', 'candidate', 'structure',
    'contact', 'experience', 'skills', 'content', 'strengths', 'issues',
    'remove_or_reduce', 'add_or_strengthen', 'job_match_observations',
  ],
  properties: {
    is_cv: { type: 'boolean' },
    language: { type: 'string', enum: ['fr', 'en', 'other'] },
    confidence: { type: 'number', minimum: 0, maximum: 1 },
    document: objectSchema({
      extraction_quality: { type: 'string', enum: ['good', 'partial', 'poor'] },
      layout_assessable: { type: 'boolean' },
      layout_risk: { type: 'string', enum: ['low', 'medium', 'high'] },
      heading_clarity: { type: 'string', enum: ['clear', 'partial', 'poor'] },
    }),
    candidate: objectSchema({
      target_role_detected: { type: ['string', 'null'] },
      experience_level: {
        type: 'string',
        enum: ['student', 'junior', 'intermediate', 'senior', 'executive', 'unknown'],
      },
    }),
    structure: objectSchema({
      summary_section: { type: 'boolean' }, experience_section: { type: 'boolean' },
      education_section: { type: 'boolean' }, skills_section: { type: 'boolean' },
      languages_section: { type: 'boolean' },
    }),
    contact: objectSchema({
      email_present: { type: 'boolean' }, phone_present: { type: 'boolean' },
      linkedin_present: { type: 'boolean' },
    }),
    experience: objectSchema({
      positions_count: count(), positions_with_dates: count(),
      positions_with_bullets: count(), bullet_count: count(),
      action_oriented_bullets: count(), quantified_bullets: count(),
      outcome_or_impact_bullets: count(),
    }),
    skills: objectSchema({
      explicit_section: { type: 'boolean' }, detected: stringArray,
      skills_supported_by_experience: stringArray,
    }),
    content: objectSchema({
      word_count: count(), generic_phrase_count: count(), language_issue_count: count(),
      date_consistency_issue_count: count(), contradiction_count: count(),
    }),
    strengths: stringArray,
    issues: {
      type: 'array',
      items: objectSchema({
        category: { type: 'string' },
        severity: { type: 'string', enum: ['low', 'medium', 'high'] },
        evidence: { type: 'string' }, explanation: { type: 'string' },
        recommended_action: { type: 'string' }, example_rewrite: { type: 'string' },
      }),
    },
    remove_or_reduce: stringArray,
    add_or_strengthen: stringArray,
    job_match_observations: {
      anyOf: [
        objectSchema({
          required_skills_total: count(), required_skills_detected: count(),
          responsibilities_total: count(), responsibilities_matched: count(),
          experience_relevance: { type: 'number', minimum: 0, maximum: 1 },
          keywords_total: count(), keywords_detected: count(),
          strengths: stringArray, gaps: stringArray,
        }),
        { type: 'null' },
      ],
    },
  },
} as const;

function count() {
  return { type: 'integer', minimum: 0 } as const;
}

function objectSchema(properties: Record<string, unknown>) {
  return {
    type: 'object',
    additionalProperties: false,
    required: Object.keys(properties),
    properties,
  } as const;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function hasBooleans(value: unknown, keys: string[]) {
  return isRecord(value) && keys.every((key) => typeof value[key] === 'boolean');
}

function hasCounts(value: unknown, keys: string[]) {
  return isRecord(value) && keys.every((key) =>
    Number.isInteger(value[key]) && Number(value[key]) >= 0,
  );
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

export function validateCvObservations(value: unknown): value is CvObservations {
  if (!isRecord(value)) return false;
  const document = value.document;
  const candidate = value.candidate;
  const skills = value.skills;
  const job = value.job_match_observations;

  return (
    typeof value.is_cv === 'boolean' &&
    ['fr', 'en', 'other'].includes(String(value.language)) &&
    typeof value.confidence === 'number' && value.confidence >= 0 && value.confidence <= 1 &&
    isRecord(document) &&
    ['good', 'partial', 'poor'].includes(String(document.extraction_quality)) &&
    typeof document.layout_assessable === 'boolean' &&
    ['low', 'medium', 'high'].includes(String(document.layout_risk)) &&
    ['clear', 'partial', 'poor'].includes(String(document.heading_clarity)) &&
    isRecord(candidate) &&
    (candidate.target_role_detected === null || typeof candidate.target_role_detected === 'string') &&
    ['student', 'junior', 'intermediate', 'senior', 'executive', 'unknown'].includes(String(candidate.experience_level)) &&
    hasBooleans(value.structure, ['summary_section', 'experience_section', 'education_section', 'skills_section', 'languages_section']) &&
    hasBooleans(value.contact, ['email_present', 'phone_present', 'linkedin_present']) &&
    hasCounts(value.experience, ['positions_count', 'positions_with_dates', 'positions_with_bullets', 'bullet_count', 'action_oriented_bullets', 'quantified_bullets', 'outcome_or_impact_bullets']) &&
    isRecord(skills) && typeof skills.explicit_section === 'boolean' &&
    isStringArray(skills.detected) && isStringArray(skills.skills_supported_by_experience) &&
    hasCounts(value.content, ['word_count', 'generic_phrase_count', 'language_issue_count', 'date_consistency_issue_count', 'contradiction_count']) &&
    isStringArray(value.strengths) && isStringArray(value.remove_or_reduce) &&
    isStringArray(value.add_or_strengthen) && Array.isArray(value.issues) &&
    value.issues.every((issue) => isRecord(issue) &&
      typeof issue.category === 'string' && ['low', 'medium', 'high'].includes(String(issue.severity)) &&
      typeof issue.evidence === 'string' && typeof issue.explanation === 'string' &&
      typeof issue.recommended_action === 'string' && typeof issue.example_rewrite === 'string') &&
    (job === null || (isRecord(job) && hasCounts(job, ['required_skills_total', 'required_skills_detected', 'responsibilities_total', 'responsibilities_matched', 'keywords_total', 'keywords_detected']) &&
      typeof job.experience_relevance === 'number' && job.experience_relevance >= 0 && job.experience_relevance <= 1 &&
      isStringArray(job.strengths) && isStringArray(job.gaps)))
  );
}
