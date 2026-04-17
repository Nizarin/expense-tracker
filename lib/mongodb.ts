import mongoose from "mongoose";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

// ── Mongoose connection (for Mongoose models/queries) ──────────────────────
declare global {
  var _mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
}

const mongooseCache = global._mongoose ?? { conn: null, promise: null };
global._mongoose = mongooseCache;

export async function connectDB(): Promise<typeof mongoose> {
  if (mongooseCache.conn) return mongooseCache.conn;

  if (!mongooseCache.promise) {
    mongooseCache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  mongooseCache.conn = await mongooseCache.promise;
  return mongooseCache.conn;
}

// ── Native MongoClient (required by @auth/mongodb-adapter) ─────────────────
declare global {
  var _mongoClient: Promise<MongoClient> | undefined;
}

const client = new MongoClient(MONGODB_URI);
const clientPromise: Promise<MongoClient> =
  global._mongoClient ?? (global._mongoClient = client.connect());

export { clientPromise };
