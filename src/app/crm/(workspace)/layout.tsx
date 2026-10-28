import { redirect } from "next/navigation";
import { session } from "@/lib/crm/auth";
import { CrmShell } from "@/components/crm/CrmShell";
export const dynamic = "force-dynamic";
export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const current = await session();
  if (!current) redirect("/crm/login");
  return <CrmShell member={current.member}>{children}</CrmShell>;
}
