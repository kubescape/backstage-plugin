import { execSync } from 'child_process';
import * as fs from 'fs';

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
  controlStats?: SeverityStats;
  vulnerabilitiesScanTime: string;
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

export function basicScan(): BasicScanResponse {
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
  const resourceMap = new Map(
    rawJson.resources.map(obj => [obj.resourceID, obj]),
  );
  const controlInfo = rawJson.summaryDetails.controls;

  // console.log(resourceMap);
  let resultJSON: BasicScanResponse = {
    nsaScore: rawJson.summaryDetails.frameworks[2].complianceScore as number,
    mitreScore: rawJson.summaryDetails.frameworks[2].complianceScore as number,
    totalControlFailure: rawJson.summaryDetails
      .controlsSeverityCounters as SeverityStats,
    resourceDetails: [],
  };

  for (const resource of rawJson.results) {
    let mapping = {
      name: '',
      kind: '',
      namespace: '',
      controlScanTime: '',
      // controlStats: {},
      vulnerabilitiesScanTime: '',
      // vulnerabilitiesFindings: {},
    };
    const resourceID = resource.resourceID;
    const resourceInfo = resourceMap[resourceID];
    if ('metadata' in resourceInfo.object) {
      mapping.name = resourceInfo.object.metadata.name;
      mapping.kind = resourceInfo.object.kind;
      mapping.namespace = resourceInfo.object.metadata.namespace;
    } else {
      mapping.name = resourceInfo.object.name;
      mapping.kind = resourceInfo.object.kind;
    }

    mapping.controlScanTime = new Date().toTimeString();

    // mapping.name = resourceMap[resource.resourceID].object.metadata.name;
    // mapping.kind = resourceMap[resource.resourceID].object.kind;
    // mapping.namespace =
    //   resourceMap[resource.resourceID].object.metadata.namespace;
    // mapping.controlScanTime = new Date().toTimeString();
    resultJSON.resourceDetails.push(mapping);
  }

  return resultJSON;
}
