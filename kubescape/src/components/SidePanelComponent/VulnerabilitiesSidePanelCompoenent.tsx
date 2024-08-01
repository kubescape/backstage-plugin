import {
  Content,
  ContentHeader,
  Header,
  HeaderActionMenu,
  Page,
} from '@backstage/core-components';
import { Button, Grid, Typography } from '@material-ui/core';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import React from 'react';

const columns: GridColDef[] = [
  {
    field: 'CVEID',
    headerName: 'CVE ID',
    minWidth: 200,
  },
  {
    field: 'severity',
    headerName: 'Severity',
    minWidth: 200,
  },
  {
    field: 'cvss',
    headerName: 'CVSS',
    minWidth: 200,
  },
  {
    field: 'epss',
    headerName: 'EPSS',
    minWidth: 200,
  },
  {
    field: 'exploitable',
    headerName: 'Exploitable',
    minWidth: 200,
  },
  {
    field: 'component',
    headerName: 'Component',
    minWidth: 200,
  },
  {
    field: 'fixVersion',
    headerName: 'Fix Version',
    minWidth: 200,
  },
  {
    field: 'affectedImage',
    headerName: 'Affected Image',
    minWidth: 200,
  },
  {
    field: 'affectedWorkload',
    headerName: 'Affected Workload',
    minWidth: 200,
  },
];

export function VulnerabilitiesSidePanelComponent({ data, operatePanel }) {
  if (data === undefined) {
    return <div>is loading</div>;
  }
  return (
    <Page themeId="tool">
      <Header title="Vulnerabilities Detail and Fix" />
      <Content>
        <Grid container>
          <Grid item>
            <Button onClick={operatePanel}>
              <ArrowBackIosIcon />
            </Button>
          </Grid>
          <Grid item>
            <ContentHeader title={`Resource:  ${data.name}`}>
              <Button variant="contained">Scan</Button>
            </ContentHeader>
          </Grid>
        </Grid>

        <DataGrid rows={[]} columns={columns} />
      </Content>
    </Page>
  );
}
