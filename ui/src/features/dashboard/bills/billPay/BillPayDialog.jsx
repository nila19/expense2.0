import React from 'react';
import { useSelector } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

import moment from 'moment';

// @material-ui/core
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';

// @material-ui/icons
import SaveIcon from '@material-ui/icons/Save';
import CreditCardIcon from '@material-ui/icons/CreditCard';

import Card from 'components/Card/Card.js';
import CardHeader from 'components/Card/CardHeader.js';
import CardBody from 'components/Card/CardBody.js';
import GridItem from 'components/Grid/GridItem.js';
import GridContainer from 'components/Grid/GridContainer.js';
import Button from 'components/CustomButtons/Button.js';
import styles from 'assets/jss/material-dashboard-react/views/dashboardStyle.js';

import { CustomTextField, FormikAmount, FormikComboBox, FormikDatePicker } from 'features/inputs';
import { format, formatAmt, formatDate, buildAccountOptions } from 'features/utils';

import { selectAccounts } from 'features/dashboard/accounts/accountSlice';
import { selectBillPay } from 'features/dashboard/bills/billPay/billPaySlice';

const useStyles = makeStyles(styles);

const BillPayForm = ({ bill, accountOptions, onEditSave }) => {
  return (
    <Formik
      initialValues={{
        bill: bill,
        account: { id: null },
        paidAmt: bill.balance,
        paidDt: formatDate(moment(), format.YYYYMMDD),
      }}
      validationSchema={Yup.object({
        paidDt: Yup.string().required('Required'),
        paidAmt: Yup.number().required('Required').moreThan(0, 'Must be > 0').max(bill.amount, 'Must be < Bill Amt'),
        account: Yup.object({ id: Yup.number().required('Required') }),
      })}
      onSubmit={(values, { setSubmitting }) => {
        setSubmitting(false);
        onEditSave(values);
      }}
    >
      {({ isSubmitting }) => (
        <Form>
          <GridContainer>
            <GridItem xs={12} sm={12}>
              <CustomTextField disabled id='acct' label='Account' value={bill.account.name} />
            </GridItem>
            <GridItem xs={12} sm={12}>
              <CustomTextField disabled id='bill' label='Bill' value={bill.name} />
            </GridItem>
            <GridItem xs={12} sm={4}>
              <CustomTextField disabled id='billAmount' label='Bill Amount' value={formatAmt(bill.amount, true)} />
            </GridItem>
            <GridItem xs={12} sm={4}>
              <CustomTextField disabled id='billBalance' label='Bill Balance' value={formatAmt(bill.balance, true)} />
            </GridItem>
            <GridItem xs={12} sm={4}>
              <CustomTextField disabled id='dueDate' label='Due Date' value={formatDate(bill.dueDt)} />
            </GridItem>
            <GridItem xs={12} sm={12}>
              <Field
                name='account.id'
                id='accountId'
                label='Pay From'
                component={FormikComboBox}
                options={accountOptions}
              />
            </GridItem>
            <GridItem xs={12} sm={12} md={4}>
              <div style={{ marginLeft: '-8px' }}>
                <Field name='paidAmt' id='paidAmt' label='Payment Amount' labelWidth={125} component={FormikAmount} />
              </div>
            </GridItem>
            <GridItem xs={12} sm={12} md={4}>
              <Field name='paidDt' id='paidDt' label='Payment Date' component={FormikDatePicker} />
            </GridItem>
            <GridItem xs={12} sm={12} md={4}>
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

export const BillPayDialog = ({ openEdit, onEditSave, onEditCancel }) => {
  const classes = useStyles();

  const bill = useSelector(selectBillPay);
  const accounts = useSelector(selectAccounts);
  // only cash accounts can be used for bill pay.
  const accountOptions = buildAccountOptions(accounts.filter((e) => e.cash === true));

  return (
    <>
      {bill && (
        <Dialog open={openEdit} onClose={onEditCancel} fullWidth width={'180px'}>
          <DialogContent style={{ padding: '0px' }}>
            <Card style={{ marginBottom: '0px' }}>
              <CardHeader color='primary'>
                <GridContainer>
                  <GridItem xs={12} sm={12} md={1}>
                    <CreditCardIcon />
                  </GridItem>
                  <GridItem xs={12} sm={12} md={11}>
                    <h4 className={classes.cardTitleWhite} style={{ marginTop: '6px' }}>
                      PAY BILL
                    </h4>
                  </GridItem>
                </GridContainer>
              </CardHeader>
              <CardBody>
                <BillPayForm bill={bill} accountOptions={accountOptions} onEditSave={onEditSave} />
              </CardBody>
            </Card>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
