import EnglishPage from '@/components/EnglishPage';
import EnglishResumeReview from '@/components/EnglishResumeReview';
import { localizedMetadata } from '@/lib/i18n';
export const metadata = localizedMetadata('/en/resume-review', 'Free resume structure check | TalentiQues', 'Review the basics of your resume with a private, browser-based checklist. Check section headings and evidence without uploading your document.');
export default function Page() { return <EnglishPage title="Check the basics before you send your resume." intro="A clear structure helps readers find the evidence. Use this private checklist as a first pass, then review your resume against the role itself."><EnglishResumeReview /></EnglishPage>; }
