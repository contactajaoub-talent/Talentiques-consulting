import type { Prospect } from './types';
import { normalizeEmail, normalizeLinkedIn, normalizePhone } from './mappers.ts';

export type DuplicateMatch = { prospect: Prospect; fields: Array<'linkedin' | 'email' | 'phone'> };

export function detectDuplicates(prospects: Prospect[], input: { linkedinUrl?: string; email?: string; phone?: string }): DuplicateMatch[] {
  const linkedin = input.linkedinUrl ? normalizeLinkedIn(input.linkedinUrl) : '';
  const email = input.email ? normalizeEmail(input.email) : '';
  const phone = input.phone ? normalizePhone(input.phone) : '';
  return prospects.flatMap((prospect) => {
    const fields: DuplicateMatch['fields'] = [];
    if (linkedin && normalizeLinkedIn(prospect.linkedinUrl) === linkedin) fields.push('linkedin');
    if (email && normalizeEmail(prospect.email) === email) fields.push('email');
    if (phone && normalizePhone(prospect.phone) === phone) fields.push('phone');
    return fields.length ? [{ prospect, fields }] : [];
  });
}
