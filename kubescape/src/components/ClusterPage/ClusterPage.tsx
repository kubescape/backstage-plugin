/* eslint-disable no-console */
import React, { PropsWithChildren, useEffect, useState } from 'react';
import {
  Link,
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useParams,
} from 'react-router-dom';
import {
  Box,
  Button,
  ButtonBase,
  Grid,
  Typography,
  Breadcrumbs,
  Drawer,
  makeStyles,
} from '@material-ui/core';
import {
  Content,
  ContentHeader,
  Header,
  Page,
} from '@backstage/core-components';
import {
  DataGrid,
  GridRowsProp,
  GridColDef,
  GridRenderCellParams,
  GridRowData,
  GridComparatorFn,
  GridSortModel,
} from '@mui/x-data-grid';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { Dashboard } from './DashBoardComponent';
import { SeverityDisplayComponent } from '../SeverityDisplayComponent';
import { ChipData } from '../SeverityDisplayComponent/SeverityDisplayComponent';
import {
  ControlSidePanelComponent,
  VulnerabilitiesSidePanelComponent,
} from '../SidePanelComponent';

import {
  BasicScanResponse,
  getBasicScan,
  getCompliancScan,
  getResourceList,
  ResourceDetail,
  scanWorkloadVulnerabilities,
} from '../../api/KubescapeClient';
import { ResourecesWithImage } from '../../utils/constants';

const useStyles = makeStyles({
  sidePanel: {
    width: '80vw',
  },
});

// const clusterName = 'Minikube';

const failure_data = [
  { type: 'Critical', count: 0 },
  { type: 'High', count: 0 },
  { type: 'Medium', count: 0 },
  { type: 'Low', count: 0 },
];

// compare failed controls or vulnerabilities findings
const severityComparator: GridComparatorFn = (
  v1: ChipData[],
  v2: ChipData[],
) => {
  const v1Value =
    typeof v1 === 'undefined'
      ? 0
      : v1.reduce((acc, curr) => acc + curr.label, 0);
  const v2Value =
    typeof v2 === 'undefined'
      ? 0
      : v2.reduce((acc, curr) => acc + curr.label, 0);
  return v1Value - v2Value;
};

