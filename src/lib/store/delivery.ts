import { Resend } from 'resend';
import { render } from '@react-email/render';
import { StoreDeliveryEmail } from '@/emails/store-delivery-email';
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

function absoluteHttpUrl(value: string, name: string) {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`URL invalide pour ${name}`);
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error(`URL invalide pour ${name}`);
  }

  return url.toString().replace(/\/$/, '');
}

export function requiredDeliveryUrl(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Lien de livraison non configuré : ${name}`);
  }

  const url = absoluteHttpUrl(value, name);
  if (new URL(url).protocol !== 'https:') throw new Error(`HTTPS requis pour ${name}`);
  return url;
}

function getAppUrl() {
  const configured =
    (process.env.VERCEL_ENV === 'preview' ? process.env.VERCEL_URL : undefined) ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    'https://www.talentiques.com';

  const withProtocol = /^https?:\/\//i.test(configured)
    ? configured
    : `https://${configured}`;

  return absoluteHttpUrl(withProtocol, 'URL publique du Store');
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
   * Les sources EN existantes restent configurées côté serveur.
   * Seule la route sécurisée est publiée, jamais l'URL source.
   */
  if (!accessToken) throw new Error('Delivery token missing');
  // Validate configuration before sending links; only secure URLs leave the server.
  if (productId !== 'ats') requiredDeliveryUrl('STORE_TRACKER_PACKAGE_EN_URL');
  if (productId !== 'tracker') requiredDeliveryUrl('STORE_ATS_PACKAGE_EN_URL');
  const trackerItem = (): DeliveryItem => ({
    label: 'Opportunity Tracker Pro',
    description: 'Tracker + automations + premium guides.',
    url: getSecureDownloadUrl(accessToken, 'tracker'),
  });

  const atsItem = (): DeliveryItem => ({
    label: 'ATS Resume System',
    description: 'ATS templates + resume guide + LinkedIn bonus.',
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

async function sendDeliveryEmail(
  order: StoreOrderRow,
  items: DeliveryItem[]
) {
  const apiKey = process.env.RESEND_API_KEY;

  const from =
    process.env.RESEND_FROM_EMAIL ||
    'TalentiQues <resources@talentiques.com>';

  const email = safeString(order.customer_email).trim();

  if (!apiKey) {
    throw new Error('RESEND_API_KEY manquant');
  }

  if (!email) {
    throw new Error('Adresse e-mail client introuvable');
  }

  const product = getStoreProduct(
    order.product_id,
    order.market
  );

  const isFr = order.market === 'fr';

  const firstName = safeString(order.customer_name)
    .trim()
    .split(/\s+/)[0];

  const accessUrl = `${getAppUrl()}/${
    isFr ? 'outils/acces' : 'en/tools/access'
  }?token=${encodeURIComponent(order.access_token)}`;

  const subject = isFr
    ? `Votre accès TalentiQues - ${product.name}`
    : `Your TalentiQues access - ${product.name}`;

  const emailComponent = StoreDeliveryEmail({
    firstName: firstName || undefined,
    productName: product.name,
    accessUrl,
    items,
    locale: order.market,
  });
  const [html, text] = await Promise.all([
    render(emailComponent),
    render(emailComponent, { plainText: true }),
  ]);

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from,
    to: [email],
    subject,
    html,
    text,
  });

  if (error) {
    throw new Error(
      error.message || "Resend a refusé l'envoi"
    );
  }

  return data;
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
