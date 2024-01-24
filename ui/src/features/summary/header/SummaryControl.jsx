import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import { Grid, Box, IconButton } from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import { CustomCheckBox } from 'features/inputs';

import { loadSummary } from 'features/summary/summarySlice';

export const SummaryControl = ({ hasNext, hasPrevious, changePage }) => {
  const dispatch = useDispatch();
  const [forecast, setForecast] = useState(false);
  const [regular, setRegular] = useState(true);
  const [adhoc, setAdhoc] = useState(true);

  const toggleForecast = () => {
    setForecast(!forecast);
    dispatch(loadSummary({ forecast: !forecast, regular, adhoc }));
  };

  const toggleRegular = () => {
    setRegular(!regular);
    dispatch(loadSummary({ forecast, regular: !regular, adhoc }));
  };

  const toggleAdhoc = () => {
    setAdhoc(!adhoc);
    dispatch(loadSummary({ forecast, regular, adhoc: !adhoc }));
  };

  return (
    <Box display='flex' justifyContent='center' alignItems='center'>
      <Grid container spacing={0} marginTop={0} alignItems='center' justifyContent='center'>
        <Grid item xs={12} sm={12} md={2}>
          <CustomCheckBox id='forecast' title='Forecast' checked={forecast} onClick={toggleForecast} />
        </Grid>
        <Grid item xs={12} sm={12} md={2}>
          <CustomCheckBox id='regular' title='Regular' disabled={!adhoc} checked={regular} onClick={toggleRegular} />
        </Grid>
        <Grid item xs={12} sm={12} md={2}>
          <CustomCheckBox id='adhoc' title='Adhoc' disabled={!regular} checked={adhoc} onClick={toggleAdhoc} />
        </Grid>
        <Grid item xs={12} sm={12} md={2}></Grid>
        <Grid item xs={12} sm={12} md={2}>
          <IconButton size='small' disabled={!hasPrevious} onClick={() => changePage(-1)}>
            <ArrowBackIcon fontSize='inherit' />
          </IconButton>
        </Grid>
        <Grid item xs={12} sm={12} md={2}>
          <IconButton size='small' disabled={!hasNext} onClick={() => changePage(+1)}>
            <ArrowForwardIcon fontSize='inherit' />
          </IconButton>
        </Grid>
      </Grid>
    </Box>
  );
};
