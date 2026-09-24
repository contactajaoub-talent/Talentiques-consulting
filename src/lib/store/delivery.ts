import {
  getStoreProduct,
  type StoreMarket,
  type StoreProductId,
} from '@/lib/store/catalog';
import {
  claimOrderDelivery,
  findStoreOrderById,
  updateStoreOrder,
} from '@/lib/store/supabase-rest';

type StoreOrderRow = {
  id: string;
  product_id: StoreProductId;
  market: StoreMarket;
  status: string;
  delivery_status: string;
  customer_email?: string | null;
  customer_name?: string | null;
  access_token: string;
  digital_content_consent_at?: string | null;
};

type DeliveryItem = {
  label: string;
  description: string;
  url: string;
};

function safeString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function requiredDeliveryUrl(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Lien de livraison non configuré : ${name}`);
  }

  return value;
}

function getAppUrl() {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    'https://www.talentiques.com';

  const withProtocol = /^https?:\/\//i.test(configured)
    ? configured
    : `https://${configured}`;

  return withProtocol.replace(/\/$/, '');
}

function getSecureDownloadUrl(
  token: string,
  item: 'tracker' | 'ats'
) {
  return `${getAppUrl()}/api/store/download?token=${encodeURIComponent(
    token
  )}&item=${item}`;
}

export function getDeliveryItems(
  productId: StoreProductId,
  market: StoreMarket,
  accessToken?: string
): DeliveryItem[] {
  /*
   * Marché FR
   *
   * Les fichiers sont stockés dans Vercel Blob Private.
   * On ne transmet jamais l'URL du Blob au client.
   * Le téléchargement passe par /api/store/download.
   */
  if (market === 'fr') {
    if (!accessToken) {
      throw new Error('Token de livraison manquant');
    }

    const trackerItem = (): DeliveryItem => ({
      label: 'Opportunity Tracker Pro',
      description:
        'Tracker + automatisations + guides premium. Versions française et anglaise incluses.',
      url: getSecureDownloadUrl(accessToken, 'tracker'),
    });

    const atsItem = (): DeliveryItem => ({
      label: 'CV ATS System',
      description:
        'Modèles ATS + guide CV + bonus LinkedIn. Versions française et anglaise incluses.',
      url: getSecureDownloadUrl(accessToken, 'ats'),
    });

    if (productId === 'tracker') {
      return [trackerItem()];
    }

    if (productId === 'ats') {
      return [atsItem()];
    }

    return [trackerItem(), atsItem()];
  }

  /*
   * Marché EN
   *
   * On conserve temporairement le système actuel.
   * Il sera migré vers Blob Private lorsque la version EN du Store sera lancée.
   */
  const trackerItem = (): DeliveryItem => ({
    label: 'Opportunity Tracker Pro',
    description: 'Tracker + automations + premium guides.',
    url: requiredDeliveryUrl('STORE_TRACKER_PACKAGE_EN_URL'),
  });

  const atsItem = (): DeliveryItem => ({
    label: 'ATS Resume System',
    description: 'ATS templates + resume guide + LinkedIn bonus.',
    url: requiredDeliveryUrl('STORE_ATS_PACKAGE_EN_URL'),
  });

  if (productId === 'tracker') {
    return [trackerItem()];
  }

  if (productId === 'ats') {
    return [atsItem()];
  }

  return [trackerItem(), atsItem()];
}

