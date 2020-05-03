export const BACKEND = {
  BASE_URL: 'http://localhost:8000',
  TIME_OUT: 2000,
};

export const API = {
  STARTUP: { ACCOUNTS: '/app/startup/accounts?cityId=', BILLS: '/app/dashboard/bills?cityId=' },
  ACCOUNT: { TALLY: '/app/edit/tally', BILL: '/app/edit/bill' },
  BILL: { PAY: '/app/edit/payBill' },
  EXPENSE: {
    ADD: '/app/edit/add',
    MODIFY: '/app/edit/modify',
    DELETE: '/app/edit/delete',
    SWAP: '/app/edit/swap',
    SEARCH: '/app/search/go',
  },
};

export const SOCKETS = {
  ENABLED: true,
};

export const COUNTS = {
  DASHBOARD_ACCOUNTS: 6, //keep it a factor of 12.
  DASHBOARD_BILLS: 4,
  DASHBOARD_EXPENSES: 10,
  SEARCH_EXPENSES: 20,
  MESSAGES: 3,
};
