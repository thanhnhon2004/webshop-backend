# 🌱 Seed Data Documentation

## Overview

The seed script automatically populates your database with sample data for development and testing purposes.

## What Gets Created

### 1. Admin User
```
Email: admin@example.com
Password: Admin@123456
Role: admin
Phone: 0123456789
Address: 123 Admin Street, City, Country
```

### 2. Sample Products (10 items)
- **6 Figurines**: Ahri, Lux, Teemo, Yasuo, Akali, Caitlyn
- **1 Figure Set**: K/DA Ahri Mini Figure Set
- **1 Poster**: League of Legends Classic Poster
- **2 Accessories**: Hoodie, Mousepad

#### Product Categories
- **Figrue** (Figurines): 6 products
- **Mô hình** (Figure Sets): 1 product
- **Poster**: 1 product
- **Phụ kiện** (Accessories): 2 products

#### Price Range
- Figurines: ₫249,000 - ₫399,000
- Figure Sets: ₫449,000
- Posters: ₫149,000
- Accessories: ₫199,000 - ₫599,000

## Running the Seed Script

### Basic Seed (Recommended)
```bash
npm run seed
```

This will:
1. Connect to MongoDB
2. Clear existing data
3. Create admin user
4. Create 10 sample products
5. Display summary
6. Disconnect

### Output Example
```
🌱 Starting database seeding...

✅ Connected to MongoDB
📋 Clearing existing data...
✅ Data cleared

👤 Creating admin user...
✅ Admin user created:
   Email: admin@example.com
   Password: Admin@123456
   ID: 507f1f77bcf86cd799439011

📦 Creating sample products...
✅ 10 products created:
   1. Ahri Classic Figurine (Ahri) - ₫299,000
   2. Lux Star Guardian Figurine (Lux) - ₫399,000
   3. Teemo Cottontail Figurine (Teemo) - ₫249,000
   ...
   10. Caitlyn Enforcer Figure (Caitlyn) - ₫319,000

======================================================================
📊 SEED DATA SUMMARY
======================================================================

✅ Admin User Created:
   • Email: admin@example.com
   • Password: Admin@123456
   • Role: admin
   • ID: 507f1f77bcf86cd799439011

✅ Sample Products Created: 10
   • Figrue: 6 products
   • Mô hình: 1 products
   • Poster: 1 products
   • Phụ kiện: 2 products

💰 Total Inventory Value: ₫3,345,000

======================================================================
✨ Seed data successfully created!
======================================================================

✅ Seeding completed successfully!
```

## Using Seed Data

### Login with Admin Account
1. Start your server: `npm start`
2. Login with:
   - **Email**: admin@example.com
   - **Password**: Admin@123456
3. Now you can:
   - View all products
   - Create products
   - Manage orders
   - Access admin features

### Test with Frontend
1. Use admin account for admin panel testing
2. Create regular user accounts for customer testing
3. Add products to cart and checkout with sample products
4. Test all features with real data

### Development Workflow
```bash
# 1. Start MongoDB (if not running)
# 2. Create/reset seed data
npm run seed

# 3. Start development server
npm start

# 4. Run tests (they have their own test data)
npm test
```

## Seed Data Details

### Admin User Model
```javascript
{
  name: 'Admin User',
  email: 'admin@example.com',
  passwordHash: 'hashed_password',
  phone: '0123456789',
  address: '123 Admin Street, City, Country',
  role: 'admin',
  isVerified: true,
  isLocked: false,
  createdAt: '2026-01-06T...',
  updatedAt: '2026-01-06T...'
}
```

### Sample Product Model
```javascript
{
  name: 'Product Name',
  description: 'Product description',
  price: 299000,
  image: 'http://localhost:2004/uploads/products/product.jpg',
  images: [],
  stock: 50,
  category: 'Figrue', // 'Mô hình', 'Figrue', 'Poster', 'Phụ kiện'
  champion: 'Ahri',   // null for non-champion items
  rating: 4.8,
  reviews: 45,
  createdAt: '2026-01-06T...',
  updatedAt: '2026-01-06T...'
}
```

## Important Notes

⚠️ **Warning**: Running `npm run seed` will:
- **Delete all existing users and products**
- **Reset the database to sample data**
- **Clear any previous data**

✅ **Good for**:
- Initial setup
- Testing features
- Resetting development environment
- Demo/presentation purposes

❌ **NOT recommended for**:
- Production environments
- When you have real customer data
- Without backing up first

## Troubleshooting

### MongoDB Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: 
- Make sure MongoDB is running
- Check connection string in .env file
- Verify database name is correct

### Permission Denied
```
Error: EACCES: permission denied, open 'scripts/seed.js'
```
**Solution**: 
- Ensure you have write permissions
- Try running with appropriate permissions
- Check file ownership

### Models Not Found
```
Error: Cannot find module '../src/models/User'
```
**Solution**:
- Run from BE directory: `cd BE && npm run seed`
- Check that model files exist
- Verify file paths are correct

## Script Location

The seed script is located at:
```
BE/
└── scripts/
    └── seed.js
```

Run it from the BE directory:
```bash
cd BE
npm run seed
```

## Customizing Seed Data

To modify seed data, edit `scripts/seed.js`:

### Change Admin Password
```javascript
const adminUser = {
  password: 'NewPassword@123456'  // Change here
};
```

### Add More Products
```javascript
const sampleProducts = [
  // Existing products...
  {
    name: 'New Product',
    description: 'Product description',
    price: 299000,
    category: 'Figrue',
    champion: 'ChampionName',
    stock: 50
    // ... other fields
  }
];
```

### Change Admin Email
```javascript
const adminUser = {
  email: 'newemail@example.com'  // Change here
};
```

Then run: `npm run seed`

## File Structure

```
BE/
├── scripts/
│   └── seed.js              ← Seed script
├── src/
│   ├── models/
│   │   ├── User.js
│   │   └── Product.js
│   └── ...
└── package.json             ← Contains "seed" script
```

## Next Steps

1. **Run seed**: `npm run seed`
2. **Start server**: `npm start`
3. **Test login**: Use admin@example.com / Admin@123456
4. **Create users**: Add more test users through registration
5. **Test features**: Browse products, add to cart, checkout

## Additional Commands

```bash
# Reseed database (alias for seed)
npm run seed:clear

# Check if seed ran successfully
# Look for products in database via MongoDB client
mongosh
use be_database
db.products.find().pretty()
db.users.find().pretty()

# Count documents
db.products.countDocuments()  # Should be 10
db.users.countDocuments()     # Should be 1 (admin)
```

---

**Need Help?** Check the main [QUICK_START.md](QUICK_START.md) or [TESTING.md](TESTING.md)
