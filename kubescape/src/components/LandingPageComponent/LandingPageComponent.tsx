import {
  Content,
  ContentHeader,
  Header,
  HeaderLabel,
  InfoCard,
  Page,
  SupportButton,
} from '@backstage/core-components';
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Typography,
} from '@material-ui/core';
import React, { useState } from 'react';

const pingURL = 'http://localhost:8007/api/kubescape/health';
const baseURL = 'http://localhost:8007/api/kubescape';

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

export function LandingPageComponent() {
  const [scanResult, setScanResult] = useState('');

  async function handlePing() {
    try {
      const response = await fetch(pingURL);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const json = await response.json();
      console.log(json);
      alert(JSON.stringify(json));
    } catch (error) {
      console.error(error.message);
    }
  }

  async function handleScan() {
    // const url = baseURL + '/scan';
    try {
      setScanResult('Processing Scan');
      const response = await fetch(`${baseURL}/scan`);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const json = await response.json();
      console.log(json);
      //   const result = JSON.stringify(json.scanResult);
      const result = json.scanResult;
      //   alert(result);
      setScanResult(result);
    } catch (error) {
      console.error(error.message);
    }
  }

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
        <Button variant="contained" onClick={handleScan}>
          Cluster Scan
        </Button>
        {/* <Typography>{scanResult}</Typography> */}
        <Container maxWidth="md">
          <HTMLDisplay htmlContent={scanResult} />
        </Container>
      </Content>
    </Page>
  );
}
