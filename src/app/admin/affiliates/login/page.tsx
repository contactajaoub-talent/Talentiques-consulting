import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import AdminLoginForm from '@/components/affiliate/admin/AdminLoginForm';
import { getAdminSession } from '@/lib/affiliate/admin-auth';
export const metadata:Metadata={title:'Administration Affiliés',robots:{index:false,follow:false}};
export default async function Page({searchParams}:{searchParams:Promise<{error?:string}>}){if(await getAdminSession())redirect('/admin/affiliates');const invalid=(await searchParams).error==='invalid';return <main className="flex min-h-screen items-center justify-center bg-[#071b2b] px-5"><section className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl sm:p-10"><p className="text-sm font-bold tracking-[.16em] text-[#0683C9]">TALENTIQUES ADMIN</p><h1 className="mt-4 font-heading text-4xl font-bold">Administration affiliés</h1><p className="mt-4 leading-7 text-slate-600">Connexion privée par lien sécurisé. Aucun mot de passe n’est requis.</p>{invalid&&<p className="mt-5 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Lien invalide, expiré ou déjà utilisé.</p>}<AdminLoginForm/></section></main>}
