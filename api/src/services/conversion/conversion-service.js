'use strict';

import _ from 'lodash';
import moment from 'moment';

import { FORMAT, MONTH_TYPE } from 'config/constants';

import { cityModel, monthModel, descriptionModel, summaryModel } from 'data/models';
import { transactionService } from 'data/services';

import { buildSummary } from 'services/conversion/summary-service';

export const convertDescAndMonths = async (db) => {
  const citiesMap = await buildMapOfCounts(db);

  // clear existing records
  await recreateCollections(db);

  // insert new records
  const counts = await insertCountsToDB(db, citiesMap);
  console.log('All inserted => ' + JSON.stringify(counts));
};

const recreateCollections = async (db) => {
  try {
    await descriptionModel._dropCollection(db);
    await monthModel._dropCollection(db);
  } catch (err) {
    console.log('Error while dropping collections => ' + JSON.stringify(err));
  }

  await descriptionModel._createCollection(db);
  await monthModel._createCollection(db);
};

const insertCountsToDB = async (db, citiesMap) => {
  let descCountAll = 0,
    entryCountAll = 0,
    transCountAll = 0;
  const p0 = _.keys(citiesMap).map(async (key) => {
    const cityMap = citiesMap[key];
    const cityId = _.parseInt(key);
    let descCount = 0,
      entryCount = 0,
      transCount = 0;
    const p1 = _.keys(cityMap.descriptions).map(async (key) => {
      descCount++;
      const item = { id: key, cityId, count: cityMap.descriptions[key] };
      return await descriptionModel.insertOne(db, item);
    });
    const p2 = _.keys(cityMap.entryMonths).map(async (key) => {
      entryCount++;
      const item = { id: key, type: MONTH_TYPE.ENTRY, cityId, count: cityMap.entryMonths[key] };
      return await monthModel.insertOne(db, item);
    });
    const p3 = _.keys(cityMap.transMonths).map(async (key) => {
      transCount++;
      const item = { id: key, type: MONTH_TYPE.TRANS, cityId, count: cityMap.transMonths[key] };
      return await monthModel.insertOne(db, item);
    });
    await Promise.all([...p1, ...p2, ...p3]);
    console.log('Processed city => ' + JSON.stringify({ cityId, descCount, entryCount, transCount }));
    descCountAll += descCount;
    entryCountAll += entryCount;
    transCountAll += transCount;
  });
  await Promise.all(p0);
  return { descCountAll, entryCountAll, transCountAll };
};

const buildMapOfCounts = async (db) => {
  const citiesMap = {};
  const cities = await cityModel.findAll(db);
  const promises = cities.map(async (city) => {
    const cityMap = { descriptions: {}, transMonths: {}, entryMonths: {} };
    const trans = await transactionService.findForCity(db, city.id);
    trans.forEach((tran) => {
      incrementCount(cityMap.descriptions, tran.description);
      incrementCount(cityMap.entryMonths, tran.entryMonth);
      incrementCount(cityMap.transMonths, tran.transMonth);
    });
    citiesMap[city.id] = cityMap;
  });

  await Promise.all(promises);
  return citiesMap;
};

const incrementCount = (map, id) => {
  let item = map[id];
  item = item && item > 0 ? item + 1 : 1;
  map[id] = item;
};

export const addYears = async (db) => {
  const cities = await cityModel.findAll(db);
  const p0 = cities.map(async (city) => {
    const trans = await transactionService.findForCity(db, city.id);
    const p1 = trans.map(async ({ id, entryMonth, transMonth }) => {
      const mod = { $set: { entryYear: year(entryMonth), transYear: year(transMonth) } };
      await transactionService.findOneAndUpdate(db, { id }, mod);
    });
    await Promise.all(p1);
    console.log('Processed city -> ' + city.id);
  });
  await Promise.all(p0);
  console.log('Processed all...');
};

const year = _.memoize((month) => moment(month, FORMAT.YYYYMMDD).year());

export const convertSummary = async (db) => {
  // clear existing records
  await recreateSummaryCollection(db);

  const cities = await cityModel.findAll(db);
  const p0 = cities.map(async (city) => {
    const regular = await buildSummary({ db, cityId: city.id, regular: true, adhoc: false });
    await insertSummaryToDB(db, city.id, false, regular);

    const adhoc = await buildSummary({ db, cityId: city.id, regular: false, adhoc: true });
    await insertSummaryToDB(db, city.id, true, adhoc);
    console.log('Processed city -> ' + city.id);
  });
  await Promise.all(p0);
  console.log('Processed all...');
};

const recreateSummaryCollection = async (db) => {
  try {
    await summaryModel._dropCollection(db);
  } catch (err) {
    console.log('Error while dropping collections => ' + JSON.stringify(err));
  }

  await summaryModel._createCollection(db);
};

const insertSummaryToDB = async (db, cityId, adhoc, { months, gridRows }) => {
  const p1 = months.map(async (month, idx) => {
    if (month.aggregate) {
      return;
    }
    const transMonth = month.id;
    const p2 = gridRows.map(async ({ category, amounts, counts }) => {
      const cat = { id: category.id, name: category.name };
      const amount = amounts[idx];
      const count = counts[idx];
      if (amount !== 0 && count > 0) {
        const item = { cityId, adhoc, category: cat, transMonth, count, amount };
        return await summaryModel.insertOne(db, item);
      }
    });
    await Promise.all(p2);
  });
  await Promise.all(p1);
};
