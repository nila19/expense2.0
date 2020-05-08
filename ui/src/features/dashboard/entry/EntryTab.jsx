import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

import _ from 'lodash';

// @material-ui/icons
import AddIcon from '@material-ui/icons/Add';

import GridItem from 'components/Grid/GridItem.js';
import GridContainer from 'components/Grid/GridContainer.js';
import Button from 'components/CustomButtons/Button.js';

import { FormikAmount, FormikCheckBox, FormikComboBox, FormikDatePicker } from 'features/inputs';
import { buildCategoriesOptions, buildAccountOptions } from 'features/utils';

import { selectStartupData } from 'features/startup/startupSlice';
import { selectAccounts } from 'features/dashboard/accounts/accountSlice';
import { addExpense } from 'features/dashboard/entry/entrySlice';

export const EntryTab = ({ adjust }) => {
  const dispatch = useDispatch();
  const { categories, descriptions } = useSelector(selectStartupData);
  const accounts = useSelector(selectAccounts);

  const accountOptions = buildAccountOptions(accounts);
  const categoriesOptions = buildCategoriesOptions(categories);

  return (
    <div style={{ paddingBottom: '30px' }}>
      <Formik
        initialValues={{
          adjust: adjust,
          accounts: {
            from: { id: null },
            to: { id: null },
          },
          category: { id: null, name: null, adjust: adjust },
          description: null,
          amount: null,
          transDt: null,
          adhoc: false,
        }}
        validationSchema={Yup.object({
          category: Yup.object({
            id: Yup.number()
              .nullable()
              .when('adjust', {
                is: false,
                then: Yup.number().required('Required'),
                otherwise: Yup.number().notRequired(),
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
        })}
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
                    <Field name='adhoc' id='adhoc' component={FormikCheckBox} />
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
};
