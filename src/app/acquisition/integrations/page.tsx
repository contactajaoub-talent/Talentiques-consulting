import { PageHeader } from '@/components/acquisition/AcquisitionShell';
import { IntegrationsView } from '@/components/acquisition/IntegrationsView';

export default function Page() {
  return (
    <>
      <PageHeader
        title="Intégrations"
        description="État des connecteurs serveur utilisés par Acquisition OS."
      />
      <IntegrationsView />
    </>
  );
}