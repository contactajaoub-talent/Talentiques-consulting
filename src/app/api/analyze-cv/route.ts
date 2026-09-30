import { checkBotId } from 'botid/server';
import { NextResponse } from 'next/server';
import { executeCvAnalysisRequest } from '@/lib/cv-analysis/endpoint';
import { fetchEscoContext } from '@/lib/cv-analysis/esco';
import { analyzeCvWithModels } from '@/lib/cv-analysis/openai';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const response = await executeCvAnalysisRequest(request, {
    checkBotId,
    fetchEscoContext,
    analyzeCvWithModels,
  });

  return NextResponse.json(response.body, { status: response.status });
}
