import React from 'react';
import {
  Card,
  CardContent,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@material-ui/core';
import { GaugeCard, InfoCard, TrendLine } from '@backstage/core-components';

export function Dashboard(props) {
  return (
    <Grid container>
      <Grid item>
        <GaugeCard
          variant="fullHeight"
          alignGauge="bottom"
          size="small"
          title="NSA Score"
          progress={0.9}
        />
      </Grid>
      <Grid item>
        <GaugeCard
          variant="fullHeight"
          alignGauge="bottom"
          size="small"
          title="MITRE Score"
          progress={0.6}
        />
      </Grid>
      <Grid item>
        <Card>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Failure Statistics</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {props.failure_data.map(row => (
                <TableRow key={row.type}>
                  <TableCell component="th">{row.type}</TableCell>
                  <TableCell align="right">{row.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </Grid>
      <Grid item md={4}>
        <InfoCard title="Trends over time" noPadding>
          <CardContent>
            <TrendLine data={[0.8, 0.7, 0.5, 0.1]} title="Trend over time" />
          </CardContent>
        </InfoCard>
      </Grid>
    </Grid>
  );
}
