# Upload Ảnh Sản Phẩm - Test Script

## 1. Đăng nhập admin (lấy token)
```bash
curl -X POST http://localhost:2004/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900,
    "user": { "id": "...", "name": "Admin", "email": "admin@example.com", "role": "admin" }
  }
}
```

---

## 2. Upload 1 ảnh sản phẩm
```bash
curl -X POST http://localhost:2004/api/upload/product-image \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -F "file=@/path/to/ahri.jpg"
```

**Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "filename": "ahri-1704537600000.jpg",
    "url": "http://localhost:2004/uploads/products/ahri-1704537600000.jpg",
    "size": 245678,
    "mimetype": "image/jpeg"
  }
}
```

---

## 3. Upload nhiều ảnh
```bash
curl -X POST http://localhost:2004/api/upload/product-images \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -F "files=@ahri-1.jpg" \
  -F "files=@ahri-2.jpg" \
  -F "files=@ahri-detail.jpg"
```

**Response:**
```json
{
  "success": true,
  "message": "3 image(s) uploaded successfully",
  "data": {
    "count": 3,
    "images": [
      {
        "filename": "ahri-1-1704537600000.jpg",
        "url": "http://localhost:2004/uploads/products/ahri-1-1704537600000.jpg",
        "size": 245678
      },
      {
        "filename": "ahri-2-1704537600001.jpg",
        "url": "http://localhost:2004/uploads/products/ahri-2-1704537600001.jpg",
        "size": 256789
      },
      {
        "filename": "ahri-detail-1704537600002.jpg",
        "url": "http://localhost:2004/uploads/products/ahri-detail-1704537600002.jpg",
        "size": 267890
      }
    ]
  }
}
```

---

## 4. Tạo sản phẩm với ảnh URL chuẩn
```bash
curl -X POST http://localhost:2004/api/products \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ahri Figure",
    "description": "High-quality collectible figure of Ahri from League of Legends",
    "price": 450000,
    "image": "http://localhost:2004/uploads/products/ahri-1-1704537600000.jpg",
    "images": [
      "http://localhost:2004/uploads/products/ahri-1-1704537600000.jpg",
      "http://localhost:2004/uploads/products/ahri-2-1704537600001.jpg",
      "http://localhost:2004/uploads/products/ahri-detail-1704537600002.jpg"
    ],
    "stock": 50,
    "category": "collectible",
    "champion": "Ahri"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "_id": "...",
    "name": "Ahri Figure",
    "description": "High-quality collectible figure of Ahri from League of Legends",
    "price": 450000,
    "image": "http://localhost:2004/uploads/products/ahri-1-1704537600000.jpg",
    "images": [
      "http://localhost:2004/uploads/products/ahri-1-1704537600000.jpg",
      "http://localhost:2004/uploads/products/ahri-2-1704537600001.jpg",
      "http://localhost:2004/uploads/products/ahri-detail-1704537600002.jpg"
    ],
    "stock": 50,
    "category": "collectible",
    "champion": "Ahri",
    "rating": 0,
    "sold": 0,
    "isActive": true,
    "createdAt": "2024-01-07T10:00:00.000Z"
  }
}
```

---

## 5. Xóa ảnh sản phẩm
```bash
curl -X DELETE http://localhost:2004/api/upload/product-image/ahri-1-1704537600000.jpg \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

**Response:**
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

---

## 6. Lấy danh sách sản phẩm (ảnh có URL chuẩn)
```bash
curl -X GET http://localhost:2004/api/products \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

**Response:**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    {
      "_id": "...",
      "name": "Ahri Figure",
      "image": "http://localhost:2004/uploads/products/ahri-1-1704537600000.jpg",
      "images": [
        "http://localhost:2004/uploads/products/ahri-1-1704537600000.jpg",
        "http://localhost:2004/uploads/products/ahri-2-1704537600001.jpg",
        "http://localhost:2004/uploads/products/ahri-detail-1704537600002.jpg"
      ],
      "price": 450000,
      ...
    }
  ]
}
```

---

## 📝 Ghi chú:

- **Authorize header:** `Authorization: Bearer <YOUR_ACCESS_TOKEN>`
- **File size limit:** 5MB mỗi file
- **Allowed formats:** JPG, PNG, GIF, WebP
- **Upload folder:** `BE/uploads/products/`
- **Access via:** `http://localhost:2004/uploads/products/filename.jpg`
