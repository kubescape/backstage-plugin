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
    field: 'controlID',
    headerName: 'Control ID',
    minWidth: 200,
  },
  {
    field: 'name',
    headerName: 'Name',
    minWidth: 200,
  },
  {
    field: 'descriptiton',
    headerName: 'Description',
    minWidth: 400,
  },
  {
    field: 'severity',
    headerName: 'Severity',
    minWidth: 200,
  },
  {
    field: 'autofix',
    headerName: 'Auto Fix',
    minWidth: 200,
  },
];

export function ControlSidePanelComponent({ data, operatePanel }) {
  if (data === undefined) {
    return <div>is loading</div>;
  }
  return (
    <Page themeId="tool">
      <Header title="Control Detail and Fix" />
      <Content>
        <Grid container>
          <Grid item>
            <Button onClick={operatePanel}>
              <ArrowBackIosIcon />
            </Button>
          </Grid>
          <Grid item>
            <ContentHeader title={`Resource: ${data.name} `}>
              <Button variant="contained">Scan</Button>
            </ContentHeader>
          </Grid>
        </Grid>

        <DataGrid rows={[]} columns={columns} />
      </Content>
    </Page>
  );
}
