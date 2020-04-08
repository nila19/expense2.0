import joi from '@hapi/joi';

const account_min = joi.object({
  id: joi.number().allow(0),
  name: joi.string().allow(''),
  balanceBf: joi.number(),
  balanceAf: joi.number(),
});

const category_min = joi.object({
  id: joi.number().allow(0),
  name: joi.string().required(),
});

const bill_min = joi.object({
  id: joi.number().positive().required(),
  name: joi.string().required(),
  billDt: joi.string().required(),
  account: account_min.allow(null),
});

export const transaction = joi.object({
  id: joi.number().positive().required(),
  cityId: joi.number().positive().required(),
  entryDt: joi.string().required(),
  entryMonth: joi.string().required(),
  category: category_min.allow(null),
  description: joi.string().required(),
  amount: joi.number().required().allow(0),
  transDt: joi.string().required(),
  transMonth: joi.string().required(),
  seq: joi.number().positive().required(),
  accounts: joi.object({
    from: account_min.allow(null),
    to: account_min.allow(null),
  }),
  bill: bill_min.allow(null),
  adhoc: joi.boolean(),
  adjust: joi.boolean(),
  status: joi.boolean(),
  tallied: joi.boolean(),
  tallyDt: joi.string().allow(null),
});

const payment = joi.object({
  id: joi.number().positive().required(),
  transDt: joi.string().required(),
  amount: joi.number().allow(0),
});

export const bill = joi.object({
  id: joi.number().positive().required(),
  name: joi.string().required(),
  cityId: joi.number().positive().required(),
  account: account_min,
  createdDt: joi.string().required(),
  billDt: joi.string().required(),
  dueDt: joi.string().required(),
  closed: joi.boolean(),
  amount: joi.number().allow(0),
  balance: joi.number().allow(0),
  payments: [payment.allow(null)],
});

export const tallyHistory = joi.object({
  id: joi.number().positive().required(),
  cityId: joi.number().positive().required(),
  account: account_min,
  tallyDt: joi.string().required(),
  balance: joi.number().allow(0),
});

export const category = joi.object({
  id: joi.number().positive().required(),
  name: joi.string().required(),
  cityId: joi.number().positive().required(),
  mainDesc: joi.string().required(),
  subDesc: joi.string().required(),
  icon: joi.string().required(),
  active: joi.boolean(),
  seq: joi.number().allow(0),
});

export const city = joi.object({
  id: joi.number().positive().required(),
  name: joi.string().required(),
  active: joi.boolean(),
  default: joi.boolean(),
  currency: joi.string().required(),
  startDt: joi.string().required(),
  endDt: joi.string().allow(null),
});

export const sequence = joi.object({
  table: joi.string().required(),
  cityId: joi.number().positive().required(),
  seq: joi.number().allow(0),
});
