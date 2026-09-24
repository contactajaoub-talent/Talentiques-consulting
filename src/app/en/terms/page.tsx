import EnglishPage from '@/components/EnglishPage';
import { localizedMetadata } from '@/lib/i18n';
export const metadata = localizedMetadata('/en/terms', "Terms and conditions | TalentiQues", "The framework for using TalentiQues services and digital resources.");
const sections = [
  [
    "Scope",
    "TalentiQues provides career support, resume and LinkedIn guidance, interview preparation, training and digital career tools. The scope, schedule and fees for personalised services are agreed before the service begins."
  ],
  [
    "Your information and responsibilities",
    "Provide accurate, current information and participate actively in the services you choose. You remain responsible for your applications, the accuracy of your resume and the decisions you make."
  ],
  [
    "Digital purchases",
    "The store displays the price and currency for your selected market before payment. Store resources are a one-time purchase, not a subscription. Access is provided after payment confirmation through a secure page and an email sent to the address entered at checkout. The French store includes French and English editions; the English store supplies English resources."
  ],
  [
    "Immediate access",
    "At checkout, you must explicitly request immediate supply of the digital content and acknowledge the withdrawal-right notice displayed with that consent. Contact talentiques@gmail.com if a payment or download fails. Do not make a second payment to resolve an access problem."
  ],
  [
    "Intellectual property",
    "Site content and supplied resources remain the intellectual property of their respective owners. Resources are for your personal use. Reproduction, redistribution or resale without permission is not authorised."
  ],
  [
    "Appointments and cancellations",
    "For personalised services, the schedule and payment arrangements are agreed with you. Under the published service terms, a session cancelled less than 24 hours in advance remains payable."
  ],
  [
    "Limits and support",
    "TalentiQues provides tools and guidance, not a guarantee of interviews, employment or a particular career outcome. Your results also depend on your participation and market conditions. For questions about these terms or your purchase, contact talentiques@gmail.com."
  ]
];
export default function Page() { return <EnglishPage title="Terms and conditions" intro="The framework for using TalentiQues services and digital resources.">{sections.map(([heading, text]) => <section key={heading}><h2 className="text-2xl font-bold">{heading}</h2><p className="mt-4 leading-8 text-slate-600">{text}</p></section>)}</EnglishPage>; }
