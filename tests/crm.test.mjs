import test from "node:test";
import assert from "node:assert/strict";
import {
  addBusinessHours,
  DEFAULT_HOURS,
  validateIntake,
  verifyCapture,
  validateHours,
} from "../src/lib/crm/core.ts";
import { fileMetadata, validateFile } from "../src/lib/crm/files.ts";
import { reportPdf } from "../src/lib/crm/report-pdf.ts";
const candidate = {
  name: "Test Person",
  email: "TEST@example.com",
  current_status: "En poste",
  objective: "Responsable marketing",
  markets: ["France", "Canada"],
  privacy: true,
};
test("intake requires consent, target markets, objective and identity; optional marketing is never inferred", () => {
  const v = validateIntake(candidate);
  assert.equal(v.email, "test@example.com");
  assert.equal(v.marketing, false);
  assert.equal(v.kind, "diagnostic");
  for (const bad of [
    { privacy: false },
    { markets: [] },
    { objective: "" },
    { email: "invalid" },
    { linkedin: "javascript:alert(1)" },
    { kind: "service", service_id: "fake" },
  ])
    assert.throws(() => validateIntake({ ...candidate, ...bad }));
  assert.deepEqual(
    validateIntake({ ...candidate, markets: ["France", "France", "unknown"] })
      .markets,
    ["France"],
  );
});
test("business SLA skips evenings and weekends and follows Paris winter/summer offsets", () => {
  assert.equal(
    addBusinessHours(
      new Date("2026-10-23T14:00:00Z"),
      3,
      DEFAULT_HOURS,
    ).toISOString(),
    "2026-10-26T09:00:00.000Z",
  );
  assert.equal(
    addBusinessHours(
      new Date("2026-03-27T15:00:00Z"),
      3,
      DEFAULT_HOURS,
    ).toISOString(),
    "2026-03-30T08:00:00.000Z",
  );
  assert.equal(
    addBusinessHours(
      new Date("2026-10-26T08:00:00Z"),
      27,
      DEFAULT_HOURS,
    ).toISOString(),
    "2026-10-28T17:00:00.000Z",
  );
  assert.throws(() => validateHours({ ...DEFAULT_HOURS, days: [] }));
  assert.throws(() => validateHours({ ...DEFAULT_HOURS, start: 19, end: 18 }));
  assert.throws(() => addBusinessHours(new Date(), NaN, DEFAULT_HOURS));
});
test("payment requires matching beneficiary, immutable order reference, capture status, amount and currency", () => {
  const stored = { id: "internal", amount: 35, currency: "EUR" };
  const order = {
    id: "paypal",
    status: "COMPLETED",
    purchase_units: [
      {
        custom_id: "internal",
        payee: { merchant_id: "merchant" },
        payments: {
          captures: [
            {
              id: "capture",
              status: "COMPLETED",
              amount: { currency_code: "EUR", value: "35.00" },
            },
          ],
        },
      },
    ],
  };
  assert.equal(verifyCapture(stored, order, "merchant").id, "capture");
  for (const change of [
    (o) => (o.status = "APPROVED"),
    (o) => (o.purchase_units[0].payee.merchant_id = "wrong"),
    (o) => (o.purchase_units[0].custom_id = "other"),
    (o) => (o.purchase_units[0].payments.captures[0].amount.value = "0.01"),
    (o) =>
      (o.purchase_units[0].payments.captures[0].amount.currency_code = "USD"),
    (o) => (o.purchase_units[0].payments.captures[0].status = "PENDING"),
  ]) {
    const copy = structuredClone(order);
    change(copy);
    assert.throws(() => verifyCapture(stored, copy, "merchant"));
  }
  assert.throws(() => verifyCapture(stored, order, ""));
});
test("uploads reject oversize, spoofed Office containers, truncated/encrypted/active PDFs and mismatched lengths", () => {
  assert.throws(() => fileMetadata("cv.doc", 1000));
  assert.throws(() => fileMetadata("cv.pdf", 5 * 1024 * 1024 + 1));
  const valid = Buffer.from(
    "%PDF-1.4\n1 0 obj << /Type /Page >> endobj\n" +
      " ".repeat(120) +
      "\n%%EOF\n",
  );
  const meta = fileMetadata("cv.pdf", valid.length);
  assert.doesNotThrow(() => validateFile(valid, meta));
  assert.throws(() => validateFile(Buffer.from("%PDF broken"), meta));
  for (const marker of ["/JavaScript", "/Encrypt", "/EmbeddedFile"]) {
    const bad = Buffer.from(
      valid
        .toString()
        .replace(" ".repeat(120), marker + " ".repeat(120 - marker.length)),
    );
    assert.throws(() => validateFile(bad, meta));
  }
  const zip = Buffer.alloc(150);
  zip.write("PK\x03\x04");
  assert.throws(() => validateFile(zip, fileMetadata("cv.docx", zip.length)));
});
test("human-authored PDF exporter escapes injected syntax, preserves accents and paginates", () => {
  const pdf = reportPdf(
    "Élodie (test)",
    "Objectif\n" +
      "Recommandations vérifiées, expérience et adéquation au marché.\n".repeat(
        100,
      ) +
      "(test)\\)",
    new Date("2026-10-28T10:00:00Z"),
  );
  assert.doesNotThrow(() =>
    validateFile(pdf, fileMetadata("report.pdf", pdf.length, "report")),
  );
  assert.match(pdf.toString("latin1"), /\/Count 3/);
  assert.match(pdf.toString("latin1"), /\\\(test\\\)/);
});
