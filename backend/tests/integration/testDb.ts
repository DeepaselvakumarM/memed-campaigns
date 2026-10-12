import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import os from 'node:os';

let replSet: MongoMemoryReplSet | undefined;

/** Starts a real (in-memory) single-node replica set — needed for multi-document transactions. */
export async function startTestDb(): Promise<void> {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } });
  await mongoose.connect(replSet.getUri('memed-test'), {
    // The driver loads `os` via dynamic import(), which Jest's sandbox doesn't support; without it the
    // handshake is sent with empty client metadata and the server rejects it. Supplying it directly avoids that.
    runtimeAdapters: { os },
  });
  // Build unique indexes up front so duplicate checks behave exactly as in production.
  await mongoose.connection.syncIndexes();
}

export async function clearTestDb(): Promise<void> {
  const collections = await mongoose.connection.db!.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
}

export async function stopTestDb(): Promise<void> {
  await mongoose.disconnect();
  await replSet?.stop();
}
