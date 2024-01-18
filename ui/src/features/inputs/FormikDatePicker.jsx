import React from "react";
import { useField } from "formik";

import moment from "moment";
import "moment/locale/es";

import makeStyles from "@mui/styles/makeStyles";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";

import { FORMATS } from "app/constants";

import { labelColor } from "features/inputs/inputUtils";

const fieldStyles = makeStyles(() => ({
  dateRoot: {
    display: "flex",
    flexWrap: "wrap",
    // marginTop: "2px",
  },
  dateField: {
    ...labelColor,
    marginTop: "22px",
    "& input": {
      fontSize: 12,
      paddingTop: "17px",
      paddingBottom: "17px",
    },
  },
}));

const CustomDatePicker = (props) => {
  const fieldClasses = fieldStyles();
  return (
    <div className={fieldClasses.dateRoot}>
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <DatePicker
          {...props}
          disableToolbar
          autoOk
          variant="inline"
          inputVariant="outlined"
          format="MM/DD/YYYY"
          margin="normal"
          className={fieldClasses.dateField}
          InputLabelProps={{ shrink: true }}
        />
      </LocalizationProvider>
    </div>
  );
};

export const FormikDatePicker = (props) => {
  const [field, meta, helpers] = useField(props.field);
  const { touched, error } = meta;
  return (
    <CustomDatePicker
      {...props}
      // {...field}
      error={touched && error && true}
      onChange={(date) => {
        const val = moment(date).format(FORMATS.YYYYMMDD);
        helpers.setValue(moment(date));
        if (props.onFieldChange) {
          props.onFieldChange(field.name, val);
        }
      }}
    />
  );
};
