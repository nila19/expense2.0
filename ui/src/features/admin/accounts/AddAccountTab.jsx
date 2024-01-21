import React, { memo, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { Formik, Form, Field } from 'formik';
// import memoize from 'memoize-one';

import { Grid, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import MDButton from 'components/MDButton';
import MDTypography from 'components/MDTypography';

import { acctSchema } from 'features/utils';
import { FormikTextField } from 'features/inputs';
import { FormikAmount, FormikCheckBox, FormikComboBox } from 'features/inputs';
import { buildIconOptions, buildColorOptions } from 'components/app/AppIcon';

import { addAccount } from 'features/accounts/accountSlice';

export const AddAccountTab = memo(() => {
  const dispatch = useDispatch();

  const iconOptions = useMemo(() => buildIconOptions(), []);
  const colorOptions = useMemo(() => buildColorOptions(), []);

  const initialValues = () => ({
    name: null,
    cash: null,
    billed: false,
    icon: null,
    color: null,
    seq: 999,
    closingDay: 5,
    dueDay: 5,
    balance: 0,
    active: true,
  });

  return (
    <Formik
      initialValues={initialValues()}
      validationSchema={acctSchema}
      onSubmit={(values, { setSubmitting }) => {
        setSubmitting(false);
        dispatch(addAccount(values));
      }}
    >
      {({ isSubmitting }) => (
        <Form>
          <Grid container spacing={2} alignItems='center' justifyContent='center'>
            <Grid item xs={12} sm={12} md={5}>
              <Grid container spacing={2} alignItems='center' justifyContent='center'>
                <Grid item xs={12} sm={12} md={5}>
                  <Field name='name' id='name' label='Account Name' component={FormikTextField} />
                </Grid>
                <Grid item xs={12} sm={12} md={4}>
                  <Field name='icon' id='icon' label='Icon' component={FormikComboBox} options={iconOptions} />
                </Grid>
                <Grid item xs={12} sm={12} md={3}>
                  <Field name='color' id='color' label='Color' component={FormikComboBox} options={colorOptions} />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={12} md={2}>
              <Grid container spacing={2} alignItems='center' justifyContent='center'>
                <Grid item xs={12} sm={12} md={4}>
                  <MDTypography variant='body2' fontWeight='light'>
                    Cash
                  </MDTypography>
                  <Field name='cash' id='cash' label='Cash' component={FormikCheckBox} />
                </Grid>
                <Grid item xs={12} sm={12} md={4}>
                  <MDTypography variant='body2' fontWeight='light'>
                    Billed
                  </MDTypography>
                  <Field name='billed' id='billed' label='Billed' component={FormikCheckBox} />
                </Grid>
                <Grid item xs={12} sm={12} md={4}>
                  <MDTypography variant='body2' fontWeight='light'>
                    Active
                  </MDTypography>
                  <Field name='active' id='active' label='Active' component={FormikCheckBox} />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={12} md={5}>
              <Grid container spacing={2} alignItems='center' justifyContent='center'>
                <Grid item xs={12} sm={12} md={2}>
                  <Field name='seq' id='seq' label='Seq' component={FormikTextField} />
                </Grid>
                <Grid item xs={12} sm={12} md={2}>
                  <Field name='closingDay' id='closingDay' label='Closing Day' component={FormikTextField} />
                </Grid>
                <Grid item xs={12} sm={12} md={2}>
                  <Field name='dueDay' id='dueDay' label='Due Day' component={FormikTextField} />
                </Grid>
                <Grid item xs={12} sm={12} md={3}>
                  <Field name='balance' id='balance' label='Balance' component={FormikAmount} />
                </Grid>
                <Grid item xs={12} sm={12} md={3}>
                  <Box display='flex' justifyContent='center' alignItems='center'>
                    <MDButton color='success' type='submit' variant='gradient' size='large' disabled={isSubmitting}>
                      <AddIcon />
                    </MDButton>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
});
