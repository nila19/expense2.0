import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';

import _ from 'lodash';

// @material-ui/core components
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';

import GridItem from 'components/Grid/GridItem.js';
import GridContainer from 'components/Grid/GridContainer.js';
import Card from 'components/Card/Card.js';
import CardHeader from 'components/Card/CardHeader.js';
import CardBody from 'components/Card/CardBody.js';
import styles from 'assets/jss/material-dashboard-react/views/dashboardStyle.js';

import { COUNTS } from 'app/config';

import { SummaryHeader } from 'features/summary/header/SummaryHeader';
import { SummaryBody } from 'features/summary/body/SummaryBody';
import { getSliceForPage } from 'features/utils';

import { selectSummary, loadSummary } from 'features/summary/summarySlice';
import { selectStartupData } from 'features/startup/startupSlice';
import { clearSearchResults } from 'features/search/expenses/expenseSlice';

const useStyles = makeStyles(styles);

const SummaryPage = ({ loading, page, hasNext, hasPrevious, changePage, months, summaryData, setGoToSearch }) => {
  const classes = useStyles();

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
      <CardBody style={{ padding: '20px 20px' }}>
        <Table className={classes.table}>
          <TableHead>
            <SummaryHeader hasNext={hasNext} hasPrevious={hasPrevious} changePage={changePage} months={months} />
          </TableHead>
          <TableBody>
            <SummaryBody page={page} months={months} summaryData={summaryData} setGoToSearch={setGoToSearch} />
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
};

const Summary = () => {
  const dispatch = useDispatch();
  const { transMonths } = useSelector(selectStartupData);
  const { loading, data: summaryData } = useSelector(selectSummary);

  const [page, setPage] = useState(0);
  const [goToSearch, setGoToSearch] = useState(false);

  useEffect(() => {
    dispatch(clearSearchResults());
  }, [dispatch]);

  useEffect(() => {
    // dispatch(loadTransMonths(selectedCity));
    dispatch(loadSummary());
  }, [dispatch]);

  const maxPage = useMemo(() => transMonths.length / COUNTS.SUMMARY_COLS, [transMonths]);

  const months = useMemo(() => getSliceForPage(transMonths, page, COUNTS.SUMMARY_COLS), [transMonths, page]);
  const hasNext = page < maxPage;
  const hasPrevious = page > 0;

  const changePage = (delta) => {
    setPage(_.clamp(page + delta, 0, maxPage));
  };

  if (goToSearch) {
    return <Redirect to='/search' />;
  }

  return (
    <SummaryPage
      loading={loading}
      page={page}
      hasNext={hasNext}
      hasPrevious={hasPrevious}
      changePage={changePage}
      months={months}
      summaryData={summaryData}
      setGoToSearch={setGoToSearch}
    />
  );
};

// default export to facilitate lazy loading
export default Summary;
