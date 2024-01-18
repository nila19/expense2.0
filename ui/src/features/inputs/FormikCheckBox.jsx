import React from "react";
import { useField } from "formik";

import Checkbox from "@mui/material/Checkbox";
import Tooltip from "@mui/material/Tooltip";

export const CustomCheckBox = (props) => {
  const { title, ...other } = props;
  return (
    <Tooltip title={title} placement="top">
      <Checkbox {...other} tabIndex={-1} />
    </Tooltip>
  );
};

export const FormikCheckBox = (props) => {
  const [field, meta, helpers] = useField(props.field);
  const { value } = meta;
  return (
    <CustomCheckBox
      {...props}
      {...field}
      checked={value}
      onClick={() => helpers.setValue(!value)}
    />
  );
};
