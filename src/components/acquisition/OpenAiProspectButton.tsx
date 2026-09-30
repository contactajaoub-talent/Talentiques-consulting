'use client';

import {
  BrainCircuit,
  Check,
  Clipboard,
  Loader2,
  Mail,
  MessageSquareText,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import type { Prospect } from '@/lib/acquisition/types';
import { useProspect } from './AcquisitionProvider';

type AiResult = {
  ok?: boolean;
  model?: string;
  patch?: Partial<Prospect>;
  qualification?: {
    summary: string;
    score: number;
    scoreReason: string;
  };
  recommendation?: {
    id: string;
    name: string;
    reason: string;
    confidence: number;
  } | null;
  drafts?: {
    linkedinMessage: string;
    linkedinFollowUp: string;
    emailSubject: string;
    emailBody: string;
  };
  error?: string;
};

function CopyButton({
  text,
  label,
}: {
  text: string;
  label: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <button
      type="button"
      onClick={() => void copy()}
      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold"
    >
      {copied ? <Check size={14} /> : <Clipboard size={14} />}
      {copied ? 'Copié' : label}
    </button>
  );
}

export function OpenAiProspectButton({
  prospect,
}: {
  prospect: Prospect;
}) {
  const { updateProspect } = useProspect(prospect.id);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiResult | null>(null);
  const [error, setError] = useState('');

  async function analyze() {
    if (loading) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        '/api/acquisition/integrations/openai/analyze',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prospectId: prospect.id,
          }),
        },
      );

      const data = await response.json() as AiResult;

      if (!response.ok) {
        throw new Error(data.error || 'Analyse OpenAI impossible.');
      }

      if (data.patch) {
        const saved = await updateProspect(
          prospect.id,
          data.patch,
          {
            type: 'status',
            label: 'Prospect qualifié avec OpenAI',
            detail:
              data.qualification
                ? `Score IA suggéré : ${data.qualification.score}/100`
                : undefined,
          },
        );

        if (!saved) {
          throw new Error(
            'Analyse terminée, mais la qualification n’a pas pu être enregistrée.',
          );
        }
      }

      setResult(data);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Analyse OpenAI impossible.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full sm:w-auto">
      <button
        type="button"
        disabled={loading}
        onClick={() => void analyze()}
        className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-bold text-[#0683C9] transition hover:bg-sky-100 disabled:cursor-wait disabled:opacity-60"
      >
        {loading
          ? <Loader2 size={16} className="animate-spin" />
          : <BrainCircuit size={16} />
        }

        {loading ? 'Analyse IA…' : 'Analyser avec OpenAI'}
      </button>

      {error ? (
        <p className="mt-2 max-w-xl text-xs font-semibold text-rose-600">
          {error}
        </p>
      ) : null}

      {result?.qualification && result.drafts ? (
        <div className="mt-4 w-full max-w-3xl rounded-2xl border border-sky-100 bg-white p-5 shadow-lg">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0683C9]">
                <Sparkles size={14} />
                Qualification Talentiques IA
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-700">
                {result.qualification.summary}
              </p>
            </div>

            <div className="rounded-xl bg-slate-950 px-4 py-3 text-center text-white">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Score IA suggéré
              </p>
              <p className="mt-1 text-2xl font-black">
                {result.qualification.score}
                <span className="text-sm text-slate-400">/100</span>
              </p>
            </div>
          </div>

          <p className="mt-3 text-xs leading-5 text-slate-500">
            {result.qualification.scoreReason}
          </p>

          {result.recommendation ? (
            <div className="mt-4 rounded-xl bg-emerald-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Offre Talentiques recommandée
              </p>
              <p className="mt-1 font-bold text-slate-900">
                {result.recommendation.name}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                {result.recommendation.reason}
              </p>
            </div>
          ) : null}

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <section className="rounded-xl border border-slate-200 p-4">
              <p className="flex items-center gap-2 text-sm font-bold">
                <MessageSquareText size={16} className="text-[#0683C9]" />
                Premier message LinkedIn
              </p>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {result.drafts.linkedinMessage}
              </p>

              <div className="mt-3">
                <CopyButton
                  text={result.drafts.linkedinMessage}
                  label="Copier"
                />
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 p-4">
              <p className="flex items-center gap-2 text-sm font-bold">
                <MessageSquareText size={16} className="text-[#0683C9]" />
                Relance LinkedIn
              </p>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {result.drafts.linkedinFollowUp}
              </p>

              <div className="mt-3">
                <CopyButton
                  text={result.drafts.linkedinFollowUp}
                  label="Copier"
                />
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 p-4 md:col-span-2">
              <p className="flex items-center gap-2 text-sm font-bold">
                <Mail size={16} className="text-[#0683C9]" />
                Email suggéré
              </p>

              <p className="mt-3 text-sm font-semibold text-slate-800">
                {result.drafts.emailSubject}
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {result.drafts.emailBody}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <CopyButton
                  text={result.drafts.emailSubject}
                  label="Copier l’objet"
                />

                <CopyButton
                  text={result.drafts.emailBody}
                  label="Copier l’email"
                />
              </div>
            </section>
          </div>

          <p className="mt-4 text-[11px] text-slate-400">
            Brouillons uniquement — aucun message n’est envoyé automatiquement.
          </p>
        </div>
      ) : null}
    </div>
  );
}