"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="crm-empty">
      <h1>Le CRM est indisponible</h1>
      <p>Vérifiez la connexion et la configuration du service.</p>
      <button onClick={reset}>Réessayer</button>
    </div>
  );
}
