import {
  Content,
  ContentHeader,
  Header,
  HeaderActionMenu,
  Page,
} from '@backstage/core-components';
import { Button, Grid, Typography, Link } from '@material-ui/core';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import React, { useEffect, useState } from 'react';
import {
  ControlResponse,
  getResourceControlList,
} from '../../api/KubescapeClient';

const columns: GridColDef[] = [
  {
    field: 'control_id',
    headerName: 'Control ID',
    minWidth: 200,
    renderCell: (params: GridRenderCellParams) => (
      <Link
        underline="hover"
        target="_blank"
        rel="noopener noreferrer"
        href={`https://hub.armosec.io/docs/${params.row.control_id.toLowerCase()}`}
      >
        <Typography> {params.row.control_id}</Typography>
      </Link>
    ),
  },
  {
    field: 'name',
    headerName: 'Name',
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
  const [controlRows, setControlRows] = useState<ControlResponse[]>([]);

  useEffect(() => {
    getResourceControlList(0, data?.id).then(rows => {
      setControlRows(rows);
    });
  }, [data]);
  if (data === undefined) {
    return <div>is loading</div>;
  }
  // test

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

        <DataGrid autoHeight rows={controlRows} columns={columns} />
      </Content>
    </Page>
  );
}
