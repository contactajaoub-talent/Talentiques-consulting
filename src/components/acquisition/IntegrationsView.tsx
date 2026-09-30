'use client';

import { Cable, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { StatusBadge } from './ui';

type IntegrationStatus = {
  supabase: boolean;
  openai: boolean;
  apollo: boolean;
  gmail: boolean;
  whatsapp: boolean;
};

const emptyStatus: IntegrationStatus = {
  supabase: false,
  openai: false,
  apollo: false,
  gmail: false,
  whatsapp: false,
};

export function IntegrationsView() {
  const [status, setStatus] = useState<IntegrationStatus>(emptyStatus);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetch('/api/acquisition/integrations/status', {
      cache: 'no-store',
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Impossible de lire les intégrations.');
        return response.json() as Promise<IntegrationStatus>;
      })
      .then((data) => {
        if (active) setStatus(data);
      })
      .catch(() => {
        if (active) setStatus(emptyStatus);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const integrations = [
    {
      key: 'supabase' as const,
      name: 'Supabase',
      detail: 'Base PostgreSQL utilisée par Acquisition OS.',
    },
    {
      key: 'openai' as const,
      name: 'OpenAI',
      detail: 'Qualification, personnalisation et suggestions assistées par IA.',
    },
    {
      key: 'apollo' as const,
      name: 'Apollo',
      detail: 'Enrichissement contrôlé des données prospects.',
    },
    {
      key: 'gmail' as const,
      name: 'Gmail',
      detail: 'Lecture et envoi d’e-mails à connecter ultérieurement.',
    },
    {
      key: 'whatsapp' as const,
      name: 'WhatsApp',
      detail: 'Ouverture manuelle disponible, API à connecter ultérieurement.',
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-56 items-center justify-center rounded-3xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
          <Loader2 className="animate-spin" size={18} />
          Vérification des intégrations…
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {integrations.map((integration) => {
        const connected = status[integration.key];

        return (
          <div
            key={integration.key}
            className="rounded-3xl border border-slate-200 bg-white p-6"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-[#0683C9]">
                <Cable size={20} />
              </span>

              <StatusBadge value={connected ? 'Connecté' : 'Non connecté'} />
            </div>

            <h2 className="mt-5 font-heading text-xl font-bold">
              {integration.name}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {integration.detail}
            </p>

            <div
              className={`mt-5 inline-flex rounded-xl border px-4 py-2 text-sm font-bold ${
                connected
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 text-slate-400'
              }`}
            >
              {connected ? 'Configuré côté serveur' : 'Configuration requise'}
            </div>
          </div>
        );
      })}
    </div>
  );
}