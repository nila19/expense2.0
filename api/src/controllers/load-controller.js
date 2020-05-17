const _loadCities = async (db) => {
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

const _loadLandmarks = async (db) => {
  let cities = db.collection('cities');

  Promise.all([
    cities.doc('SF').collection('landmarks').doc().set({
      name: 'Golden Gate Bridge',
      type: 'bridge',
    }),
    cities.doc('SF').collection('landmarks').doc().set({
      name: 'Legion of Honor',
      type: 'museum',
    }),
    cities.doc('LA').collection('landmarks').doc().set({
      name: 'Griffith Park',
      type: 'park',
    }),
    cities.doc('LA').collection('landmarks').doc().set({
      name: 'The Getty',
      type: 'museum',
    }),
    cities.doc('DC').collection('landmarks').doc().set({
      name: 'Lincoln Memorial',
      type: 'memorial',
    }),
    cities.doc('DC').collection('landmarks').doc().set({
      name: 'National Air and Space Museum',
      type: 'museum',
    }),
    cities.doc('TOK').collection('landmarks').doc().set({
      name: 'Ueno Park',
      type: 'park',
    }),
    cities.doc('TOK').collection('landmarks').doc().set({
      name: 'National Museum of Nature and Science',
      type: 'museum',
    }),
    cities.doc('BJ').collection('landmarks').doc().set({
      name: 'Jingshan Park',
      type: 'park',
    }),
    cities.doc('BJ').collection('landmarks').doc().set({
      name: 'Beijing Ancient Observatory',
      type: 'museum',
    }),
  ]);
};

const getCityCount = async (db) => {
  const records = await db.collection('cities').get();
  return records.size;
};

export const loadCities = async (req, resp) => {
  const { firebase } = req.app.locals;
  await _loadCities(firebase);
  const count = await getCityCount(firebase);
  return resp.json({ code: 0, data: count });
};

const getLandmarkCount = async (db) => {
  const records = await db.collectionGroup('landmarks').get();
  return records.size;
};

export const loadLandmarks = async (req, resp) => {
  const { firebase } = req.app.locals;
  await _loadLandmarks(firebase);
  const count = await getLandmarkCount(firebase);
  return resp.json({ code: 0, data: count });
};
