export const BACKEND = {
  BASE_URL: 'http://localhost:8000',
  TIME_OUT: 3000,
};

export const API = {
  STARTUP: {
    CONNECT: '/app/startup/connect',
    CITIES: '/app/startup/cities',
    DEFAULT_CITY: '/app/startup/city/default',
    CATEGORIES: '/app/startup/categories',
    DESCRIPTIONS: '/app/startup/descriptions',
    TRANS_MONTHS: '/app/startup/months/trans',
    ENTRY_MONTHS: '/app/startup/months/entry',
    ACCOUNTS: '/app/startup/accounts',
    BILLS: '/app/startup/bills',
  },
  ACCOUNT: {
    FIND_ALL: '/app/account/findAll',
    ADD: '/app/account/add',
    MODIFY: '/app/account/modify',
    DELETE: '/app/account/delete',
    TALLY: '/app/account/tally',
  },
  BILL: { CLOSE: '/app/bill/closeBill', PAY: '/app/bill/payBill' },
  EXPENSE: {
    ADD: '/app/expense/add',
    MODIFY: '/app/expense/modify',
    DELETE: '/app/expense/delete',
    SWAP: '/app/expense/swap',
  },
  SEARCH: { SEARCH: '/app/search/search' },
  SUMMARY: {
    CHART: '/app/summary/chart',
    SUMMARY: '/app/summary/summary',
  },
};

export const ROUTE = {
  BASE: '/',
  DASHBOARD: '/dashboard',
  SUMMARY: '/summary',
  SEARCH: '/search',
  ADMIN: '/admin',
};

export const SOCKETS = {
  ENABLED: true,
};

export const COUNTS = {
  DASHBOARD_ACCOUNTS: 6, // should be a factor of 12
  DASHBOARD_BILLS: 3,
  DASHBOARD_EXPENSES: 15,
  DASHBOARD_EXPENSES_MIN: 5,
  SEARCH_EXPENSES: 25,
  MESSAGES: 3,
  SUMMARY_COLS: 14,
  ADMIN_ACCOUNTS: 10,
};

export const COLOR = {
  GREY: '#cfd8dc',
  GREEN: 'green',
  WHITE: 'white',
  ROSE: '#E91E63',
  ROSE_LIGHT: '#F27BA3',
  BLUE: '#00ABEE',
  BLUE_GREEN: '#51D1E1',
  BLACK: '#212121',
  ORANGE: '#FF9800',
  RED: '#F44335',
  PURPLE: '#9c27b0',
};
