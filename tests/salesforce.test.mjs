import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getSalesforceOfferFields,
  SAFE_OFFER_RESOURCE_VALUES,
  SALESFORCE,
} from '../src/lib/salesforce.ts';
import { getServiceOffer } from '../src/lib/services/catalog.ts';

const f = SALESFORCE.fields;

function offerFields(overrides = {}) {
  return getSalesforceOfferFields({
    isCareerApplication: false,
    typeDemande: 'Optimisation',
    offreRessource: '',
    nomRessource: '',
    montantPrevu: '',
    statutPaiement: '',
    ...overrides,
  });
}

test('dynamic service uses the Salesforce text field and keeps payment details', () => {
  const fields = offerFields({
    offreRessource: 'Valorisation professionnelle complète',
    nomRessource: 'Valorisation professionnelle complète',
    montantPrevu: '45.00',
    statutPaiement: 'Paiement en attente',
  });

  assert.equal(
    fields[f.nomRessource],
    'Valorisation professionnelle complète',
  );
  assert.equal(fields[f.offreRessource], undefined);
  assert.equal(fields[f.montantPrevu], '45.00');
  assert.equal(fields[f.statutPaiement], 'Paiement en attente');
});

test('legacy allowlisted offer resource is still sent to Salesforce', () => {
  const fields = offerFields({ offreRessource: 'Diagnostic CV' });

  assert.equal(fields[f.offreRessource], 'Diagnostic CV');
  assert.deepEqual(SAFE_OFFER_RESOURCE_VALUES, [
    'Contact général',
    'Diagnostic CV',
    'Accompagnement Total',
  ]);
});

test('unknown offer resource is ignored by the server mapping', () => {
  const fields = offerFields({ offreRessource: 'Future arbitrary offer' });

  assert.equal(fields[f.offreRessource], undefined);
});

test('recruitment mapping keeps restricted commercial picklists out', () => {
  const fields = offerFields({
    isCareerApplication: true,
    typeDemande: 'Recrutement',
    offreRessource: 'Diagnostic CV',
    nomRessource: 'Business developer',
  });

  assert.equal(fields[f.typeDemande], undefined);
  assert.equal(fields[f.offreRessource], undefined);
  assert.equal(fields[f.nomRessource], 'Business developer');
});

test('French and English dynamic service names remain available as text', () => {
  for (const market of ['fr', 'en']) {
    for (const serviceId of ['professional-profile', 'student-jobseeker']) {
      const service = getServiceOffer(serviceId, market);
      const fields = offerFields({
        offreRessource: service.name,
        nomRessource: service.name,
      });

      assert.equal(fields[f.nomRessource], service.name);
      assert.equal(fields[f.offreRessource], undefined);
    }
  }
});
