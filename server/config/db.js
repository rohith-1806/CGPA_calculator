import mongoose from 'mongoose';

let mongoMemoryServer = null;

export const connectDB = async () => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const mongoUri = process.env.MONGO_URI;

    mongoose.set('strictQuery', false);

    if (mongoUri) {
      console.log('Connecting to MongoDB Atlas / Remote Database...');
      await mongoose.connect(mongoUri);
      console.log(`MongoDB Connected successfully to host: ${mongoose.connection.host}`);
      return;
    }

    if (isProduction) {
      console.error('CRITICAL CONFIGURATION ERROR: process.env.MONGO_URI is missing in production environment. Exiting...');
      process.exit(1);
    }

    // Local Development Fallback (only when NODE_ENV !== 'production' and process.env.MONGO_URI is absent)
    console.log('No MONGO_URI provided in local environment. Initializing local MongoMemoryServer for development...');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongoMemoryServer = await MongoMemoryServer.create();
    const memoryUri = mongoMemoryServer.getUri();
    await mongoose.connect(memoryUri);
    console.log(`Development MongoMemoryServer connected at: ${memoryUri}`);

  } catch (error) {
    console.error(`MongoDB Connection Failed: ${error.message}`);
    process.exit(1);
  }
};
