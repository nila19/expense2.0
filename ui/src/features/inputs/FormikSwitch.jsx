import React from 'react';
import { useField } from 'formik';

// @mui/material components
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';

const CustomSwitch = ({ title, ...props }) => {
  return (
    <Tooltip title={title} placement='top'>
      <Switch {...props} />
    </Tooltip>
  );
};

export const FormikSwitch = (props) => {
  const [field, meta, helpers] = useField(props.field);
  const { value } = meta;
  return <CustomSwitch {...props} {...field} checked={value} onClick={() => helpers.setValue(!value)} />;
};
