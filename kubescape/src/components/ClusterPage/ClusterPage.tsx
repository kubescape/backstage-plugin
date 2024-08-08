/* eslint-disable no-console */
import React, { PropsWithChildren, useEffect, useState } from 'react';
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
  Drawer,
  makeStyles,
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
  GridRowData,
} from '@mui/x-data-grid';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { Dashboard } from './DashBoardComponent';
import { SeverityDisplayComponent } from '../SeverityDisplayComponent';
import { ChipData } from '../SeverityDisplayComponent/SeverityDisplayComponent';
import {
  ControlSidePanelComponent,
  VulnerabilitiesSidePanelComponent,
} from '../SidePanelComponent';

import { getBasicScan } from '../../api/KubescapeClient';

const useStyles = makeStyles({
  sidePanel: {
    width: '80vw',
  },
});

const baseURL = 'http://localhost:7007/api/kubescape';
const date = new Date();
const clusterName = 'Minikube';

const failure_data = [
  { type: 'Critical', count: 0 },
  { type: 'High', count: 27 },
  { type: 'Medium', count: 15 },
  { type: 'Low', count: 1 },
];

export function ClusterPage() {
  const [scanResult, setScanResult] = useState('');
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [sidePanelType, setSidePanelType] = useState('');
  const [selectedResource, setSelectedResource] = useState<GridRowData>();

  const closePanel = () => {
    setSidePanelOpen(false);
    setSelectedResource(undefined);
  };

  const classes = useStyles();

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
                  onClick={getBasicScan}
                >
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
