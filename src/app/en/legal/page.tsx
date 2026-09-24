import EnglishPage from '@/components/EnglishPage';
import { localizedMetadata } from '@/lib/i18n';
export const metadata = localizedMetadata('/en/legal', "Legal information | TalentiQues", "Publisher, contact and hosting information for TalentiQues.");
const sections = [
  [
    "Publisher",
    "TalentiQues. Publication director: Othmane Biz."
  ],
  [
    "Contact",
    "Email: talentiques@gmail.com. Phone: +212 610 778 015."
  ],
  [
    "Hosting",
    "Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, United States. Website: https://vercel.com."
  ],
  [
    "Intellectual property",
    "All rights reserved. Reproduction of all or part of this website on any medium requires the express permission of the publication director, subject to applicable exceptions."
  ]
];
export default function Page() { return <EnglishPage title="Legal information" intro="Publisher, contact and hosting information for TalentiQues.">{sections.map(([heading, text]) => <section key={heading}><h2 className="text-2xl font-bold">{heading}</h2><p className="mt-4 leading-8 text-slate-600">{text}</p></section>)}</EnglishPage>; }
