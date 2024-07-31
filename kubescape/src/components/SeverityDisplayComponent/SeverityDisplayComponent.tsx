import {
  Box,
  ButtonBase,
  Chip,
  makeStyles,
  Paper,
  Theme,
} from '@material-ui/core';
import { createStyles } from '@material-ui/styles';
import React, { useState } from 'react';

export interface ChipData {
  key: string;
  label: number;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
      listStyle: 'none',
      padding: theme.spacing(0.5),
      margin: 0,
    },
    chip: {
      margin: theme.spacing(0.5),
    },
  }),
);

export function SeverityDisplayComponent({ data }) {
  const classes = useStyles();
  return (
    <ButtonBase component="ul" className={classes.root}>
      {data?.map(item => {
        return (
          <li key={item.key}>
            <Chip
              label={`${item.key}: ${item.label}`}
              size="small"
              className={classes.chip}
            />
          </li>
        );
      })}
    </ButtonBase>
  );
}
