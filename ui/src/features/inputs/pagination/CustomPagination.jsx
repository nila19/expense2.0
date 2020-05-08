import { withStyles } from '@material-ui/core/styles';
import TablePagination from '@material-ui/core/TablePagination';

const paginationStyle = { toolbar: { minHeight: '30px', paddingTop: '5px' }, caption: { fontSize: 12 } };
export const CustomPagination = withStyles(paginationStyle)(TablePagination);
