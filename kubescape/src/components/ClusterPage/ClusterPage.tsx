/* eslint-disable no-console */
import React, { PropsWithChildren, useState } from 'react';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import {
  Box,
  Button,
  ButtonBase,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Breadcrumbs,
} from '@material-ui/core';
import {
  CardTab,
  Content,
  ContentHeader,
  GaugeCard,
  Header,
  InfoCard,
  Page,
  StatusAborted,
  StatusError,
  StatusOK,
  StatusPending,
  StatusRunning,
  StatusWarning,
  TabbedCard,
  TabbedLayout,
  TrendLine,
} from '@backstage/core-components';
import {
  DataGrid,
  GridRowsProp,
  GridColDef,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { Dashboard } from './DashBoardComponent';
import { SeverityDisplayComponent } from '../SeverityDisplayComponent';
import { ChipData } from '../SeverityDisplayComponent/SeverityDisplayComponent';

const baseURL = 'http://localhost:7007/api/kubescape';

const date = new Date();
const clusterName = 'Minikube';
const resourceRows: GridRowsProp = [
  {
    id: 1,
    name: 'kubernetes-dashboard',
    kind: 'Deployment',
    namespace: 'kubernetes-dashboard',
    failedControls: [
      { key: 'Critical', label: 0 },
      { key: 'High', label: 0 },
      { key: 'Medium', label: 0 },
      { key: 'Low', label: 0 },
    ],
    lastControlScan: date,
    vulnerabilities: [
      { key: 'Critical', label: 0 },
      { key: 'High', label: 0 },
      { key: 'Medium', label: 0 },
      { key: 'Low', label: 0 },
    ],
    lastVulnerabilityScan: date,
  },
];
const resourceColumns: GridColDef[] = [
  { field: 'name', headerName: 'Resource', width: 200 },
  { field: 'kind', headerName: 'Kind', width: 150 },
  { field: 'namespace', headerName: 'Namespace', width: 160 },
  {
    field: 'failedControls',
    headerName: 'Failed Control Status',
    width: 305,
    renderCell: (params: GridRenderCellParams) => (
      <SeverityDisplayComponent data={params.value as ChipData[]} />
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
    renderCell: (params: GridRenderCellParams) => (
      <SeverityDisplayComponent data={params.value as ChipData[]} />
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
    field: 'vulnerabilities scan',
    headerName: 'Scan',
    width: 200,
    renderCell: () => <Button variant="contained">Scan</Button>,
  },
];

const controlRows: GridRowsProp = [
  {
    id: 1,
    status: 'Failed',
    severity: 'High',
    controlID: 'C-270',
    name: 'Ensure CPU limits are set',
    remediation: 'Set CPU limit',
    resource: '2 failed out of 21 resources',
    fix: 'FIX',
  },
];
const controlCols: GridColDef[] = [
  { field: 'status', headerName: 'Status', width: 150 },
  { field: 'severity', headerName: 'Severity', width: 150 },
  { field: 'controlID', headerName: 'Control ID', width: 150 },
  { field: 'name', headerName: 'Control Name', width: 200 },
  { field: 'remediation', headerName: 'Remediation', width: 200 },
  { field: 'compliance', headerName: 'Compliance', width: 200 },
  { field: 'resources', headerName: 'Resources', width: 200 },
  { field: 'fix', headerName: 'Fix', width: 100 },
];
const failure_data = [
  { type: 'Critical', count: 0 },
  { type: 'High', count: 27 },
  { type: 'Medium', count: 15 },
  { type: 'Low', count: 1 },
];

export function ClusterPage() {
  const [scanResult, setScanResult] = useState('');
  async function handleScan() {
    try {
      setScanResult('Processing Scan');
      const response = await fetch(`${baseURL}/scan`);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const json = await response.json();
      console.log(json);
      const result = json.scanResult;
      setScanResult(result);
    } catch (error) {
      console.error(error.message);
    }
  }

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
                <Button variant="contained" color="primary">
                  Compliance Scan
                </Button>
              </Box>
            </ContentHeader>
          </Grid>
          <Dashboard failure_data={failure_data} />
          <Grid item style={{ height: '70vh' }}>
            <DataGrid rows={resourceRows} columns={resourceColumns} />
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
}
