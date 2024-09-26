import {
  DiscoveryApi,
  FetchApi,
  fetchApiRef,
  useApi,
  configApiRef,
} from '@backstage/core-plugin-api';
import {
  SeveritySummary,
  DBResource,
} from '../../../kubescape-backend/src/database/KubescapeDatabase';

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
  CVE_list?: SeverityStats;
}

export interface BasicScanResponse {
  nsaScore: number;
  mitreScore: number;
  totalControlFailure: SeverityStats;
  resourceDetails: ResourceDetail[];
}

export interface ResourceListResponse {
  nsaScore: number;
  mitreScore: number;
  totalControlFailure: SeveritySummary;
  resourceDetails: DBResource[];
}

export interface ControlResponse {
  control_id: string;
  name: string;
  severity: string;
  created: Date;
  compliance_score: number;
  cluster_id: number;
}

export interface VulnerabilityResponse {
  CVE_ID: string;
  resourceID: string;
  severity: string;
  package: string;
  version: string;
  fixVersions: string[];
  fixedState: string;
}

export async function getCompliancScan(baseURL: string, clusterID: string) {
  const response = await fetch(
    `${baseURL}/complianceScan?clusterID=${clusterID}`,
  );
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }
  return await response.json();
}

export async function getResourceList(
  baseURL: string,
  clusterID: number,
): Promise<ResourceListResponse> {
  const response = await fetch(
    `${baseURL}/getResourceList?clusterID=${clusterID}`,
  );
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }
  const json = await response.json();
  return json.scanResult;
}

export async function getResourceControlList(
  baseURL: string,
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

export async function getResourceVulnerabiliyList(
  baseURL: string,
  clusterId: number,
  resourceId: string,
): Promise<VulnerabilityResponse[]> {
  const response = await fetch(
    `${baseURL}/resourceVulnerabilities?cluster_id=${clusterId}&resource_id=${resourceId}`,
  );
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }
  const json = await response.json();
  const result: VulnerabilityResponse[] = json.result;
  return result;
}

export async function scanWorkloadVulnerabilities(
  baseURL: string,
  namespace: string,
  type: string,
  name: string,
  resource_id: string,
) {
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

export async function addCluster(
  baseURL: string,
  clusterName: string,
  config: string,
  fetchApi: FetchApi,
) {
  const response = await fetchApi.fetch(`${baseURL}/addCluster`, {
    method: 'POST',
    body: JSON.stringify({ name: clusterName, config: config }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const result = await response.json();
  return result;
}

export async function getClusterList(baseURL: string, fetchApi: FetchApi) {
  const response = await fetchApi.fetch(`${baseURL}/clusters`);
  const result = await response.json();
  return result;
}
