const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('MONGODB_URI is required. Set it in your environment before running this script.');
}

async function main() {
  const client = new MongoClient(uri, {});
  try {
    await client.connect();
    await client.db('greenflow').command({ ping: 1 });
    console.log('DB connection OK');
  } catch (err) {
    console.error('DB connection FAILED:', err.message || err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();
