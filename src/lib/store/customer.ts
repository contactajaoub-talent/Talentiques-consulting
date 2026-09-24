export const STORE_CUSTOMER_STATUSES = [
  'Étudiant',
  'Jeune diplômé',
  'En recherche d’emploi',
  'En poste',
  'En reconversion professionnelle',
  'Freelance / Indépendant',
  'Autre',
] as const;

export type StoreCustomerStatus =
  (typeof STORE_CUSTOMER_STATUSES)[number];

export type StoreCustomerInput = {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  currentStatus: string;
};

export type StoreCustomerField = keyof StoreCustomerInput;
export type StoreCustomerErrors = Partial<
  Record<StoreCustomerField, string>
>;

type StoreCustomerValidation =
  | {
      success: true;
      data: StoreCustomerInput & {
        currentStatus: StoreCustomerStatus;
      };
      errors: StoreCustomerErrors;
    }
  | {
      success: false;
      errors: StoreCustomerErrors;
    };

function cleanText(value: unknown) {
  if (typeof value !== 'string') return '';

  return value
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

export function validateStoreCustomerInput(
  value: unknown
): StoreCustomerValidation {
  const source =
    value && typeof value === 'object'
      ? (value as Record<string, unknown>)
      : {};

  const fullName = cleanText(source.fullName);
  const email = cleanText(source.email).toLowerCase();
  const phone = cleanText(source.phone);
  const country = cleanText(source.country);
  const currentStatus = cleanText(source.currentStatus);
  const errors: StoreCustomerErrors = {};

  if (fullName.length < 2 || fullName.length > 150) {
    errors.fullName = 'Indiquez votre nom complet.';
  }

  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    errors.email = 'Indiquez une adresse e-mail valide.';
  }

  const phoneDigits = phone.replace(/\D/g, '');
  if (
    phoneDigits.length < 6 ||
    phoneDigits.length > 20 ||
    phone.length > 50 ||
    !/^\+?[0-9][0-9\s().-]*$/.test(phone)
  ) {
    errors.phone = 'Indiquez un numéro de téléphone valide.';
  }

  if (country.length < 2 || country.length > 100) {
    errors.country = 'Indiquez votre pays.';
  }

  if (
    currentStatus.length > 100 ||
    !STORE_CUSTOMER_STATUSES.includes(
      currentStatus as StoreCustomerStatus
    )
  ) {
    errors.currentStatus = 'Sélectionnez votre situation actuelle.';
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      fullName,
      email,
      phone,
      country,
      currentStatus: currentStatus as StoreCustomerStatus,
    },
    errors,
  };
}
