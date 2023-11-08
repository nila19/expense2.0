import _ from 'lodash';

export const sortAccounts = (data) => {
  return _.orderBy(data, ['active', 'seq'], ['desc', 'asc']);
};
