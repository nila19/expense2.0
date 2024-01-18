import React from "react";
import { useField } from "formik";

import makeStyles from "@mui/styles/makeStyles";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";

import { NumericFormat } from "react-number-format";

import { labelColor } from "features/inputs/inputUtils";

const fieldStyles = makeStyles((theme) => ({
  amountRoot: {
    display: "flex",
    flexWrap: "wrap",
    // marginTop: "16px",
  },
  amountLabel: {
    ...labelColor,
    margin: theme.spacing(1),
  },
  amountField: {
    ...labelColor,
    "& input": {
      fontSize: 12,
      paddingTop: "17px",
      paddingBottom: "17px",
      paddingRight: "15px",
    },
  },
}));

const NumberFormatCustom = (props) => {
  const { inputRef, onChange, ...other } = props;
  return (
    <NumericFormat
      thousandSeparator=","
      valueIsNumericString={true}
      decimalScale={2}
      fixedDecimalScale
      prefix=""
      {...other}
      autoComplete="off"
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
      <FormControl fullWidth className={fieldClasses.amountLabel} variant="outlined">
        <OutlinedInput
          id={id}
          {...other}
          className={fieldClasses.amountField}
          inputComponent={NumberFormatCustom}
          startAdornment={<InputAdornment position="start">$</InputAdornment>}
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
