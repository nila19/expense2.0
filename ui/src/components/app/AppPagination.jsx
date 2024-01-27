import React from 'react';
import { useDispatch } from 'react-redux';

import { Grid, Icon, Tooltip } from '@mui/material';
import { GridPagination } from '@mui/x-data-grid';

import MDTypography from 'components/MDTypography';

import { AppIcon } from 'components/app/AppIcon';

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
          <Tooltip title='Reset Filter' placement='top'>
            <Icon fontSize='small' title='Tally' onClick={() => handleResetFilters()}>
              {<AppIcon icon='FilterAltIcon' color='error' clickable />}
            </Icon>
          </Tooltip>
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
