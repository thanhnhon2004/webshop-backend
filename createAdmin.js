const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./src/models/User');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lol-figures');
    console.log('✅ Connected to MongoDB');

    // Email và password của admin
    const adminEmail = 'admin@example.com';
    const adminPassword = 'Admin@123456';

    // Xóa admin cũ nếu có
    await User.deleteOne({ email: adminEmail });
    console.log('Đã xóa admin cũ (nếu có)');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    // Tạo admin user
    const admin = new User({
      name: 'Admin',
      email: adminEmail,
      passwordHash,
      phone: '0000000000',
      role: 'admin',
      isVerified: true
    });

    await admin.save();
    console.log('✅ Admin tạo thành công!');
    console.log('');
    console.log('📧 Email: ' + adminEmail);
    console.log('🔐 Password: ' + adminPassword);
    console.log('👤 Role: admin');
    console.log('');
    console.log('Sử dụng thông tin trên để đăng nhập vào trang Admin.');

  } catch (err) {
    console.error('❌ Lỗi:', err.message);
  } finally {
    await mongoose.connection.close();
  }
}

createAdmin();
