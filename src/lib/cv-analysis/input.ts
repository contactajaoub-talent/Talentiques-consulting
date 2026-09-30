export const MAX_CV_FILE_SIZE = 5 * 1024 * 1024;
export const MAX_PASTED_TEXT_LENGTH = 50_000;
export const MAX_JOB_OFFER_LENGTH = 20_000;
export const MIN_CV_FILE_SIZE = 100;

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
    if (file.size < MIN_CV_FILE_SIZE) return { ok: false, error: 'Le fichier ne contient pas un CV exploitable.' };
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (!hasValidSignature(extension, bytes)) {
        return { ok: false, error: 'Le fichier ne contient pas un CV exploitable.' };
      }
      return {
        ok: true,
        input: { kind: 'file', filename: file.name.slice(-120), mimeType, bytes },
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

function hasValidSignature(extension: string, bytes: Uint8Array) {
  if (extension === 'pdf') return startsWith(bytes, [0x25, 0x50, 0x44, 0x46, 0x2d]);
  if (extension === 'doc') return startsWith(bytes, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
  if (extension === 'docx') return startsWith(bytes, [0x50, 0x4b, 0x03, 0x04]);
  if (extension === 'txt') {
    return new TextDecoder('utf-8', { fatal: false }).decode(bytes).trim().length >= 100;
  }
  return false;
}

function startsWith(bytes: Uint8Array, signature: number[]) {
  return signature.every((value, index) => bytes[index] === value);
}

function clean(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : '';
}
