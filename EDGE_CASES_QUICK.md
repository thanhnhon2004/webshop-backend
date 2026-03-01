# 🚀 Edge Cases Implementation - Quick Start

## ✅ Hoàn Thành 100%

Tất cả edge cases đã được xử lý:
- ✅ Rollback stock khi checkout fail
- ✅ Rollback stock khi hủy đơn
- ✅ Hệ thống voucher/discount hoàn chỉnh
- ✅ Tính phí vận chuyển theo địa chỉ
- ✅ Seed data mẫu (5 vouchers + 15 shipping fees)

---

## 📦 Files Mới Tạo

### Models (2 files)
- `src/models/Voucher.js` - Quản lý mã giảm giá
- `src/models/ShippingFee.js` - Quản lý phí vận chuyển

### Controllers (2 files)
- `src/controllers/voucherController.js` - 7 functions (CRUD + validate)
- `src/controllers/shippingFeeController.js` - 8 functions (CRUD + calculate)

### Routes (2 files)
- `src/routes/voucherRoutes.js` - Admin + User endpoints
- `src/routes/shippingRoutes.js` - Admin + Public endpoints

### Scripts (1 file)
- `scripts/seedVouchersShipping.js` - Seed vouchers & shipping fees

### Docs (1 file)
- `EDGE_CASES.md` - Tài liệu chi tiết 900+ dòng

---

## 🎯 Quick Commands

```bash
# Seed vouchers & shipping fees (5 + 15 records)
npm run seed:vouchers

# Seed tất cả (products + vouchers + shipping)
npm run seed:all

# Start server
npm start

# Test API
# Server đang chạy: http://localhost:2004
```

---

## 📡 API Endpoints Mới

### Vouchers
```
POST   /api/vouchers/admin/vouchers              # Tạo voucher (admin)
GET    /api/vouchers/admin/vouchers              # List all (admin)
PATCH  /api/vouchers/admin/vouchers/:id          # Update (admin)
DELETE /api/vouchers/admin/vouchers/:id          # Delete (admin)

GET    /api/vouchers/available-vouchers          # User xem vouchers
POST   /api/vouchers/validate-voucher            # Validate mã
```

### Shipping Fees
```
POST   /api/shipping/admin/shipping-fees         # Tạo phí ship (admin)
GET    /api/shipping/admin/shipping-fees         # List all (admin)
PATCH  /api/shipping/admin/shipping-fees/:id     # Update (admin)
DELETE /api/shipping/admin/shipping-fees/:id     # Delete (admin)

POST   /api/shipping/calculate-shipping          # Tính phí (public)
GET    /api/shipping/provinces                   # List provinces (public)
GET    /api/shipping/provinces/:province/districts # List districts
```

---

## 💡 Vouchers Mẫu (5 mã)

| Code | Type | Value | Min Order | Description |
|------|------|-------|-----------|-------------|
| **WELCOME10** | 10% | Max 100K | ≥200K | Giảm 10% đơn đầu |
| **SALE50** | Fixed | 50K | ≥500K | Giảm 50K cứng |
| **FIGURINE20** | 20% | Max 200K | ≥300K | Giảm 20% Figurine |
| **FREESHIP** | Fixed | 30K | ≥1M | Miễn phí ship |
| **VIP100** | Fixed | 100K | ≥800K | Giảm 100K VIP |

---

## 🚚 Shipping Fees Mẫu

**8 Tỉnh/Thành phố:**
- Hà Nội: 20K-30K (3 quận + chung)
- TP.HCM: 20K-30K (3 quận + chung)
- Đà Nẵng: 30K-35K
- Hải Phòng: 40K
- Cần Thơ: 45K
- Bình Dương: 35K
- Đồng Nai: 35K
- Bắc Ninh: 40K

---

## 🛒 Checkout Với Voucher & Shipping

