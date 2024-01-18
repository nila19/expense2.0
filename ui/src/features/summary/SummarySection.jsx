import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

import _ from "lodash";

import { COUNTS, ROUTE } from "app/config";

import { AppSection } from "components/app/AppSection";

import { SummaryTab } from "features/summary/SummaryTab";

import { getSliceForPage } from "features/utils";

import { selectSummary, loadSummary } from "features/summary/summarySlice";
import { clearSearchResults } from "features/search/expenses/expenseSlice";

export const SummarySection = () => {
  const dispatch = useDispatch();
  const { data } = useSelector(selectSummary);
  const { months, gridRows, totalRow } = data;

  const [page, setPage] = useState(0);
  const [goToSearch, setGoToSearch] = useState(false);

  useEffect(() => {
    dispatch(clearSearchResults());
  }, [dispatch]);

  useEffect(() => {
    dispatch(loadSummary());
  }, [dispatch]);

  const maxPage = useMemo(() => months.length / COUNTS.SUMMARY_COLS, [months]);

  const monthsForPage = useMemo(
    () => getSliceForPage(months, page, COUNTS.SUMMARY_COLS),
    [months, page]
  );
  const hasNext = page < maxPage;
  const hasPrevious = page > 0;

  const changePage = (delta) => {
    setPage(_.clamp(page + delta, 0, maxPage));
  };

  if (goToSearch) {
    return <Navigate to={ROUTE.SEARCH} />;
  }

  return (
    <AppSection
      title="MONTHLY SUMMARY"
      headerColor="warning"
      content=<SummaryTab
        page={page}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
        changePage={changePage}
        monthsForPage={monthsForPage}
        gridRows={gridRows}
        totalRow={totalRow}
        setGoToSearch={setGoToSearch}
      />
    />
  );
};
