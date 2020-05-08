import React from 'react';
import { useField } from 'formik';

// @material-ui/core components
import { makeStyles } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';

// @material-ui/icons
import CheckIcon from '@material-ui/icons/Check';

import styles from 'assets/jss/material-dashboard-react/checkboxAdnRadioStyle.js';

const checkBoxStyles = makeStyles(styles);

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
