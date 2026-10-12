// Runs before every test file, before any app module (and so `config/env`) is imported.
// Integration tests connect to an in-memory MongoDB themselves; this URI is only a placeholder.
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://placeholder-overridden-by-tests';
process.env.JWT_SECRET = 'test-secret-that-is-at-least-32-characters-long';
