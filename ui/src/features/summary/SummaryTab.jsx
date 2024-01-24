import React from 'react';

import { Table, TableBody } from '@mui/material';

import { SummaryHeader } from 'features/summary/header/SummaryHeader';
import { SummaryBody } from 'features/summary/body/SummaryBody';

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
