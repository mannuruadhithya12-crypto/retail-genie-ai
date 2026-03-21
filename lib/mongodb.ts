import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/retail-genie';

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    };

    console.log('🔌 Attempting to connect to MongoDB...');
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB Connected Successfully');
        return mongoose;
      })
      .catch((err) => {
        console.error('❌ MongoDB Connection Error:', err.message);
        // If the primary URI fails and it's not local, try local as a last resort
        if (MONGODB_URI !== 'mongodb://localhost:27017/retail-genie') {
          console.log('🔄 Retrying with local MongoDB...');
          return mongoose.connect('mongodb://localhost:27017/retail-genie', opts);
        }
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
