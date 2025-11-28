const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const supertest = require('supertest');
const bcrypt = require('bcrypt');

let mongod;
let app;
let request;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGO_URI = uri;
  process.env.SESSION_SECRET = 'testsecret';

  // Connect mongoose to the in-memory server
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  // Require app after MONGO_URI is set so session store uses the correct uri
  app = require('../app');
  request = supertest(app);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

afterEach(async () => {
  const { collections } = mongoose.connection;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

test('register admin creates a user', async () => {
  const res = await request.post('/api/auth/register-admin').send({ username: 'admin', password: 'adminpass' }).expect(200);
  expect(res.body.message).toBe('Admin created');

  const User = require('../models/User');
  const user = await User.findOne({ username: 'admin' });
  expect(user).not.toBeNull();
  expect(user.role).toBe('admin');
  const ok = await bcrypt.compare('adminpass', user.passwordHash);
  expect(ok).toBeTruthy();
});

test('login returns role and sets cookie', async () => {
  const User = require('../models/User');
  const hash = await bcrypt.hash('password123', 10);
  const u = new User({ username: 'bob', passwordHash: hash, role: 'admin' });
  await u.save();

  const res = await request.post('/api/auth/login').send({ username: 'bob', password: 'password123' }).expect(200);
  expect(res.body.role).toBe('admin');
  expect(res.headers['set-cookie']).toBeDefined();
});
