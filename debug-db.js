const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('MONGODB_URI is required. Set it in your environment before running this script.');
}

(async () => {
  try {
    const client = new MongoClient(uri, { monitorCommands: true });
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected. Sending ping...');
    await client.db('greenflow').command({ ping: 1 });
    console.log('Ping successful');
    await client.close();
  } catch (err) {
    console.error('connect error:');
    console.error(err);
    process.exitCode = 1;
  }
})();
