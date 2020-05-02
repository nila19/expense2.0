import _ from 'lodash';

export const findTargetTransId = (expenses, id, up) => {
  const index = _.findIndex(expenses, { id: id });
  const targetIndex = index + (up ? -1 : 1);
  if (targetIndex < 0 || targetIndex >= expenses.length) {
    return null;
  } else {
    return expenses[targetIndex].id;
  }
};
