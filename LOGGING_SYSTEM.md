# 📊 Logging & Monitoring System

## ✅ Hoàn thành - Logging với Morgan, Winston + Request-ID

---

## 🎯 **Logging System Overview**

### **3 Thành Phần Chính:**

#### **1. Request-ID Middleware**
```
Mục đích: Tạo ID duy nhất cho mỗi request
Flow: Middleware → req.id → Logger → Response header
```

#### **2. Winston Logger**
```
Mục đích: Log application events
Output: Console (dev) + File (app.log, error.log, http.log)
```

#### **3. Morgan + Winston Integration**
```
Mục đích: Log HTTP requests
Method: Morgan → Winston stream → log files
```

---

## 📋 **Các Files Được Tạo**

### **1. [src/middleware/requestId.js](c:\Users\ASUS\Desktop\chuyende\BE\src\middleware\requestId.js)** ✅
Generate unique ID cho mỗi request:
```javascript
// Format: 1704537600000-abc12345
const requestId = `${Date.now()}-${uuidv4().slice(0, 8)}`;

// Gán vào:
req.id / req.requestId        // Dùng trong controllers
res.header('X-Request-ID')    // Gửi cho client
```

**Lợi ích:**
- ✅ Unique per request
- ✅ Timestamp + UUID
- ✅ Easy to track in logs

### **2. [src/utils/logger.js](c:\Users\ASUS\Desktop\chuyende\BE\src\utils\logger.js)** ✅
Winston logger configuration:

```javascript
const logger = require('./utils/logger');

// Log info
logger.info('User registered', { requestId, userId: '...' });

// Log warning
logger.warn('Stock low', { requestId, productId: '...' });

// Log error
logger.logError('Database error', err, requestId);
```

**Log Output Locations:**
- `logs/app.log` - Tất cả events
- `logs/error.log` - Chỉ errors
- `logs/http.log` - HTTP requests
- Console (development)

### **3. [src/middleware/morganWinston.js](c:\Users\ASUS\Desktop\chuyende\BE\src\middleware\morganWinston.js)** ✅
Morgan với Winston stream:

```javascript
// Format HTTP logs
[requestId] METHOD URL STATUS DURATION
```

### **4. Updated Files**
- ✅ `src/server.js` - Mount requestId + morgan middleware
- ✅ `src/controllers/userController.js` - Log register/login events

---

## 📊 **Log Output Examples**

### **Console Output (Development):**
```
2026-01-06 08:47:36  [1704537600000-abc12345] [info] Login attempt: admin@example.com
2026-01-06 08:47:36  [1704537600000-abc12345] [info] Login successful: admin@example.com
2026-01-06 08:47:37  [1704537600000-def67890] HTTP POST /api/users/login 200 - 125 bytes
```

### **app.log File Content:**
```
2026-01-06 08:47:36 [1704537600000-abc12345] [INFO] Login attempt: admin@example.com
2026-01-06 08:47:36 [1704537600000-abc12345] [INFO] Password verified successfully
2026-01-06 08:47:36 [1704537600000-abc12345] [INFO] JWT token generated: exp 15m
2026-01-06 08:47:37 [1704537600000-def67890] [INFO] HTTP POST /api/users/login 200
```

### **error.log File Content (Chỉ Errors):**
```
2026-01-06 08:48:15 [1704537600001-ghi34567] [ERROR] Login failed: Email already exists
2026-01-06 08:48:20 [1704537600002-jkl89012] [ERROR] MongoDB connection timeout
```

---

## 🔄 **Request Tracing Flow**

### **Example: POST /api/users/login**

```
1. Request đến → Middleware requestId tạo ID: 1704537600000-abc12345

2. Morgan log:
   [1704537600000-abc12345] POST /api/users/login

3. User controller log:
   [1704537600000-abc12345] [INFO] Login attempt: admin@example.com

4. Database query log:
   [1704537600000-abc12345] [INFO] User found in DB

5. JWT generation log:
   [1704537600000-abc12345] [INFO] Token generated

6. Response sent:
   [1704537600000-abc12345] [INFO] HTTP 200

7. Client nhận:
   - Response data
   - Header: X-Request-ID: 1704537600000-abc12345

8. Tất cả logs có ID này → Dễ trace từ đầu đến cuối!
```

---

## 💡 **Dùng Logger trong Controllers**

