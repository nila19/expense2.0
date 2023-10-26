import React, { memo, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field } from 'formik';
// import memoize from 'memoize-one';

// import _ from 'lodash';

// @material-ui/icons
import AddIcon from '@material-ui/icons/Add';

import GridItem from 'components/Grid/GridItem.js';
import GridContainer from 'components/Grid/GridContainer.js';
import Button from 'components/CustomButtons/Button.js';
import Card from 'components/Card/Card.js';
import CardBody from 'components/Card/CardBody.js';

import { acctSchema } from 'features/utils';
import { FormikTextField } from 'features/inputs';
import { FormikAmount, FormikCheckBox, FormikComboBox } from 'features/inputs';
import { buildIconOptions, buildColorOptions } from 'features/utils';

import { addAccount } from 'features/admin/form/addFormSlice';

export const AddForm = memo(() => {
  const dispatch = useDispatch();

  const iconOptions = useMemo(() => buildIconOptions(), []);
  const colorOptions = useMemo(() => buildColorOptions(), []);

  const initialValues = () => ({
    name: null,
    cash: null,
    billed: false,
    icon: null,
    color: null,
    seq: 999,
    closingDay: 5,
    dueDay: 5,
    balance: 0,
    active: true,
  });

  return (
    <Formik
      initialValues={initialValues()}
      validationSchema={acctSchema}
      onSubmit={(values, { setSubmitting }) => {
        console.log('Submitting');
        setSubmitting(false);
        dispatch(addAccount(values));
      }}
    >
      {({ isSubmitting }) => (
        <Form>
          <Card style={{ marginBottom: '20px' }}>
            <CardBody style={{ padding: '10px 10px' }}>
              <GridContainer>
                <GridItem xs={12} sm={12} md={5}>
                  <GridContainer>
                    <GridItem xs={12} sm={12} md={5} style={{ marginTop: '10px' }}>
                      <Field name='name' id='name' label='Account Name' component={FormikTextField} />
                    </GridItem>
                    <GridItem xs={12} sm={12} md={4}>
                      <Field name='icon' id='icon' label='Icon' component={FormikComboBox} options={iconOptions} />
                    </GridItem>
                    <GridItem xs={12} sm={12} md={3}>
                      <Field name='color' id='color' label='Color' component={FormikComboBox} options={colorOptions} />
                    </GridItem>
                  </GridContainer>
                </GridItem>
                <GridItem xs={12} sm={12} md={2} style={{ marginTop: '20px' }}>
                  <GridContainer>
                    <GridItem xs={12} sm={12} md={4}>
                      Cash <Field name='cash' id='cash' label='Cash' component={FormikCheckBox} />
                    </GridItem>
                    <GridItem xs={12} sm={12} md={4}>
                      Billed <Field name='billed' id='billed' label='Billed' component={FormikCheckBox} />
                    </GridItem>
                    <GridItem xs={12} sm={12} md={4}>
                      Active <Field name='active' id='active' label='Active' component={FormikCheckBox} />
                    </GridItem>
                  </GridContainer>
                </GridItem>
                <GridItem xs={12} sm={12} md={5}>
                  <GridContainer>
                    <GridItem xs={12} sm={12} md={2}>
                      <Field name='seq' id='seq' label='Seq' component={FormikTextField} />
                    </GridItem>
                    <GridItem xs={12} sm={12} md={2}>
                      <Field name='closingDay' id='closingDay' label='Closing Day' component={FormikTextField} />
                    </GridItem>
                    <GridItem xs={12} sm={12} md={2}>
                      <Field name='dueDay' id='dueDay' label='Due Day' component={FormikTextField} />
                    </GridItem>
                    <GridItem xs={12} sm={12} md={3} style={{ marginTop: '-10px' }}>
                      <Field name='balance' id='balance' label='Balance' labelWidth={60} component={FormikAmount} />
                    </GridItem>
                    <GridItem xs={12} sm={12} md={3}>
                      <div style={{ marginTop: '13px' }}>
                        <Button color='rose' type='submit' disabled={isSubmitting}>
                          <AddIcon />
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
