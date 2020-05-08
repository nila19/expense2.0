import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';

import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';
import FilterListIcon from '@material-ui/icons/FilterList';

import { ActionButton } from 'features/inputs';
import { formatAmt } from 'features/utils';

import { selectDashboardGlobal, resetFilters } from 'features/dashboard/dashboardGlobalSlice';

const useStyles = makeStyles((theme) => ({
  root: {
    flexShrink: 0,
    marginLeft: theme.spacing(2.5),
  },
}));

export const PaginationActions = ({ section, count, page, rowsPerPage, total, onChangePage }) => {
  const classes = useStyles();

  const dispatch = useDispatch();
  const { accountFilter, billFilter } = useSelector(selectDashboardGlobal);

  // for bills list, only consider accountFilter
  // for expenses list, consider both accountFilter & billFilter
  const filterEnabled = section === 'bills' ? accountFilter : accountFilter || billFilter;

  const handleFirstPageButtonClick = (event) => {
    onChangePage(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onChangePage(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onChangePage(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onChangePage(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <div className={classes.root}>
      <span style={{ color: '#e91e63', fontSize: 12, paddingLeft: 20, paddingRight: 20 }}>
        {formatAmt(total, true)}
      </span>
      <ActionButton
        color='rose'
        disabled={!filterEnabled}
        onClick={() => dispatch(resetFilters())}
        icon={filterEnabled ? <FilterListIcon fontSize='small' /> : ''}
      />
      <IconButton
        onClick={handleFirstPageButtonClick}
        style={{ padding: '4px 12px' }}
        disabled={page === 0}
        aria-label='first page'
      >
        <FirstPageIcon />
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        style={{ padding: '4px 12px' }}
        disabled={page === 0}
        aria-label='previous page'
      >
        <KeyboardArrowLeftIcon />
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        style={{ padding: '4px 12px' }}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label='next page'
      >
        <KeyboardArrowRightIcon />
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        style={{ padding: '4px 12px' }}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label='last page'
      >
        <LastPageIcon />
      </IconButton>
    </div>
  );
};
