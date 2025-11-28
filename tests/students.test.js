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

  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
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

async function loginAs(username, password){
  const res = await request.post('/api/auth/login').send({ username, password }).expect(200);
  const cookies = res.headers['set-cookie'];
  return cookies;
}

test('admin can create and list students', async () => {
  // create admin user
  const User = require('../models/User');
  const hash = await bcrypt.hash('adminpass', 10);
  const admin = new User({ username: 'admin', passwordHash: hash, role: 'admin' });
  await admin.save();

  const cookies = await loginAs('admin', 'adminpass');

  // create student
  const createRes = await request.post('/api/students').set('Cookie', cookies).send({ name: 'Alice', roll: 'A1' }).expect(200);
  expect(createRes.body.student.name).toBe('Alice');

  // list students
  const listRes = await request.get('/api/students').set('Cookie', cookies).expect(200);
  expect(Array.isArray(listRes.body)).toBeTruthy();
  expect(listRes.body.length).toBe(1);
  expect(listRes.body[0].name).toBe('Alice');
});

test('student sees only their profile', async () => {
  const Student = require('../models/Student');
  const User = require('../models/User');
  const roll = 'S100';
  const student = new Student({ name: 'Student One', roll, class: '10' });
  await student.save();
  const hash = await bcrypt.hash('studpass', 10);
  const user = new User({ username: 'stud1', passwordHash: hash, role: 'student', studentRef: student._id });
  await user.save();

  const cookies = await loginAs('stud1', 'studpass');
  const res = await request.get('/api/students').set('Cookie', cookies).expect(200);
  expect(Array.isArray(res.body)).toBeTruthy();
  expect(res.body.length).toBe(1);
  expect(res.body[0].roll).toBe(roll);
});
