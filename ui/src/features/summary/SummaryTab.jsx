import React from "react";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";

import { SummaryHeader } from "features/summary/header/SummaryHeader";
import { SummaryBody } from "features/summary/body/SummaryBody";

export const SummaryTab = ({
  page,
  hasNext,
  hasPrevious,
  changePage,
  monthsForPage,
  gridRows,
  totalRow,
  setGoToSearch,
}) => {
  return (
    <Table>
      <TableBody>
        <SummaryHeader
          hasNext={hasNext}
          hasPrevious={hasPrevious}
          changePage={changePage}
          monthsForPage={monthsForPage}
        />
        {/* </TableHead>
      <TableBody> */}
        <SummaryBody
          page={page}
          monthsForPage={monthsForPage}
          gridRows={gridRows}
          totalRow={totalRow}
          setGoToSearch={setGoToSearch}
        />
      </TableBody>
    </Table>
  );
};
