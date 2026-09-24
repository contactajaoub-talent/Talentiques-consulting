import {
  STORE_FR_PRODUCTS,
  STORE_EN_PRODUCTS,
  getStoreProduct,
  type StoreMarket,
  type StoreProduct,
  type StoreProductId,
} from '@/lib/store/catalog';

export const STORE_ANALYTICS_READY_EVENT =
  'talentiques-store-analytics-ready';

const STORE_ITEM_LIST_ID = 'talentiques_store_fr';
const STORE_ITEM_LIST_NAME = 'Talentiques Store FR';
const trackedPurchaseIds = new Set<string>();

const productPaths: Partial<Record<string, StoreProductId>> = {
  '/outils/opportunity-tracker': 'tracker',
  '/outils/cv-ats': 'ats',
  '/outils/bundle': 'bundle',
  '/en/tools/opportunity-tracker': 'tracker',
  '/en/tools/ats-resume': 'ats',
  '/en/tools/bundle': 'bundle',
};

function productValue(product: StoreProduct) {
  return Number(product.amount);
}

function gaItem(product: StoreProduct) {
  return {
    item_id: product.id,
    item_name: product.name,
    price: productValue(product),
    quantity: 1,
    currency: product.currency,
  };
}

function metaProduct(product: StoreProduct) {
  return {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    value: productValue(product),
    currency: product.currency,
  };
}

export function onStoreAnalyticsReady(callback: () => void) {
  if (typeof window === 'undefined') return;

  if (window.__talentiquesStoreAnalyticsReady) {
    callback();
    return;
  }

  window.addEventListener(STORE_ANALYTICS_READY_EVENT, callback, {
    once: true,
  });

  return () =>
    window.removeEventListener(STORE_ANALYTICS_READY_EVENT, callback);
}

export function trackStorePage(pathname: string) {
  const normalizedPath =
    pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;

  window.fbq?.('track', 'PageView');

  const market = normalizedPath.startsWith('/en/') ? 'en' : 'fr';
  if (normalizedPath === '/outils' || normalizedPath === '/en/tools') {
    const products = Object.values(market === 'fr' ? STORE_FR_PRODUCTS : STORE_EN_PRODUCTS);

    window.gtag?.('event', 'view_item_list', {
      item_list_id: market === 'fr' ? STORE_ITEM_LIST_ID : 'talentiques_store_en',
      item_list_name: market === 'fr' ? STORE_ITEM_LIST_NAME : 'Talentiques Store EN',
      currency: products[0].currency,
      items: products.map(gaItem),
    });
    return;
  }

  const productId = productPaths[normalizedPath];
  if (!productId) return;

  const product = getStoreProduct(productId, market);

  window.fbq?.('track', 'ViewContent', metaProduct(product));
  window.gtag?.('event', 'view_item', {
    currency: product.currency,
    value: productValue(product),
    items: [gaItem(product)],
  });
  window.clarity?.('event', 'store_product_view');
}

export function trackStoreProductClick(productId: StoreProductId, market: StoreMarket = 'fr') {
  const product = getStoreProduct(productId, market);

  window.fbq?.(
    'trackCustom',
    'StoreProductClick',
    metaProduct(product)
  );
  window.gtag?.('event', 'select_item', {
    item_list_id: market === 'fr' ? STORE_ITEM_LIST_ID : 'talentiques_store_en',
    item_list_name: market === 'fr' ? STORE_ITEM_LIST_NAME : 'Talentiques Store EN',
    items: [gaItem(product)],
  });
  window.clarity?.('event', 'store_product_click');
}

export function trackStoreCheckoutStarted(product: StoreProduct) {
  window.fbq?.('track', 'InitiateCheckout', metaProduct(product));
  window.gtag?.('event', 'begin_checkout', {
    currency: product.currency,
    value: productValue(product),
    items: [gaItem(product)],
  });
  window.clarity?.('event', 'store_checkout_started');
}

export function trackStorePurchaseOnce({
  product,
  transactionId,
  amount,
  currency,
}: {
  product: StoreProduct;
  transactionId: string;
  amount: number;
  currency: StoreProduct['currency'];
}) {
  const storageKey = `talentiques-store-purchase:${transactionId}`;

  if (trackedPurchaseIds.has(transactionId)) return false;

  try {
    if (window.sessionStorage.getItem(storageKey)) return false;
    window.sessionStorage.setItem(storageKey, '1');
  } catch {
    // sessionStorage peut être indisponible en navigation privée stricte.
  }

  trackedPurchaseIds.add(transactionId);

  const productData = {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    value: amount,
    currency,
  };

  window.fbq?.('track', 'Purchase', productData);
  window.gtag?.('event', 'purchase', {
    transaction_id: transactionId,
    currency,
    value: amount,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        price: amount,
        quantity: 1,
        currency,
      },
    ],
  });
  window.clarity?.('event', 'store_purchase');

  return true;
}
