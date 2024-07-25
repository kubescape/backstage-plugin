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
import { DataGrid, GridRowsProp, GridColDef } from '@mui/x-data-grid';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';

const baseURL = 'http://localhost:7007/api/kubescape';

const HTMLDisplay = ({ htmlContent }) => {
  return (
    <Paper elevation={3}>
      <Box
        sx={{ bgcolor: '#cfe8fc', margin: '10px' }}
        p={2}
        height="600px"
        width="100%"
      >
        <iframe
          srcDoc={htmlContent}
          title="HTML Content"
          width="100%"
          height="100%"
          style={{ border: 'none' }}
        />
      </Box>
    </Paper>
  );
};

const clusterName = 'Minikube';
const resourceRows: GridRowsProp = [];
const resourceColumns: GridColDef = [
  { field: 'name', headerName: 'Resource', width: 100 },
  { field: 'kind', headerName: 'Kind', width: 100 },
  { field: 'namespace', headerName: 'Namespace', width: 100 },
  { field: 'failedControls', headerName: 'Failed Control Status', width: 100 },
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
                  Vulnerabilities Panel
                </Button>
                <Button variant="contained" color="primary">
                  Compliance Scan
                </Button>
              </Box>
            </ContentHeader>
          </Grid>
          <Grid container>
            <Grid item>
              <GaugeCard
                variant="fullHeight"
                alignGauge="bottom"
                size="small"
                title="NSA Score"
                progress={0.9}
              />
            </Grid>
            <Grid item>
              <GaugeCard
                variant="fullHeight"
                alignGauge="bottom"
                size="small"
                title="MITRE Score"
                progress={0.6}
              />
            </Grid>
            <Grid item>
              <Card>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Failure Statistics</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {failure_data.map(row => (
                      <TableRow key={row.type}>
                        <TableCell component="th">{row.type}</TableCell>
                        <TableCell align="right">{row.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </Grid>
            <Grid item md={4}>
              <InfoCard title="Trends over time" noPadding>
                <CardContent>
                  <TrendLine
                    data={[0.8, 0.7, 0.5, 0.1]}
                    title="Trend over time"
                  />
                </CardContent>
              </InfoCard>
            </Grid>
          </Grid>
          <Grid item style={{ height: '70vh' }}>
            <DataGrid rows={controlRows} columns={controlCols} />
          </Grid>
        </Grid>
        {/* <Box width="100%"> */}
        {/* <TabbedCard title="Cluster Information">
        <CardTab style={cardContentStyle} label="Compliance">
          <div>
            <Content>
              <Typography>This is the cluster page</Typography>

              <Button variant="contained" onClick={handleScan}>
                Cluster Scan
              </Button>
              <Container maxWidth="md">
                <HTMLDisplay htmlContent={scanResult} />
              </Container>
            </Content>
          </div>
        </CardTab>
        <CardTab style={cardContentStyle} label="Vulnerability">
          <div>Vulnerability</div>
        </CardTab>
      </TabbedCard> */}
        {/* </Box> */}
      </Content>
    </Page>
  );
}
