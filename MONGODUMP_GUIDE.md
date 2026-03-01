# MongoDB Backup & Restore Guide

## 📌 Tổng Quan

Dự án đã được tích hợp **Mongoose** (CRUD) + **Mongodump** (Backup/Restore) để:
- ✅ Thực hiện các hoạt động CRUD với Mongoose
- ✅ Sao lưu dữ liệu định kỳ với Mongodump
- ✅ Khôi phục dữ liệu từ backup khi cần

---

## 🔧 Chuẩn Bị Ban Đầu

### 1. Kiểm Tra MongoDB Đã Cài Đặt

```powershell
# Windows - Kiểm tra MongoDB Service
Get-Service | Where-Object {$_.Name -like '*Mongo*'}

# hoặc kiểm tra mongodump
mongodump --version
mongorestore --version
```

### 2. Kiểm Tra Kết Nối MONGO_URI

Đảm bảo file `.env` có:
```env
MONGO_URI=mongodb://localhost:27017/lol-figures
```

### 3. Cài Đặt MongoDB Tools (nếu cần)

**Windows:**
```powershell
# Tải MongoDB Tools từ: https://www.mongodb.com/try/download/database-tools
# Sau đó thêm vào PATH hoặc chạy với đường dẫn đầy đủ
```

**Hoặc sử dụng Chocolatey (nếu có):**
```powershell
choco install mongodb-database-tools
```

---

## 📂 Scripts Backup Mới

### 1. **Backup Ngay Lập Tức**

```bash
npm run backup
```

**Chức năng:**
- Tạo backup tại: `BE/backups/backup_YYYY-MM-DD_HH-MM-SS/`
- Tự động tính toán kích thước
- Tạo file `metadata.json` lưu thông tin

**Output:**
```
============================================================
🔄 MONGODB BACKUP STARTED
============================================================
📦 Database: lol-figures
🖥️  Host: localhost:27017
📁 Backup Path: C:\...\backups\backup_2024-01-13_14-30-45
⏰ Timestamp: 2024-01-13_14-30-45
============================================================

... (mongodump output)

============================================================
✅ BACKUP COMPLETED SUCCESSFULLY!
============================================================
📊 Backup Size: 12.45 MB
📁 Location: C:\...\backups\backup_2024-01-13_14-30-45
🔑 Database: lol-figures
============================================================
```

---

### 2. **Restore Dữ Liệu**

```bash
npm run restore
```

**Chức năng:**
- Hiển thị danh sách backup có sẵn
- Chọn backup để restore
- Hỏi xác nhận trước khi restore

**Ví dụ:**
```bash
📋 Các backup có sẵn:
============================================================
1. backup_2024-01-13_14-30-45
   📊 Size: 12.45 MB
   🕐 Time: 2024-01-13_14-30-45
   🗄️  DB: lol-figures
============================================================

📌 Chọn backup để restore (nhập số hoặc tên): 1

⚠️  MONGODB RESTORE WARNING
============================================================
📁 Backup: backup_2024-01-13_14-30-45
🎯 Database: mongodb://localhost:27017/lol-figures
➕ Mode: MERGE (thêm/cập nhật dữ liệu)
============================================================

⚡ Bạn chắc chắn muốn restore? (yes/no): yes
```

**Restore với Mode DROP (xóa collection cũ):**
```bash
node scripts/restore.js backups/backup_2024-01-13_14-30-45 --drop
```

---

### 3. **Liệt Kê Tất Cả Backup**

```bash
npm run backups:list
```

**Output:**
```
======================================================================
📋 DANH SÁCH CÁC BACKUP
======================================================================
#   Tên Backup                     Timestamp            Size
----------------------------------------------------------------------
1   backup_2024-01-13_14-30-45     2024-01-13_14-30-45  12.45 MB
2   backup_2024-01-12_02-00-00     2024-01-12_02-00-00  11.20 MB
3   backup_2024-01-11_02-00-00     2024-01-11_02-00-00  10.89 MB
======================================================================

📊 Tổng cộng: 3 backup, 34.54 MB
```

---

### 4. **Xem Chi Tiết Backup**

```bash
npm run backups:info 1
```

**Output:**
```
============================================================
📦 CHI TIẾT BACKUP
============================================================
Tên:        backup_2024-01-13_14-30-45
Timestamp:  2024-01-13_14-30-45
Size:       12.45 MB
Path:       C:\...\backups\backup_2024-01-13_14-30-45
============================================================

🗄️  Collections:
   - users (3 files)
   - products (4 files)
   - orders (2 files)
   - carts (1 file)
   - vouchers (1 file)
```

---

### 5. **Xóa Backup Cũ**

```bash
npm run backups:delete 1
```

Sẽ hỏi xác nhận:
```
⚠️  Bạn chắc chắn muốn xóa "backup_2024-01-13_14-30-45"? (yes/no): yes
✅ Đã xóa: backup_2024-01-13_14-30-45
```

---

## ⏰ Cấu Hình Backup Tự Động (Optional)

### Cách 1: Sử dụng Windows Task Scheduler

**Tạo task backup mỗi ngày lúc 2:00 AM:**

1. Mở **Task Scheduler** (Win + R → `taskschd.msc`)
2. Click **Create Basic Task**
3. Tên: `MongoDB Backup Daily`
4. Trigger: **Daily** → **2:00 AM**
5. Action: **Start a program**
   - Program: `C:\Program Files\nodejs\node.exe`
   - Arguments: `C:\...\chuyende\BE\scripts\backup.js`
   - Start in: `C:\...\chuyende\BE\`
6. Click **Finish**

---

### Cách 2: Sử dụng Node-Cron (Recommended)

**Cài đặt:**
```bash
npm install node-cron
```

**Tạo file `src/backup-scheduler.js`:**

```javascript
const cron = require('node-cron');
const { performBackup, log } = require('../scripts/scheduledBackup');

