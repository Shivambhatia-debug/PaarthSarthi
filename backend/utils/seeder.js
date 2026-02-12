const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding...');

    // Check if admin exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin already exists:');
      console.log(`  Email: ${existingAdmin.email}`);
      console.log('  Skipping seed...');
    } else {
      // Create default admin
      const admin = await User.create({
        name: 'ParthSarthi Admin',
        email: 'admin@parthsarthi.com',
        password: 'admin123456',
        phone: '+919999999999',
        role: 'admin',
        isVerified: true,
        isActive: true
      });

      console.log('=================================');
      console.log('  Admin created successfully!');
      console.log('  Email: admin@parthsarthi.com');
      console.log('  Password: admin123456');
      console.log('  CHANGE PASSWORD AFTER FIRST LOGIN!');
      console.log('=================================');
    }

    process.exit(0);
  } catch (error) {
    console.error('Seeder error:', error);
    process.exit(1);
  }
};

seedAdmin();
