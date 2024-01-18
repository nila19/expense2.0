import React from 'react';

import Tooltip from '@mui/material/Tooltip';

import MDButton from 'components/MDButton';

export const ActionButton = (props) => {
  const { icon, title = '', ...other } = props;
  return (
    <Tooltip title={title} placement='top' enterDelay={1000}>
      <span>
        <MDButton
          {...other}
          iconOnly={true}
          variant='text'
          style={{
            padding: '0px',
            marginTop: '0px',
            marginBottom: '0px',
            marginLeft: '3px',
            marginRight: '3px',
            top: '0px',
            width: '20px',
            height: '20px',
            minWidth: '20px',
          }}
        >
          {icon}
        </MDButton>
      </span>
    </Tooltip>
  );
};
