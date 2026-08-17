import { KubernetesApi } from '@backstage/plugin-kubernetes-react';

export interface WorkloadConfigurationScan {
  metadata: { name: string; namespace: string };
  spec: { controls?: Record<string, { status?: { status: string } }> };
}

export interface VulnerabilityManifest {
  metadata: { name: string; namespace: string };
  spec: { payload?: { matches?: Array<{ vulnerability: { id: string; severity: string } }> } };
}

export class KubescapeApiClient {
  constructor(private kubernetesApi: KubernetesApi) {}

  private async getClusterName(): Promise<string> {
    const clusters = await this.kubernetesApi.getClusters();
    if (!clusters.length) {
      throw new Error('No Kubernetes clusters configured in Backstage');
    }
    return clusters[0].name;
  }

  async getConfigScans(namespace: string): Promise<WorkloadConfigurationScan[]> {
    const clusterName = await this.getClusterName();
    const path = `/apis/spdx.softwarecomposition.kubescape.io/v1beta1/namespaces/${namespace}/workloadconfigurationscans`;
    const res = await this.kubernetesApi.proxy({ clusterName, path });
    if (!res.ok) {
      throw new Error(`Failed to fetch config scans: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return data.items ?? [];
  }

  async getVulnerabilities(namespace: string): Promise<VulnerabilityManifest[]> {
    const clusterName = await this.getClusterName();
    const path = `/apis/spdx.softwarecomposition.kubescape.io/v1beta1/namespaces/${namespace}/vulnerabilitymanifests`;
    const res = await this.kubernetesApi.proxy({ clusterName, path });
    if (!res.ok) {
      throw new Error(`Failed to fetch vulnerabilities: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return data.items ?? [];
  }
}
