const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Voucher = require('../src/models/Voucher');
const ShippingFee = require('../src/models/ShippingFee');

// Load env
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/be_database';

const seedVouchersAndShipping = async () => {
  try {
    // Connect DB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Voucher.deleteMany({});
    await ShippingFee.deleteMany({});
    console.log('✅ Cleared old vouchers and shipping fees');

    // ===== VOUCHERS =====
    const vouchers = [
      {
        code: 'WELCOME10',
        description: 'Giảm 10% cho đơn hàng đầu tiên',
        discountType: 'percentage',
        discountValue: 10,
        maxDiscount: 100000,
        minOrderAmount: 200000,
        maxUses: 100,
        maxUsesPerUser: 1,
        expiryDate: new Date('2026-12-31'),
        applicableCategories: null,
        isActive: true
      },
      {
        code: 'SALE50',
        description: 'Giảm 50K cho đơn từ 500K',
        discountType: 'fixed',
        discountValue: 50000,
        minOrderAmount: 500000,
        maxUses: 50,
        maxUsesPerUser: 1,
        expiryDate: new Date('2026-06-30'),
        applicableCategories: null,
        isActive: true
      },
      {
        code: 'FIGURINE20',
        description: 'Giảm 20% cho Figurine',
        discountType: 'percentage',
        discountValue: 20,
        maxDiscount: 200000,
        minOrderAmount: 300000,
        maxUses: 30,
        maxUsesPerUser: 2,
        expiryDate: new Date('2026-12-31'),
        applicableCategories: ['Figurine'],
        isActive: true
      },
      {
        code: 'FREESHIP',
        description: 'Miễn phí ship cho đơn từ 1 triệu',
        discountType: 'fixed',
        discountValue: 30000,
        minOrderAmount: 1000000,
        maxUses: null,
        maxUsesPerUser: 3,
        expiryDate: new Date('2026-12-31'),
        applicableCategories: null,
        isActive: true
      },
      {
        code: 'VIP100',
        description: 'Giảm 100K cho khách VIP',
        discountType: 'fixed',
        discountValue: 100000,
        minOrderAmount: 800000,
        maxUses: 20,
        maxUsesPerUser: 1,
        expiryDate: new Date('2026-03-31'),
        applicableCategories: null,
        isActive: true
      }
    ];

    await Voucher.insertMany(vouchers);
    console.log(`✅ Created ${vouchers.length} vouchers:`);
    vouchers.forEach(v => {
      console.log(`   - ${v.code}: ${v.description}`);
    });

    // ===== SHIPPING FEES =====
    const shippingFees = [
      // Hà Nội
      { province: 'Hà Nội', district: null, baseFee: 30000, perKgFee: 5000, estimatedDays: 2, description: 'Nội thành Hà Nội', isActive: true },
      { province: 'Hà Nội', district: 'Hoàn Kiếm', baseFee: 20000, perKgFee: 3000, estimatedDays: 1, description: 'Giao hỏa tốc', isActive: true },
      { province: 'Hà Nội', district: 'Ba Đình', baseFee: 20000, perKgFee: 3000, estimatedDays: 1, description: 'Giao hỏa tốc', isActive: true },
      { province: 'Hà Nội', district: 'Cầu Giấy', baseFee: 25000, perKgFee: 4000, estimatedDays: 1, description: 'Giao nhanh', isActive: true },

      // TP. Hồ Chí Minh
      { province: 'TP. Hồ Chí Minh', district: null, baseFee: 30000, perKgFee: 5000, estimatedDays: 2, description: 'Nội thành TP.HCM', isActive: true },
      { province: 'TP. Hồ Chí Minh', district: 'Quận 1', baseFee: 20000, perKgFee: 3000, estimatedDays: 1, description: 'Giao hỏa tốc', isActive: true },
      { province: 'TP. Hồ Chí Minh', district: 'Quận 3', baseFee: 20000, perKgFee: 3000, estimatedDays: 1, description: 'Giao hỏa tốc', isActive: true },
      { province: 'TP. Hồ Chí Minh', district: 'Quận 7', baseFee: 25000, perKgFee: 4000, estimatedDays: 1, description: 'Giao nhanh', isActive: true },

      // Đà Nẵng
      { province: 'Đà Nẵng', district: null, baseFee: 35000, perKgFee: 6000, estimatedDays: 3, description: 'Giao toàn Đà Nẵng', isActive: true },
      { province: 'Đà Nẵng', district: 'Hải Châu', baseFee: 30000, perKgFee: 5000, estimatedDays: 2, description: 'Trung tâm Đà Nẵng', isActive: true },

      // Các tỉnh khác
      { province: 'Hải Phòng', district: null, baseFee: 40000, perKgFee: 7000, estimatedDays: 3, description: 'Giao toàn Hải Phòng', isActive: true },
      { province: 'Cần Thơ', district: null, baseFee: 45000, perKgFee: 8000, estimatedDays: 4, description: 'Giao toàn Cần Thơ', isActive: true },
      { province: 'Bình Dương', district: null, baseFee: 35000, perKgFee: 6000, estimatedDays: 3, description: 'Giao toàn Bình Dương', isActive: true },
      { province: 'Đồng Nai', district: null, baseFee: 35000, perKgFee: 6000, estimatedDays: 3, description: 'Giao toàn Đồng Nai', isActive: true },
      { province: 'Bắc Ninh', district: null, baseFee: 40000, perKgFee: 7000, estimatedDays: 3, description: 'Giao toàn Bắc Ninh', isActive: true }
    ];

    await ShippingFee.insertMany(shippingFees);
    console.log(`✅ Created ${shippingFees.length} shipping fee records`);

    // Group by province
    const provinces = [...new Set(shippingFees.map(s => s.province))];
    console.log(`   Provinces covered: ${provinces.join(', ')}`);

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${vouchers.length} Vouchers`);
    console.log(`   - ${shippingFees.length} Shipping Fee Records`);
    console.log(`   - ${provinces.length} Provinces Covered`);

    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Seed failed:', err);
    mongoose.disconnect();
    process.exit(1);
  }
};

seedVouchersAndShipping();
