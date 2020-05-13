'use strict';

import _ from 'lodash';

import { closeBill as _closeBill } from 'services/bill/bill-service';
import { payBill as _payBill } from 'services/bill/bill-pay-service';

export const payBill = async (req, resp) => {
  const parms = buildParm(req);
  try {
    const trans = await _payBill(parms, req.body);
    return resp.json({ code: 0, data: trans });
  } catch (error) {
    parms.log.error(error);
    return resp.status(500).send(error.message);
  }
};

export const closeBill = async (req, resp) => {
  const parms = buildParm(req);
  try {
    await _closeBill(parms, req.body);
    return resp.json({ code: 0 });
  } catch (error) {
    parms.log.error(error);
    return resp.status(500).send(error.message);
  }
};

const buildParm = (req) => {
  return {
    db: req.app.locals.db,
    log: req.app.locals.log,
  };
};
