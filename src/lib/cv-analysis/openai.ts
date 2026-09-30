import { CV_OBSERVATIONS_SCHEMA, validateCvObservations } from './schema.ts';
import type { CvObservations } from './types.ts';
import type { EscoContext } from './esco.ts';

export const MAX_OUTPUT_TOKENS = 3500;
export const PRIMARY_MODEL = 'gpt-6-luna';
export const FALLBACK_MODEL = 'gpt-6-sol';

export type CvModelErrorKind =
  | 'authentication'
  | 'configuration'
  | 'invalid'
  | 'permission'
  | 'quota'
  | 'rate_limit'
  | 'timeout'
  | 'unavailable';

type CvInput =
  | { kind: 'text'; text: string }
  | { kind: 'file'; filename: string; mimeType: string; bytes: Uint8Array };

type AnalyzeOptions = {
  input: CvInput;
  targetRole: string;
  jobOffer: string;
  locale: 'fr' | 'en';
  esco: EscoContext;
};

type OpenAiUsage = { input_tokens?: number; output_tokens?: number; total_tokens?: number };
type ModelResult = { observations: CvObservations; usage: OpenAiUsage };
type FetchLike = typeof fetch;

export class CvModelError extends Error {
  readonly kind: CvModelErrorKind;

  constructor(message: string, kind: CvModelErrorKind) {
    super(message);
    this.kind = kind;
  }
}

export async function analyzeCvWithModels(
  options: AnalyzeOptions,
  fetchImpl: FetchLike = fetch,
) {
  const primaryModel = process.env.CV_ANALYSIS_MODEL || PRIMARY_MODEL;
  const fallbackModel = process.env.CV_ANALYSIS_FALLBACK_MODEL || FALLBACK_MODEL;
  let first: ModelResult;

  try {
    first = await requestModel(primaryModel, options, fetchImpl);
  } catch (error) {
    if (!(error instanceof CvModelError) || !allowsFallback(error.kind)) throw error;
    const fallback = await requestModel(fallbackModel, options, fetchImpl);
    return { ...fallback, modelUsed: fallbackModel, fallbackUsed: true };
  }

  if (!first.observations.is_cv) {
    return { ...first, modelUsed: primaryModel, fallbackUsed: false };
  }

  const needsFallback = first.observations.confidence < 0.65 ||
    first.observations.document.extraction_quality === 'poor';

  if (!needsFallback) {
    return { ...first, modelUsed: primaryModel, fallbackUsed: false };
  }

  const fallback = await requestModel(fallbackModel, options, fetchImpl);
  return {
    ...fallback,
    usage: combineUsage(first.usage, fallback.usage),
    modelUsed: fallbackModel,
    fallbackUsed: true,
  };
}

