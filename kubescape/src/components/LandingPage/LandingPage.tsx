import {
  Content,
  ContentHeader,
  Header,
  HeaderLabel,
  Page,
  SupportButton,
} from '@backstage/core-components';
import { Button } from '@material-ui/core';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { SeverityDisplayComponent } from '../SeverityDisplayComponent';
import { ChipData } from '../SeverityDisplayComponent/SeverityDisplayComponent';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import { AddClusterForm } from './AddClusterFormComponent';
import { fetchApiRef, useApi, configApiRef } from '@backstage/core-plugin-api';
import { getClusterList } from '../../api/KubescapeClient';

export function LandingPage() {
  const fetchApi = useApi(fetchApiRef);
  const [formOpen, setFormOpen] = useState(false);
  const [rows, setRows] = useState<GridRowsProp>([]);
  const backStageConfig = useApi(configApiRef);
  const baseURL = `${backStageConfig.getString(
    'backend.baseUrl',
  )}/api/kubescape`;

  useEffect(() => {
    getClusterList(baseURL, fetchApi).then(data => {
      setRows(data);
    });
  }, []);

  const handleClickOpen = () => {
    setFormOpen(true);
  };

  const handleClose = () => {
    setFormOpen(false);
  };

  const navigate = useNavigate();
  const goToCluster = source => {
    navigate('../cluster', { state: { from: source } });
  };

  const parseSeverityInfo = stats => {
    if (stats === null) return undefined;

    const severityResult = Object.entries(stats).map(([key, value]) => ({
      key: key,
      label: value,
    }));

    return severityResult;
  };

  const columns: GridColDef[] = [
    {
      headerName: 'Cluster Name',
      field: 'name',
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Button
          fullWidth
          variant="contained"
          onClick={() => {
            goToCluster(params.value);
          }}
        >
          {params.value as string}
        </Button>
      ),
    },
    {
      headerName: 'Last Scan',
      field: 'scanFate',
      type: 'string',
      width: 300,
      valueFormatter: params => {
        if (params.row.history.length > 0) {
          return new Date(
            params.row.history[params.row.history.length - 1].scanDate,
          ).toUTCString();
        }
        return '';
      },
    },
    {
      headerName: 'Failed Controls',
      field: 'history',
      minWidth: 405,
      renderCell: (params: GridRenderCellParams) => (
        <SeverityDisplayComponent
          data={
            params.value.length > 0
              ? (parseSeverityInfo(
                  params.value[params.value.length - 1].summary,
                ) as ChipData[])
              : (parseSeverityInfo([]) as ChipData[])
          }
        />
      ),
    },
  ];

  return (
    <Page themeId="tool">
      <Header
        title="Welcome to kubescape!"
        subtitle="An open-source Kubernetes security platform"
      >
        <HeaderLabel label="Owner" value="Team X" />
        <HeaderLabel label="Lifecycle" value="Alpha" />
      </Header>
      <Content>
        <ContentHeader title="Landing Page">
          <Button variant="contained" color="primary" onClick={handleClickOpen}>
            Add Cluster
          </Button>
          <SupportButton>A description of your plugin goes here.</SupportButton>
        </ContentHeader>
        <AddClusterForm
          formOpen={formOpen}
          handleClose={handleClose}
          setRows={setRows}
        />
        <DataGrid columns={columns} rows={rows} />
      </Content>
    </Page>
  );
}
