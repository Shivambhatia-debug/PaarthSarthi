const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Meeting = require('./models/Meeting');

dotenv.config();

const run = async () => {
  await connectDB();
  
  const meetings = await Meeting.find({ mentor: { $exists: false } });
  console.log('Unlinked Meetings:');
  meetings.forEach(m => {
    console.log(JSON.stringify(m, null, 2));
  });

  process.exit(0);
};

run();
