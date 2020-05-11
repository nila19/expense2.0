import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import _ from 'lodash';

// @material-ui/core
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

import GridItem from 'components/Grid/GridItem.js';
import GridContainer from 'components/Grid/GridContainer.js';
import Card from 'components/Card/Card.js';
import CardHeader from 'components/Card/CardHeader.js';
import CardBody from 'components/Card/CardBody.js';
import styles from 'assets/jss/material-dashboard-react/views/dashboardStyle.js';

import { COUNTS } from 'app/config';

import { SummaryControl } from 'features/summary/SummaryControl';
import { SummaryHeader } from 'features/summary/SummaryHeader';
import { SummaryData } from 'features/summary/SummaryData';
import { getSliceForPage } from 'features/utils';

import { selectSummary, loadSummary } from 'features/summary/summarySlice';
import { selectStartupData } from 'features/startup/startupSlice';

const useStyles = makeStyles(styles);

const Summary = () => {
  const classes = useStyles();

  const dispatch = useDispatch();
  const { transMonths } = useSelector(selectStartupData);
  const { loading, data: summaryData } = useSelector(selectSummary);

  const [forecast, setForecast] = useState(false);
  const [regular, setRegular] = useState(true);
  const [adhoc, setAdhoc] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    // dispatch(loadTransMonths(selectedCity));
    dispatch(loadSummary());
  }, [dispatch]);

  const maxPage = useMemo(() => transMonths.length / COUNTS.SUMMARY_COLS, [transMonths]);

  const months = useMemo(() => getSliceForPage(transMonths, page, COUNTS.SUMMARY_COLS), [transMonths, page]);
  const hasNext = page < maxPage;
  const hasPrevious = page > 0;

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

  const changePage = (delta) => {
    setPage(_.clamp(page + delta, 0, maxPage));
  };

  return (
    <Card style={{ marginBottom: '10px' }}>
      <CardHeader color='info'>
        <GridContainer>
          <GridItem xs={12} sm={12} md={11}>
            <h4 className={classes.cardTitleWhite}>MONTHLY SUMMARY</h4>
          </GridItem>
          <GridItem xs={12} sm={12} md={1}>
            <div style={{ paddingLeft: 60 }}>
              {loading && <CircularProgress color='secondary' style={{ width: 14, height: 14 }} />}
            </div>
          </GridItem>
        </GridContainer>
      </CardHeader>
      <CardBody style={{ padding: '10px 20px' }}>
        <GridContainer>
          <GridItem xs={12} sm={12} md={2}>
            <SummaryControl
              forecast={forecast}
              regular={regular}
              adhoc={adhoc}
              toggleForecast={toggleForecast}
              toggleRegular={toggleRegular}
              toggleAdhoc={toggleAdhoc}
              hasNext={hasNext}
              hasPrevious={hasPrevious}
              changePage={changePage}
            />
          </GridItem>
          <GridItem xs={12} sm={12} md={10}>
            <SummaryHeader months={months} />
          </GridItem>
          <GridItem xs={12} sm={12} md={12}>
            <SummaryData page={page} months={months} summaryData={summaryData} />
          </GridItem>
        </GridContainer>
      </CardBody>
    </Card>
  );
};

// default export to facilitate lazy loading
export default Summary;
