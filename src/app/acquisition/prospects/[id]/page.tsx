import { PageHeader } from '@/components/acquisition/AcquisitionShell';
import { ProspectDetailView } from '@/components/acquisition/ProspectDetailView';
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <><PageHeader title="Fiche prospect" description="Identité, qualification, suivi CRM et historique complet." /><ProspectDetailView id={id} /></>; }
