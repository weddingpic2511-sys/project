const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

async function run(){
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI not set in .env');
    process.exit(1);
  }
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  const username = process.env.SEED_ADMIN_USERNAME || 'admin';
  const password = process.env.SEED_ADMIN_PASSWORD || 'adminpass';

  const existing = await User.findOne({ username });
  if (existing){
    console.log('Admin user already exists with username:', username);
    await mongoose.disconnect();
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  const u = new User({ username, passwordHash: hash, role: 'admin' });
  await u.save();
  console.log('Created admin user:', username);
  console.log('Change the password immediately or remove this seed script from production.');
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
