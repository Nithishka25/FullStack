import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

export async function connect() {
  const uriEnv = process.env.TEST_MONGODB_URI || process.env.MONGODB_URI;
  if (uriEnv) {
    await mongoose.connect(uriEnv);
    return;
  }
  try {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  } catch (err) {
    // Fallback to local default test DB if in-memory server cannot start (e.g., blocked download)
    const localUri = 'mongodb://127.0.0.1:27017/microblog_test';
    await mongoose.connect(localUri);
  }
}

export async function clearDatabase() {
  const { collections } = mongoose.connection;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
}

export async function disconnect() {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
}
