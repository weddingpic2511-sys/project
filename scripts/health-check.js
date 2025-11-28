const mongoose = require('mongoose');
const http = require('http');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function checkDB(){
  const uri = process.env.MONGO_URI;
  if (!uri) { console.error('MONGO_URI not set'); return false; }
  try{
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connection: OK');
    await mongoose.disconnect();
    return true;
  }catch(err){
    console.error('MongoDB connection error:', err.message);
    return false;
  }
}

function checkServer(){
  return new Promise((res)=>{
    const port = process.env.PORT || 3000;
    const opts = { method: 'GET', hostname: 'localhost', port, path: '/' };
    const req = http.request(opts, r => {
      console.log('Server response status:', r.statusCode);
      res(true);
    });
    req.on('error', (e)=>{ console.error('Server check failed:', e.message); res(false); });
    req.end();
  });
}

(async () => {
  const dbOk = await checkDB();
  const checkServerFlag = process.argv.includes('--server');
  let serverOk = true;
  if (checkServerFlag){
    serverOk = await checkServer();
  }
  if (dbOk && serverOk){
    console.log('OK');
    process.exit(0);
  } else process.exit(2);
})();
