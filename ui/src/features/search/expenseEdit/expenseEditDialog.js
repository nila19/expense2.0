import React from 'react';
import { useSelector } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

import _ from 'lodash';

// @material-ui/core
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';

// @material-ui/icons
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart';
import TransformIcon from '@material-ui/icons/Transform';
import SaveIcon from '@material-ui/icons/Save';

import Card from 'components/Card/Card.js';
import CardHeader from 'components/Card/CardHeader.js';
import CardBody from 'components/Card/CardBody.js';
import GridItem from 'components/Grid/GridItem.js';
import GridContainer from 'components/Grid/GridContainer.js';
import Button from 'components/CustomButtons/Button.js';
import styles from 'assets/jss/material-dashboard-react/views/dashboardStyle.js';

import { FormikComboBox } from 'features/inputs/comboBox';
import { FormikDatePicker, FormikAmount, FormikCheckBox } from 'features/inputs/formFields';
import { buildCategoriesOptions, buildAccountOptions, buildBillOptions } from 'features/utils';

import { selectStartupData } from 'features/startup/startupSlice';
import { selectAccounts } from 'features/dashboard/accounts/accountsSlice';
import { selectBills } from 'features/dashboard/bills/billTab/billTabSlice';
import { selectExpenseEdit } from 'features/search/expenseEdit/expenseEditSlice';

const useStyles = makeStyles(styles);

export const ExpenseEditForm = ({
  expense,
  billOptions,
  accountOptions,
  categoriesOptions,
  descriptions,
  onEditSave,
}) => {
  return (
    <Formik
      initialValues={expense}
      validationSchema={Yup.object({
        category: Yup.object({
          id: Yup.number()
            .nullable()
            .when('adjust', {
              is: false,
              then: Yup.number().required('Required'),
              otherwise: Yup.number().notRequired(),
            }),
        }).nullable(),
        bill: Yup.object({
          id: Yup.number()
            .nullable()
            .when('billed', {
              is: true,
              then: Yup.number().required('Required'),
              otherwise: Yup.number().notRequired(),
            }),
        }).nullable(),
        description: Yup.string().required('Required').trim().min(2, 'Min length'),
        transDt: Yup.string().required('Required'),
        amount: Yup.number().required('Required').moreThan(0, 'Must be > 0'),
        accounts: Yup.object({
          from: Yup.object({
            id: Yup.number().required('Required'),
          }),
        }),
      })}
      onSubmit={(values, { setSubmitting }) => {
        setSubmitting(false);
        let expense = _.cloneDeep(values);
        if (expense.category && expense.category.id) {
          const category = _.find(categoriesOptions, { key: expense.category.id });
          expense.category.name = category ? category.label : null;
        }
        if (expense.bill && expense.bill.id) {
          const bill = _.find(billOptions, { key: expense.bill.id });
          expense.bill.name = bill ? bill.label : null;
        }
        onEditSave(expense);
      }}
    >
      {({ isSubmitting }) => (
        <Form>
          <GridContainer>
            <GridItem xs={12} sm={12}>
              <Field
                name='accounts.from.id'
                id='fromAcctId'
                label='From Account'
                component={FormikComboBox}
                options={accountOptions}
              />
            </GridItem>
            {expense.bill && expense.bill.id && (
              <GridItem xs={12} sm={12}>
                <Field name='bill.id' id='billId' label='Bill' component={FormikComboBox} options={billOptions} />
              </GridItem>
            )}
            <GridItem xs={12} sm={12}>
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
            </GridItem>
            <GridItem xs={12} sm={12}>
              <Field
                freeSolo
                name='description'
                id='description'
                label='Description'
                component={FormikComboBox}
                options={descriptions}
              />
            </GridItem>
            <GridItem xs={12} sm={12} md={4}>
              <div style={{ marginLeft: '-8px' }}>
                <Field name='amount' id='amount' label='Amount' labelWidth={60} component={FormikAmount} />
              </div>
            </GridItem>
            <GridItem xs={12} sm={12} md={3}>
              <Field name='transDt' id='transDt' label='Date' component={FormikDatePicker} />
            </GridItem>
            <GridItem xs={12} sm={12} md={2}>
              {!expense.adjust && (
                <div style={{ marginTop: '30px' }}>
                  <Field name='adhoc' id='adhoc' component={FormikCheckBox} />
                </div>
              )}
            </GridItem>
            <GridItem xs={12} sm={12} md={2}>
              <div style={{ marginTop: '20px' }}>
                <Button color='primary' type='submit' disabled={isSubmitting}>
                  <SaveIcon />
                </Button>
              </div>
            </GridItem>
          </GridContainer>
        </Form>
      )}
    </Formik>
  );
};

export const ExpenseEditDialog = ({ openEdit, onEditSave, onEditCancel }) => {
  const classes = useStyles();

  const { categories, descriptions } = useSelector(selectStartupData);
  const accounts = useSelector(selectAccounts);
  const bills = useSelector(selectBills);
  const expense = useSelector(selectExpenseEdit);

  const categoriesOptions = buildCategoriesOptions(categories);
  const accountOptions = buildAccountOptions(accounts);
  const acctId = _.get(expense, 'bill.account.id');
  const billOptions = acctId ? buildBillOptions(bills, acctId) : [];

  return (
    <>
      {expense && (
        <Dialog open={openEdit} onClose={onEditCancel} fullWidth={true} width={'180px'}>
          <DialogContent style={{ padding: '0px' }}>
            <Card style={{ marginBottom: '0px' }}>
              <CardHeader color='success'>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={1}>
                    {expense.adjust ? <TransformIcon /> : <AddShoppingCartIcon />}
                  </GridItem>
                  <GridItem xs={12} sm={12} md={11}>
                    <h4 className={classes.cardTitleWhite} style={{ marginTop: '6px' }}>
                      MODIFY EXPENSE
                    </h4>
                  </GridItem>
                </GridContainer>
              </CardHeader>
              <CardBody>
                <ExpenseEditForm
                  expense={expense}
                  billOptions={billOptions}
                  accountOptions={accountOptions}
                  categoriesOptions={categoriesOptions}
                  descriptions={descriptions}
                  onEditSave={onEditSave}
                />
              </CardBody>
            </Card>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
