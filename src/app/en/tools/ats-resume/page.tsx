import EnglishStore from '@/components/store/EnglishStore';
import { localizedMetadata } from '@/lib/i18n';
export const metadata = localizedMetadata('/en/tools/ats-resume', "ATS Resume System", "Seven editable ATS-friendly resume templates, a complete resume guide and a LinkedIn guide. Build clearer, more relevant applications.");
export default function Page() { return <EnglishStore productId="ats"/>; }
