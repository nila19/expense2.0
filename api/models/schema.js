import joi from '@hapi/joi';

const AccountTypeMin = joi.object({
  id: joi.number().allow(0),
  name: joi.string().allow(''),
  balanceBf: joi.number(),
  balanceAf: joi.number(),
});

const CategoryTypeMin = joi.object({
  id: joi.number().allow(0),
  name: joi.string().required(),
});

const BillTypeMin = joi.object({
  id: joi.number().positive().required(),
  name: joi.string().required(),
  billDt: joi.string().required(),
  account: AccountTypeMin.allow(null),
});

export const TransactionType = joi.object({
  id: joi.number().positive().required(),
  cityId: joi.number().positive().required(),
  entryDt: joi.string().required(),
  entryMonth: joi.string().required(),
  category: CategoryTypeMin.allow(null),
  description: joi.string().required(),
  amount: joi.number().required().allow(0),
  transDt: joi.string().required(),
  transMonth: joi.string().required(),
  seq: joi.number().positive().required(),
  accounts: joi.object({
    from: AccountTypeMin.allow(null),
    to: AccountTypeMin.allow(null),
  }),
  bill: BillTypeMin.allow(null),
  adhoc: joi.boolean(),
  adjust: joi.boolean(),
  status: joi.boolean(),
  tallied: joi.boolean(),
  tallyDt: joi.string().allow(null),
});

const PaymentType = joi.object({
  id: joi.number().positive().required(),
  transDt: joi.string().required(),
  amount: joi.number().allow(0),
});

export const BillType = joi.object({
  id: joi.number().positive().required(),
  name: joi.string().required(),
  cityId: joi.number().positive().required(),
  account: AccountTypeMin,
  createdDt: joi.string().required(),
  billDt: joi.string().required(),
  dueDt: joi.string().required(),
  closed: joi.boolean(),
  amount: joi.number().allow(0),
  balance: joi.number().allow(0),
  draft: joi.number().allow(0),
  payments: joi.array().items(PaymentType).optional(),
});

export const TallyHistoryType = joi.object({
  id: joi.number().positive().required(),
  cityId: joi.number().positive().required(),
  account: AccountTypeMin,
  tallyDt: joi.string().required(),
  balance: joi.number().allow(0),
});

export const CategoryType = joi.object({
  id: joi.number().positive().required(),
  name: joi.string().required(),
  cityId: joi.number().positive().required(),
  mainDesc: joi.string().required(),
  subDesc: joi.string().required(),
  icon: joi.string().required(),
  active: joi.boolean(),
  seq: joi.number().allow(0),
});

export const CityType = joi.object({
  id: joi.number().positive().required(),
  name: joi.string().required(),
  active: joi.boolean(),
  default: joi.boolean(),
  currency: joi.string().required(),
  startDt: joi.string().required(),
  endDt: joi.string().allow(null),
});

export const SequenceType = joi.object({
  table: joi.string().required(),
  cityId: joi.number().positive().required(),
  seq: joi.number().allow(0),
});
