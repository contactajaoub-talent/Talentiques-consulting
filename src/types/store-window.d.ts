export {};

declare global {
  type StoreAnalyticsParameters = Record<string, unknown>;

  type PayPalButtonsOptions = {
    fundingSource?: string;
    style?: {
      layout?: 'vertical' | 'horizontal';
      shape?: 'pill' | 'rect';
      label?: string;
      height?: number;
    };
    createOrder?: () => Promise<string>;
    onApprove?: (data: { orderID?: string }) => Promise<void>;
    onCancel?: () => void;
    onError?: (reason: unknown) => void;
  };

  interface Window {
    paypal?: {
      FUNDING: { PAYPAL: string; CARD: string };
      Buttons: (options: PayPalButtonsOptions) => {
        isEligible: () => boolean;
        render: (selector: string) => Promise<void>;
        close: () => Promise<void>;
      };
    };
    fbq?: (
      command: 'track' | 'trackCustom',
      eventName: string,
      parameters?: StoreAnalyticsParameters
    ) => void;
    gtag?: (
      command: 'event',
      eventName: string,
      parameters?: StoreAnalyticsParameters
    ) => void;
    clarity?: (command: 'event', eventName: string) => void;
    dataLayer?: unknown[];
    __talentiquesStoreAnalyticsReady?: boolean;
  }
}
