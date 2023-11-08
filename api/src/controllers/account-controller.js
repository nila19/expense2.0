'use strict';

import _ from 'lodash';

import { tallyAccount as _tallyAccount } from 'services/account/tally-service';
import {
  findAll as _findAll,
  addAccount as _addAccount,
  modifyAccount as _modifyAccount,
  deleteAccount as _deleteAccount,
} from 'services/account/account-service';

export const tallyAccount = async (req, resp) => {
  const parms = buildParm(req);
  const acctId = _.toNumber(req.body.id);
  try {
    await _tallyAccount(parms, acctId);
    return resp.json({ code: 0 });
  } catch (error) {
    parms.log.error(error);
    return resp.status(500).send(error.message);
  }
};

export const findAll = async (req, resp) => {
  const parms = buildParm(req);
  try {
    const acct = await _findAll(parms, req.body);
    return resp.json({ code: 0, data: acct });
  } catch (error) {
    parms.log.error(error);
    return resp.status(500).send(error.message);
  }
};

export const addAccount = async (req, resp) => {
  const parms = buildParm(req);
  try {
    const acct = await _addAccount(parms, req.body);
    return resp.json({ code: 0, data: acct });
  } catch (error) {
    parms.log.error(error);
    return resp.status(500).send(error.message);
  }
};

export const modifyAccount = async (req, resp) => {
  const parms = buildParm(req);
  try {
    const acct = await _modifyAccount(parms, req.body);
    return resp.json({ code: 0, data: acct });
  } catch (error) {
    parms.log.error(error);
    return resp.status(500).send(error.message);
  }
};

export const deleteAccount = async (req, resp) => {
  const parms = buildParm(req);
  try {
    const acct = await _deleteAccount(parms, req.body);
    return resp.json({ code: 0, data: acct });
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
