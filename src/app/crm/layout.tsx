import type { Metadata } from "next";
import "./crm.css";
export const metadata: Metadata = {
  title: "CRM",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return <div className="crm">{children}</div>;
}
