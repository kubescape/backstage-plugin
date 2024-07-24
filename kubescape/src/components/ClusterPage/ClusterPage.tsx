/* eslint-disable no-console */
import React, { PropsWithChildren, useState } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Box, Button, Container, Paper, Typography } from '@material-ui/core';
import {
  CardTab,
  Content,
  Header,
  Page,
  TabbedCard,
  TabbedLayout,
} from '@backstage/core-components';

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

  const cardContentStyle = { height: 200, width: 500 };
  // const cardContentStyle = {};
  return (
    <Page themeId="tool">
      <Header
        title="Welcome to kubescape!"
        subtitle="An open-source Kubernetes security platform"
      />
      <Box width="100%">
        <TabbedCard title="Cluster Information">
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
        </TabbedCard>
      </Box>
    </Page>
  );
}
