'use client';

import { DatabaseZap, Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { Prospect } from '@/lib/acquisition/types';
import { useProspect } from './AcquisitionProvider';

type ApolloResponse = {
  matched?: boolean;
  applied?: boolean;
  matchConfidence?: string;
  patch?: Partial<Prospect>;
  message?: string;
  error?: string;
};

export function ApolloEnrichButton({
  prospect,
}: {
  prospect: Prospect;
}) {
  const { updateProspect } = useProspect(prospect.id);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isError, setIsError] = useState(false);

  async function enrich() {
    if (loading) return;

    setLoading(true);
    setFeedback('');
    setIsError(false);

    try {
      const response = await fetch(
        '/api/acquisition/integrations/apollo/enrich',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prospect: {
              firstName: prospect.firstName,
              lastName: prospect.lastName,
              email: prospect.email,
              linkedinUrl: prospect.linkedinUrl,
              company: prospect.company,
              jobTitle: prospect.jobTitle,
              city: prospect.city,
              country: prospect.country,
            },
          }),
        },
      );

      const result = await response.json() as ApolloResponse;

      if (!response.ok) {
        throw new Error(result.error || 'Enrichissement Apollo impossible.');
      }

      if (!result.matched || !result.applied || !result.patch) {
        setFeedback(
          result.message ||
          'Apollo n’a appliqué aucune modification.',
        );
        return;
      }

      const saved = await updateProspect(
        prospect.id,
        result.patch,
        {
          type: 'status',
          label: 'Prospect enrichi avec Apollo',
          detail: `Confiance Apollo : ${result.matchConfidence ?? 'inconnue'}`,
        },
      );

      if (!saved) {
        throw new Error(
          'Apollo a répondu, mais la mise à jour du prospect a échoué.',
        );
      }

      setFeedback(
        `Enrichissement terminé · confiance ${result.matchConfidence ?? 'inconnue'}.`,
      );
    } catch (error) {
      setIsError(true);
      setFeedback(
        error instanceof Error
          ? error.message
          : 'Enrichissement Apollo impossible.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col">
      <button
        type="button"
        disabled={loading}
        onClick={() => void enrich()}
        className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-bold text-violet-700 transition hover:bg-violet-100 disabled:cursor-wait disabled:opacity-60"
      >
        {loading
          ? <Loader2 size={16} className="animate-spin" />
          : <DatabaseZap size={16} />
        }

        {loading ? 'Enrichissement…' : 'Enrichir avec Apollo'}
      </button>

      {feedback ? (
        <span
          className={`mt-1 max-w-60 text-xs ${
            isError ? 'text-rose-600' : 'text-slate-500'
          }`}
        >
          {feedback}
        </span>
      ) : null}
    </div>
  );
}