export function ClusterPage() {
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [sidePanelType, setSidePanelType] = useState('');
  const [selectedResource, setSelectedResource] = useState<GridRowData>();
  const [rows, setRows] = useState<GridRowsProp[]>([]);
  const [nsaScore, setNsaScore] = useState(0);
  const [mitreScore, setMitreScore] = useState(0);
  const [totalFailedControl, setTotalFailedControl] = useState(failure_data);
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'failedControls', sort: 'desc' },
  ]);

  const location = useLocation();
  const clusterName = location.state.from;

  const parseSeverityInfo = (stats, type: 'control' | 'vulnerability') => {
    if (stats === null) return undefined;
    if (type === 'vulnerability') {
      return Object.entries(stats).map(([severity, value]) => ({
        key: severity.replace('Severity', '').toLowerCase(),
        label: value,
      }));
    }

    const mapping = {
      critical: { key: 'critical', label: 0 },
      high: { key: 'high', label: 0 },
      medium: { key: 'medium', label: 0 },
      low: { key: 'low', label: 0 },
    };

    for (const item of stats) {
      if (item.severity in mapping) {
        mapping[item.severity].label += 1;
      }
    }
    const severityResult = Object.entries(mapping).map(([key, value]) => ({
      key: value.key,
      label: value.label,
    }));

    return severityResult;
  };

  const updatePage = () => {
    console.log('fetch data from backend');
    getResourceList(clusterName).then(result => {
      console.log('fetched resources from backend');
      console.log(result);
      if (result.nsaScore === undefined || result.nsaScore === null) {
        return;
      }
      const resourcesResult = result.resourceDetails.map(obj => ({
        id: obj.resourceID,
        name: obj.name,
        kind: obj.kind,
        namespace: obj.namespace,
        failedControls: parseSeverityInfo(obj.controlList, 'control'),
        lastControlScan: obj.controlScanDate,
        vulnerabilities: parseSeverityInfo(obj.imageSummary, 'vulnerability'),
        lastVulnerabilityScan: obj.imageScanDate,
      }));
      setRows(resourcesResult);
      setNsaScore(result.nsaScore / 100);
      setMitreScore(result.mitreScore / 100);
      setTotalFailedControl(
        Object.entries(result.totalControlFailure).map(([key, value]) => ({
          type: key.replace('Severity', ''),
          count: value,
        })),
      );
    });
  };

  function scanWorkload(
    resource_id: string,
    name: string,
    kind: string,
    namespace: string,
  ) {
    scanWorkloadVulnerabilities(namespace, kind, name, resource_id).then(
      data => {
        console.log(data);
        updatePage();
      },
    );
  }

  useEffect(() => {
    console.log('page reload');
    updatePage();
    const intervalId = setInterval(updatePage, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const closePanel = () => {
    setSidePanelOpen(false);
    setSelectedResource(undefined);
  };

  const classes = useStyles();

  const resourceColumns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Resource',
      width: 200,
      renderCell: params => (
        <Typography style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
          {params.value}
        </Typography>
      ),
    },
    { field: 'kind', headerName: 'Kind', width: 150 },
    {
      field: 'namespace',
      headerName: 'Namespace',
      width: 200,
      renderCell: params => (
        <Typography style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'failedControls',
      headerName: 'Failed Control Status',
      width: 305,
      sortComparator: severityComparator,
      renderCell: (params: GridRenderCellParams) => (
        <ButtonBase
          onClick={() => {
            setSelectedResource(params.row);
            setSidePanelType('Control');
            setSidePanelOpen(true);
          }}
        >
          <SeverityDisplayComponent data={params.value as ChipData[]} />
        </ButtonBase>
      ),
    },
    {
      field: 'lastControlScan',
      headerName: 'Last Control Scan',
      width: 230,
      valueFormatter: params => {
        return new Date(params.value).toUTCString();
      },
    },
    {
      field: 'vulnerabilities',
      headerName: 'Vulnerabilities Finding',
      width: 345,
      sortComparator: severityComparator,
      renderCell: (params: GridRenderCellParams) => {
        if (params.row.kind in ResourecesWithImage) {
          return (
            <ButtonBase
              onClick={() => {
                setSelectedResource(params.row);
                setSidePanelType('Vulnerabilities');
                setSidePanelOpen(true);
              }}
            >
              <SeverityDisplayComponent data={params.value as ChipData[]} />
            </ButtonBase>
          );
        }
        return <Typography>Resource has no image</Typography>;
      },
    },
    {
      field: 'lastVulnerabilityScan',
      headerName: 'Last Vulnerabilities Scan',
      width: 230,
      valueFormatter: params => {
        return params.value !== null
          ? new Date(params.value).toUTCString()
          : undefined;
      },
    },
    {
      field: 'vulnerabilitiesScan',
      headerName: ' Vulnerabilities Scan',
      width: 200,
      renderCell: (params: GridRenderCellParams) => {
        if (params.row.kind in ResourecesWithImage) {
          return (
            <Button
              variant="contained"
              onClick={() => {
                console.log('begin scanning workload');
                scanWorkload(
                  params.row.id,
                  params.row.name,
                  params.row.kind,
                  params.row.namespace,
                );
              }}
            >
              Scan
            </Button>
          );
        }
        return (
          <Button variant="contained" disabled>
            Scan
          </Button>
        );
      },
    },
  ];
  return (
    <Page themeId="tool">
      <Header title="Welcome to kubescape!" />
      <Content>
        <Box>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link to="../landing">Cluster Monitor</Link>
            <Typography>Cluster page</Typography>
          </Breadcrumbs>
        </Box>
        <Grid container direction="column">
          <Grid item>
            <ContentHeader title={`Cluster Compliance Panel: ${clusterName}`}>
              <Box
                flexDirection="row"
                sx={{ '& > :not(style) + :not(style)': { marginLeft: 5 } }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => getCompliancScan(clusterName)}
                >
                  Compliance Scan
                </Button>
              </Box>
            </ContentHeader>
          </Grid>
          <Dashboard
            failure_data={totalFailedControl}
            nsaScore={nsaScore}
            mitreScore={mitreScore}
          />
          <Grid item style={{ height: '70vh' }}>
            <DataGrid
              pageSize={20}
              rows={rows}
              columns={resourceColumns}
              sortModel={sortModel}
              onSortModelChange={model => {
                if (JSON.stringify(model) !== JSON.stringify(sortModel)) {
                  setSortModel(model);
                }
                // console.log('sort model change');
                // setSortModel(model);
              }}
            />
          </Grid>
        </Grid>
      </Content>
      <Drawer
        anchor="right"
        open={sidePanelOpen}
        variant="temporary"
        onClose={closePanel}
      >
        <div className={classes.sidePanel}>
          {sidePanelType === 'Control' && (
            <ControlSidePanelComponent
              clusterName={clusterName}
              data={selectedResource}
              operatePanel={closePanel}
            />
          )}
          {sidePanelType === 'Vulnerabilities' && (
            <VulnerabilitiesSidePanelComponent
              clusterName={clusterName}
              data={selectedResource}
              operatePanel={closePanel}
            />
          )}
        </div>
      </Drawer>
    </Page>
  );
}
