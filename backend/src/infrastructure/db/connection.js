import mongoose from 'mongoose';

/**
 * Connect to MongoDB
 */
export async function connectDB(uri) {
  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}
