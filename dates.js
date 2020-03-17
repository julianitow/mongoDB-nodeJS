const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

(async function() {
  // Connection URL
  const url = 'mongodb://localhost:27017/dates';
  // Database Name
  const dbName = 'dates';
  const client = new MongoClient(url, {useUnifiedTopology: true});

  try {
    // Use connect method to connect to the Server
    await client.connect();
    console.log("Connected correctly to server");
    const db = client.db(dbName);
    const col = db.collection('dates');

    //Inserrting one date document
    const r = await col.insertOne({ date: new Date() });
    assert.equal(1, r.insertedCount);

    const cursor = col.find({});
    while(await cursor.hasNext()) {
      const doc = await cursor.next();
      console.dir(doc);
    }
    
  } catch (err) {
    console.log(err.stack);
  }

  client.close();
})();