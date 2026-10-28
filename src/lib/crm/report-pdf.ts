// Small, deterministic PDF exporter for human-authored reports; no analysis/scoring service.
const special: Record<string, number> = {
  "€": 128,
  "‚": 130,
  ƒ: 131,
  "„": 132,
  "…": 133,
  "†": 134,
  "‡": 135,
  ˆ: 136,
  "‰": 137,
  Š: 138,
  "‹": 139,
  Œ: 140,
  Ž: 142,
  "‘": 145,
  "’": 146,
  "“": 147,
  "”": 148,
  "•": 149,
  "–": 150,
  "—": 151,
  "˜": 152,
  "™": 153,
  š: 154,
  "›": 155,
  œ: 156,
  ž: 158,
  Ÿ: 159,
};
function pdfText(text: string) {
  return [...text]
    .map((c) => {
      const code = special[c] ?? c.charCodeAt(0);
      if (["\\", "(", ")"].includes(c)) return `\\${c}`;
      if (code > 255) return "?";
      if (code < 32 || code > 126)
        return `\\${code.toString(8).padStart(3, "0")}`;
      return c;
    })
    .join("");
}
function width(text: string) {
  return (
    ([...text].reduce(
      (n, c) =>
        n +
        ("ilI.,:;!|' ".includes(c)
          ? 280
          : "mwMW@%".includes(c)
            ? 900
            : /[A-Z]/.test(c)
              ? 670
              : 540),
      0,
    ) *
      10) /
    1000
  );
}
function wrap(text: string) {
  const lines: string[] = [];
  for (const paragraph of text.replace(/\r/g, "").split("\n")) {
    let line = "";
    for (const word of paragraph.split(/\s+/)) {
      if (width(`${line} ${word}`) > 485 && line) {
        lines.push(line);
        line = "";
      }
      let rest = word;
      while (width(rest) > 485) {
        let at = 1;
        while (at < rest.length && width(rest.slice(0, at + 1)) <= 485) at++;
        lines.push(rest.slice(0, at));
        rest = rest.slice(at);
      }
      line += (line ? " " : "") + rest;
    }
    lines.push(line);
  }
  return lines;
}
export function reportPdf(
  name: string,
  body: string,
  created = new Date(),
): Buffer {
  const lines = wrap(body),
    pages: string[][] = [];
  for (let i = 0; i < lines.length; i += 43) pages.push(lines.slice(i, i + 43));
  if (!pages.length) pages.push([""]);
  const objects: string[] = [
    "",
    "",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
  ];
  const kids: number[] = [];
  for (let i = 0; i < pages.length; i++) {
    const pageId = objects.length + 1,
      contentId = pageId + 1;
    kids.push(pageId);
    const header = `0.075 0.224 0.376 rg BT /F1 17 Tf 50 790 Td (${pdfText("TALENTIQUES")}) Tj ET\n0.05 0.84 0.92 RG 2 w 50 772 m 545 772 l S\n0.075 0.224 0.376 rg BT /F1 14 Tf 50 744 Td (${pdfText("Diagnostic CV — Rapport personnalisé")}) Tj ET\nBT /F1 10 Tf 50 722 Td (${pdfText(name.slice(0, 80))}) Tj ET\n`;
    const content =
      header +
      `0.12 0.18 0.25 rg BT /F1 10 Tf 15 TL 50 688 Td\n` +
      pages[i].map((l, n) => `${n ? "T* " : ""}(${pdfText(l)}) Tj`).join("\n") +
      `\nET\n0.4 0.46 0.54 rg BT /F1 8 Tf 50 35 Td (${pdfText(`Rapport contrôlé humainement · ${created.toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" })} · ${i + 1}/${pages.length}`)}) Tj ET`;
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`,
    );
    objects.push(
      `<< /Length ${Buffer.byteLength(content, "latin1")} >>\nstream\n${content}\nendstream`,
    );
  }
  objects[0] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[1] = `<< /Type /Pages /Kids [${kids.map((k) => `${k} 0 R`).join(" ")}] /Count ${kids.length} >>`;
  let output = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  const offsets = [0];
  objects.forEach((o, i) => {
    offsets.push(Buffer.byteLength(output, "latin1"));
    output += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = Buffer.byteLength(output, "latin1");
  output +=
    `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n` +
    offsets
      .slice(1)
      .map((o) => `${String(o).padStart(10, "0")} 00000 n \n`)
      .join("") +
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(output, "latin1");
}
