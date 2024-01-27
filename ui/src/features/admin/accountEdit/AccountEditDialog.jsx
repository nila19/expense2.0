import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field } from 'formik';

import _ from 'lodash';

import { Grid, Box, Dialog, DialogContent } from '@mui/material';

import MDButton from 'components/MDButton';
import MDTypography from 'components/MDTypography';

import { ICONS } from 'app/constants';
import { AppCard } from 'components/app/AppCard';
import { AppIcon, buildIconOptions, buildColorOptions } from 'components/app/AppIcon';

import { FormikAmount, FormikCheckBox, FormikComboBox, FormikTextField } from 'features/inputs';
// import { editSchema } from "features/utils";

import { selectAccountEdit, resetForm, saveEditAccount } from 'features/accounts/accountEditSlice';

const AccountEditForm = ({ account, setOpenEdit }) => {
  const dispatch = useDispatch();

  const handleEditSave = (form) => {
    dispatch(saveEditAccount(form));
    setOpenEdit(false);
  };

  const iconOptions = useMemo(() => buildIconOptions(), []);
  const colorOptions = useMemo(() => buildColorOptions(), []);

  const account2 = { ...account };

  return (
    <Formik
      initialValues={account2}
      // validationSchema={editSchema}
      onSubmit={(values, { setSubmitting }) => {
        setSubmitting(false);
        let account = _.cloneDeep(values);
        handleEditSave(account);
      }}
    >
      {({ isSubmitting, handleSubmit }) => (
        <Form>
          <Grid container spacing={1} alignItems='center' justifyContent='center'>
            <Grid item xs={12} sm={12}>
              <Field freeSolo name='name' id='accName' label='Account Name' component={FormikTextField} />
            </Grid>
            <Grid item xs={12} sm={12} md={12}>
              <Field name='icon' id='icon' label='Icon' component={FormikComboBox} options={iconOptions} />
            </Grid>
            <Grid item xs={12} sm={12} md={12}>
              <Field name='color' id='color' label='Color' component={FormikComboBox} options={colorOptions} />
            </Grid>
            <Grid item xs={12} sm={12} md={4}>
              <Box display='flex' justifyContent='center' alignItems='center'>
                <MDTypography variant='body2' fontWeight='light'>
                  Cash
                </MDTypography>
                <Field name='cash' id='cash' title='Cash' component={FormikCheckBox} />
              </Box>
            </Grid>
            <Grid item xs={12} sm={12} md={4}>
              <Box display='flex' justifyContent='center' alignItems='center'>
                <MDTypography variant='body2' fontWeight='light'>
                  Billed
                </MDTypography>
                <Field name='billed' id='billed' title='Billed' component={FormikCheckBox} />
              </Box>
            </Grid>
            <Grid item xs={12} sm={12} md={4}>
              <Box display='flex' justifyContent='center' alignItems='center'>
                <MDTypography variant='body2' fontWeight='light'>
                  Active
                </MDTypography>
                <Field name='active' id='active' title='Active' component={FormikCheckBox} />
              </Box>
            </Grid>
            <Grid item xs={12} sm={12} md={4}>
              <Field name='seq' id='seq' label='Sequence' component={FormikTextField} />
            </Grid>
            <Grid item xs={12} sm={12} md={8}>
              <Field name='balance' id='balance' label='Balance' component={FormikAmount} />
            </Grid>
            <Grid item xs={12} sm={12} md={4}>
              {account.billed && (
                <Field name='closingDay' id='closingDay' label='Closing Day' component={FormikTextField} />
              )}
            </Grid>
            <Grid item xs={12} sm={12} md={4}>
              {account.billed && <Field name='dueDay' id='dueDay' label='Due Day' component={FormikTextField} />}
            </Grid>
            <Grid item xs={12} sm={12} md={4}>
              <Box display='flex' justifyContent='center' alignItems='center'>
                <MDButton
                  color='primary'
                  type='button'
                  variant='gradient'
                  size='large'
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                >
                  <AppIcon icon='SaveIcon' color='white' />
                </MDButton>
              </Box>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};

export const AccountEditDialog = ({ openEdit, setOpenEdit }) => {
  const dispatch = useDispatch();
  const account = useSelector(selectAccountEdit);

  const handleEditCancel = () => {
    dispatch(resetForm());
    setOpenEdit(false);
  };

  const body = <AccountEditForm account={account} setOpenEdit={setOpenEdit} />;

  return (
    <>
      {account && openEdit && (
        <Dialog open={openEdit} onClose={handleEditCancel} fullWidth width={'300px'}>
          <DialogContent style={{ padding: '0px' }}>
            <AppCard color='info' titleIcon={ICONS.CreditCardIcon} title={'MODIFY ACCOUNT'} body={body} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
