import {
  Content,
  ContentHeader,
  Header,
  HeaderActionMenu,
  Page,
} from '@backstage/core-components';
import { Button, Grid, Typography, Link } from '@material-ui/core';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
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
        href={`https://hub.armosec.io/docs/${params.row.controlID.toLowerCase()}`}
      >
        <Typography> {params.row.controlID}</Typography>
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
];

export function ControlSidePanelComponent({ clusterName, data, operatePanel }) {
  const [controlRows, setControlRows] = useState<ControlResponse[]>([]);
  const config = useApi(configApiRef);
  const baseURL = `${config.getString('backend.baseUrl')}/api/kubescape`;

  useEffect(() => {
    getResourceControlList(baseURL, clusterName, data?.id).then(rows => {
      setControlRows(rows);
    });
  }, [clusterName, data]);
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
            <ContentHeader title={`Resource: ${data.name} `} />
          </Grid>
        </Grid>

        <DataGrid autoHeight rows={controlRows} columns={columns} />
      </Content>
    </Page>
  );
}