### **Log Info (Success)**
```javascript
const logger = require('../utils/logger');

const register = async (req, res, next) => {
  try {
    const requestId = req.id;
    
    logger.info(`User registration attempt: ${email}`, { 
      requestId, 
      email 
    });
    
    // ... logic ...
    
    logger.info(`User registered successfully: ${email}`, { 
      requestId, 
      userId: user._id 
    });
  }
};
```

### **Log Warning (Anomaly)**
```javascript
const login = async (req, res, next) => {
  try {
    if (user.isLocked) {
      logger.warn(`Login failed: Account locked: ${email}`, {
        requestId: req.id,
        email,
        userId: user._id
      });
      throw new ForbiddenError('Account is locked');
    }
  }
};
```

### **Log Error (Exception)**
```javascript
catch (err) {
  logger.logError(`Login failed: ${err.message}`, err, req.id);
  next(err);
}
```

---

## 📁 **Log File Structure**

```
BE/
├── logs/
│   ├── app.log          ← Tất cả logs
│   ├── error.log        ← Chỉ errors
│   ├── http.log         ← HTTP requests
│   └── app.1.log        ← Rotated (nếu vượt 5MB)
```

---

## 🔍 **Tracking Request Từ Logs**

### **Tìm tất cả logs của 1 request:**
```bash
# Windows PowerShell
$requestId = "1704537600000-abc12345"
Select-String -Path "logs\app.log" -Pattern $requestId

# Linux/Mac
grep "1704537600000-abc12345" logs/app.log
```

### **Output:**
```
2026-01-06 08:47:36 [1704537600000-abc12345] [INFO] Login attempt
2026-01-06 08:47:36 [1704537600000-abc12345] [INFO] Password verified
2026-01-06 08:47:36 [1704537600000-abc12345] [INFO] Token generated
2026-01-06 08:47:37 [1704537600000-abc12345] [INFO] HTTP 200
```

---

## 📊 **Log Levels (Winston)**

| Level | Dùng Khi | Ví Dụ |
|-------|---------|-------|
| **error** | Lỗi nghiêm trọng | DB connection failed |
| **warn** | Anomaly, cảnh báo | Stock low, login locked |
| **info** | Business logic | User registered, login success |
| **debug** | Development only | SQL query, response data |

---

## ⚙️ **Configuration**

### **.env Variable:**
```env
LOG_LEVEL=info    # error, warn, info, debug
```

### **Log Rotation:**
```javascript
// app.log: max 5MB, keep 5 files
// → app.log, app.1.log, app.2.log, ...
```

---

## 🎯 **Use Cases**

### **1. Debug User Issue**
```
Customer: "Không thêm được sản phẩm"
Dev: "Cho request-id của request đó"
Customer: "1704537600000-xyz789"

grep "1704537600000-xyz789" logs/error.log
→ [ERROR] Validation failed: stock must be >= 0
→ Client gửi stock = -1
→ Fix client code
```

### **2. Monitor Performance**
```
grep "HTTP" logs/http.log | awk '{print $NF}' | sort -rn | head -10
→ Tìm 10 request chậm nhất
```

### **3. Security Audit**
```
grep "login\|Login" logs/app.log | grep "\[WARN\]\|\[ERROR\]"
→ Tìm login attempts sai
→ Phát hiện brute force attack
```

### **4. System Health**
```
tail -f logs/error.log
→ Monitor errors real-time
→ Alert khi có error
```

---

## 🚀 **Server Startup với Logging**

```
✅ All required environment variables are present
2026-01-06 08:47:36  [info] 🚀 Server running at http://localhost:2004/
2026-01-06 08:47:36  [info] 📝 Environment: development
✅ MongoDB đã kết nối
```

**Logs đang chạy:**
- ✅ HTTP request logging (morgan)
- ✅ Application event logging (winston)
- ✅ Request-ID tracking
- ✅ File rotation (5MB per file)
- ✅ Console output (dev) + File output

---

## 📝 Summary

| Component | Status | Purpose |
|-----------|--------|---------|
| Request-ID | ✅ | Trace requests |
| Winston Logger | ✅ | Log events |
| Morgan + Winston | ✅ | Log HTTP |
| File Rotation | ✅ | Auto cleanup |
| Console + File | ✅ | Dual output |
| Controllers logging | ✅ | Track business logic |

**System Ready! 🎉**

Giờ mỗi request đều có:
- Unique ID để track
- HTTP logs (morgan)
- Application logs (winston)
- Stored in files (app.log, error.log, http.log)