```bash
POST /api/orders/:userId/checkout
Authorization: Bearer <token>

{
  "paymentMethod": "credit_card",
  "shippingAddress": {
    "fullName": "Nguyễn Văn A",
    "phone": "0123456789",
    "email": "a@example.com",
    "address": "123 Phố Huế",
    "ward": "Phường Phúc Tân",
    "district": "Hoàn Kiếm",
    "province": "Hà Nội"
  },
  "voucherCode": "WELCOME10",   // Optional
  "weight": 2,                  // Optional (kg)
  "note": "Giao giờ hành chính"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderCode": "ORD-20260106-12345",
    "totalPrice": 1000000,
    "shippingFee": 26000,        // 20K + (2kg * 3K)
    "discountAmount": 100000,    // 10% (capped 100K)
    "finalPrice": 926000,        // 1M + 26K - 100K
    "shippingFeeData": {
      "province": "Hà Nội",
      "district": "Hoàn Kiếm",
      "estimatedDays": 1
    },
    "discountCode": "WELCOME10",
    "items": [...]
  }
}
```

---

## 🔄 Rollback Logic

### Checkout Flow
```
1. Validate cart (not empty)
2. Check stock availability
3. Calculate shipping fee (province + district)
4. Validate & apply voucher (if provided)
5. Calculate finalPrice
6. ❌ START TRACKING UPDATES
7. Update stock (-quantity, +sold)
8. Create order
9. Clear cart
10. Increment voucher usage

❌ ERROR ANYWHERE → Rollback stock
```

### Cancel Order
```
When status → 'cancelled':
1. Restore stock (+quantity, -sold)
2. Decrement voucher usage (-1)
```

---

## 📊 Data Summary

**Created:**
- 5 Vouchers (percentage + fixed)
- 15 Shipping Fee Records
- 8 Provinces Covered
- 2 New Models
- 2 New Controllers
- 2 New Route Files

**Updated:**
- Order model (added 5 new fields)
- orderController (rollback logic + voucher + shipping)
- validate.js (3 new schemas)
- server.js (2 new route registrations)
- package.json (seed scripts)

---

## ⚠️ Testing Scenarios

### Test Voucher
```bash
POST /api/vouchers/validate-voucher
{
  "code": "WELCOME10",
  "orderAmount": 500000
}

Expected:
{
  "discountAmount": 50000,  // 10% of 500K
  "finalAmount": 450000
}
```

### Test Shipping
```bash
POST /api/shipping/calculate-shipping
{
  "province": "Hà Nội",
  "district": "Hoàn Kiếm",
  "weight": 3
}

Expected:
{
  "totalFee": 29000,  // 20K + (3 * 3K)
  "estimatedDays": 1
}
```

### Test Rollback
```
1. Add item to cart
2. Checkout with invalid voucher
3. Verify stock NOT reduced
4. Fix voucher, checkout success
5. Verify stock reduced
6. Cancel order
7. Verify stock restored
```

---

## 🎓 Important Notes

### Voucher Rules
- Code must be UPPERCASE
- Expiry date validated
- Usage count tracked
- Min order amount enforced
- Category/product restrictions supported

### Shipping Calculation
- District-specific fee prioritized
- Falls back to province-wide fee
- Weight-based pricing (₫/kg)
- Returns estimated delivery days

### Order Fields
```javascript
{
  totalPrice: 1000000,      // Subtotal
  shippingFee: 30000,       // Calculated
  discountAmount: 100000,   // From voucher
  finalPrice: 930000,       // Total + ship - discount
  discountCode: "WELCOME10",
  voucherId: ObjectId,
  shippingFeeData: {
    province: "Hà Nội",
    district: "Hoàn Kiếm",
    estimatedDays: 1
  }
}
```

---

## 📖 Full Documentation

Chi tiết đầy đủ xem: **[EDGE_CASES.md](EDGE_CASES.md)**

---

## ✨ Summary

✅ **Rollback**: Stock tự động restore khi checkout fail hoặc hủy đơn  
✅ **Voucher**: 2 types (percentage/fixed), full validation, usage tracking  
✅ **Shipping**: Location-based, weight-based, 8 provinces seeded  
✅ **Testing**: 5 vouchers + 15 shipping fees sẵn sàng test  
✅ **Documentation**: EDGE_CASES.md 900+ dòng chi tiết  

**Backend production-ready!** 🚀
