import React, { memo } from 'react';
import { useDispatch } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import memoize from 'memoize-one';

import _ from 'lodash';

// @material-ui/icons
import AddIcon from '@material-ui/icons/Add';

import GridItem from 'components/Grid/GridItem.js';
import GridContainer from 'components/Grid/GridContainer.js';
import Button from 'components/CustomButtons/Button.js';

import { FormikAmount, FormikCheckBox, FormikComboBox, FormikDatePicker } from 'features/inputs';

import { addExpense } from 'features/dashboard/entry/entrySlice';

const initialValues = memoize((adjust) => ({
  adjust: adjust,
  accounts: {
    from: { id: null },
    to: { id: null },
  },
  category: { id: adjust ? 0 : null, name: null },
  description: null,
  amount: null,
  transDt: null,
  adhoc: false,
}));

const validationSchema = memoize(() =>
  Yup.object().shape({
    category: Yup.object({
      id: Yup.number().when('adjust', {
        is: false,
        then: Yup.number().required('Required'),
      }),
    }),
    description: Yup.string().required('Required').trim().min(2, 'Min length'),
    transDt: Yup.string().required('Required'),
    amount: Yup.number().required('Required').notOneOf([0]),
    accounts: Yup.object({
      from: Yup.object({
        id: Yup.number().required('Required'),
      }),
    }),
  })
);

export const EntryTab = memo(({ adjust, descriptions, categories, accountOptions, categoriesOptions }) => {
  const dispatch = useDispatch();

  return (
    <div style={{ paddingBottom: '3px' }}>
      <Formik
        initialValues={initialValues(adjust)}
        validationSchema={validationSchema()}
        onSubmit={(values, { setSubmitting, resetForm }) => {
          setSubmitting(false);
          const category = values.category.id ? _.find(categories, { id: values.category.id }) : null;
          values.category.name = category ? category.name : null;
          dispatch(addExpense(values));
          resetForm();
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <GridContainer>
              <GridItem xs={12} sm={12} md={4}>
                <Field
                  name='accounts.from.id'
                  id='fromAcctId'
                  label='From Account'
                  component={FormikComboBox}
                  options={accountOptions}
                />
              </GridItem>
              <GridItem xs={12} sm={12} md={5}>
                {adjust ? (
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
              </GridItem>
              <GridItem xs={12} sm={12} md={3}>
                <Field name='amount' id='amount' label='Amount' labelWidth={60} component={FormikAmount} />
              </GridItem>
            </GridContainer>
            <GridContainer>
              <GridItem xs={12} sm={12} md={6}>
                <Field
                  freeSolo
                  name='description'
                  id='description'
                  label='Description'
                  component={FormikComboBox}
                  options={descriptions}
                />
              </GridItem>
              <GridItem xs={12} sm={12} md={3}>
                <Field name='transDt' id='transDt' label='Date' component={FormikDatePicker} />
              </GridItem>
              <GridItem xs={12} sm={12} md={1}>
                {!adjust && (
                  <div style={{ marginTop: '30px' }}>
                    <Field name='adhoc' id='adhoc' title='Adhoc' component={FormikCheckBox} />
                  </div>
                )}
              </GridItem>
              <GridItem xs={12} sm={12} md={2}>
                <div style={{ marginTop: '23px' }}>
                  <Button color='success' type='submit' disabled={isSubmitting}>
                    <AddIcon />
                  </Button>
                </div>
              </GridItem>
            </GridContainer>
          </Form>
        )}
      </Formik>
    </div>
  );
});
