import { inflateRawSync } from "node:zlib";
import { CrmError } from "./core.ts";

export const MAX_FILE = 5 * 1024 * 1024;
export function fileMetadata(name: unknown, size: unknown, kind = "cv") {
  if (
    typeof name !== "string" ||
    name.length > 180 ||
    typeof size !== "number" ||
    size < 100 ||
    size > MAX_FILE
  )
    throw new CrmError("Fichier requis, 5 Mo maximum.");
  const ext = name.split(".").pop()?.toLowerCase();
  const allowed =
    kind === "cv"
      ? ["pdf", "docx"]
      : kind === "cv_word"
        ? ["docx"]
        : kind === "tracker"
          ? ["xlsx", "pdf"]
          : ["pdf"];
  if (!ext || !allowed.includes(ext))
    throw new CrmError(`Formats acceptés : ${allowed.join(", ")}.`);
  return {
    name: name.replace(/[^\p{L}\p{N} ._-]/gu, "-"),
    size,
    ext,
    mime:
      ext === "pdf"
        ? "application/pdf"
        : ext === "docx"
          ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
}
/** Inspect ZIP directory, bounds, compression, XML structure; never extract to disk. */
function validateOffice(bytes: Buffer, ext: string) {
  let eocd = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--)
    if (bytes.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  if (eocd < 0) throw new Error();
  const count = bytes.readUInt16LE(eocd + 10),
    offset = bytes.readUInt32LE(eocd + 16);
  if (
    !count ||
    count > 500 ||
    bytes.readUInt16LE(eocd + 4) ||
    bytes.readUInt16LE(eocd + 6)
  )
    throw new Error();
  let cursor = offset,
    total = 0;
  const files = new Map<string, string>();
  for (let n = 0; n < count; n++) {
    if (cursor + 46 > eocd || bytes.readUInt32LE(cursor) !== 0x02014b50)
      throw new Error();
    const method = bytes.readUInt16LE(cursor + 10),
      packed = bytes.readUInt32LE(cursor + 20),
      unpacked = bytes.readUInt32LE(cursor + 24),
      nameLen = bytes.readUInt16LE(cursor + 28),
      extra = bytes.readUInt16LE(cursor + 30),
      comment = bytes.readUInt16LE(cursor + 32),
      local = bytes.readUInt32LE(cursor + 42);
    const name = bytes
      .subarray(cursor + 46, cursor + 46 + nameLen)
      .toString("utf8");
    total += unpacked;
    if (
      total > 30 * 1024 * 1024 ||
      unpacked > 8 * 1024 * 1024 ||
      bytes.readUInt16LE(cursor + 8) & 1 ||
      ![0, 8].includes(method) ||
      /(^\/|\.\.|vbaProject|embeddings\/|\.exe$|\.js$)/i.test(name) ||
      files.has(name)
    )
      throw new Error();
    if (local + 30 > offset || bytes.readUInt32LE(local) !== 0x04034b50)
      throw new Error();
    const start =
      local +
      30 +
      bytes.readUInt16LE(local + 26) +
      bytes.readUInt16LE(local + 28);
    if (start + packed > offset) throw new Error();
    const payload =
      method === 8
        ? inflateRawSync(bytes.subarray(start, start + packed), {
            maxOutputLength: 8 * 1024 * 1024,
          })
        : bytes.subarray(start, start + packed);
    if (payload.length !== unpacked) throw new Error();
    const xml =
      name.endsWith(".xml") || name.endsWith(".rels")
        ? payload.toString("utf8")
        : "";
    if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error();
    for (const rel of xml.matchAll(/<Relationship\b[^>]*>/g)) {
      if (
        /TargetMode\s*=\s*["']External/i.test(rel[0]) &&
        (!/Type=["'][^"']*\/hyperlink["']/.test(rel[0]) ||
          !/Target=["']https:\/\//i.test(rel[0]))
      )
        throw new Error();
    }
    files.set(name, xml);
    cursor += 46 + nameLen + extra + comment;
  }
  if (
    !files.has("[Content_Types].xml") ||
    (ext === "docx"
      ? !/<w:document[\s>]/.test(files.get("word/document.xml") || "")
      : !files.has("xl/workbook.xml"))
  )
    throw new Error();
}
export function validateFile(
  bytes: Buffer,
  meta: ReturnType<typeof fileMetadata>,
) {
  try {
    if (bytes.length !== meta.size) throw new Error();
    if (meta.ext === "pdf") {
      const raw = bytes.toString("latin1");
      if (
        !raw.startsWith("%PDF-") ||
        !/%%EOF\s*$/.test(raw.slice(-2048)) ||
        !/\/Type\s*\/Page\b/.test(raw) ||
        /\/(JavaScript|JS|Launch|EmbeddedFile|Encrypt|OpenAction)\b/.test(raw)
      )
        throw new Error();
    } else validateOffice(bytes, meta.ext);
  } catch {
    throw new CrmError(
      "Document invalide, chiffré ou contenant des éléments actifs. Exportez une nouvelle version PDF ou DOCX.",
    );
  }
}
