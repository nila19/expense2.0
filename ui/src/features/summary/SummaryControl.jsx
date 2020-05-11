import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';

import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';

import GridItem from 'components/Grid/GridItem.js';
import GridContainer from 'components/Grid/GridContainer.js';

import { CustomCheckBox } from 'features/inputs';

const useStyles = makeStyles((theme) => ({
  margin: {
    margin: theme.spacing(1),
  },
}));

export const SummaryControl = ({
  forecast,
  regular,
  adhoc,
  toggleForecast,
  toggleRegular,
  toggleAdhoc,
  hasNext,
  hasPrevious,
  changePage,
}) => {
  const classes = useStyles();

  return (
    <GridContainer>
      <GridItem xs={12} sm={12} md={2}>
        <CustomCheckBox id='forecast' checked={forecast} onClick={toggleForecast} />
      </GridItem>
      <GridItem xs={12} sm={12} md={2}>
        <CustomCheckBox id='regular' checked={regular} onClick={toggleRegular} />
      </GridItem>
      <GridItem xs={12} sm={12} md={2}>
        <CustomCheckBox id='adhoc' checked={adhoc} onClick={toggleAdhoc} />
      </GridItem>
      <GridItem xs={12} sm={12} md={2}></GridItem>
      <GridItem xs={12} sm={12} md={2}>
        <IconButton
          aria-label='Left'
          className={classes.margin}
          size='small'
          disabled={!hasPrevious}
          onClick={() => changePage(-1)}
        >
          <ArrowBackIcon fontSize='inherit' />
        </IconButton>
      </GridItem>
      <GridItem xs={12} sm={12} md={2}>
        <IconButton
          aria-label='Left'
          className={classes.margin}
          size='small'
          disabled={!hasNext}
          onClick={() => changePage(+1)}
        >
          <ArrowForwardIcon fontSize='inherit' />
        </IconButton>
      </GridItem>
    </GridContainer>
  );
};
