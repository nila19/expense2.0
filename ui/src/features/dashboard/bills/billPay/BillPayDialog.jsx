import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import memoize from 'memoize-one';

import moment from 'moment';

import { Grid, Dialog, DialogContent } from '@mui/material';

import SaveIcon from '@mui/icons-material/Save';

import MDButton from 'components/MDButton';

import { AppCard } from 'components/app/AppCard';

import { ICONS } from 'app/constants';
import { CustomTextField, FormikAmount, FormikComboBox, FormikDatePicker } from 'features/inputs';
import { formatAmt, formatDate, buildAccountOptions } from 'features/utils';

import { selectAccounts } from 'features/accounts/accountsSlice';
import { selectBillPay, resetBillPay, savePayBill } from 'features/dashboard/bills/billPay/billPaySlice';

const initialValues = memoize((bill) => ({
  bill: bill,
  account: { id: null },
  paidAmt: bill.balance,
  paidDt: moment(),
}));

const validationSchema = memoize((bill) =>
  Yup.object({
    paidDt: Yup.string().required('Required'),
    paidAmt: Yup.number().required('Required').moreThan(0, 'Must be > 0').max(bill.amount, 'Must be < Bill Amt'),
    account: Yup.object({ id: Yup.number().required('Required') }),
  })
);

const BillPayForm = ({ bill, accountOptions, setOpenEdit }) => {
  const dispatch = useDispatch();

  const handleEditSave = (form) => {
    dispatch(savePayBill(form));
    setOpenEdit(false);
  };

  return (
    <Formik
      initialValues={initialValues(bill)}
      validationSchema={validationSchema(bill)}
      onSubmit={(values, { setSubmitting }) => {
        setSubmitting(false);
        handleEditSave(values);
      }}
    >
      {({ isSubmitting, handleSubmit }) => (
        <Form>
          <Grid container spacing={1} alignItems='center' justifyContent='center'>
            <Grid item xs={12} sm={12}>
              <CustomTextField disabled id='acct' label='Account' value={bill.account.name} />
            </Grid>
            <Grid item xs={12} sm={12} marginTop={2}>
              <CustomTextField disabled id='bill' label='Bill' value={bill.name} />
            </Grid>
            <Grid item xs={12} sm={4} marginTop={2}>
              <CustomTextField disabled id='billAmount' label='Bill Amount' value={formatAmt(bill.amount, true)} />
            </Grid>
            <Grid item xs={12} sm={4} marginTop={2}>
              <CustomTextField disabled id='billBalance' label='Bill Balance' value={formatAmt(bill.balance, true)} />
            </Grid>
            <Grid item xs={12} sm={4} marginTop={2}>
              <CustomTextField disabled id='dueDate' label='Due Date' value={formatDate(bill.dueDt)} />
            </Grid>
            <Grid item xs={12} sm={12} marginTop={2}>
              <Field
                name='account.id'
                id='accountId'
                label='Pay From'
                component={FormikComboBox}
                options={accountOptions}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={5} marginTop={2}>
              <Field name='paidAmt' id='paidAmt' label='Payment Amount' component={FormikAmount} />
            </Grid>
            <Grid item xs={12} sm={12} md={5} marginTop={2}>
              <Field name='paidDt' id='paidDt' label='Payment Date' component={FormikDatePicker} />
            </Grid>
            <Grid item xs={12} sm={12} md={2} marginTop={2}>
              <MDButton
                color='primary'
                type='button'
                variant='gradient'
                size='large'
                disabled={isSubmitting}
                onClick={handleSubmit}
              >
                <SaveIcon />
              </MDButton>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};

export const BillPayDialog = ({ openEdit, setOpenEdit }) => {
  const dispatch = useDispatch();

  const bill = useSelector(selectBillPay);
  const { accounts } = useSelector(selectAccounts);
  // only cash accounts can be used for bill pay.
  const accountOptions = useMemo(
    () => buildAccountOptions(accounts.filter((e) => e.cash === true && e.useForBillPay === true)),
    [accounts]
  );

  const handleEditCancel = () => {
    dispatch(resetBillPay());
    setOpenEdit(false);
  };

  const body = <BillPayForm bill={bill} accountOptions={accountOptions} setOpenEdit={setOpenEdit} />;

  return (
    <>
      {bill && openEdit && (
        <Dialog open={openEdit} onClose={handleEditCancel} fullWidth width={'180px'}>
          <DialogContent style={{ padding: '0px' }}>
            <AppCard color='primary' titleIcon={ICONS.CreditCardIcon} title='PAY BILL' body={body} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
