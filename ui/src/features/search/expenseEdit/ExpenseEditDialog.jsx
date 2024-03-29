import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import moment from 'moment';

import _ from 'lodash';

import { Grid, Box, Dialog, DialogContent } from '@mui/material';

import MDButton from 'components/MDButton';

import { AppIcon } from 'components/app/AppIcon';
import { AppCard } from 'components/app/AppCard';

import { ICONS } from 'app/constants';
import { FormikAmount, FormikCheckBox, FormikComboBox, FormikDatePicker } from 'features/inputs';
import { buildCategoriesOptions, buildAccountOptions, buildBillOptions } from 'features/utils';

// import { editSchema } from "features/utils";

import { selectStartupData } from 'features/startup/startupSlice';
import { selectAccounts } from 'features/accounts/accountsSlice';
import { selectBills } from 'features/dashboard/bills/billTab/billTabSlice';
import { selectExpenseEdit, resetForm, saveEditExpense } from 'features/search/expenseEdit/expenseEditSlice';

const ExpenseEditForm = ({
  expense,
  billOptions,
  accountOptions,
  categoriesOptions,
  descriptions,
  bills,
  setOpenEdit,
}) => {
  const dispatch = useDispatch();

  const handleEditSave = (form) => {
    dispatch(saveEditExpense(form));
    setOpenEdit(false);
  };

  const expense2 = { ...expense, transDt: moment(expense.transDt, 'YYYY-MM-DD') };

  return (
    <Formik
      initialValues={expense2}
      // validationSchema={editSchema}
      onSubmit={(values, { setSubmitting }) => {
        setSubmitting(false);
        let expense = _.cloneDeep(values);
        if (expense.category && expense.category.id) {
          const category = _.find(categoriesOptions, { key: expense.category.id });
          expense.category.name = category ? category.label : null;
        }
        if (expense.bill && expense.bill.id) {
          const bill = _.find(bills, { id: expense.bill.id });
          const { id, name, billDt } = bill;
          expense.bill = { id, name, billDt };
        }
        handleEditSave(expense);
      }}
    >
      {({ isSubmitting, handleSubmit }) => (
        <Form>
          <Grid container spacing={1} alignItems='center' justifyContent='center'>
            <Grid item xs={12} sm={12}>
              <Field
                name='accounts.from.id'
                id='fromAcctId'
                label='From Account'
                component={FormikComboBox}
                options={accountOptions}
              />
            </Grid>
            {expense.bill && expense.bill.id && (
              <Grid item xs={12} sm={12} marginTop={1}>
                <Field name='bill.id' id='billId' label='Bill' component={FormikComboBox} options={billOptions} />
              </Grid>
            )}
            <Grid item xs={12} sm={12} marginTop={1}>
              {expense.adjust ? (
                <Field
                  name='accounts.to.id'
                  id='toAcctId'
                  label='To Account'
                  component={FormikComboBox}
                  options={accountOptions}
                />
              ) : (
                <Field
                  name='category.id'
                  id='categoryId'
                  label='Category'
                  component={FormikComboBox}
                  options={categoriesOptions}
                />
              )}
            </Grid>
            <Grid item xs={12} sm={12} marginTop={1}>
              <Field
                freeSolo
                name='description'
                id='description'
                label='Description'
                component={FormikComboBox}
                options={descriptions}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={4} marginTop={1}>
              <Field name='amount' id='amount' label='Amount' component={FormikAmount} />
            </Grid>
            <Grid item xs={12} sm={12} md={4} marginTop={1}>
              <Field name='transDt' id='transDt' label='Date' component={FormikDatePicker} />
            </Grid>
            <Grid item xs={12} sm={6} md={1} marginTop={1}>
              <Box display='flex' justifyContent='center' alignItems='center'>
                {!expense.adjust && <Field name='adhoc' id='adhoc' title='Adhoc' component={FormikCheckBox} />}
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={1} marginTop={1}>
              <Box display='flex' justifyContent='center' alignItems='center'>
                {!expense.adjust && (
                  <Field name='recurring' id='recurring' title='Recurring' component={FormikCheckBox} />
                )}
              </Box>
            </Grid>
            <Grid item xs={12} sm={12} md={2} marginTop={1}>
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
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};

export const ExpenseEditDialog = ({ openEdit, setOpenEdit }) => {
  const dispatch = useDispatch();
  const { categories, descriptions } = useSelector(selectStartupData);
  const { accounts } = useSelector(selectAccounts);
  const bills = useSelector(selectBills);
  const expense = useSelector(selectExpenseEdit);

  const categoriesOptions = useMemo(() => buildCategoriesOptions(categories), [categories]);
  const accountOptions = useMemo(() => buildAccountOptions(accounts), [accounts]);
  const billOptions = useMemo(() => {
    const acctId = _.get(expense, 'bill.account.id');
    return acctId ? buildBillOptions(bills, acctId) : [];
  }, [expense, bills]);

  const handleEditCancel = () => {
    dispatch(resetForm());
    setOpenEdit(false);
  };

  const body = (
    <ExpenseEditForm
      expense={expense}
      billOptions={billOptions}
      accountOptions={accountOptions}
      categoriesOptions={categoriesOptions}
      descriptions={descriptions}
      bills={bills}
      setOpenEdit={setOpenEdit}
    />
  );

  return (
    <>
      {expense && openEdit && (
        <Dialog open={openEdit} onClose={handleEditCancel} fullWidth width={'300px'}>
          <DialogContent style={{ padding: '0px' }}>
            <AppCard
              color='info'
              titleIcon={expense.adjust ? ICONS.TransformIcon : ICONS.AddShoppingCartIcon}
              title={expense.adjust ? 'MODIFY ADJUSTMENT' : 'MODIFY EXPENSE'}
              body={body}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
