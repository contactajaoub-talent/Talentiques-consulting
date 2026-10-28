import assert from "node:assert/strict";
import { test } from "node:test";
import { MARKET_OPTIONS, validateIntake, CrmError } from "../src/lib/crm/core.ts";
const base = {
  name: "Exemple Client", email: "person@example.com", current_status: "Étudiant",
  objective: "Recherche d'une alternance", privacy: true, markets: ["Marché français"],
};
test("marchés principaux ordonnés et traduits", () => {
  const primary = MARKET_OPTIONS.filter((m) => m.group === "primary");
  assert.deepEqual(primary.map((m) => m.value), [
    "Marché français", "Marché suisse", "Marché canadien", "Marché belge", "Marché luxembourgeois",
  ]);
  assert.deepEqual(primary.map((m) => m.en), [
    "French market", "Swiss market", "Canadian market", "Belgian market", "Luxembourg market",
  ]);
});
test("sous-menu Afrique limité aux six pays demandés", () => {
  assert.deepEqual(MARKET_OPTIONS.filter((m) => m.group === "africa").map((m) => m.value), [
    "Marché marocain", "Marché tunisien", "Marché ivoirien",
    "Marché sénégalais", "Marché malgache", "Marché camerounais",
  ]);
});
test("autres régions dans l'ordre demandé, sans entrée emiratie individuelle", () => {
  assert.deepEqual(MARKET_OPTIONS.filter((m) => m.group === "regional").map((m) => m.value), [
    "Moyen-Orient", "International francophone", "International anglophone",
  ]);
  assert.equal(MARKET_OPTIONS.some((m) => m.value === "Marché émirati (UAE)"), false);
  assert.equal(MARKET_OPTIONS.length, 14);
});
test("un pays libre non référencé est conservé", () => {
  const data = validateIntake({ ...base, markets: ["Marché français", "Marché rwandais"] });
  assert.deepEqual(data.markets, ["Marché français", "Marché rwandais"]);
});
test("ancien marché et doublon sont compatibles", () => {
  const data = validateIntake({ ...base, markets: ["France", " France ", "marché belge", "Marché belge"] });
  assert.deepEqual(data.markets, ["France", "Marché belge"]);
});
test("marchés excessifs et injection refusés", () => {
  for (const markets of [[], ["<script>"], Array.from({ length: 9 }, (_, i) => `Marché ${i}`), ["A".repeat(81)], [{ name: "France" }]]) {
    assert.throws(() => validateIntake({ ...base, markets }), CrmError);
  }
});
