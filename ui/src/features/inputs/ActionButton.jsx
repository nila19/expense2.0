import React from 'react';

import Tooltip from '@material-ui/core/Tooltip';

import Button from 'components/CustomButtons/Button.js';

export const ActionButton = (props) => {
  const { icon, title = '', ...other } = props;
  return (
    <Tooltip title={title} placement='top' enterDelay={1000}>
      <Button
        {...other}
        justIcon
        simple
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
      </Button>
    </Tooltip>
  );
};
