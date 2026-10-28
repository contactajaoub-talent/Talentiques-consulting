import { notFound } from "next/navigation";
import { CrmWorkspace } from "@/components/crm/CrmWorkspace";
export default async function Page({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (
    !["requests", "sales", "cases", "communications", "settings"].includes(
      section,
    )
  )
    notFound();
  return <CrmWorkspace section={section} />;
}
