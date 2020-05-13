'use strict';

import _ from 'lodash';

import { tallyAccount as _tallyAccount } from 'services/account/tally-service';

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

const buildParm = (req) => {
  return {
    db: req.app.locals.db,
    log: req.app.locals.log,
  };
};
