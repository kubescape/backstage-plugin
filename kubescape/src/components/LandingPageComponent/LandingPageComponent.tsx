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

export function LandingPageComponent() {
  const navigate = useNavigate();
  const goToCluster = source => {
    navigate('../cluster', { state: { from: source } });
  };

  const columns: TableColumn[] = [
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
          {' '}
          {row.clusterName}
        </Button>
      ),
    },
    { title: 'Last Scan', field: 'lastScan' },
    { title: 'Failed Resources', field: 'failedResources' },
  ];

  interface TableData {
    clusterName: string;
    lastScan: string;
    failedResources: string;
  }

  const placeholderData: Array<TableData> = [
    {
      clusterName: 'my minikube',
      lastScan: '	18/07/24, 2:00:40 PM',
      failedResources: '20',
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
