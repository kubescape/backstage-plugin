import { execSync } from 'child_process';
import * as fs from 'fs';
import { KubescapeDatabse } from '../../database/KubescapeDatabase';
import { Control, Resource, SeverityItem } from '../../util/types';

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

interface ControlInfo {
  controlID: string;
  name: string;
  complianceScore: number;
  scoreFactor: number;
}

export interface BasicScanResponse {
  nsaScore: number;
  mitreScore: number;
  totalControlFailure: SeverityStats;
  resourceDetails: ResourceDetail[];
}

export function basicScanHTML(): string {
  const output = execSync(
    // 'kubescape scan --format json --format-version v2 --output results.json',
    'kubescape scan --format html --output results.html',
    { encoding: 'utf-8' },
  ).toString(); // the default is 'buffer'
  console.log('Output was:\n', output);
  const data = fs.readFileSync('./results.html', {
    encoding: 'utf8',
    flag: 'r',
  });
  return data;
}

function getSeverity(baseScore: number): string {
  if (baseScore >= 9) {
    return 'SeverityCritical';
  }
  if (baseScore >= 7) {
    return 'SeverityHigh';
  }
  if (baseScore >= 4) {
    return 'SeverityMedium';
  }
  if (baseScore >= 1) {
    return 'SeverityLow';
  }
  return 'SeverityUnknown';
}

export async function basicScan(
  database: KubescapeDatabse,
): Promise<BasicScanResponse> {
  const scanDate = new Date();
  // const output = execSync(
  //   'kubescape scan --kubeconfig ./kubescapeScanResult/kube.conf --format json --format-version v2 --output ./kubescapeScanResult/results2.json',
  //   { encoding: 'utf-8' },
  // ).toString(); // the default is 'buffer'
  // console.log('Output was:\n', output);

  const data = fs.readFileSync('./kubescapeScanResult/results2.json', {
    encoding: 'utf8',
    flag: 'r',
  });

  const rawJson = JSON.parse(data);
  const resourceMap = Object.fromEntries(
    rawJson.resources.map(obj => [obj.resourceID, obj]),
  );
  const contorlMap = rawJson.summaryDetails.controls;

  const scannedControl: Control[] = (
    Object.entries(contorlMap) as [string, ControlInfo][]
  ).map(([control_id, control]) => ({
    created: scanDate, // Current date and time
    name: control.name,
    control_id: control_id,
    severity: getSeverity(control.scoreFactor),
    compliance_score: control.complianceScore,
    cluster_id: 0,
    // 0 for test
  }));
  // update cluster control info
  database.updateControls(scannedControl);

  const scannedResource: Resource[] = [];
  for (const resource of rawJson.results) {
    const mapping: Resource = {
      resource_id: '',
      name: '',
      kind: '',
      namespace: '',
      controlScanDate: scanDate,
      cluster_id: 0,
      control_list: '',
      CVE_list: [],
    };
    const control_list_json: SeverityItem[] = [];
    const resourceID = resource.resourceID;
    const resourceInfo = resourceMap[resourceID];

    mapping.resource_id = resourceID;
    if ('metadata' in resourceInfo.object) {
      mapping.name = resourceInfo.object.metadata.name;
      mapping.kind = resourceInfo.object.kind;
      if ('namespace' in resourceInfo.object.metadata) {
        mapping.namespace = resourceInfo.object.metadata.namespace;
      }
    } else {
      mapping.name = resourceInfo.object.name;
      mapping.kind = resourceInfo.object.kind;
    }

    for (const control of resource.controls) {
      if (control.status.status === 'failed') {
        control_list_json.push({
          name: control.name,
          id: control.controlID,
          severity: getSeverity(contorlMap[control.controlID].scoreFactor),
        });
      }
    }
    mapping.control_list = JSON.stringify(control_list_json);
    scannedResource.push(mapping);
  }
  await database.updateFailedResource(scannedResource);

  const resultJSON: BasicScanResponse = {
    nsaScore: rawJson.summaryDetails.frameworks[2].complianceScore as number,
    mitreScore: rawJson.summaryDetails.frameworks[2].complianceScore as number,
    totalControlFailure: rawJson.summaryDetails
      .controlsSeverityCounters as SeverityStats,
    resourceDetails: [],
  };

  await database.getResourceList(0).then(resourceRows => {
    resultJSON.resourceDetails = resourceRows;
  });

  return resultJSON;
}
