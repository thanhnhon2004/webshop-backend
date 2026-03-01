/**
 * Seed Database Script
 * Creates sample data: admin user, products, categories
 */

const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

const User = require('../src/models/User');
const Product = require('../src/models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/be_database';

// Sample data
const adminUser = {
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'Admin@123456',
  phone: '0123456789',
  address: '123 Admin Street, City, Country',
  role: 'admin',
  isVerified: true,
  isLocked: false
};

const sampleProducts = [
  {
    name: 'Ahri Classic Figurine',
    description: 'Beautiful collectible figurine of Ahri from League of Legends - Classic Skin',
    price: 299000,
    image: 'http://localhost:2004/uploads/products/ahri-classic.jpg',
    images: [],
    stock: 50,
    category: 'Figrue',
    champion: 'Ahri',
    rating: 4.8,
    reviews: 45
  },
  {
    name: 'Lux Star Guardian Figurine',
    description: 'Premium figurine of Lux wearing Star Guardian skin - LED light compatible',
    price: 399000,
    image: 'http://localhost:2004/uploads/products/lux-star-guardian.jpg',
    images: [],
    stock: 35,
    category: 'Figrue',
    champion: 'Lux',
    rating: 4.9,
    reviews: 67
  },
  {
    name: 'Teemo Cottontail Figurine',
    description: 'Cute collectible figurine of Teemo in Cottontail skin - Perfect for collectors',
    price: 249000,
    image: 'http://localhost:2004/uploads/products/teemo-cottontail.jpg',
    images: [],
    stock: 60,
    category: 'Figrue',
    champion: 'Teemo',
    rating: 4.6,
    reviews: 52
  },
  {
    name: 'Yasuo High Noon Figurine',
    description: 'Detailed figurine of Yasuo in High Noon skin - Premium paint job',
    price: 349000,
    image: 'http://localhost:2004/uploads/products/yasuo-high-noon.jpg',
    images: [],
    stock: 40,
    category: 'Figrue',
    champion: 'Yasuo',
    rating: 4.7,
    reviews: 58
  },
  {
    name: 'Akali Nurse Figurine',
    description: 'Cool figurine of Akali in Nurse skin - High detail sculpting',
    price: 329000,
    image: 'http://localhost:2004/uploads/products/akali-nurse.jpg',
    images: [],
    stock: 45,
    category: 'Figrue',
    champion: 'Akali',
    rating: 4.8,
    reviews: 63
  },
  {
    name: 'K/DA Ahri Mini Figure Set',
    description: 'Limited edition 3-piece mini figure set of K/DA Ahri with display box',
    price: 449000,
    image: 'http://localhost:2004/uploads/products/kda-ahri-set.jpg',
    images: [],
    stock: 25,
    category: 'Mô hình',
    champion: 'Ahri',
    rating: 4.9,
    reviews: 89
  },
  {
    name: 'League of Legends Poster - Classic',
    description: 'Official poster featuring iconic League of Legends champions - 60cm x 90cm',
    price: 149000,
    image: 'http://localhost:2004/uploads/products/lol-poster-classic.jpg',
    images: [],
    stock: 100,
    category: 'Poster',
    champion: null,
    rating: 4.5,
    reviews: 34
  },
  {
    name: 'League of Legends Hoodie',
    description: 'Premium cotton hoodie with embroidered League of Legends logo',
    price: 599000,
    image: 'http://localhost:2004/uploads/products/lol-hoodie.jpg',
    images: [],
    stock: 80,
    category: 'Phụ kiện',
    champion: null,
    rating: 4.7,
    reviews: 71
  },
  {
    name: 'Pentakill Mousepad',
    description: 'High-quality gaming mousepad with Pentakill theme - Non-slip base',
    price: 199000,
    image: 'http://localhost:2004/uploads/products/pentakill-mousepad.jpg',
    images: [],
    stock: 120,
    category: 'Phụ kiện',
    champion: null,
    rating: 4.6,
    reviews: 45
  },
  {
    name: 'Caitlyn Enforcer Figure',
    description: 'Detailed collectible of Caitlyn in Enforcer skin - Perfect sculpt detail',
    price: 319000,
    image: 'http://localhost:2004/uploads/products/caitlyn-enforcer.jpg',
    images: [],
    stock: 55,
    category: 'Figrue',
    champion: 'Caitlyn',
    rating: 4.8,
    reviews: 52
  }
];

/**
 * Connect to MongoDB
 */
async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

/**
 * Disconnect from MongoDB
 */
async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (err) {
    console.error('❌ Disconnection failed:', err.message);
  }
}

/**
 * Clear existing data
 */
async function clearData() {
  try {
    console.log('\n📋 Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('✅ Data cleared');
  } catch (err) {
    console.error('❌ Error clearing data:', err.message);
    throw err;
  }
}

/**
 * Create admin user
 */
async function seedAdminUser() {
  try {
    console.log('\n👤 Creating admin user...');
    
    const passwordHash = await bcryptjs.hash(adminUser.password, 10);
    
    const admin = await User.create({
      name: adminUser.name,
      email: adminUser.email,
      passwordHash,
      phone: adminUser.phone,
      address: adminUser.address,
      role: adminUser.role,
      isVerified: adminUser.isVerified,
      isLocked: adminUser.isLocked
    });
    
    console.log(`✅ Admin user created:`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Password: ${adminUser.password}`);
    console.log(`   ID: ${admin._id}`);
    
    return admin;
  } catch (err) {
    console.error('❌ Error creating admin user:', err.message);
    throw err;
  }
}

/**
 * Create sample products
 */
async function seedProducts() {
  try {
    console.log('\n📦 Creating sample products...');
    
    const products = await Product.insertMany(sampleProducts);
    
    console.log(`✅ ${products.length} products created:`);
    products.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} (${product.champion || 'General'}) - ₫${product.price.toLocaleString()}`);
    });
    
    return products;
  } catch (err) {
    console.error('❌ Error creating products:', err.message);
    throw err;
  }
}

/**
 * Display seed summary
 */
function displaySummary(admin, products) {
  console.log('\n' + '='.repeat(70));
  console.log('📊 SEED DATA SUMMARY');
  console.log('='.repeat(70));
  console.log(`\n✅ Admin User Created:`);
  console.log(`   • Email: ${admin.email}`);
  console.log(`   • Password: ${adminUser.password}`);
  console.log(`   • Role: ${admin.role}`);
  console.log(`   • ID: ${admin._id}\n`);
  
  console.log(`✅ Sample Products Created: ${products.length}`);
  const categories = {};
  products.forEach(p => {
    categories[p.category] = (categories[p.category] || 0) + 1;
  });
  
  Object.entries(categories).forEach(([category, count]) => {
    console.log(`   • ${category}: ${count} products`);
  });
  
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  console.log(`\n💰 Total Inventory Value: ₫${totalValue.toLocaleString()}\n`);
  
  console.log('='.repeat(70));
  console.log('✨ Seed data successfully created!');
  console.log('='.repeat(70) + '\n');
}

/**
 * Main seed function
 */
async function seed() {
  try {
    console.log('\n🌱 Starting database seeding...\n');
    
    await connectDB();
    await clearData();
    
    const admin = await seedAdminUser();
    const products = await seedProducts();
    
    displaySummary(admin, products);
    await disconnectDB();
    
    console.log('✅ Seeding completed successfully!\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seeding failed:', err.message);
    await disconnectDB();
    process.exit(1);
  }
}

// Run seed
seed();
