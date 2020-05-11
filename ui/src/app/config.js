export const BACKEND = {
  BASE_URL: 'http://localhost:8000',
  TIME_OUT: 2000,
};

export const API = {
  STARTUP: {
    CONNECT: '/app/startup/connect',
    CITIES: '/app/startup/cities',
    DEFAULT_CITY: '/app/startup/city/default',
    CATEGORIES: '/app/startup/categories?cityId=',
    DESCRIPTIONS: '/app/startup/descriptions?cityId=',
    TRANS_MONTHS: '/app/startup/months/trans?cityId=',
    ENTRY_MONTHS: '/app/startup/months/entry?cityId=',
    ACCOUNTS: '/app/startup/accounts?cityId=',
    BILLS: '/app/dashboard/bills?cityId=',
  },
  ACCOUNT: { TALLY: '/app/edit/tally' },
  BILL: { CLOSE: '/app/edit/closeBill', PAY: '/app/edit/payBill' },
  EXPENSE: {
    ADD: '/app/edit/add',
    MODIFY: '/app/edit/modify',
    DELETE: '/app/edit/delete',
    SWAP: '/app/edit/swap',
    SEARCH: '/app/search/go',
  },
  SUMMARY: {
    CHART: '/app/summary/chart',
    SUMMARY: '/app/summary/go',
  },
};

export const ROUTE = {
  BASE: '/',
  DASHBOARD: '/dashboard',
  SUMMARY: '/summary',
  SEARCH: '/search',
};

export const SOCKETS = {
  ENABLED: true,
};

export const COUNTS = {
  DASHBOARD_ACCOUNTS: 6, //keep it a factor of 12.
  DASHBOARD_BILLS: 4,
  DASHBOARD_EXPENSES: 10,
  SEARCH_EXPENSES: 21,
  MESSAGES: 3,
  SUMMARY_COLS: 14,
};
