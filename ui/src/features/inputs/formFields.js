import React from 'react';
import { useField } from 'formik';

import moment from 'moment';

// @material-ui/core components
import { makeStyles } from '@material-ui/core/styles';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import Tooltip from '@material-ui/core/Tooltip';

import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';

// @material-ui/icons
import CheckIcon from '@material-ui/icons/Check';

import MomentUtils from '@date-io/moment';
import NumberFormat from 'react-number-format';

import Button from 'components/CustomButtons/Button.js';
import styles from 'assets/jss/material-dashboard-react/checkboxAdnRadioStyle.js';

import { format } from 'features/utils';

const checkBoxStyles = makeStyles(styles);

export const labelColor = {
  '& label.Mui-focused': {
    color: 'green',
  },
  '& .MuiInput-underline:after': {
    borderBottomColor: 'green',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#999',
    },
    '&:hover fieldset': {
      borderColor: 'green',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'green',
    },
  },
};

const fieldStyles = makeStyles((theme) => ({
  dateRoot: {
    display: 'flex',
    flexWrap: 'wrap',
    marginTop: '2px',
  },
  amountRoot: {
    display: 'flex',
    flexWrap: 'wrap',
    marginTop: '16px',
  },
  textRoot: {
    display: 'flex',
    flexWrap: 'wrap',
    marginTop: '16px',
  },
  textField: {
    ...labelColor,
    width: '100%',
    '& input': {
      fontSize: 12,
      paddingTop: '18px',
      paddingBottom: '18px',
      paddingRight: '15px',
    },
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
      onChange={(date) => helpers.setValue(moment(date).format(format.YYYYMMDD))}
    />
  );
};

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

const CustomCheckBox = (props) => {
  const checkBoxClasses = checkBoxStyles();
  return (
    <Checkbox
      {...props}
      tabIndex={-1}
      checkedIcon={<CheckIcon className={checkBoxClasses.checkedIcon} />}
      icon={<CheckIcon className={checkBoxClasses.uncheckedIcon} />}
      classes={{
        checked: checkBoxClasses.checked,
      }}
    />
  );
};

export const FormikCheckBox = (props) => {
  const [field, meta, helpers] = useField(props.field);
  const { value } = meta;
  return <CustomCheckBox {...props} {...field} checked={value} onClick={() => helpers.setValue(!value)} />;
};

const CustomSwitch = ({ title, ...props }) => {
  return (
    <Tooltip title={title}>
      <Switch {...props} />
    </Tooltip>
  );
};

export const FormikSwitch = (props) => {
  const [field, meta, helpers] = useField(props.field);
  const { value } = meta;
  return <CustomSwitch {...props} {...field} checked={value} onClick={() => helpers.setValue(!value)} />;
};

export const CustomTextField = (props) => {
  const fieldClasses = fieldStyles();
  return (
    <div className={fieldClasses.textRoot}>
      <TextField {...props} variant='outlined' className={fieldClasses.textField} InputLabelProps={{ shrink: true }} />
    </div>
  );
};

export const FormikTextField = (props) => {
  const [field, meta] = useField(props.field);
  const { touched, error } = meta;
  return <CustomTextField {...props} {...field} error={touched && error && true} />;
};

export const ActionButton = (props) => {
  const { icon, ...other } = props;
  return (
    <Button
      {...other}
      justIcon
      simple
      style={{
        padding: '0px',
        marginTop: '0px',
        marginBottom: '0px',
        marginLeft: '3px',
        marginRight: '3px',
        top: '0px',
        width: '20px',
        height: '20px',
        minWidth: '20px',
      }}
    >
      {icon}
    </Button>
  );
};
