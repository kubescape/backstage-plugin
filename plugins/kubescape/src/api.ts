import { KubernetesApi } from '@backstage/plugin-kubernetes-react';

export interface WorkloadConfigurationScan {
  metadata: { name: string; namespace: string };
  spec: { controls: Record<string, { status: { status: string } }> };
}

export interface VulnerabilityManifest {
  metadata: { name: string; namespace: string };
  spec: { payload: { matches: Array<{ vulnerability: { id: string; severity: string } }> } };
}

export class KubescapeApiClient {
  constructor(private kubernetesApi: KubernetesApi) {}

  async getConfigScans(clusterName: string, namespace?: string): Promise<WorkloadConfigurationScan[]> {
    const path = namespace
      ? `/apis/spdx.softwarecomposition.kubescape.io/v1beta1/namespaces/${namespace}/workloadconfigurationscans`
      : `/apis/spdx.softwarecomposition.kubescape.io/v1beta1/workloadconfigurationscans`;
    const res = await this.kubernetesApi.proxy({ clusterName, path });
    const data = await res.json();
    return data.items ?? [];
  }

  async getVulnerabilities(clusterName: string, namespace?: string): Promise<VulnerabilityManifest[]> {
    const path = namespace
      ? `/apis/spdx.softwarecomposition.kubescape.io/v1beta1/namespaces/${namespace}/vulnerabilitymanifests`
      : `/apis/spdx.softwarecomposition.kubescape.io/v1beta1/vulnerabilitymanifests`;
    const res = await this.kubernetesApi.proxy({ clusterName, path });
    const data = await res.json();
    return data.items ?? [];
  }
}
