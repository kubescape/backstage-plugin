/* eslint-disable no-console */
import React, { PropsWithChildren, useEffect, useState } from 'react';
import { Link, MemoryRouter, Route, Routes, useParams } from 'react-router-dom';
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
  ResourceDetail,
} from '../../api/KubescapeClient';

const useStyles = makeStyles({
  sidePanel: {
    width: '80vw',
  },
});

const date = new Date();
const clusterName = 'Minikube';

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
  return (
    v1.reduce((acc, curr) => acc + curr.label, 0) -
    v2.reduce((acc, curr) => acc + curr.label, 0)
  );
};

export function ClusterPage() {
  // const [scanResult, setScanResult] = useState('');
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [sidePanelType, setSidePanelType] = useState('');
  const [selectedResource, setSelectedResource] = useState<GridRowData>();
  const [rows, setRows] = useState<GridRowsProp[]>([]);
  const [nsaScore, setNsaScore] = useState(0);
  const [mitreScore, setMitreScore] = useState(0);

  const parseSeverityInfo = controls => {
    const mapping = {
      SeverityCritical: { key: 'Critical', label: 0 },
      SeverityHigh: { key: 'High', label: 0 },
      SeverityMedium: { key: 'Medium', label: 0 },
      SeverityLow: { key: 'Low', label: 0 },
    };
    let changed = false;
    for (const control of controls) {
      if (control.severity in mapping) {
        mapping[control.severity].label += 1;
        changed = true;
      }
    }
    const severityResult = Object.entries(mapping).map(([key, value]) => ({
      key: value.key,
      label: value.label,
    }));
    if (changed) {
      console.log(severityResult);
    }

    return severityResult;
  };

  const updatePage = () => {
    let scanResult: BasicScanResponse;
    getBasicScan().then(data => {
      scanResult = data;
      const resourcesResult = scanResult.resourceDetails.map(obj => ({
        id: obj.resource_id,
        name: obj.name,
        kind: obj.kind,
        namespace: obj.namespace,
        failedControls: parseSeverityInfo(obj.control_list),
        lastControlScan: obj.controlScanDate,
        vulnerabilities: [
          { key: 'Critical', label: 0 },
          { key: 'High', label: 0 },
          { key: 'Medium', label: 0 },
          { key: 'Low', label: 0 },
        ],
        // lastVulnerabilityScan: date,
      }));
      setRows(resourcesResult);
      setNsaScore(scanResult.nsaScore / 100);
      setMitreScore(scanResult.mitreScore / 100);
    });
  };

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
      width: 200,
      valueFormatter: params => {
        return params.value?.toLocaleString();
      },
    },
    {
      field: 'vulnerabilities',
      headerName: 'Vulnerabilities Finding',
      width: 305,
      sortComparator: severityComparator,
      renderCell: (params: GridRenderCellParams) => (
        <ButtonBase
          onClick={() => {
            setSelectedResource(params.row);
            setSidePanelType('Vulnerabilities');
            setSidePanelOpen(true);
          }}
        >
          <SeverityDisplayComponent data={params.value as ChipData[]} />
        </ButtonBase>
      ),
    },
    {
      field: 'lastVulnerabilityScan',
      headerName: 'Last Vulnerabilities Scan',
      width: 200,
      valueFormatter: params => {
        return params.value?.toLocaleString();
      },
    },
    {
      field: 'vulnerabilitiesScan',
      headerName: ' Vulnerabilities Scan',
      width: 200,
      renderCell: () => <Button variant="contained">Scan</Button>,
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
                  onClick={updatePage}
                >
                  Compliance Scan
                </Button>
              </Box>
            </ContentHeader>
          </Grid>
          <Dashboard
            failure_data={failure_data}
            nsaScore={nsaScore}
            mitreScore={mitreScore}
          />
          <Grid item style={{ height: '70vh' }}>
            <DataGrid
              autoHeight
              rows={rows}
              columns={resourceColumns}
              sortModel={[{ field: 'failedControls', sort: 'desc' }]}
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
              data={selectedResource}
              operatePanel={closePanel}
            />
          )}
          {sidePanelType === 'Vulnerabilities' && (
            <VulnerabilitiesSidePanelComponent
              data={selectedResource}
              operatePanel={closePanel}
            />
          )}
        </div>
      </Drawer>
    </Page>
  );
}
