const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

// Import User model
const User = require('./src/models/User');

// Test data
const testUsers = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    role: 'student'
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    password: 'password456',
    role: 'student'
  },
  {
    name: 'Dr. Teacher',
    email: 'teacher@example.com',
    password: 'PDPUteacher123',
    role: 'teacher'
  }
];

// Connect to database and test signup
const testSignup = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB successfully!');

    // Clear existing test users
    await User.deleteMany({ email: { $in: testUsers.map(u => u.email) } });
    console.log('Cleared existing test users');

    // Test user creation
    for (const userData of testUsers) {
      try {
        console.log(`\nTesting signup for: ${userData.email}`);
        const user = await User.create(userData);
        console.log(`✅ User created successfully: ${user.name} (${user.email})`);
        console.log(`   Role: ${user.role}, ID: ${user._id}`);
      } catch (error) {
        console.log(`❌ Failed to create user ${userData.email}:`, error.message);
      }
    }

    // List all users
    console.log('\n--- All Users in Database ---');
    const allUsers = await User.find({});
    allUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}), Role: ${user.role}, Created: ${user.createdAt}`);
    });

    console.log('\n✅ Signup functionality test completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
};

testSignup();
