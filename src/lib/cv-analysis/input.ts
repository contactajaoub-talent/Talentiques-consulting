export const MAX_CV_FILE_SIZE = 5 * 1024 * 1024;
export const MAX_PASTED_TEXT_LENGTH = 50_000;
export const MAX_JOB_OFFER_LENGTH = 20_000;

const FILE_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  txt: 'text/plain',
};

export async function parseCvInput(form: FormData): Promise<
  | { ok: true; input: { kind: 'text'; text: string } | { kind: 'file'; filename: string; mimeType: string; bytes: Uint8Array } }
  | { ok: false; error: string }
> {
  const file = form.get('cvFile');
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_CV_FILE_SIZE) return { ok: false, error: 'Le fichier dépasse la limite de 5 Mo.' };
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const mimeType = FILE_TYPES[extension];
    if (!mimeType) return { ok: false, error: 'Format non supporté. Utilisez PDF, DOC, DOCX ou TXT.' };
    try {
      return {
        ok: true,
        input: { kind: 'file', filename: file.name.slice(-120), mimeType, bytes: new Uint8Array(await file.arrayBuffer()) },
      };
    } catch {
      return { ok: false, error: 'Le fichier est illisible.' };
    }
  }

  const text = clean(form.get('cvText'));
  if (text.length < 100) return { ok: false, error: 'Le CV doit contenir au moins 100 caractères.' };
  if (text.length > MAX_PASTED_TEXT_LENGTH) return { ok: false, error: 'Le texte du CV est trop long.' };
  return { ok: true, input: { kind: 'text', text } };
}

function clean(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : '';
}
