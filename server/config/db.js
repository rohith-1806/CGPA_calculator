import 'dotenv/config';
import mongoose from 'mongoose';

let mongoMemoryServer = null;

export const connectDB = async () => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const mongoUri = process.env.MONGO_URI;

    mongoose.set('strictQuery', false);

    if (mongoUri) {
      console.log('Connecting to MongoDB Atlas...');
      try {
        await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 8000
        });
        console.log('MongoDB connected successfully');
        return;
      } catch (connErr) {
        console.error(`MongoDB Atlas Connection Error: ${connErr.message}`);
        if (isProduction) {
          throw connErr;
        }
        // In local development, if connection to local or specified URI failed, fallback to MongoMemoryServer
        console.log('Falling back to local MongoMemoryServer for development...');
      }
    }

    if (isProduction) {
      console.error('CRITICAL CONFIGURATION ERROR: process.env.MONGO_URI is missing in production environment.');
      process.exit(1);
    }

    // Local Development Fallback
    console.log('Initializing local MongoMemoryServer for offline development...');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongoMemoryServer = await MongoMemoryServer.create();
    const memoryUri = mongoMemoryServer.getUri();
    await mongoose.connect(memoryUri);
    console.log('MongoDB connected successfully (Development MongoMemoryServer)');
  } catch (error) {
    console.error(`MongoDB Connection Failed: ${error.message}`);
    process.exit(1);
  }
};
