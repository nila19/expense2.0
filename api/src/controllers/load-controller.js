const load = async (db) => {
  const cities = db.collection('cities');

  await cities.doc('SF').set({
    name: 'San Francisco',
    state: 'CA',
    country: 'USA',
    capital: false,
    population: 860000,
    regions: ['west_coast', 'norcal'],
  });
  await cities.doc('LA').set({
    name: 'Los Angeles',
    state: 'CA',
    country: 'USA',
    capital: false,
    population: 3900000,
    regions: ['west_coast', 'socal'],
  });
  await cities.doc('DC').set({
    name: 'Washington, D.C.',
    state: 'DC',
    country: 'USA',
    capital: true,
    population: 680000,
    regions: ['east_coast'],
  });
  await cities.doc('TOK').set({
    name: 'Tokyo',
    state: 'CA',
    country: 'Japan',
    capital: true,
    population: 9000000,
    regions: ['kanto', 'honshu'],
  });
  await cities.doc('BJ').set({
    name: 'Beijing',
    state: 'CA',
    country: 'China',
    capital: true,
    population: 21500000,
    regions: ['jingjinji', 'hebei'],
  });
  await cities.doc('LN').set({
    name: 'London',
    state: null,
    country: 'UK',
    capital: true,
    population: 2150000,
    regions: ['Britain', 'yorkshire'],
  });
};

const getCount = async (db) => {
  const records = await db.collection('cities').get();
  return records.size;
};

export const loadCities = async (req, resp) => {
  const { firebase } = req.app.locals;
  await load(firebase);
  const count = await getCount(firebase);
  return resp.json({ code: 0, data: count });
};