async function sendDeliveryEmail(
  order: StoreOrderRow,
  items: DeliveryItem[]
) {
  const apiKey = process.env.RESEND_API_KEY;

  const from =
    process.env.RESEND_FROM_EMAIL ||
    'TalentiQues <noreply@talentiques.com>';

  const email = safeString(order.customer_email).trim();

  if (!apiKey) {
    throw new Error('RESEND_API_KEY manquant');
  }

  if (!email) {
    throw new Error('Email client PayPal introuvable');
  }

  const product = getStoreProduct(
    order.product_id,
    order.market
  );

  const isFr = order.market === 'fr';

  const firstName = safeString(order.customer_name)
    .trim()
    .split(/\s+/)[0];

  const greeting = firstName
    ? isFr
      ? `Bonjour ${escapeHtml(firstName)},`
      : `Hi ${escapeHtml(firstName)},`
    : isFr
      ? 'Bonjour,'
      : 'Hi,';

  const accessUrl = `${getAppUrl()}/${
    isFr ? 'outils' : 'en/tools'
  }/acces?token=${encodeURIComponent(order.access_token)}`;

  const itemHtml = items
    .map(
      (item) => `
        <div style="margin:14px 0;padding:18px;border:1px solid #dbeafe;border-radius:16px;background:#f8fbff;">
          <div style="font-size:16px;font-weight:800;color:#0f172a;">
            ${escapeHtml(item.label)}
          </div>

          <div style="margin-top:5px;font-size:13px;line-height:1.6;color:#64748b;">
            ${escapeHtml(item.description)}
          </div>

          <a
            href="${escapeHtml(item.url)}"
            style="display:inline-block;margin-top:12px;padding:11px 16px;border-radius:999px;background:#0683c9;color:#ffffff;text-decoration:none;font-size:13px;font-weight:800;"
          >
            ${isFr ? 'Télécharger' : 'Download'}
          </a>
        </div>
      `
    )
    .join('');

  const subject = isFr
    ? `Votre accès TalentiQues - ${product.name}`
    : `Your TalentiQues access - ${product.name}`;

  const html = `
    <div style="margin:0;padding:28px;background:#f1f5f9;font-family:Arial,sans-serif;color:#0f172a;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:24px;padding:30px;border:1px solid #e2e8f0;">

        <div style="font-size:22px;font-weight:900;color:#0683c9;">
          TalentiQues
        </div>

        <h1 style="font-size:26px;line-height:1.2;margin:24px 0 12px;">
          ${
            isFr
              ? 'Votre achat est prêt.'
              : 'Your purchase is ready.'
          }
        </h1>

        <p style="font-size:15px;line-height:1.75;color:#475569;">
          ${greeting}
        </p>

        <p style="font-size:15px;line-height:1.75;color:#475569;">
          ${
            isFr
              ? `Merci pour votre achat de <strong>${escapeHtml(
                  product.name
                )}</strong>. Vous pouvez utiliser et réutiliser ces ressources à chaque nouvelle opportunité professionnelle.`
              : `Thank you for purchasing <strong>${escapeHtml(
                  product.name
                )}</strong>. You can reuse these resources for every new career opportunity.`
          }
        </p>

        <div style="margin:16px 0;padding:14px 16px;border-radius:14px;background:#f8fafc;border:1px solid #e2e8f0;font-size:12px;line-height:1.6;color:#64748b;">
          ${
            isFr
              ? "Confirmation : lors de votre commande, vous avez demandé la fourniture immédiate du contenu numérique avant la fin du délai de rétractation et reconnu la perte du droit de rétractation applicable une fois l’accès fourni."
              : 'Confirmation: when placing your order, you requested immediate supply of the digital content and acknowledged the applicable loss of the withdrawal right once access is supplied.'
          }
        </div>

        ${itemHtml}

        <div style="margin-top:22px;padding-top:20px;border-top:1px solid #e2e8f0;">
          <a
            href="${escapeHtml(accessUrl)}"
            style="color:#0683c9;font-weight:800;text-decoration:none;"
          >
            ${
              isFr
                ? "Ouvrir ma page d’accès"
                : 'Open my access page'
            }
          </a>
        </div>

        <p style="margin-top:24px;font-size:12px;line-height:1.6;color:#94a3b8;">
          ${
            isFr
              ? 'Paiement unique. Aucun abonnement.'
              : 'One-time payment. No subscription.'
          }
        </p>

      </div>
    </div>
  `;

  const response = await fetch(
    'https://api.resend.com/emails',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject,
        html,
      }),
      cache: 'no-store',
    }
  );

  const payload = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    throw new Error(
      payload?.message ||
        `Resend a refusé l'envoi (${response.status})`
    );
  }

  return payload;
}

export async function deliverPaidStoreOrder(
  orderId: string
) {
  const raw = await findStoreOrderById(orderId);

  if (!raw) {
    throw new Error('Commande introuvable');
  }

  const order =
    raw as unknown as StoreOrderRow;

  if (order.status !== 'paid') {
    throw new Error('Commande non payée');
  }

  if (order.delivery_status === 'sent') {
    return {
      status: 'sent' as const,
    };
  }

  let items: DeliveryItem[];

  try {
    items = getDeliveryItems(
      order.product_id,
      order.market,
      order.access_token
    );
  } catch (error) {
    await updateStoreOrder(order.id, {
      delivery_status: 'failed',
      delivery_error:
        error instanceof Error
          ? error.message
          : 'Configuration manquante',
    });

    throw error;
  }

  const claimed = await claimOrderDelivery(
    order.id
  );

  if (!claimed) {
    return {
      status: 'already_processing' as const,
    };
  }

  try {
    const resend = await sendDeliveryEmail(
      order,
      items
    );

    await updateStoreOrder(order.id, {
      delivery_status: 'sent',
      delivered_at: new Date().toISOString(),
      delivery_error: null,
      resend_email_id: resend?.id || null,
    });

    return {
      status: 'sent' as const,
    };
  } catch (error) {
    await updateStoreOrder(order.id, {
      delivery_status: 'failed',
      delivery_error:
        error instanceof Error
          ? error.message
          : 'Erreur de livraison',
    });

    throw error;
  }
}