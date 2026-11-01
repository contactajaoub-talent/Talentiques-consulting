import { serializeCareerQuote, validateCareerQuote } from './career-quote.ts';

export type QuoteAttempt = {
  fingerprint: string; uploadId: string; token: string;
  uploadUrl?: string; mime?: string; uploaded?: boolean;
};
type State = { current: QuoteAttempt | null };
type SavedQuote = { requestId: string; documentId: string; committed?: boolean };
const endpoint = '/api/crm/career-quote';

async function checked(response: Response) {
  const result = await response.json();
  if (!response.ok) {
    const error = new Error(result.error || 'Envoi impossible. Réessayez sans fermer le formulaire.');
    Object.assign(error, { status: response.status });
    throw error;
  }
  return result;
}
function confirmed(result: SavedQuote) {
  if (!result.requestId || !result.documentId) throw new Error('L’enregistrement de votre demande et du CV n’a pas pu être confirmé. Réessayez.');
  return result;
}

/** Keep a single upload capability across retries, including a lost init/commit response. */
export async function submitCareerQuote(data: FormData, state: State, send: typeof fetch = fetch) {
  const { cv } = validateCareerQuote(data);
  const body = serializeCareerQuote(data);
  const fileHash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', await cv.arrayBuffer()))].map(b => b.toString(16).padStart(2, '0')).join('');
  const fingerprint = JSON.stringify({ ...body, filename: cv.name, size: cv.size, fileHash });
  if (!state.current || state.current.fingerprint !== fingerprint) {
    const token = [...crypto.getRandomValues(new Uint8Array(32))].map(b => b.toString(16).padStart(2, '0')).join('');
    state.current = { fingerprint, uploadId: crypto.randomUUID(), token };
  }
  const attempt = state.current;
  try {
    if (!attempt.uploadUrl) {
      const init = await checked(await send(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, website: data.get('website') || '', filename: cv.name, size: cv.size, uploadId: attempt.uploadId, token: attempt.token }),
      }));
      if (init.committed) return confirmed(init);
      attempt.uploadUrl = init.uploadUrl; attempt.mime = init.mime;
    }
    if (!attempt.uploadUrl || !attempt.mime) throw new Error('Le dépôt privé n’a pas pu être préparé. Réessayez.');
    if (!attempt.uploaded) {
      const response = await send(attempt.uploadUrl, { method: 'PUT', headers: { 'Content-Type': attempt.mime, 'x-upsert': 'false' }, body: cv });
      if (!response.ok) {
        // A PUT may have succeeded even when its response was lost. Never overwrite that object.
        const result = await response.json().catch(() => ({}));
        if (response.status !== 409 && String(result.statusCode) !== '409' && result.error !== 'Duplicate')
          throw new Error('Le dépôt privé du CV a échoué. Réessayez sans fermer le formulaire.');
      }
      attempt.uploaded = true;
    }
    return confirmed(await checked(await send(endpoint, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uploadId: attempt.uploadId, token: attempt.token }),
    })));
  } catch (error) {
    if (error instanceof Error && 'status' in error && error.status === 410) state.current = null;
    throw error;
  }
}
