import { useEffect, useState } from 'react';
import { InfoCard, Progress } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { kubernetesApiRef } from '@backstage/plugin-kubernetes';
import { KubescapeApiClient, WorkloadConfigurationScan } from '../api';

export const ComplianceCard = () => {
  const kubernetesApi = useApi(kubernetesApiRef);
  const [scans, setScans] = useState<WorkloadConfigurationScan[] | null>(null);

  useEffect(() => {
    const client = new KubescapeApiClient(kubernetesApi as any);
    client.getConfigScans('kind-kubescape-test').then(setScans);
  }, [kubernetesApi]);

  if (!scans) return <Progress />;

  const total = scans.length;
  const failed = scans.filter((s: WorkloadConfigurationScan) =>
    Object.values(s.spec?.controls ?? {}).some(
      (c: { status: { status: string } }) => c.status?.status === 'failed',
    ),
  ).length;

  return (
    <InfoCard title="Kubescape Compliance">
      <div>{total - failed} / {total} resources passing</div>
    </InfoCard>
  );
};
