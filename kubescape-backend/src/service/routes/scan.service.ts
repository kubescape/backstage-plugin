import { execSync } from 'child_process';
import * as fs from 'fs';
import { KubescapeDatabse } from '../../database/KubescapeDatabase';

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
  created: Date;
  cluster_id: number;
  controlStats?: SeverityStats;
  vulnerabilitiesScanTime?: string;
  vulnerabilitiesFindings?: SeverityStats;
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

export function basicScan(database: KubescapeDatabse): BasicScanResponse {
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

  const controlInfo = Object.entries(rawJson.summaryDetails.controls).map(
    ([control_id, control]) => ({
      created: scanDate, // Current date and time
      name: control.name,
      control_id: control_id,
      severity: getSeverity(control.scoreFactor),
      compliance_score: control.complianceScore,
      cluster_id: 0,
      // 0 for test
    }),
  );

  // update cluster control info
  database.updateControls(controlInfo);

  // console.log(resourceMap);
  const resultJSON: BasicScanResponse = {
    nsaScore: rawJson.summaryDetails.frameworks[2].complianceScore as number,
    mitreScore: rawJson.summaryDetails.frameworks[2].complianceScore as number,
    totalControlFailure: rawJson.summaryDetails
      .controlsSeverityCounters as SeverityStats,
    resourceDetails: [],
  };

  for (const resource of rawJson.results) {
    let mapping = {
      resource_id: '',
      name: '',
      kind: '',
      namespace: '',
      created: scanDate,
      cluster_id: 0,
      // controlStats: {},
      // vulnerabilitiesScanTime: '',
      // vulnerabilitiesFindings: {},
    };
    const resourceID = resource.resourceID;
    const resourceInfo = resourceMap[resourceID];

    mapping.resource_id = resourceID;
    if ('metadata' in resourceInfo.object) {
      mapping.name = resourceInfo.object.metadata.name;
      mapping.kind = resourceInfo.object.kind;
      mapping.namespace = resourceInfo.object.metadata.namespace;
    } else {
      mapping.name = resourceInfo.object.name;
      mapping.kind = resourceInfo.object.kind;
    }
    resultJSON.resourceDetails.push(mapping);
  }
  database.updateFailedResource(resultJSON.resourceDetails);
  return resultJSON;
}
