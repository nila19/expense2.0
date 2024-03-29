import React from 'react';
import { useField } from 'formik';

import _ from 'lodash';

import makeStyles from '@mui/styles/makeStyles';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

import { labelColor } from 'features/inputs/inputUtils';

const useStyles = makeStyles(() => ({
  inputText: {
    ...labelColor,
    marginTop: '25px',
    '& input': {
      fontSize: 12,
    },
  },
  option: {
    fontSize: 12,
  },
}));

const ComboBox = (props) => {
  const classes = useStyles();
  const { id, label, error, options, value, onChange, freeSolo } = props;

  const selectedOption = freeSolo ? value : value ? _.find(options, { key: value }) : null;

  return (
    <div className={classes.root}>
      <Autocomplete
        id={id}
        {...(freeSolo ? { freeSolo: true, includeInputInList: true } : {})}
        // size='small'
        classes={{
          option: classes.option,
        }}
        // autoComplete
        // autoHighlight
        autoSelect
        options={options}
        getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
        value={selectedOption}
        onChange={onChange}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            error={error}
            variant='outlined'
            InputLabelProps={{ shrink: true }}
            className={classes.inputText}
          />
        )}
      />
    </div>
  );
};

export const FormikComboBox = (props) => {
  const [field, meta, helpers] = useField(props.field);
  const { error } = meta;
  return (
    <ComboBox
      {...props}
      {...field}
      error={error && true}
      options={props.options}
      // value={props.value}
      onChange={(e, option) => {
        const value = option ? (option.key ? option.key : option) : null;
        helpers.setValue(value);
        if (props.onFieldChange) {
          props.onFieldChange(field.name, value);
        }
      }}
    />
  );
};
