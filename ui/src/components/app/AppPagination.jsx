import React from 'react';
import { useDispatch } from 'react-redux';

import { Grid, Icon } from '@mui/material';
import { GridPagination } from '@mui/x-data-grid';

import FilterAltIcon from '@mui/icons-material/FilterAlt';

import MDTypography from 'components/MDTypography';

import { formatAmt } from 'features/utils';
import { resetFilters } from 'features/dashboard/dashboardGlobalSlice';

export const AppPagination = (props) => {
  const dispatch = useDispatch();

  const handleResetFilters = () => {
    dispatch(resetFilters());
  };

  return (
    <Grid container alignItems='center' justifyContent='center'>
      <Grid item xs={12} sm={12} md={1}></Grid>
      <Grid item xs={12} sm={12} md={1}>
        {props.filterApplied && (
          <Icon fontSize='small' title='Tally' color='error' onClick={() => handleResetFilters()}>
            {<FilterAltIcon fontSize='small' style={{ top: '1px', cursor: 'pointer' }} />}
          </Icon>
        )}
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
