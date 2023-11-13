import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';

import 'typeface-roboto';

import Typography from '@mui/material/Typography';
import { lighten } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import withStyles from '@mui/styles/withStyles';
import LinearProgress from '@mui/material/LinearProgress';

import ErrorIcon from '@mui/icons-material/Error';

import SnackbarContent from 'components/Snackbar/SnackbarContent.js';

import { SOCKETS, COLOR } from 'app/config';
import { axios } from 'app/axios';
import { startListening } from 'app/sockets';

import { connectToBackend } from 'features/startup/startupSlice';

export const Startup = () => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    // initialize axios passing the snackbar.
    axios(enqueueSnackbar);
    setTimeout(() => {
      dispatch(connectToBackend());
      if (SOCKETS.ENABLED) {
        startListening(dispatch);
      }
    }, 0);
    console.log('Startup configured...');
  }, [dispatch, enqueueSnackbar]);

  return <> </>;
};

const BorderLinearProgress = withStyles({
  root: {
    height: 20,
    backgroundColor: lighten(COLOR.BLUE, 0.5),
  },
  bar: {
    borderRadius: 20,
    backgroundColor: COLOR.BLUE,
  },
})(LinearProgress);

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  margin: {
    margin: theme.spacing(1),
  },
}));

export const Loading = ({ connected, inprogress }) => {
  const classes = useStyles();
  const text = inprogress ? (connected ? 'Loading data...' : 'Connecting...') : 'Failed...';
  const item = inprogress ? (
    <BorderLinearProgress className={classes.margin} color='secondary' />
  ) : (
    <SnackbarContent
      message={connected ? 'Trouble Loading data...' : 'Trouble connecting to backend...'}
      color='danger'
      icon={ErrorIcon}
    />
  );
  return (
    <div style={{ textAlign: 'center', width: '100%', height: '100%', marginTop: 300 }}>
      <div style={{ display: 'inline-block', width: '60%', textAlign: 'center' }}>
        <Typography variant='h2' gutterBottom>
          {text}
        </Typography>
        {item}
      </div>
    </div>
  );
};
