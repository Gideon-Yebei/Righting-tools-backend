const {MongoClient} = require('mongodb');
const DEV_URL = 'mongodb://zenith:zenith@127.0.0.1:27017/scholars?directConnection=true&serverSelectionTimeoutMS=2000';

async function testConnection() {
    try {
        const client = await MongoClient.connect(DEV_URL, {useNewUrlParser: true, useUnifiedTopology: true});
        console.log('Connected successfully to MongoDB');
        await client.close();
    } catch (err) {
        console.error('Connection failed:', err);
    }
}

testConnection();