async function requestModel(model: string, options: AnalyzeOptions, fetchImpl: FetchLike): Promise<ModelResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new CvModelError('OpenAI is not configured', 'configuration');
  const reasoningEffort = process.env.CV_ANALYSIS_REASONING === 'low' ? 'low' : 'low';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);
  const content: Array<Record<string, unknown>> = [
    { type: 'input_text', text: buildUserInstructions(options) },
  ];

  if (options.input.kind === 'text') {
    content.push({ type: 'input_text', text: `CV À ANALYSER:\n${options.input.text}` });
  } else {
    content.push({
      type: 'input_file',
      filename: options.input.filename,
      file_data: `data:${options.input.mimeType};base64,${Buffer.from(options.input.bytes).toString('base64')}`,
      ...(options.input.mimeType === 'application/pdf' ? { detail: 'low' } : {}),
    });
  }

  try {
    const response = await fetchImpl('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        store: false,
        reasoning: { effort: reasoningEffort },
        max_output_tokens: MAX_OUTPUT_TOKENS,
        instructions: SYSTEM_PROMPT,
        input: [{ role: 'user', content }],
        text: {
          format: {
            type: 'json_schema',
            name: 'cv_observations',
            strict: true,
            schema: CV_OBSERVATIONS_SCHEMA,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new CvModelError('OpenAI request failed', await classifyOpenAiError(response));
    }
    const raw = await response.json() as Record<string, unknown>;
    const outputText = extractOutputText(raw);
    let parsed: unknown;
    try {
      parsed = JSON.parse(outputText);
    } catch {
      throw new CvModelError('Invalid structured response', 'invalid');
    }
    if (!validateCvObservations(parsed)) {
      throw new CvModelError('Incomplete structured response', 'invalid');
    }
    return { observations: parsed, usage: usageFrom(raw.usage) };
  } catch (error) {
    if (error instanceof CvModelError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new CvModelError('OpenAI timeout', 'timeout');
    }
    throw new CvModelError('OpenAI unavailable', 'unavailable');
  } finally {
    clearTimeout(timeout);
  }
}

function allowsFallback(kind: CvModelErrorKind) {
  return kind === 'invalid';
}

async function classifyOpenAiError(response: Response): Promise<CvModelErrorKind> {
  const status = response.status;
  if (status === 401) return 'authentication';
  if (status === 403) return 'permission';
  if (status === 429) {
    const errorCode = await openAiErrorCode(response);
    return errorCode.includes('quota') || errorCode.includes('billing') || errorCode.includes('credit')
      ? 'quota'
      : 'rate_limit';
  }
  if (status >= 400 && status < 500) return 'configuration';
  return status >= 500 && status < 600 ? 'unavailable' : 'configuration';
}

async function openAiErrorCode(response: Response) {
  try {
    const payload = await response.clone().json() as Record<string, unknown>;
    const error = payload.error && typeof payload.error === 'object'
      ? payload.error as Record<string, unknown>
      : {};
    return [error.type, error.code, error.message]
      .filter((value): value is string => typeof value === 'string')
      .join(' ')
      .toLowerCase();
  } catch {
    return '';
  }
}

function extractOutputText(raw: Record<string, unknown>) {
  if (typeof raw.output_text === 'string') return raw.output_text;
  const output = Array.isArray(raw.output) ? raw.output : [];
  for (const item of output) {
    if (!item || typeof item !== 'object') continue;
    const content = Array.isArray((item as Record<string, unknown>).content)
      ? (item as Record<string, unknown>).content as unknown[]
      : [];
    for (const part of content) {
      if (part && typeof part === 'object' && typeof (part as Record<string, unknown>).text === 'string') {
        return (part as Record<string, unknown>).text as string;
      }
    }
  }
  throw new CvModelError('Missing structured response', 'invalid');
}

function usageFrom(value: unknown): OpenAiUsage {
  if (!value || typeof value !== 'object') return {};
  const usage = value as Record<string, unknown>;
  return {
    input_tokens: numberValue(usage.input_tokens),
    output_tokens: numberValue(usage.output_tokens),
    total_tokens: numberValue(usage.total_tokens),
  };
}

function numberValue(value: unknown) {
  return typeof value === 'number' ? value : undefined;
}

function combineUsage(first: OpenAiUsage, second: OpenAiUsage): OpenAiUsage {
  const sum = (a?: number, b?: number) =>
    a === undefined && b === undefined ? undefined : (a || 0) + (b || 0);
  return {
    input_tokens: sum(first.input_tokens, second.input_tokens),
    output_tokens: sum(first.output_tokens, second.output_tokens),
    total_tokens: sum(first.total_tokens, second.total_tokens),
  };
}

function buildUserInstructions(options: AnalyzeOptions) {
  const jobOffer = options.jobOffer.trim();
  const escoSkills = options.esco.skills.slice(0, 20);
  const layoutAssessable = options.input.kind === 'file' && options.input.mimeType === 'application/pdf';
  return [
    `Interface language: ${options.locale}.`,
    `Input mode: ${options.input.kind}. Layout assessable: ${layoutAssessable}. Set layout_assessable to this exact value.`,
    `Target role supplied: ${options.targetRole.trim() || 'none'}.`,
    `ESCO occupation: ${options.esco.occupation || 'none'}.`,
    `Reduced ESCO skills: ${escoSkills.length ? escoSkills.join(' | ') : 'none'}.`,
    jobOffer ? `REAL JOB OFFER PROVIDED. job_match_observations MUST be populated:\n${jobOffer}` : 'No job offer. job_match_observations MUST be null.',
    'Return factual observations only. The application calculates all scores.',
  ].join('\n');
}

const SYSTEM_PROMPT = `You analyze resumes conservatively and return only the required JSON.
Never invent a job, employer, diploma, skill, result, number, duration, or certification.
Evidence and detected skills must appear in the resume. If a rewrite needs missing data, use [à compléter] or [résultat réel à compléter]. Never insert a plausible metric.
Treat ESCO skills as role references, not candidate facts. A missing ESCO skill means only that it was not detected in the resume.
If the input is clearly not a resume, set is_cv=false, use empty arrays and zero counts; do not force resume facts.
If no real job offer is supplied, job_match_observations must be null. Do not output an ATS score or hiring probability.
For pasted text, layout_assessable must be false. Keep strengths and issues concise, evidence-based, and in the interface language.`;
