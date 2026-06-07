const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Meeting = require('../models/Meeting');

// Load environment variables from the parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const run = async () => {
  await connectDB();
  
  const testMeetingIds = [
    '6a22725b8b1b7861ad83ce04',
    '6a25f0969ba1a571b272564f',
    '6a25f1de4ee273906a245603',
    '6a25f22b4d27551217f340bc'
  ];

  const result = await Meeting.updateMany(
    { _id: { $in: testMeetingIds } },
    {
      $set: {
        mentor: new mongoose.Types.ObjectId('698e1e0c00c1c5add16a3fb7'),
        meetingPersonName: 'Surya Prakash Singh'
      }
    }
  );

  console.log(`Updated ${result.modifiedCount} meetings.`);
  process.exit(0);
};

run();
