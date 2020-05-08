import React from 'react';
import { useField } from 'formik';

// @material-ui/core components
import Switch from '@material-ui/core/Switch';
import Tooltip from '@material-ui/core/Tooltip';

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
