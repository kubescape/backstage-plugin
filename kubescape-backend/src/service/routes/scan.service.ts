import { execSync } from 'child_process';
import * as fs from 'fs';
import {
  DBCluster,
  DBControl,
  DBResource,
  DBVulnerability,
  KubescapeDatabse,
  SeveritySummary,
} from '../../database/KubescapeDatabase';
import { Control, Resource, SeverityItem } from '../../util/types';
import { raw } from 'express';

export interface SeverityStats {
  criticalSeverity: number;
  highSeverity: number;
  mediumSeverity: number;
  lowSeverity?: number;
  unknownSeverity: number;
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

export interface VulnerabilitiesInfo {
  severity: string;
  vulnerabilities_id: string;
  package: string;
  version: string;
  fixVersions: string[];
  fixedState: string;
}

export interface WorkloadScanResponse {
  totalVulnerabilities: SeverityStats;
  vulnerabilities: VulnerabilitiesInfo[];
}

// new code
export interface ResourceListResponse {
  nsaScore: number;
  mitreScore: number;
  totalControlFailure: SeveritySummary;
  resourceDetails: DBResource[];
}

function getSeverity(baseScore: number): string {
  if (baseScore >= 9) {
    return 'critical';
  }
  if (baseScore >= 7) {
    return 'high';
  }
  if (baseScore >= 4) {
    return 'medium';
  }
  if (baseScore >= 1) {
    return 'low';
  }
  return 'unknown';
}

// failure
export async function workloadScan(
  database: KubescapeDatabse,
  namespace: string,
  kind: string,
  name: string,
  resourceID: string,
): Promise<WorkloadScanResponse> {
  const outputName = `workload_scan_${resourceID.replace(
    /\//g,
    '_',
  )}_${Date.now()}.json`;
  console.log(outputName);
  await database.initWorkloadScan(resourceID);
  execSync(
    `kubescape scan workload --namespace ${namespace} ${kind}/${name} --format json --output ./kubescapeScanResult/${outputName}`,
  );

  const data = fs.readFileSync(`./kubescapeScanResult/${outputName}`, {
    encoding: 'utf8',
    flag: 'r',
  });
  const rawJson = JSON.parse(data);
  const vulnerabilitiesFindings = {
    SeverityCritical:
      rawJson.summaryDetails.vulnerabilities.mapsSeverityToSummary.Critical
        .numberOfCVEs,
    SeverityHigh:
      rawJson.summaryDetails.vulnerabilities.mapsSeverityToSummary.High
        .numberOfCVEs,
    SeverityMedium:
      rawJson.summaryDetails.vulnerabilities.mapsSeverityToSummary.Medium
        .numberOfCVEs,
    SeverityUnknown:
      rawJson.summaryDetails.vulnerabilities.mapsSeverityToSummary.Unknown
        .numberOfCVEs,
  };
  const CVE_list = rawJson.summaryDetails.vulnerabilities.CVEs.map(obj => ({
    severity: obj.severity,
    CVE_ID: obj.id,
    package: obj.package,
    version: obj.version,
    fixVersions: JSON.stringify(obj.fixVersions),
    fixedState: obj.fixedState,
    resourceID: resourceID,
  }));
  fs.unlink(`./kubescapeScanResult/${outputName}`, err => {
    if (err) {
      console.error(`Error removing file: ${err}`);
      return;
    }
  });
  return {
    totalVulnerabilities: vulnerabilitiesFindings,
    vulnerabilities: CVE_list,
  };
}

export async function getResourceList(
  database: KubescapeDatabse,
  clusterID: number,
): Promise<ResourceListResponse | undefined> {
  let resources: DBResource[];
  let cluster: DBCluster;
  try {
    resources = await database.getResourceList(clusterID);
    cluster = await database.getClusterSummary(clusterID);
  } catch {
    return undefined;
  }

  if (resources === undefined || cluster === undefined) {
    return undefined;
  }
  return {
    nsaScore: cluster.nsaScore,
    mitreScore: cluster.mitreScore,
    totalControlFailure: cluster.history[0],
    resourceDetails: resources,
  };
}

export async function getControlListByResourceID(
  database: KubescapeDatabse,
  cluster_id: number,
  resource_id: string,
): Promise<DBControl[] | undefined> {
  return await database.getControlsByResource(cluster_id, resource_id);
}

export async function getVulnerabilityListByResourceID(
  database: KubescapeDatabse,
  cluster_id: number,
  resource_id: string,
): Promise<DBVulnerability[] | undefined> {
  return await database.getVulnerabilitiesByResource(cluster_id, resource_id);
}

export async function complianceScan(
  database: KubescapeDatabse,
  clusterID: number,
) {
  const scanDate = new Date();
  // execSync(
  //   // --kubeconfig ./kubescapeScanResult/kube.conf
  //   'kubescape scan  --format json --format-version v2 --output ./kubescapeScanResult/results2.json',
  //   { encoding: 'utf-8' },
  // );

  const data = fs.readFileSync('./kubescapeScanResult/results2.json', {
    encoding: 'utf8',
    flag: 'r',
  });

  const rawJson = JSON.parse(data);
  const resourceMap = Object.fromEntries(
    rawJson.resources.map(obj => [obj.resourceID, obj]),
  );
  const contorlMap = rawJson.summaryDetails.controls;

  const scannedControl: DBControl[] = (
    Object.entries(contorlMap) as [string, ControlInfo][]
  ).map(([controlID, control]) => ({
    scanDate: scanDate, // Current date and time
    name: control.name,
    controlID: controlID,
    severity: getSeverity(control.scoreFactor),
    complianceScore: control.complianceScore,
    clusterID: 0,
    // 0 for test
  }));
  // update cluster control info
  database.updateControls(0, scannedControl);

  const scannedResource: DBResource[] = [];
  for (const resource of rawJson.results) {
    const mapping: DBResource = {
      resourceID: '',
      clusterID: 0,
      name: '',
      kind: '',
      namespace: '',
      controlScanDate: scanDate,
      controlSummary: { critical: 0, high: 0, medium: 0, low: 0, unknown: 0 },
      controlList: '',
      imageScanDate: undefined,
      imageSummary: undefined,
    };
    const JSONControlList: SeverityItem[] = [];
    const resourceID = resource.resourceID;
    const resourceInfo = resourceMap[resourceID];

    mapping.resourceID = resourceID;
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
        JSONControlList.push({
          name: control.name,
          id: control.controlID,
          severity: getSeverity(contorlMap[control.controlID].scoreFactor),
        });
      }
    }
    mapping.controlList = JSON.stringify(JSONControlList);
    scannedResource.push(mapping);
  }
  // test cluster 0
  await database.updateResources(0, scannedResource);

  const nsaScore = rawJson.summaryDetails.frameworks[2]
    .complianceScore as number;
  const mitreScore = rawJson.summaryDetails.frameworks[2]
    .complianceScore as number;
  const clusterSummary: SeveritySummary = {
    critical: rawJson.summaryDetails.controlsSeverityCounters.criticalSeverity,
    high: rawJson.summaryDetails.controlsSeverityCounters.highSeverity,
    medium: rawJson.summaryDetails.controlsSeverityCounters.mediumSeverity,
    low: rawJson.summaryDetails.controlsSeverityCounters.lowSeverity,
    unknown: 0,
  };
  await database.updateClusterHistory(
    0,
    nsaScore,
    mitreScore,
    scanDate,
    clusterSummary,
  );

  // const resultJSON: BasicScanResponse = {
  //   nsaScore: rawJson.summaryDetails.frameworks[2].complianceScore as number,
  //   mitreScore: rawJson.summaryDetails.frameworks[2].complianceScore as number,
  //   totalControlFailure: rawJson.summaryDetails
  //     .controlsSeverityCounters as SeverityStats,
  //   resourceDetails: [],
  // };

  // await database.getResourceList(0).then(resourceRows => {
  //   resultJSON.resourceDetails = resourceRows;
  // });

  // return resultJSON;
}
