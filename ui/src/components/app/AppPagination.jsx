import React from 'react';

import { Grid } from '@mui/material';
import { GridPagination } from '@mui/x-data-grid';

import FilterAltIcon from '@mui/icons-material/FilterAlt';

import MDTypography from 'components/MDTypography';

import { formatAmt } from 'features/utils';

export const AppPagination = (props) => {
  return (
    <Grid container alignItems='center' justifyContent='center'>
      <Grid item xs={12} sm={12} md={1}></Grid>
      <Grid item xs={12} sm={12} md={1}>
        {props.filterApplied && <FilterAltIcon fontSize='small' color='error' />}
      </Grid>
      <Grid item xs={12} sm={12} md={7} style={{ textAlign: 'right' }}>
        <MDTypography variant='body2' fontWeight='light' color='error'>
          {formatAmt(props.totalAmt, true)}
        </MDTypography>
      </Grid>
      <Grid item xs={12} sm={12} md={3}>
        <GridPagination {...props} />
      </Grid>
    </Grid>
  );
};
