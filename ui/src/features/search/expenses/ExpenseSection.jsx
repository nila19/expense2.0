import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { EXPENSE_BLOCK } from 'app/constants';
import { COUNTS } from 'app/config';

import { AppSection } from 'components/app/AppSection';

import { ExpenseTab } from 'features/search/expenses/ExpenseTab';
import { selectExpenses } from 'features/search/expenses/expenseSlice';
import { selectAppGlobal } from 'features/appGlobalSlice';

export const ExpenseSection = ({ section }) => {
  const { data, searchResults } = useSelector(selectExpenses);
  const { accountsExpanded } = useSelector(selectAppGlobal);

  const expenses = useMemo(() => {
    let exp = data;
    if (section === EXPENSE_BLOCK.SEARCH && searchResults) {
      exp = searchResults;
    }
    return exp;
  }, [section, data, searchResults]);

  const rowsPerPage = useMemo(() => {
    let rows = accountsExpanded ? COUNTS.DASHBOARD_EXPENSES_MIN : COUNTS.DASHBOARD_EXPENSES;
    if (section === EXPENSE_BLOCK.SEARCH) {
      rows = COUNTS.SEARCH_EXPENSES;
    }
    return rows;
  }, [section, accountsExpanded]);

  return (
    <AppSection
      title='EXPENSES'
      headerColor='info'
      content=<ExpenseTab expenses={expenses} rowsPerPage={rowsPerPage} />
    />
  );
};
