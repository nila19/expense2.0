import React from 'react';
import { useField } from 'formik';

import moment from 'moment';

// @material-ui/core components
import { makeStyles } from '@material-ui/core/styles';

import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';

import MomentUtils from '@date-io/moment';

import { labelColor } from 'features/inputs/inputUtils';
import { format } from 'features/utils';

const fieldStyles = makeStyles(() => ({
  dateRoot: {
    display: 'flex',
    flexWrap: 'wrap',
    marginTop: '2px',
  },
  dateField: {
    ...labelColor,
    marginTop: '22px',
    '& input': {
      fontSize: 12,
    },
  },
}));

const CustomDatePicker = (props) => {
  const fieldClasses = fieldStyles();
  return (
    <div className={fieldClasses.dateRoot}>
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <DatePicker
          {...props}
          disableToolbar
          autoOk
          variant='inline'
          inputVariant='outlined'
          format='MM/DD/YYYY'
          margin='normal'
          className={fieldClasses.dateField}
          InputLabelProps={{ shrink: true }}
        />
      </MuiPickersUtilsProvider>
    </div>
  );
};

export const FormikDatePicker = (props) => {
  const [field, meta, helpers] = useField(props.field);
  const { touched, error } = meta;
  return (
    <CustomDatePicker
      {...props}
      {...field}
      error={touched && error && true}
      onChange={(date) => {
        const value = moment(date).format(format.YYYYMMDD);
        helpers.setValue(value);
        if (props.onFieldChange) {
          props.onFieldChange(field.name, value);
        }
      }}
    />
  );
};
