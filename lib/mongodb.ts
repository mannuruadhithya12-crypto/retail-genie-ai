import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      connectTimeoutMS: 30000,        // 30 seconds for Atlas SRV DNS
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4,                       // Force IPv4 for faster DNS resolution
    };

    console.log('🔌 Connecting to MongoDB Atlas...');
    cached.promise = mongoose.connect(MONGODB_URI!, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB Atlas Connected Successfully');
        return mongoose;
      })
      .catch((err) => {
        cached.promise = null;
        console.error('❌ MongoDB Atlas Connection Failed:', err.message);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export const connectToDatabase = dbConnect;
export default dbConnect;
