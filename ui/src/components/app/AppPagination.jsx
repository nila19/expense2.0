import React from 'react';

import { Grid } from '@mui/material';
import { GridPagination } from '@mui/x-data-grid';

import MDTypography from 'components/MDTypography';

import { formatAmt } from 'features/utils';

export const AppPagination = (props) => {
  return (
    <Grid container alignItems='center' justifyContent='center'>
      <Grid item xs={12} sm={12} md={9} style={{ textAlign: 'right' }}>
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
