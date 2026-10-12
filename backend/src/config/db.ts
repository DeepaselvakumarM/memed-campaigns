import mongoose from 'mongoose';

export async function connectDatabase(uri: string): Promise<void> {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  // Payout updates use multi-document transactions, which require a replica set
  // (MongoDB Atlas clusters, including the free M0 tier, always are one).
  console.log(`MongoDB connected (database: ${mongoose.connection.name})`);
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
