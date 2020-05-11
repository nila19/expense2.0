import React, { memo, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import memoize from 'memoize-one';

import _ from 'lodash';

// @material-ui/icons
import SearchIcon from '@material-ui/icons/Search';

import GridItem from 'components/Grid/GridItem.js';
import GridContainer from 'components/Grid/GridContainer.js';
import Button from 'components/CustomButtons/Button.js';
import Card from 'components/Card/Card.js';
import CardBody from 'components/Card/CardBody.js';

import { FormikAmount, FormikComboBox, FormikSwitch } from 'features/inputs';
import { buildCategoriesOptions, buildAccountOptions, buildMonthOptions, buildAdhocOptions } from 'features/utils';

import { selectStartupData } from 'features/startup/startupSlice';
import { selectAccounts } from 'features/dashboard/accounts/accountSlice';
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

export const SearchForm = memo(() => {
  const dispatch = useDispatch();
  const { summaryFilter } = useSelector(selectExpenses);
  const { categories, descriptions, transMonths, entryMonths } = useSelector(selectStartupData);
  const accounts = useSelector(selectAccounts);

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
          <Card style={{ marginBottom: '10px' }}>
            <CardBody style={{ padding: '10px 20px' }}>
              <GridContainer>
                <GridItem xs={12} sm={12} md={2}>
                  <Field
                    name='category.id'
                    id='categoryId'
                    label='Category'
                    component={FormikComboBox}
                    options={categoriesOptions}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={2}>
                  <Field
                    freeSolo
                    name='description'
                    id='description'
                    label='Description'
                    component={FormikComboBox}
                    options={descriptions}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={2}>
                  <Field
                    name='account.id'
                    id='accountId'
                    label='Account'
                    component={FormikComboBox}
                    options={accountOptions}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={1}>
                  <Field
                    name='transMonth.id'
                    id='transMonth'
                    label='Exp Month'
                    component={FormikComboBox}
                    options={transMonthOptions}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={1}>
                  <Field
                    name='entryMonth.id'
                    id='entryMonth'
                    label='Entry Month'
                    component={FormikComboBox}
                    options={entryMonthOptions}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={1}>
                  <Field name='amount' id='amount' label='Amount' labelWidth={60} component={FormikAmount} />
                </GridItem>
                <GridItem xs={12} sm={12} md={3}>
                  <GridContainer>
                    <GridItem xs={12} sm={12} md={3}>
                      <Field
                        name='adjust'
                        id='adjust'
                        label='Adjust'
                        component={FormikComboBox}
                        options={adhocOptions}
                      />
                    </GridItem>
                    <GridItem xs={12} sm={12} md={3}>
                      <Field name='adhoc' id='adhoc' label='Adhoc' component={FormikComboBox} options={adhocOptions} />
                    </GridItem>
                    <GridItem xs={12} sm={12} md={3}>
                      <div style={{ marginTop: '28px' }}>
                        <Field name='allRecords' id='allRecords' title='Fetch all records' component={FormikSwitch} />
                      </div>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={3}>
                      <div style={{ marginTop: '23px' }}>
                        <Button color='rose' type='submit' disabled={isSubmitting}>
                          <SearchIcon />
                        </Button>
                      </div>
                    </GridItem>
                  </GridContainer>
                </GridItem>
              </GridContainer>
            </CardBody>
          </Card>
        </Form>
      )}
    </Formik>
  );
});
