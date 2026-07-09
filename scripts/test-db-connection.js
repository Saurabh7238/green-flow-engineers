const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI ||
  'mongodb+srv://s26719247_db_user:NvkQPt5xexENtgxm@cluster0.5lknnny.mongodb.net/';

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
