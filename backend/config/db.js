const mongoose = require('mongoose');
const dns = require('dns');

const connectDB = async () => {
  // Use Google DNS to fix SRV lookup issues on some networks
  dns.setServers(['8.8.8.8', '8.8.4.4']);

  const maxRetries = 3;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
        family: 4, // Force IPv4
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      retries++;
      console.error(`MongoDB Connection Attempt ${retries}/${maxRetries} Failed: ${error.message}`);
      
      if (retries < maxRetries) {
        console.log(`Retrying in 3 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else {
        console.error('All MongoDB connection attempts failed.');
        console.error('Check: 1) Internet connection  2) MongoDB Atlas IP Whitelist (add 0.0.0.0/0)  3) Credentials');
        process.exit(1);
      }
    }
  }
};

module.exports = connectDB;
