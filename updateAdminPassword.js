const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./src/models/User');

async function updateAdminPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lol-figures');
    console.log('✅ Connected to MongoDB');

    const newPassword = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update admin user
    const result = await User.findOneAndUpdate(
      { email: 'admin@example.com' },
      { passwordHash },
      { new: true }
    );

    if (result) {
      console.log('✅ Password updated successfully!');
      console.log('');
      console.log('📧 Email: admin@example.com');
      console.log('🔐 Password: admin123');
      console.log('👤 Role: admin');
    } else {
      console.log('❌ Admin user not found!');
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.connection.close();
  }
}

updateAdminPassword();
