import EnglishPage from '@/components/EnglishPage';
import { localizedMetadata } from '@/lib/i18n';
export const metadata = localizedMetadata('/en/privacy', "Privacy policy | TalentiQues", "How information is used when you contact TalentiQues, use the website or buy a resource.");
const sections = [
  [
    "Information you provide",
    "We collect the details needed to respond to your request or fulfil your order, such as your name, email, phone number, country, professional situation and information you choose to include in a form. Technical and campaign-attribution information may also accompany your visit or order."
  ],
  [
    "Why it is used",
    "Information is used to provide requested services, manage customer relationships and orders, deliver purchased resources, respond to support enquiries and improve the website. Marketing communications require the applicable consent. Customer information is not sold."
  ],
  [
    "Service providers",
    "The website uses technical providers to operate its services. These include Vercel for hosting and file storage, Supabase for store order data, PayPal for payments, Resend for transactional email and Salesforce for enquiry management. Necessary information is processed by these providers to perform their respective functions."
  ],
  [
    "Analytics",
    "When configured, Meta Pixel, Google Analytics and Microsoft Clarity help measure website usage and campaign performance. Store ecommerce events use product and transaction information, not the name, email or phone entered in checkout. Browser privacy controls can restrict cookies and tracking."
  ],
  [
    "Your choices and rights",
    "You may request access, correction, deletion or restriction of your personal information, or object to processing where applicable, by emailing talentiques@gmail.com. Include enough context for us to identify your request without sharing passwords or payment credentials."
  ],
  [
    "Private access links",
    "Your resource access link acts as a credential. Keep it private and do not publish it. If it is lost or exposed, contact support. The English resume checklist runs locally in your browser and does not upload the text you paste."
  ]
];
export default function Page() { return <EnglishPage title="Privacy policy" intro="How information is used when you contact TalentiQues, use the website or buy a resource.">{sections.map(([heading, text]) => <section key={heading}><h2 className="text-2xl font-bold">{heading}</h2><p className="mt-4 leading-8 text-slate-600">{text}</p></section>)}</EnglishPage>; }
