import { DiscoveryApi } from '@backstage/core-plugin-api';

export class KubescapeClient {
  private readonly discoveryAp: DiscoveryApi;
}

export interface SeverityStats {
  criticalSeverity: number;
  highSeverity: number;
  mediumSeverity: number;
  lowSeverity: number;
}

export interface ResourceDetail {
  resource_id: string;
  name: string;
  kind: string;
  namespace?: string;
  controlScanDate: Date;
  cluster_id: number;
  controlStats?: SeverityStats;
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
  cluster_id: number,
  resource_id: string,
): Promise<ControlResponse[]> {
  const response = await fetch(
    `${baseURL}/resourceControls?cluster_id=${cluster_id}&resource_id=${resource_id}`,
  );
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }
  const json = await response.json();
  const result: ControlResponse[] = json.result;
  return result;
}
