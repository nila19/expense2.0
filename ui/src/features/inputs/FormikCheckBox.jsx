import React from 'react';
import { useField } from 'formik';

// @material-ui/core components
import { makeStyles } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
import Tooltip from '@material-ui/core/Tooltip';

// @material-ui/icons
import CheckIcon from '@material-ui/icons/Check';

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
