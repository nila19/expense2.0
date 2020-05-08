import React from 'react';
import { useField } from 'formik';

// @material-ui/core components
import { makeStyles } from '@material-ui/core/styles';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';

import NumberFormat from 'react-number-format';

import { labelColor } from 'features/inputs/inputUtils';

const fieldStyles = makeStyles((theme) => ({
  amountRoot: {
    display: 'flex',
    flexWrap: 'wrap',
    marginTop: '16px',
  },
  amountLabel: {
    ...labelColor,
    margin: theme.spacing(1),
  },
  amountField: {
    ...labelColor,
    '& input': {
      fontSize: 12,
      paddingTop: '18px',
      paddingBottom: '18px',
      paddingRight: '15px',
    },
  },
}));

const NumberFormatCustom = (props) => {
  const { inputRef, onChange, ...other } = props;
  return (
    <NumberFormat
      thousandSeparator
      isNumericString
      prefix=''
      {...other}
      autoComplete='off'
      getInputRef={inputRef}
      onValueChange={(values) => {
        onChange({
          target: {
            name: props.name,
            value: values.value,
          },
        });
      }}
    />
  );
};

const CustomAmount = (props) => {
  const fieldClasses = fieldStyles();
  const { id, label, ...other } = props;
  return (
    <div className={fieldClasses.amountRoot}>
      <FormControl fullWidth className={fieldClasses.amountLabel} variant='outlined'>
        <InputLabel htmlFor={id}>{label}</InputLabel>
        <OutlinedInput
          id={id}
          {...other}
          className={fieldClasses.amountField}
          inputComponent={NumberFormatCustom}
          startAdornment={<InputAdornment position='start'>$</InputAdornment>}
        />
      </FormControl>
    </div>
  );
};

export const FormikAmount = (props) => {
  const [field, meta] = useField(props.field);
  const { touched, error } = meta;
  return <CustomAmount {...props} {...field} error={touched && error && true} />;
};
