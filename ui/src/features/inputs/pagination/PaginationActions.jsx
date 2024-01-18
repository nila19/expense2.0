import React from "react";
import { useDispatch, useSelector } from "react-redux";

import makeStyles from "@mui/styles/makeStyles";
import IconButton from "@mui/material/IconButton";

import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";
import FilterListIcon from "@mui/icons-material/FilterList";

import { PAGINATION_BLOCK } from "app/constants";
import { ActionButton } from "features/inputs";
import { formatAmt } from "features/utils";

import { selectDashboardGlobal, resetFilters } from "features/dashboard/dashboardGlobalSlice";

const useStyles = makeStyles((theme) => ({
  root: {
    flexShrink: 0,
    marginLeft: theme.spacing(2.5),
  },
}));

export const PaginationActions = ({
  section,
  count,
  page,
  rowsPerPage,
  totalAmt,
  onPageChange,
}) => {
  const classes = useStyles();

  const dispatch = useDispatch();
  const { accountFilter, billFilter } = useSelector(selectDashboardGlobal);

  // for bills list, only consider accountFilter
  // for expenses list, consider both accountFilter & billFilter
  const filterEnabled =
    section === PAGINATION_BLOCK.BILLS ? accountFilter : accountFilter || billFilter;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <div className={classes.root}>
      <span style={{ color: "primary", fontSize: 12, paddingLeft: 20, paddingRight: 20 }}>
        {formatAmt(totalAmt, true)}
      </span>
      <ActionButton
        title="Clear Expense Filters"
        color="primary"
        disabled={!filterEnabled}
        onClick={() => dispatch(resetFilters())}
        icon={filterEnabled ? <FilterListIcon fontSize="small" /> : ""}
      />
      <IconButton
        onClick={handleFirstPageButtonClick}
        style={{ padding: "4px 12px" }}
        disabled={page === 0}
        aria-label="first page"
        size="large"
      >
        <FirstPageIcon />
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        style={{ padding: "4px 12px" }}
        disabled={page === 0}
        aria-label="previous page"
        size="large"
      >
        <KeyboardArrowLeftIcon />
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        style={{ padding: "4px 12px" }}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
        size="large"
      >
        <KeyboardArrowRightIcon />
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        style={{ padding: "4px 12px" }}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
        size="large"
      >
        <LastPageIcon />
      </IconButton>
    </div>
  );
};
