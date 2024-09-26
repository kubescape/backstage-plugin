import {
  Content,
  ContentHeader,
  Header,
  HeaderActionMenu,
  Page,
} from '@backstage/core-components';
import { Button, Grid, Link, Typography } from '@material-ui/core';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import React, { useEffect, useState } from 'react';
import {
  getResourceVulnerabiliyList,
  VulnerabilityResponse,
} from '../../api/KubescapeClient';

const columns: GridColDef[] = [
  {
    field: 'CVE_ID',
    headerName: 'CVE ID',
    minWidth: 200,
    renderCell: (params: GridRenderCellParams) => (
      <Link
        underline="hover"
        target="_blank"
        rel="noopener noreferrer"
        href={
          params.row.CVE_ID.split('-')[0] === 'CVE'
            ? `https://nvd.nist.gov/vuln/detail/${params.row.CVE_ID}`
            : `https://github.com/advisories/${params.row.CVE_ID}`
        }
      >
        <Typography> {params.row.CVE_ID}</Typography>
      </Link>
    ),
  },
  {
    field: 'severity',
    headerName: 'Severity',
    minWidth: 200,
  },
  {
    field: 'package',
    headerName: 'Package',
    minWidth: 200,
  },
  {
    field: 'version',
    headerName: 'Version',
    minWidth: 200,
  },
  {
    field: 'fixVersion',
    headerName: 'Fix Version',
    minWidth: 200,
  },
  {
    field: 'fixedState',
    headerName: 'Fixed State',
    minWidth: 200,
  },
];

export function VulnerabilitiesSidePanelComponent({
  clusterName,
  data,
  operatePanel,
}) {
  const [vulnerabilityRows, setVulnerabilityRows] = useState<
    VulnerabilityResponse[]
  >([]);
  const config = useApi(configApiRef);
  const baseURL = `${config.getString('backend.baseUrl')}/api/kubescape`;

  useEffect(() => {
    getResourceVulnerabiliyList(baseURL, clusterName, data?.id).then(rows => {
      setVulnerabilityRows(rows);
    });
  }, [clusterName, data]);

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
            <ContentHeader title={`Resource:  ${data.name}`} />
          </Grid>
        </Grid>

        <DataGrid rows={vulnerabilityRows} columns={columns} />
      </Content>
    </Page>
  );
}
