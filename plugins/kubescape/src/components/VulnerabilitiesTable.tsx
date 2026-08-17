import { useEffect, useState } from 'react';
import { InfoCard, Table, TableColumn, Progress } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { kubernetesApiRef } from '@backstage/plugin-kubernetes';
import { KubescapeApiClient, VulnerabilityManifest } from '../api';

type Row = { resource: string; cve: string; severity: string };

export const VulnerabilitiesTable = () => {
  const kubernetesApi = useApi(kubernetesApiRef);
  const [manifests, setManifests] = useState<VulnerabilityManifest[] | null>(null);

  useEffect(() => {
    const client = new KubescapeApiClient(kubernetesApi as any);
    client.getVulnerabilities('kind-kubescape-test').then(setManifests);
  }, [kubernetesApi]);

  if (!manifests) return <Progress />;

  const rows: Row[] = manifests.flatMap((m: VulnerabilityManifest) =>
    m.spec.payload.matches.map(match => ({
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
