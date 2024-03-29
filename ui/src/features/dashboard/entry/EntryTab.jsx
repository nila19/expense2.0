import React, { memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field } from 'formik';

import _ from 'lodash';

import { Grid, Box } from '@mui/material';

import MDButton from 'components/MDButton';

import { AppIcon } from 'components/app/AppIcon';
import { entrySchema } from 'features/utils';
import { FormikAmount, FormikCheckBox, FormikComboBox, FormikDatePicker } from 'features/inputs';

import { selectEntry, resetEntry, addExpense } from 'features/dashboard/entry/entrySlice';
import {
  setFrom,
  setTo,
  setCategory,
  setDesc,
  setAmount,
  setTransDt,
  setAdhoc,
  setRecurring,
} from 'features/dashboard/entry/entrySlice';

export const EntryTab = memo(({ adjust, descriptions, categories, accountOptions, categoriesOptions }) => {
  const dispatch = useDispatch();

  const { accounts, category, description, amount, transDt, adhoc, recurring } = useSelector(selectEntry);

  const initialValues = (adjust) => ({
    adjust: adjust,
    accounts: {
      from: { id: accounts.from.id },
      to: { id: accounts.to.id },
    },
    category: { id: adjust ? 0 : category.id, name: null },
    description: description,
    amount: amount ? amount : '',
    transDt: transDt,
    adhoc: adhoc ? adhoc : false,
    recurring: recurring ? recurring : false,
  });

  const fixCategory = (values) => {
    if (values.adjust) {
      values.category.id = 0;
    }
    const category = values.category.id ? _.find(categories, { id: values.category.id }) : null;
    values.category.name = category ? category.name : null;
  };

  const handleFrom = (field, value) => dispatch(setFrom({ field, value }));
  const handleTo = (field, value) => dispatch(setTo({ field, value }));
  const handleCategory = (field, value) => dispatch(setCategory({ field, value }));
  const handleDesc = (field, value) => dispatch(setDesc({ field, value }));
  const handleAmount = (field, value) => dispatch(setAmount({ field, value }));
  const handleTransDt = (field, value) => dispatch(setTransDt({ field, value }));
  const handleAdhoc = (field, value) => dispatch(setAdhoc({ field, value }));
  const handleRecurring = (field, value) => dispatch(setRecurring({ field, value }));

  return (
    <div
      style={{
        paddingBottom: '10px',
        paddingLeft: '10px',
        paddingRight: '10px',
      }}
    >
      <Formik
        initialValues={initialValues(adjust)}
        validationSchema={entrySchema}
        onSubmit={(values, { setSubmitting, resetForm }) => {
          setSubmitting(false);
          values = { ...values, adjust: adjust };
          fixCategory(values);
          dispatch(addExpense(values));
          resetForm({ values: { ...values, description: null, amount: '' } });
          dispatch(resetEntry());
        }}
      >
        {({ isSubmitting, handleSubmit }) => (
          <Form>
            <Grid container marginTop={1} spacing={2} alignItems='center' justifyContent='center'>
              <Grid item xs={12} sm={12} md={4}>
                <Field
                  name='accounts.from.id'
                  id='fromAcctId'
                  label='From Account'
                  onFieldChange={handleFrom}
                  component={FormikComboBox}
                  options={accountOptions}
                />
              </Grid>
              <Grid item xs={12} sm={12} md={5}>
                {adjust ? (
                  <Field
                    name='accounts.to.id'
                    id='toAcctId'
                    label='To Account'
                    onFieldChange={handleTo}
                    component={FormikComboBox}
                    options={accountOptions}
                  />
                ) : (
                  <Field
                    name='category.id'
                    id='categoryId'
                    label='Category'
                    onFieldChange={handleCategory}
                    component={FormikComboBox}
                    options={categoriesOptions}
                  />
                )}
              </Grid>
              <Grid item xs={12} sm={12} md={3}>
                <Box display='flex' justifyContent='center' alignItems='center'>
                  <Field
                    name='amount'
                    id='amount'
                    label='Amount'
                    onFieldChange={handleAmount}
                    component={FormikAmount}
                  />
                </Box>
              </Grid>
            </Grid>
            <Grid container marginTop={1} spacing={2} alignItems='center' justifyContent='center'>
              <Grid item xs={12} sm={12} md={6}>
                <Field
                  freeSolo
                  name='description'
                  id='description'
                  label='Description'
                  onFieldChange={handleDesc}
                  component={FormikComboBox}
                  options={descriptions}
                />
              </Grid>
              <Grid item xs={12} sm={12} md={2}>
                <Field
                  name='transDt'
                  id='transDt'
                  label='Date'
                  onFieldChange={handleTransDt}
                  component={FormikDatePicker}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={1}>
                <Box display='flex' justifyContent='center' alignItems='center'>
                  {!adjust && (
                    <Field
                      name='adhoc'
                      id='adhoc'
                      title='Adhoc'
                      onFieldChange={handleAdhoc}
                      component={FormikCheckBox}
                    />
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={1}>
                <Box display='flex' justifyContent='center' alignItems='center'>
                  {!adjust && (
                    <Field
                      name='recurring'
                      id='recurring'
                      title='Recurring'
                      onFieldChange={handleRecurring}
                      component={FormikCheckBox}
                    />
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} sm={12} md={2}>
                <Box display='flex' justifyContent='center' alignItems='center'>
                  <MDButton
                    color='success'
                    type='button'
                    variant='gradient'
                    size='large'
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                  >
                    <AppIcon icon='AddIcon' color='white' />
                  </MDButton>
                </Box>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </div>
  );
});
