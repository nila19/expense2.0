import React, { memo, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import memoize from 'memoize-one';

import _ from 'lodash';

import { Grid, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

import MDButton from 'components/MDButton';

import { FormikAmount, FormikComboBox, FormikSwitch } from 'features/inputs';
import { buildCategoriesOptions, buildAccountOptions, buildMonthOptions, buildAdhocOptions } from 'features/utils';

import { selectStartupData } from 'features/startup/startupSlice';
import { selectAccounts } from 'features/accounts/accountsSlice';
import { selectExpenses, searchExpenses } from 'features/search/expenses/expenseSlice';

const initialValues = memoize((summaryFilter) =>
  _.merge(
    {
      allRecords: false,
      category: { id: null },
      description: null,
      amount: null,
      bill: { id: null },
      account: { id: null },
      transMonth: { id: null, year: false },
      entryMonth: { id: null, year: false },
      adjust: null,
      adhoc: null,
    },
    summaryFilter
  )
);

export const SearchTab = memo(() => {
  const dispatch = useDispatch();
  const { summaryFilter } = useSelector(selectExpenses);
  const { categories, descriptions, transMonths, entryMonths } = useSelector(selectStartupData);
  const { accounts } = useSelector(selectAccounts);

  const categoriesOptions = useMemo(() => buildCategoriesOptions(categories), [categories]);
  const accountOptions = useMemo(() => buildAccountOptions(accounts), [accounts]);
  const transMonthOptions = useMemo(() => buildMonthOptions(transMonths), [transMonths]);
  const entryMonthOptions = useMemo(() => buildMonthOptions(entryMonths), [entryMonths]);
  const adhocOptions = useMemo(() => buildAdhocOptions(), []);

  const populateYearFlag = (month, months) => {
    if (month && month.id) {
      const selectedMonth = _.find(months, { id: month.id });
      month.year = selectedMonth.aggregate;
    }
  };

  return (
    <Formik
      initialValues={initialValues(summaryFilter)}
      onSubmit={(values, { setSubmitting }) => {
        setSubmitting(false);
        populateYearFlag(values.transMonth, transMonths);
        populateYearFlag(values.entryMonth, entryMonths);
        dispatch(searchExpenses(values));
      }}
    >
      {({ isSubmitting }) => (
        <Form>
          <Grid container spacing={2} alignItems='center' justifyContent='center'>
            <Grid item xs={12} sm={12} md={6} marginTop={2}>
              <Grid container spacing={2} alignItems='center' justifyContent='center'>
                <Grid item xs={12} sm={12} md={4}>
                  <Field
                    name='category.id'
                    id='categoryId'
                    label='Category'
                    component={FormikComboBox}
                    options={categoriesOptions}
                  />
                </Grid>
                <Grid item xs={12} sm={12} md={4}>
                  <Field
                    freeSolo
                    name='description'
                    id='description'
                    label='Description'
                    component={FormikComboBox}
                    options={descriptions}
                  />
                </Grid>
                <Grid item xs={12} sm={12} md={4}>
                  <Field
                    name='account.id'
                    id='accountId'
                    label='Account'
                    component={FormikComboBox}
                    options={accountOptions}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={12} md={3} marginTop={2}>
              <Grid container spacing={2} alignItems='center' justifyContent='center'>
                <Grid item xs={12} sm={12} md={4}>
                  <Field
                    name='transMonth.id'
                    id='transMonth'
                    label='Exp Month'
                    component={FormikComboBox}
                    options={transMonthOptions}
                  />
                </Grid>
                <Grid item xs={12} sm={12} md={4}>
                  <Field
                    name='entryMonth.id'
                    id='entryMonth'
                    label='Entry Month'
                    component={FormikComboBox}
                    options={entryMonthOptions}
                  />
                </Grid>
                <Grid item xs={12} sm={12} md={4}>
                  <Field name='amount' id='amount' label='Amount' component={FormikAmount} />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={12} md={3} marginTop={2}>
              <Grid container spacing={2} alignItems='center' justifyContent='center'>
                <Grid item xs={12} sm={12} md={3}>
                  <Field name='adjust' id='adjust' label='Adjust' component={FormikComboBox} options={adhocOptions} />
                </Grid>
                <Grid item xs={12} sm={12} md={3}>
                  <Field name='adhoc' id='adhoc' label='Adhoc' component={FormikComboBox} options={adhocOptions} />
                </Grid>
                <Grid item xs={12} sm={12} md={3}>
                  <Box display='flex' justifyContent='center' alignItems='center'>
                    <Field name='allRecords' id='allRecords' title='Fetch all records' component={FormikSwitch} />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={12} md={3}>
                  <MDButton color='primary' type='submit' variant='gradient' size='large' disabled={isSubmitting}>
                    <SearchIcon />
                  </MDButton>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
});
