import { createHmac } from 'node:crypto';
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { SALESFORCE } from '@/lib/salesforce';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 4 * 1024 * 1024;
const allowedExtensions = new Set(['pdf', 'doc', 'docx']);

function clean(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : '';
}

function add(
  params: URLSearchParams,
  key: string,
  value: string
) {
  if (value) {
    params.set(key, value);
  }
}

function isTruthy(value: string) {
  return (
    value === '1' ||
    value === 'true' ||
    value === 'on'
  );
}

function signedCvUrl(
  origin: string,
  pathname: string,
  secret: string
) {
  const sig = createHmac('sha256', secret)
    .update(pathname)
    .digest('hex');

  const url = new URL('/api/cv', origin);

  url.searchParams.set('pathname', pathname);
  url.searchParams.set('sig', sig);

  return url.toString();
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();

    /*
     * =========================
     * ANTI-SPAM
     * =========================
     */

    if (clean(form.get('website'))) {
      return NextResponse.json({
        ok: true,
      });
    }

    /*
     * =========================
     * DONNÉES PRINCIPALES
     * =========================
     */

    const firstName = clean(
      form.get('firstName')
    );

    const lastName = clean(
      form.get('lastName')
    );

    const email = clean(
      form.get('email')
    );

    const phone = clean(
      form.get('phone')
    );

    const country = clean(
      form.get('country')
    );

    const privacy = clean(
      form.get('privacy')
    );

    const typeDemande = clean(
      form.get('typeDemande')
    );

    const isCareerApplication =
      typeDemande === 'Recrutement';

    /*
     * =========================
     * VALIDATION
     * =========================
     */

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        {
          error:
            'Prénom, nom et e-mail sont obligatoires.',
        },
        {
          status: 400,
        }
      );
    }

    if (!isTruthy(privacy)) {
      return NextResponse.json(
        {
          error:
            'Le consentement à la politique de confidentialité est obligatoire.',
        },
        {
          status: 400,
        }
      );
    }

    /*
     * =========================
     * STOCKAGE SÉCURISÉ DU CV
     * =========================
     */

    let cvSecureUrl = '';

    const cv = form.get('cv');

    if (cv instanceof File && cv.size > 0) {
      if (cv.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error:
              'Le CV doit faire moins de 4 Mo.',
          },
          {
            status: 400,
          }
        );
      }

      const extension =
        cv.name
          .split('.')
          .pop()
          ?.toLowerCase() ?? '';

      if (!allowedExtensions.has(extension)) {
        return NextResponse.json(
          {
            error:
              'Formats acceptés : PDF, DOC ou DOCX.',
          },
          {
            status: 400,
          }
        );
      }

      const blobSecret =
        process.env.BLOB_READ_WRITE_TOKEN;

      if (!blobSecret) {
        return NextResponse.json(
          {
            error:
              'Le stockage sécurisé des CV doit être activé dans Vercel avant cet envoi.',
          },
          {
            status: 503,
          }
        );
      }

      const safeName = cv.name
        .replace(
          /[^a-zA-Z0-9._-]+/g,
          '-'
        )
        .slice(-60);

      const blob = await put(
        `cv/${Date.now()}-${safeName}`,
        cv,
        {
          access: 'private',
          addRandomSuffix: true,
          contentType:
            cv.type || undefined,
        }
      );

      cvSecureUrl = signedCvUrl(
        new URL(request.url).origin,
        blob.pathname,
        blobSecret
      );
    }

    /*
     * =========================
     * SALESFORCE
     * =========================
     */

    const p = new URLSearchParams();

    p.set(
      'oid',
      SALESFORCE.orgId
    );

    p.set(
      'retURL',
      'https://talentiques.com/'
    );

    p.set(
      'first_name',
      firstName
    );

    p.set(
      'last_name',
      lastName
    );

    p.set(
      'email',
      email
    );

    /*
     * Différenciation candidat / prospect
     */

    p.set(
      'company',
      isCareerApplication
        ? 'Candidat - TalentiQues'
        : 'Particulier - Talentiques'
    );

    p.set(
      'lead_source',
      isCareerApplication
        ? 'Carrières - Site TalentiQues'
        : 'Site TalentiQues'
    );

    add(
      p,
      'phone',
      phone
    );

    const f = SALESFORCE.fields;

    /*
     * =====================================
     * FORMULAIRES COMMERCIAUX EXISTANTS
     * =====================================
     *
     * On garde exactement leur fonctionnement.
     *
     * Pour les candidatures Carrières,
     * on évite les picklists Salesforce
     * restreintes qui provoquent les erreurs.
     */

    if (!isCareerApplication) {
      add(
        p,
        f.typeDemande,
        typeDemande
      );

      add(
        p,
        f.offreRessource,
        clean(
          form.get('offreRessource')
        )
      );

      add(
        p,
        f.statutActuel,
        clean(
          form.get('statutActuel')
        )
      );

      add(
        p,
        f.difficultePrincipale,
        clean(
          form.get('difficultePrincipale')
        )
      );

      add(
        p,
        f.anneesExperience,
        clean(
          form.get('anneesExperience')
        )
      );

      add(
        p,
        f.canalContact,
        clean(
          form.get('canalContact')
        )
      );
    }

    /*
     * =====================================
     * CHAMPS SÛRS / TEXTE
     * =====================================
     */

    add(
      p,
      f.nomRessource,
      clean(
        form.get('nomRessource')
      )
    );

    add(
      p,
      f.montantPrevu,
      clean(
        form.get('montantPrevu')
      )
    );

    add(
      p,
      f.statutPaiement,
      clean(
        form.get('statutPaiement')
      )
    );

    add(
      p,
      f.objectifProfessionnel,
      clean(
        form.get('objectifProfessionnel')
      )
    );

    add(
      p,
      f.profilLinkedIn,
      clean(
        form.get('profilLinkedIn')
      )
    );

    add(
      p,
      f.cvLienSecurise,
      cvSecureUrl
    );

    add(
      p,
      f.secteurActivite,
      clean(
        form.get('secteurActivite')
      )
    );

    add(
      p,
      f.marcheGeographique,
      clean(
        form.get('marcheGeographique')
      )
    );

    add(
      p,
      f.posteVise,
      clean(
        form.get('posteVise')
      )
    );

    add(
      p,
      f.dureeAccompagnement,
      clean(
        form.get('dureeAccompagnement')
      )
    );

    add(
      p,
      f.budgetEnvisage,
      clean(
        form.get('budgetEnvisage')
      )
    );

    add(
      p,
      f.freinPrincipal,
      clean(
        form.get('freinPrincipal')
      )
    );

    /*
     * =====================================
     * INFORMATIONS CANDIDATURE
     * =====================================
     */

    const existingAdditionalInfo =
      clean(
        form.get(
          'informationsComplementaires'
        )
      );

    const careerInformation = isCareerApplication
      ? [
          'Type : Candidature recrutement',

          clean(form.get('nomRessource'))
            ? `Poste : ${clean(
                form.get('nomRessource')
              )}`
            : '',

          country
            ? `Pays de résidence : ${country}`
            : '',

          clean(form.get('statutActuel'))
            ? `Disponibilité : ${clean(
                form.get('statutActuel')
              )}`
            : '',

          clean(form.get('difficultePrincipale'))
            ? clean(
                form.get(
                  'difficultePrincipale'
                )
              )
            : '',

          clean(form.get('anneesExperience'))
            ? `Expérience commerciale : ${clean(
                form.get(
                  'anneesExperience'
                )
              )}`
            : '',

          clean(form.get('canalContact'))
            ? `Canal de contact : ${clean(
                form.get('canalContact')
              )}`
            : '',

          existingAdditionalInfo,
        ]
          .filter(Boolean)
          .join('\n\n')
      : existingAdditionalInfo;

    add(
      p,
      f.informationsComplementaires,
      careerInformation
    );

    /*
     * =========================
     * CONSENTEMENTS
     * =========================
     */

    p.set(
      f.consentementConfidentialite,
      '1'
    );

    if (
      isTruthy(
        clean(
          form.get('marketing')
        )
      )
    ) {
      p.set(
        f.consentementMarketing,
        '1'
      );
    }

    /*
     * =========================
     * TRACKING
     * =========================
     */

    add(
      p,
      f.pageOrigine,
      clean(
        form.get('pageOrigine')
      )
    );

    add(
      p,
      f.utmSource,
      clean(
        form.get('utmSource')
      )
    );

    add(
      p,
      f.utmMedium,
      clean(
        form.get('utmMedium')
      )
    );

    add(
      p,
      f.utmCampaign,
      clean(
        form.get('utmCampaign')
      )
    );

    /*
     * =========================
     * ENVOI VERS SALESFORCE
     * =========================
     */

    const response = await fetch(
      SALESFORCE.endpoint,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/x-www-form-urlencoded',
        },

        body: p.toString(),

        redirect: 'manual',

        cache: 'no-store',
      }
    );

    if (
      response.status < 200 ||
      response.status >= 400
    ) {
      console.error(
        'Salesforce response status:',
        response.status
      );

      return NextResponse.json(
        {
          error:
            'Salesforce n’a pas accepté la demande.',
        },
        {
          status: 502,
        }
      );
    }

    return NextResponse.json({
      ok: true,

      type:
        isCareerApplication
          ? 'career'
          : 'lead',

      cvStored:
        Boolean(cvSecureUrl),
    });
  } catch (error) {
    console.error(
      'Salesforce lead error',
      error
    );

    return NextResponse.json(
      {
        error:
          'Impossible d’envoyer la demande pour le moment.',
      },
      {
        status: 500,
      }
    );
  }
}
