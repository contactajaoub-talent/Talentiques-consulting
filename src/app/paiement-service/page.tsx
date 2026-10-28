import type { Metadata } from "next";
import Link from "next/link";
import { checkoutOrder } from "@/lib/crm/payments";
import { uuid } from "@/lib/crm/core";
import { ServicePayment } from "@/components/crm/ServicePayment";
export const metadata: Metadata = {
  title: "Paiement de votre accompagnement",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export const dynamic = "force-dynamic";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const p = await searchParams;
  let order;
  try {
    order = await checkoutOrder(uuid(p.order), p.token || "");
  } catch {
    order = null;
  }
  if (!order)
    return (
      <main className="mx-auto max-w-xl px-6 py-24">
        <h1 className="font-heading text-3xl text-[#133960]">
          Ce lien n’est plus disponible.
        </h1>
        <p className="mt-5 text-slate-600">
          Demandez un nouveau lien à l’équipe TALENTIQUES.
        </p>
        <Link href="/" className="mt-6 inline-block underline">
          Revenir au site
        </Link>
      </main>
    );
  return (
    <ServicePayment
      id={order.id}
      token={p.token!}
      amount={Number(order.amount).toFixed(2)}
      currency={order.currency}
      paid={order.status === "paid"}
      name={order.service_name}
    />
  );
}
