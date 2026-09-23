const { token = '' } = await searchParams;
const order = token ? await findStoreOrderByAccessToken(token) : null;

if (
  !order ||
  order.status !== 'paid' ||
  !isStoreProductId(order.product_id) ||
  !isStoreMarket(order.market)
) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#020b1f] px-5 text-white">
      <div className="w-full max-w-lg rounded-[32px] border border-white/10 bg-white/[0.06] p-8 text-center backdrop-blur-xl">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-amber-400/10 text-amber-300">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-3xl font-black">Accès non disponible</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Le lien est invalide ou le paiement n’est pas encore confirmé. Si
          vous venez de payer, attendez quelques secondes puis actualisez.
        </p>
        <a
          href="/outils"
          className="mt-6 inline-flex rounded-full bg-sky-500 px-6 py-3 text-sm font-black text-white"
        >
          Retour aux outils
        </a>
      </div>
    </main>
  );
}

const product = getStoreProduct(order.product_id, order.market);
