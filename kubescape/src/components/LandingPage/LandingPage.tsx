import {
  Content,
  ContentHeader,
  Header,
  HeaderLabel,
  Page,
  SupportButton,
  Table,
  TableColumn,
} from '@backstage/core-components';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@material-ui/core';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { SeverityDisplayComponent } from '../SeverityDisplayComponent';
import { ChipData } from '../SeverityDisplayComponent/SeverityDisplayComponent';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridRowProps,
  GridRowsProp,
} from '@mui/x-data-grid';
import { AddClusterForm } from './AddClusterFormComponent';

export function LandingPage() {
  const [formOpen, setFormOpen] = useState(false);

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

  const columns: GridColDef[] = [
    {
      headerName: 'Cluster Name',
      field: 'clusterName',
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
    { headerName: 'Node', field: 'node', width: 110 },
    {
      headerName: 'Last Scan',
      field: 'lastScan',
      type: 'string',
      width: 200,
      valueFormatter: params => {
        return params.value?.toLocaleString();
      },
    },
    { headerName: 'Framework', field: 'framework', width: 200 },
    {
      headerName: 'Failed Controls',
      field: 'failedResources',
      minWidth: 305,
      renderCell: (params: GridRenderCellParams) => (
        <SeverityDisplayComponent data={params.value as ChipData[]} />
      ),
    },
  ];

  const placeholderData: GridRowsProp = [
    {
      id: 1,
      clusterName: 'my minikube',
      node: 3,
      framework: 'NSA',
      lastScan: new Date(),
      failedResources: [
        { key: 'Critical', label: 0 },
        { key: 'High', label: 0 },
        { key: 'Medium', label: 0 },
        { key: 'Low', label: 0 },
      ],
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
        <AddClusterForm formOpen={formOpen} handleClose={handleClose} />
        <DataGrid columns={columns} rows={placeholderData} />
      </Content>
    </Page>
  );
}
