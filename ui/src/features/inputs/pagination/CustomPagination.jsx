import withStyles from '@mui/styles/withStyles';
import TablePagination from '@mui/material/TablePagination';

const paginationStyle = { toolbar: { minHeight: '30px', paddingTop: '5px' }, caption: { fontSize: 12 } };
export const CustomPagination = withStyles(paginationStyle)(TablePagination);
