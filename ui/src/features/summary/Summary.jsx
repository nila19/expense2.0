import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

import _ from 'lodash';

import makeStyles from '@mui/styles/makeStyles';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';

import GridItem from 'components/Grid/GridItem.js';
import GridContainer from 'components/Grid/GridContainer.js';
import Card from 'components/Card/Card.js';
import CardHeader from 'components/Card/CardHeader.js';
import CardBody from 'components/Card/CardBody.js';
import styles from 'assets/jss/material-dashboard-react/views/dashboardStyle.js';

import { COUNTS, ROUTE } from 'app/config';

import { SummaryHeader } from 'features/summary/header/SummaryHeader';
import { SummaryBody } from 'features/summary/body/SummaryBody';
import { getSliceForPage } from 'features/utils';

import { selectSummary, loadSummary } from 'features/summary/summarySlice';
import { clearSearchResults } from 'features/search/expenses/expenseSlice';

const useStyles = makeStyles(styles);

const SummaryPage = ({
  loading,
  page,
  hasNext,
  hasPrevious,
  changePage,
  monthsForPage,
  gridRows,
  totalRow,
  setGoToSearch,
}) => {
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
            <SummaryHeader
              hasNext={hasNext}
              hasPrevious={hasPrevious}
              changePage={changePage}
              monthsForPage={monthsForPage}
            />
          </TableHead>
          <TableBody>
            <SummaryBody
              page={page}
              monthsForPage={monthsForPage}
              gridRows={gridRows}
              totalRow={totalRow}
              setGoToSearch={setGoToSearch}
            />
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
};

const Summary = () => {
  const dispatch = useDispatch();
  const { loading, data } = useSelector(selectSummary);
  const { months, gridRows, totalRow } = data;

  const [page, setPage] = useState(0);
  const [goToSearch, setGoToSearch] = useState(false);

  useEffect(() => {
    dispatch(clearSearchResults());
  }, [dispatch]);

  useEffect(() => {
    // dispatch(loadTransMonths(selectedCity));
    dispatch(loadSummary());
  }, [dispatch]);

  const maxPage = useMemo(() => months.length / COUNTS.SUMMARY_COLS, [months]);

  const monthsForPage = useMemo(() => getSliceForPage(months, page, COUNTS.SUMMARY_COLS), [months, page]);
  const hasNext = page < maxPage;
  const hasPrevious = page > 0;

  const changePage = (delta) => {
    setPage(_.clamp(page + delta, 0, maxPage));
  };

  if (goToSearch) {
    return <Navigate to={ROUTE.SEARCH} />;
  }

  return (
    <SummaryPage
      loading={loading}
      page={page}
      hasNext={hasNext}
      hasPrevious={hasPrevious}
      changePage={changePage}
      monthsForPage={monthsForPage}
      gridRows={gridRows}
      totalRow={totalRow}
      setGoToSearch={setGoToSearch}
    />
  );
};

// default export to facilitate lazy loading
export default Summary;
