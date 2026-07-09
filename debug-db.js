const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb+srv://s26719247_db_user:NvkQPt5xexENtgxm@cluster0.5lknnny.mongodb.net/';

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
