import React from 'react';
import { useField } from 'formik';

import makeStyles from '@mui/styles/makeStyles';
import Checkbox from '@mui/material/Checkbox';
import Tooltip from '@mui/material/Tooltip';

// @mui/icons-material
import CheckIcon from '@mui/icons-material/Check';

import styles from 'assets/jss/material-dashboard-react/checkboxAdnRadioStyle.js';

const checkBoxStyles = makeStyles(styles);

export const CustomCheckBox = (props) => {
  const checkBoxClasses = checkBoxStyles();
  const { title, ...other } = props;
  return (
    <Tooltip title={title} placement='top'>
      <Checkbox
        {...other}
        tabIndex={-1}
        checkedIcon={<CheckIcon className={checkBoxClasses.checkedIcon} />}
        icon={<CheckIcon className={checkBoxClasses.uncheckedIcon} />}
        classes={{
          checked: checkBoxClasses.checked,
        }}
      />
    </Tooltip>
  );
};

export const FormikCheckBox = (props) => {
  const [field, meta, helpers] = useField(props.field);
  const { value } = meta;
  return <CustomCheckBox {...props} {...field} checked={value} onClick={() => helpers.setValue(!value)} />;
};
