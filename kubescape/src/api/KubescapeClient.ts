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
  name: string;
  kind: string;
  namespace: string;
  controlScanTime: string;
  controlStats: SeverityStats;
  vulnerabilitiesScanTime: string;
  vulnerabilitiesFindings: SeverityStats;
}

export interface BasicScanResponse {
  nsaScore: number;
  mitreScore: number;
  totalControlFailure: SeverityStats;
  resourceDetails: ResourceDetail[];
}

const baseURL = 'http://localhost:7007/api/kubescape';

export async function getBasicScan(): Promise<BasicScanResponse> {
  try {
    const response = await fetch(`${baseURL}/scan`);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json();
    console.log(json);
    return json.scanResult;
  } catch (error) {
    console.error(error.message);
    return {};
  }
}
