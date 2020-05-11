import React from 'react';

import _ from 'lodash';

import { makeStyles } from '@material-ui/core/styles';

import GridItem from 'components/Grid/GridItem.js';
import GridContainer from 'components/Grid/GridContainer.js';

const useStyles = makeStyles(() => ({
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ff9800',
  },
}));

export const SummaryHeader = ({ months }) => {
  const classes = useStyles();

  return (
    <GridContainer>
      {months &&
        months.map((e) => (
          <GridItem xs={12} sm={12} md={1} key={e.id}>
            <div style={{ marginTop: '10px', textAlign: 'center' }}>
              <span className={classes.label}> {_.toUpper(e.name)}</span>
            </div>
          </GridItem>
        ))}
    </GridContainer>
  );
};
