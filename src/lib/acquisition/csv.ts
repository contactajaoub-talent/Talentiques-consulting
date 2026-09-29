export const csvFields = ['first_name','last_name','linkedin_url','email','phone','country','city','language','job_title','company','source','campaign'] as const;
export type CsvField = (typeof csvFields)[number];

export function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [], cell = '', quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"' && quoted && text[index + 1] === '"') { cell += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { row.push(cell.trim()); cell = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) { if (char === '\r' && text[index + 1] === '\n') index += 1; row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); row = []; cell = ''; }
    else cell += char;
  }
  row.push(cell.trim()); if (row.some(Boolean)) rows.push(row);
  const headers = (rows.shift() ?? []).map((value) => value.replace(/^\uFEFF/, '').trim());
  return { headers, rows };
}

export function mapCsvRows(headers: string[], rows: string[][], mapping: Record<string, string>) {
  return rows.map((row) => Object.fromEntries(headers.flatMap((header, index) => mapping[header] ? [[mapping[header], row[index] ?? '']] : [])));
}
