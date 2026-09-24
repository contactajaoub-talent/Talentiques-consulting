import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

type StoreDeliveryEmailItem = {
  label: string;
  description: string;
  url: string;
};

type StoreDeliveryEmailProps = {
  firstName?: string;
  productName: string;
  accessUrl: string;
  items: StoreDeliveryEmailItem[];
  locale: 'fr' | 'en';
};

const colors = {
  blue: '#0683C9',
  navy: '#0F172A',
  muted: '#64748B',
  border: '#DCE8F2',
  light: '#F5F9FC',
  success: '#15803D',
  successBackground: '#F0FDF4',
};

export function StoreDeliveryEmail({
  firstName,
  productName,
  accessUrl,
  items,
  locale,
}: StoreDeliveryEmailProps) {
  const isFr = locale === 'fr';
  const greeting = firstName
    ? isFr
      ? `Bonjour ${firstName},`
      : `Hi ${firstName},`
    : isFr
      ? 'Bonjour,'
      : 'Hi,';

  return (
    <Html lang={locale}>
      <Head />
      <Preview>
        {isFr
          ? `Paiement confirmé — votre accès à ${productName} est prêt.`
          : `Payment confirmed — your access to ${productName} is ready.`}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={brandSection}>
            <Text style={brand}>TalentiQues</Text>
            <Text style={storeLabel}>STORE</Text>
          </Section>

          <Section style={heroSection}>
            <Text style={confirmationBadge}>
              {isFr ? '✓ PAIEMENT CONFIRMÉ' : '✓ PAYMENT CONFIRMED'}
            </Text>
            <Heading style={heading}>
              {isFr ? 'Votre achat est prêt.' : 'Your purchase is ready.'}
            </Heading>
            <Text style={intro}>{greeting}</Text>
            <Text style={intro}>
              {isFr
                ? `Merci pour votre achat. Votre accès à ${productName} est maintenant disponible.`
                : `Thank you for your purchase. Your access to ${productName} is now available.`}
            </Text>
            <Button href={accessUrl} style={primaryButton}>
              {isFr ? 'Accéder à mon espace' : 'Access your product'}
            </Button>
          </Section>

          <Section style={benefitsSection}>
            <Text style={benefit}>
              <span style={benefitIcon}>✓</span>{' '}
              {isFr ? 'Paiement unique' : 'One-time payment'}
            </Text>
            <Text style={benefit}>
              <span style={benefitIcon}>✓</span>{' '}
              {isFr ? 'Aucun abonnement' : 'No subscription'}
            </Text>
            <Text style={benefit}>
              <span style={benefitIcon}>✓</span>{' '}
              {isFr ? 'Accès immédiat' : 'Immediate access'}
            </Text>
          </Section>

          <Section style={resourcesSection}>
            <Text style={eyebrow}>
              {isFr ? 'VOS RESSOURCES' : 'YOUR RESOURCES'}
            </Text>
            {items.map((item) => (
              <Section key={item.label} style={resourceCard}>
                <Heading as="h2" style={resourceTitle}>
                  {item.label}
                </Heading>
                <Text style={resourceDescription}>{item.description}</Text>
                <Button href={item.url} style={downloadButton}>
                  {isFr ? 'Télécharger la ressource' : 'Download resource'}
                </Button>
              </Section>
            ))}
          </Section>

          <Section style={supportSection}>
            <Heading as="h2" style={supportTitle}>
              {isFr ? 'Besoin d’aide ?' : 'Need help?'}
            </Heading>
            <Text style={supportText}>
              {isFr
                ? 'Notre équipe reste disponible si vous rencontrez une difficulté avec votre accès ou vos téléchargements.'
                : 'Our team is available if you have any trouble with your access or downloads.'}
            </Text>
            <Link href="mailto:talentiques@gmail.com" style={supportLink}>
              talentiques@gmail.com
            </Link>
          </Section>

          <Hr style={divider} />
          <Text style={legalText}>
            {isFr
              ? "Lors de votre commande, vous avez demandé la fourniture immédiate du contenu numérique et reconnu la perte du droit de rétractation applicable une fois l’accès fourni."
              : 'When placing your order, you requested immediate supply of the digital content and acknowledged the applicable loss of the withdrawal right once access is supplied.'}
          </Text>
          <Text style={footer}>© TalentiQues Store</Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  margin: '0',
  padding: '0',
  backgroundColor: '#EEF4F8',
  fontFamily: 'Arial, Helvetica, sans-serif',
  color: colors.navy,
};

const container = {
  width: '100%',
  maxWidth: '620px',
  margin: '0 auto',
  padding: '36px 20px',
};

const brandSection = {
  padding: '0 8px 20px',
};

const brand = {
  display: 'inline-block',
  margin: '0',
  color: colors.blue,
  fontSize: '24px',
  fontWeight: '800',
  letterSpacing: '-0.5px',
};

const storeLabel = {
  display: 'inline-block',
  margin: '0 0 0 10px',
  color: colors.muted,
  fontSize: '10px',
  fontWeight: '700',
  letterSpacing: '2px',
  verticalAlign: '3px',
};

const heroSection = {
  padding: '38px 34px 34px',
  border: `1px solid ${colors.border}`,
  borderRadius: '24px',
  backgroundColor: '#FFFFFF',
};

const confirmationBadge = {
  display: 'inline-block',
  margin: '0 0 16px',
  padding: '7px 11px',
  borderRadius: '999px',
  backgroundColor: colors.successBackground,
  color: colors.success,
  fontSize: '11px',
  fontWeight: '800',
  letterSpacing: '0.8px',
};

const heading = {
  margin: '0 0 20px',
  color: colors.navy,
  fontSize: '32px',
  lineHeight: '1.15',
  letterSpacing: '-1px',
};

const intro = {
  margin: '0 0 10px',
  color: '#475569',
  fontSize: '15px',
  lineHeight: '1.7',
};

const primaryButton = {
  marginTop: '18px',
  padding: '14px 22px',
  borderRadius: '10px',
  backgroundColor: colors.blue,
  color: '#FFFFFF',
  fontSize: '14px',
  fontWeight: '800',
  textDecoration: 'none',
};

const benefitsSection = {
  marginTop: '16px',
  padding: '18px 24px',
  border: `1px solid ${colors.border}`,
  borderRadius: '18px',
  backgroundColor: colors.light,
};

const benefit = {
  display: 'inline-block',
  margin: '4px 18px 4px 0',
  color: '#334155',
  fontSize: '13px',
  fontWeight: '700',
};

const benefitIcon = {
  color: colors.blue,
};

const resourcesSection = {
  padding: '30px 0 0',
};

const eyebrow = {
  margin: '0 0 12px 8px',
  color: colors.blue,
  fontSize: '11px',
  fontWeight: '800',
  letterSpacing: '1.4px',
};

const resourceCard = {
  marginBottom: '12px',
  padding: '24px',
  border: `1px solid ${colors.border}`,
  borderRadius: '18px',
  backgroundColor: '#FFFFFF',
};

const resourceTitle = {
  margin: '0 0 8px',
  color: colors.navy,
  fontSize: '18px',
  lineHeight: '1.35',
};

const resourceDescription = {
  margin: '0 0 18px',
  color: colors.muted,
  fontSize: '13px',
  lineHeight: '1.65',
};

const downloadButton = {
  padding: '11px 17px',
  border: `1px solid ${colors.blue}`,
  borderRadius: '9px',
  backgroundColor: '#FFFFFF',
  color: colors.blue,
  fontSize: '13px',
  fontWeight: '800',
  textDecoration: 'none',
};

const supportSection = {
  marginTop: '16px',
  padding: '24px',
  borderRadius: '18px',
  backgroundColor: colors.navy,
};

const supportTitle = {
  margin: '0 0 8px',
  color: '#FFFFFF',
  fontSize: '18px',
};

const supportText = {
  margin: '0 0 8px',
  color: '#CBD5E1',
  fontSize: '13px',
  lineHeight: '1.65',
};

const supportLink = {
  color: '#7DD3FC',
  fontSize: '13px',
  fontWeight: '700',
  textDecoration: 'none',
};

const divider = {
  margin: '28px 0 18px',
  borderColor: colors.border,
};

const legalText = {
  margin: '0',
  color: '#94A3B8',
  fontSize: '11px',
  lineHeight: '1.6',
};

const footer = {
  margin: '14px 0 0',
  color: colors.muted,
  fontSize: '11px',
  fontWeight: '700',
};
