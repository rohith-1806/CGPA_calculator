import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  try {
    const connUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/growx';
    console.log(`Connecting to MongoDB at: ${connUri}...`);

    mongoose.set('strictQuery', false);

    try {
      await mongoose.connect(connUri, { serverSelectionTimeoutMS: 2000 });
      console.log(`MongoDB Connected successfully to ${mongoose.connection.host}`);
    } catch (err) {
      console.log('Local MongoDB service not reachable. Spawning lightweight MongoMemoryServer...');
      mongoMemoryServer = await MongoMemoryServer.create({
        binary: {
          version: '4.4.18'
        }
      });
      const mongoUri = mongoMemoryServer.getUri();
      await mongoose.connect(mongoUri);
      console.log(`MongoMemoryServer started and connected at ${mongoUri}`);
    }
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};
