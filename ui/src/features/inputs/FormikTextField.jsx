import React from "react";
import { useField } from "formik";

import makeStyles from "@mui/styles/makeStyles";
import TextField from "@mui/material/TextField";

import { labelColor } from "features/inputs/inputUtils";

const fieldStyles = makeStyles(() => ({
  textRoot: {
    display: "flex",
    flexWrap: "wrap",
    // marginTop: '16px',
  },
  textField: {
    ...labelColor,
    width: "100%",
    "& input": {
      fontSize: 12,
      paddingTop: "18px",
      paddingBottom: "18px",
      paddingRight: "15px",
    },
  },
}));

export const CustomTextField = (props) => {
  const fieldClasses = fieldStyles();
  return (
    <div className={fieldClasses.textRoot}>
      <TextField
        {...props}
        variant="outlined"
        className={fieldClasses.textField}
        InputLabelProps={{ shrink: true }}
      />
    </div>
  );
};

export const FormikTextField = (props) => {
  const [field, meta] = useField(props.field);
  const { touched, error } = meta;
  return <CustomTextField {...props} {...field} error={touched && error && true} />;
};
