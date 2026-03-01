# 🔧 Environment Configuration Guide

## ✅ Hoàn thành - Environment Setup

### Cấu trúc ENV hiện tại:

```
.env                    ← File cấu hình thực tế (git ignore)
.env.example           ← Template cho dev (commit vào repo)
src/config/environment.js ← Validation + config centralized
```

---

## 📋 Các biến ENV được hỗ trợ

### **Server Configuration**
```env
PORT=2004                          # Port mà server chạy
NODE_ENV=development              # Environment: development/production
```

### **Database**
```env
MONGO_URI=mongodb://127.0.0.1:27017/be_database
# Production: mongodb+srv://user:password@cluster.mongodb.net/dbname
```

### **JWT Tokens** (quan trọng!)
```env
JWT_SECRET=your-access-token-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-token-secret-key-change-in-production
```

⚠️ **Important**: 
- Mỗi secret nên có **tối thiểu 32 ký tự**
- Khác nhau cho từng environment (dev/prod)
- Không commit `.env` vào git

### **Frontend & Uploads**
```env
FE_URL=http://localhost:4200      # CORS origin
BASE_URL=http://localhost:2004    # Base URL cho ảnh
MAX_FILE_SIZE=5242880             # Max upload size (bytes)
```

### **Rate Limiting** (optional)
```env
RATE_LIMIT_WINDOW_MS=900000       # 15 phút
RATE_LIMIT_MAX_REQUESTS=100       # Max requests/IP/window
```

---

## 🚀 Setup cho Dev

### **1. Clone Repository**
```bash
git clone <repo>
cd BE
```

### **2. Copy Template**
```bash
cp .env.example .env
```

### **3. Edit .env** (nếu cần)
```bash
# Mở .env và update giá trị nếu khác default
# Default settings đã sẵn sàng cho local development
```

### **4. Install & Run**
```bash
npm install
npm start
```

**Output nếu thành công:**
```
✅ All required environment variables are present
🚀 Server running at http://localhost:2004/
📝 Environment: development
✅ MongoDB đã kết nối
```

---

## 🔐 Setup cho Production

### **1. Update .env trên server**
```bash
PORT=3000
NODE_ENV=production
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/prod_db
JWT_SECRET=<generate-new-secret>
JWT_REFRESH_SECRET=<generate-new-secret>
FE_URL=https://yourdomain.com
BASE_URL=https://yourdomain.com
```

### **2. Generate JWT Secrets**
```bash
# Dùng OpenSSL
openssl rand -base64 32

# Hoặc Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### **3. Validate Configuration**
```bash
npm start
# Nếu env variables lỗi → server sẽ exit với error message
```

---

## ❌ Lỗi Thường Gặp

### **Error: Missing required environment variables**
```
❌ Missing required environment variables:
   - JWT_SECRET
   - FE_URL
   ...
📝 Please check your .env file or copy from .env.example
```

**Giải pháp:**
```bash
# Kiểm tra .env tồn tại
ls -la .env

# Copy từ .env.example
cp .env.example .env

# Kiểm tra các biến cần thiết
echo $JWT_SECRET
echo $MONGO_URI
```

### **Error: Invalid PORT**
```
PORT=abc  # ❌ Phải là số
PORT=3000 # ✅ Đúng
```

### **Error: Invalid BASE_URL**
```
BASE_URL=localhost:2004    # ❌ Thiếu http://
BASE_URL=http://localhost:2004 # ✅ Đúng
```

---

## 📝 .env.example Content

File `.env.example` là template với tất cả biến cần thiết:
- Có comments giải thích mục đích
- Có ví dụ giá trị
- Hướng dẫn sinh JWT secret
- Ghi chú cho production

**Không commit `.env` nhưng commit `.env.example`!**

```bash
# Git commands
git add .env.example
git add .gitignore
git ignore *.env  # File .env bị ignore
```

---

## 🔍 Configuration Centralization

Tất cả ENV variables được load qua **`src/config/environment.js`**:

```javascript
const config = require('./config/environment');

// Dùng config object
console.log(config.port);           // 2004
console.log(config.jwt.accessSecret); // JWT secret
console.log(config.cors.origin);    // Frontend URL
console.log(config.upload.baseUrl); // Base URL ảnh

// Tự động validate khi load
// → Nếu thiếu biến → crash ngay (tốt cho dev)
```

**Lợi ích:**
✅ Centralized configuration  
✅ Type-safe (có structure rõ)  
✅ Auto-validation (fail-fast)  
✅ Easy override per environment  
✅ Documentation in code  

---

## 📊 Environment Validation

Khi server start, `environment.js` sẽ:
1. Load `.env` file
2. Check tất cả required variables
3. Validate format (PORT là number, URLs có http://)
4. Log validation result
5. Exit nếu lỗi (prevent runtime errors)

```javascript
// src/config/environment.js
const requiredEnvVars = [
  'PORT', 'NODE_ENV', 'MONGO_URI',
  'JWT_SECRET', 'JWT_REFRESH_SECRET',
  'FE_URL', 'BASE_URL'
];

validateEnvironment(); // Check và exit if lỗi
```

---

## 🎯 Summary - Đã hoàn thành

| Item | Status | File |
|------|--------|------|
| `.env.example` template | ✅ Done | `.env.example` |
| `.env` optimized | ✅ Done | `.env` |
| Environment config with validation | ✅ Done | `src/config/environment.js` |
| Server using config | ✅ Done | `src/server.js` |
| Controllers using config | ✅ Done | `src/controllers/uploadController.js` |
| Utils using config | ✅ Done | `src/utils/tokenUtils.js` |
| `.gitignore` updated | ✅ Done | `.gitignore` |
| Server startup validation | ✅ Done | Auto check on start |

**Server chạy thành công với validation! ✅**
