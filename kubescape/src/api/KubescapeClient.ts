import { DiscoveryApi } from '@backstage/core-plugin-api';

export class KubescapeClient {
  private readonly discoveryAp: DiscoveryApi;
}

export interface SeverityStats {
  criticalSeverity: number;
  highSeverity: number;
  mediumSeverity: number;
  lowSeverity?: number;
  unknownSeverity: number;
}

export interface SeverityLabel {
  key: string;
  label: number;
}

export interface ResourceDetail {
  resource_id: string;
  name: string;
  kind: string;
  namespace?: string;
  controlScanDate: Date;
  cluster_id: number;
  controlStats?: SeverityStats;
  control_list: SeverityLabel[];
  imageScanDate?: Date;
  vulnerabilitiesFindings?: SeverityStats;
}

export interface BasicScanResponse {
  nsaScore: number;
  mitreScore: number;
  totalControlFailure: SeverityStats;
  resourceDetails: ResourceDetail[];
}

export interface ControlResponse {
  control_id: string;
  name: string;
  severity: string;
  created: Date;
  compliance_score: number;
  cluster_id: number;
}

const baseURL = 'http://localhost:7007/api/kubescape';

export async function getBasicScan(): Promise<BasicScanResponse> {
  const response = await fetch(`${baseURL}/scan`);
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }
  const json = await response.json();
  const result: BasicScanResponse = json.scanResult;
  return result;
}

export async function getResourceControlList(
  clusterId: number,
  resourceId: string,
): Promise<ControlResponse[]> {
  const response = await fetch(
    `${baseURL}/resourceControls?cluster_id=${clusterId}&resource_id=${resourceId}`,
  );
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }
  const json = await response.json();
  const result: ControlResponse[] = json.result;
  return result;
}

export async function getWorkloadVulnerabilities(
  namespace: string,
  type: string,
  name: string,
  resource_id: string,
) {
  console.log(
    `${baseURL}/workloadScan?namespace=${namespace}&name=${name}&kind=${type}&resource_id=${resource_id}`,
  );
  const response = await fetch(
    `${baseURL}/workloadScan?namespace=${namespace}&name=${name}&kind=${type}&resource_id=${resource_id}`,
    {
      method: 'GET',
    },
  );
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }
  const json = await response.json();
  const result: SeverityStats = json.result;
  return result;
}

export async function addCluster(clusterName: string, config: string) {
  const response = await fetch(`${baseURL}/addCluster`, {
    method: 'POST',
    body: JSON.stringify({ name: clusterName, config: config }),
  });

  return response.json().result;
}
