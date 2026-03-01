# 🌱 Quick Seed Data Guide

## One-Line Setup

```bash
npm run seed
```

That's it! Your database will be populated with sample data.

---

## What Gets Created

### Admin Account (Login with this)
```
📧 Email: admin@example.com
🔑 Password: Admin@123456
👤 Role: Admin
```

### Sample Data
- **1 Admin User**
- **10 LOL Figurines & Merchandise Products**
  - 6 Champion Figurines
  - 1 Figure Set
  - 1 Poster
  - 2 Accessories

---

## Quick Commands

```bash
# Create/Reset seed data
npm run seed

# Start server with sample data
npm start

# Run tests with sample data
npm test

# See all products
# After starting server, visit:
# GET http://localhost:2004/api/products
```

---

## Use After Seeding

### Step 1: Start Server
```bash
npm start
```

### Step 2: Login as Admin
Use these credentials:
- Email: `admin@example.com`
- Password: `Admin@123456`

### Step 3: Test Features
- Browse 10 sample products
- Create new products
- View sample products
- Test all admin features

---

## Troubleshooting

**Q: Seed failed?**
- Make sure MongoDB is running
- Check `.env` file has correct `MONGO_URI`
- Run from `BE` directory

**Q: Can I customize seed data?**
- Edit `scripts/seed.js`
- Modify products or admin credentials
- Run `npm run seed` again

**Q: Where's the admin user stored?**
- Database: `be_database`
- Collection: `users`
- Email: `admin@example.com`

---

## Sample Product Categories

| Category | Count | Examples |
|----------|-------|----------|
| Figrue (Figurines) | 6 | Ahri, Lux, Teemo, Yasuo, Akali, Caitlyn |
| Mô hình (Sets) | 1 | K/DA Ahri Mini Set |
| Poster | 1 | Classic Poster |
| Phụ kiện (Accessories) | 2 | Hoodie, Mousepad |

---

## Price Range

- **Figurines**: ₫249,000 - ₫399,000
- **Figure Sets**: ₫449,000
- **Posters**: ₫149,000
- **Accessories**: ₫199,000 - ₫599,000

---

## Next: Testing

After seeding, run:
```bash
npm test              # All tests
npm run test:auth    # Auth tests
npm run test:cart    # Cart tests
```

---

**Everything set up!** 🎉 Ready to develop.

For more details, see [SEED_DATA.md](SEED_DATA.md)
