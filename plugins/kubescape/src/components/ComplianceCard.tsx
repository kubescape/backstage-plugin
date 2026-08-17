import { useEffect, useState } from 'react';
import { InfoCard, Progress, ResponseErrorPanel } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { kubernetesApiRef } from '@backstage/plugin-kubernetes-react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { KubescapeApiClient, WorkloadConfigurationScan } from '../api';

export const ComplianceCard = () => {
  const kubernetesApi = useApi(kubernetesApiRef);
  const { entity } = useEntity();
  const [scans, setScans] = useState<WorkloadConfigurationScan[] | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const namespace = entity.metadata.namespace ?? 'default';
  const entityName = entity.metadata.name;

  useEffect(() => {
    setError(null);
    setScans(null);
    const client = new KubescapeApiClient(kubernetesApi);
    client
      .getConfigScans(namespace)
      .then(all => all.filter(s => s.metadata.name.includes(entityName)))
      .then(setScans)
      .catch(setError);
  }, [kubernetesApi, namespace, entityName]);

  if (error) return <ResponseErrorPanel error={error} />;
  if (!scans) return <Progress />;

  const total = scans.length;
  const failed = scans.filter((s: WorkloadConfigurationScan) =>
    Object.values(s.spec?.controls ?? {}).some(
      c => c.status?.status === 'failed',
    ),
  ).length;

  return (
    <InfoCard title="Kubescape Compliance">
      <div>{total - failed} / {total} resources passing</div>
    </InfoCard>
  );
};
