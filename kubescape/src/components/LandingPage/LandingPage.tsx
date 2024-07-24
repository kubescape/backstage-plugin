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
import { Button } from '@material-ui/core';
import { useNavigate } from 'react-router-dom';
import React from 'react';

export function LandingPage() {
  const navigate = useNavigate();
  const goToCluster = source => {
    navigate('../cluster', { state: { from: source } });
  };

  const columns: TableColumn[] = [
    { title: 'status', field: 'status' },
    {
      title: 'Cluster Name',
      field: 'clusterName',
      render: (row: Partial<TableData>) => (
        <Button
          variant="contained"
          onClick={() => {
            goToCluster(row.clusterName);
          }}
        >
          {row.clusterName}
        </Button>
      ),
    },
    { title: 'Node', field: 'node' },
    { title: 'Last Scan', field: 'lastScan' },
    { title: 'Framework', field: 'framework' },
    { title: 'Failed Information', field: 'failedResources' },
  ];

  interface TableData {
    status: string;
    clusterName: string;
    node: number;
    lastScan: string;
    framework: string;
    failedResources: string;
  }

  const placeholderData: Array<TableData> = [
    {
      status: 'connected',
      clusterName: 'my minikube',
      node: 3,
      framework: 'NSA',
      lastScan: new Date().toString(),
      failedResources:
        'Contains failed information for complaince and vulnerabilities',
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
          <Button variant="contained" color="primary">
            Add Cluster
          </Button>
          <SupportButton>A description of your plugin goes here.</SupportButton>
        </ContentHeader>

        <Table
          options={{ paging: true }}
          data={placeholderData}
          columns={columns}
          title="Clusters"
        />
      </Content>
    </Page>
  );
}
