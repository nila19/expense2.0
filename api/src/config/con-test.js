import { MongoClient } from 'mongodb';

// Connection URL
const url = 'mongodb://localhost:27017';
const dbName = 'expense-test';

// Create a new MongoClient
const client = new MongoClient(url, { useUnifiedTopology: true, useNewUrlParser: true });

const findDocuments = async (db) => {
  const cities = db.collection('cities');

  const cities_data = await cities.find({}).toArray();
  console.log('Found the following records');
  console.log(cities_data);
};

(async () => {
  await client.connect();
  console.log('Connected successfully to server...');

  const db = client.db(dbName);
  console.log('Got database...');

  await findDocuments(db);
  client.close();
})();
