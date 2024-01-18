import _ from 'lodash';
import memoize from 'memoize-one';

export const filterAndSortExpenses = memoize((expenses, account, bill) => {
  let filtered = account
    ? expenses.filter(
        (e) => (e.accounts.from && e.accounts.from.id === account) || (e.accounts.to && e.accounts.to.id === account)
      )
    : expenses;
  filtered = bill ? filtered.filter((e) => e.bill && e.bill.id === bill) : filtered;

  return _.reverse(_.sortBy(filtered, 'seq'));
});

export const findTargetTransId = (expenses, id, up) => {
  const index = _.findIndex(expenses, { id: id });
  const targetIndex = index + (up ? -1 : 1);
  if (targetIndex < 0 || targetIndex >= expenses.length) {
    return null;
  } else {
    return expenses[targetIndex].id;
  }
};
