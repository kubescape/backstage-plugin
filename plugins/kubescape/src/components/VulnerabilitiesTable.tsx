import { useEffect, useState } from 'react';
import { InfoCard, Table, TableColumn, Progress, ResponseErrorPanel } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { kubernetesApiRef } from '@backstage/plugin-kubernetes-react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { KubescapeApiClient, VulnerabilityManifest } from '../api';

type Row = { resource: string; cve: string; severity: string };

export const VulnerabilitiesTable = () => {
  const kubernetesApi = useApi(kubernetesApiRef);
  const { entity } = useEntity();
  const [manifests, setManifests] = useState<VulnerabilityManifest[] | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const namespace = entity.metadata.namespace ?? 'default';
  const entityName = entity.metadata.name;

  useEffect(() => {
    setError(null);
    setManifests(null);
    const client = new KubescapeApiClient(kubernetesApi);
    client
      .getVulnerabilities(namespace)
      .then(all => all.filter(m => m.metadata.name.includes(entityName)))
      .then(setManifests)
      .catch(setError);
  }, [kubernetesApi, namespace, entityName]);

  if (error) return <ResponseErrorPanel error={error} />;
  if (!manifests) return <Progress />;

  const rows: Row[] = manifests.flatMap((m: VulnerabilityManifest) =>
    (m.spec.payload?.matches ?? []).map(match => ({
      resource: m.metadata.name,
      cve: match.vulnerability.id,
      severity: match.vulnerability.severity,
    })),
  );

  const columns: TableColumn<Row>[] = [
    { title: 'Resource', field: 'resource' },
    { title: 'CVE', field: 'cve' },
    { title: 'Severity', field: 'severity' },
  ];

  return (
    <InfoCard title="Kubescape Vulnerabilities">
      <Table options={{ paging: true, search: true }} columns={columns} data={rows} />
    </InfoCard>
  );
};
