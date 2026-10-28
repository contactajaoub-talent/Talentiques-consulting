import type { Metadata } from "next";
import { CompleteInformation } from "@/components/crm/CompleteInformation";
export const metadata: Metadata = {
  title: "Compléter votre dossier",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <CompleteInformation token={token || ""} />;
}
