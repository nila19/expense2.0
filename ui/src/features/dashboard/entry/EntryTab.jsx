import React, { memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field } from 'formik';

import _ from 'lodash';

import { Grid, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import MDButton from 'components/MDButton';

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
} from 'features/dashboard/entry/entrySlice';

export const EntryTab = memo(({ adjust, descriptions, categories, accountOptions, categoriesOptions }) => {
  const dispatch = useDispatch();

  const { accounts, category, description, amount, transDt, adhoc } = useSelector(selectEntry);

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
            <Grid container spacing={2} marginTop={2} alignItems='center' justifyContent='center'>
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
                <Field name='amount' id='amount' label='Amount' onFieldChange={handleAmount} component={FormikAmount} />
              </Grid>
            </Grid>
            <Grid container spacing={2} marginTop={2} alignItems='center' justifyContent='center'>
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
              <Grid item xs={12} sm={12} md={2}>
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
              <Grid item xs={12} sm={12} md={2}>
                <MDButton
                  color='success'
                  type='button'
                  variant='gradient'
                  size='large'
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                >
                  <AddIcon />
                </MDButton>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </div>
  );
});