// Backup mỗi ngày lúc 2:00 AM
cron.schedule('0 2 * * *', () => {
  log('🔄 Tự động chạy backup theo lịch');
  performBackup();
});

// Backup mỗi 6 tiếng
cron.schedule('0 */6 * * *', () => {
  log('🔄 Tự động chạy backup 6 tiếng');
  performBackup();
});

module.exports = { startBackupScheduler: () => console.log('✅ Backup scheduler đã khởi động') };
```

**Thêm vào `server.js`:**
```javascript
const { startBackupScheduler } = require('./backup-scheduler');

// ... sau khi kết nối database ...
startBackupScheduler();
console.log('✅ Backup scheduler đã khởi động');
```

---

## 📊 Cấu Trúc Folder Backup

```
BE/
├── backups/
│   ├── backup_2024-01-13_14-30-45/
│   │   ├── lol-figures/          # Database name
│   │   │   ├── users.bson        # Users collection
│   │   │   ├── users.metadata.json
│   │   │   ├── products.bson
│   │   │   ├── products.metadata.json
│   │   │   ├── orders.bson
│   │   │   ├── orders.metadata.json
│   │   │   ├── carts.bson
│   │   │   └── ... (other collections)
│   │   └── metadata.json         # Backup metadata
│   └── backup_2024-01-12_02-00-00/
├── logs/
│   └── backup.log               # Backup log file
```

---

## 🔄 Quy Trình Backup/Restore Thực Tế

### Scenario 1: Backup Thường Xuyên

```bash
# Mỗi tuần
npm run backup

# Liệt kê backups
npm run backups:list

# Xóa backup cũ (>30 ngày)
npm run backups:delete 5
```

### Scenario 2: Khôi Phục Sau Lỗi

```bash
# Khi dữ liệu bị lỗi hoặc mất
npm run restore

# Chọn backup muốn restore
# Input: 1 (chọn backup mới nhất)

# Mở server để kiểm tra
npm run dev
```

### Scenario 3: Chuyển Dữ Liệu Giữa Environments

**Từ Production sang Development:**

```bash
# Production: Backup dữ liệu
npm run backup

# Copy folder backup_YYYY-MM-DD_HH-MM-SS sang dev machine

# Development: Restore
npm run restore
# Chọn backup từ production
```

---

## ⚠️ Troubleshooting

### Lỗi: "mongodump: command not found"

**Solution:**
```bash
# Windows - Thêm MongoDB Tools path
# Tải từ: https://www.mongodb.com/try/download/database-tools
# Trích xuất và thêm vào PATH

# Hoặc chạy với đường dẫn đầy đủ
"C:\Program Files\mongodump" --version
```

### Lỗi: "Authentication failed"

```bash
# Kiểm tra MONGO_URI trong .env
MONGO_URI=mongodb://localhost:27017/lol-figures

# Nếu có authentication
MONGO_URI=mongodb://username:password@localhost:27017/lol-figures
```

### Lỗi: "Permission denied"

```bash
# Kiểm tra quyền thư mục backups
# Windows: Run as Administrator

# hoặc chạy PowerShell as Admin
npm run backup
```

### Lỗi: "Backup size quá lớn"

```bash
# Xóa backup cũ
npm run backups:delete <number>

# Hoặc xóa thủ công
Remove-Item "BE\backups\backup_2024-01-13_*" -Recurse
```

---

## 📋 Checklist Hàng Tháng

- [ ] Kiểm tra MongoDB Service đang chạy
- [ ] Chạy backup: `npm run backup`
- [ ] Liệt kê backup: `npm run backups:list`
- [ ] Xóa backup cũ (>30 ngày): `npm run backups:delete <number>`
- [ ] Test restore với backup cũ: `npm run restore`
- [ ] Kiểm tra kích thước backups: `npm run backups:list`
- [ ] Backup log: `cat logs/backup.log`

---

## 🎯 Best Practices

1. **Backup thường xuyên** - Mỗi ngày hoặc mỗi 6 giờ
2. **Lưu backup ở nơi an toàn** - Khác ổ đĩa, hoặc cloud
3. **Test restore định kỳ** - Đảm bảo backup có thể khôi phục
4. **Giữ metadata** - Giúp track backup cũ nhất nào nên xóa
5. **Monitor backup size** - Nếu > 1GB/backup, có thể cần compress
6. **Encrypt backup** - Nếu lưu cloud hoặc chứa dữ liệu nhạy cảm
7. **Backup before major changes** - Trước khi migrate, update schema

---

## 📞 Hỗ Trợ

Nếu gặp lỗi:

```bash
# Kiểm tra MongoDB status
# Windows
Get-Service | Where-Object {$_.Name -like 'MongoDB*'}

# Kiểm tra MONGO_URI
cat .env | findstr MONGO_URI

# Chạy backup với verbose output
mongodump --uri="mongodb://localhost:27017/lol-figures" --out="backups/test"

# Xem backup log
cat logs/backup.log
```

---

## 📚 Tài Liệu Tham Khảo

- [MongoDB Backup & Restore Docs](https://docs.mongodb.com/manual/core/backups/)
- [Mongodump Reference](https://docs.mongodb.com/database-tools/mongodump/)
- [Mongorestore Reference](https://docs.mongodb.com/database-tools/mongorestore/)
- [Node-Cron Documentation](https://github.com/kelektiv/node-cron)

---

**Tạo ngày:** 13 January 2024  
**Cập nhật:** Mongoose + Mongodump Integration  
**Version:** 1.0
