# Mongodump Backup System - Tài Liệu Tổng Hợp

## 📌 Giới Thiệu

Dự án đã tích hợp hoàn chỉnh **Mongoose** (cho CRUD operations) + **Mongodump** (cho backup/restore).

```
Mongoose:  Node.js ←→ MongoDB (CRUD operations)
Mongodump: MongoDB → File .bson (Backup/Restore)
```

**Hai công nghệ phục vụ mục đích khác nhau, dùng cùng nhau!**

---

## 🚀 Khởi Động Nhanh

### 1. Setup Lần Đầu
```bash
node setup-backup.js
```
Script sẽ:
- ✅ Kiểm tra mongodump đã cài
- ✅ Kiểm tra .env có MONGO_URI
- ✅ Test kết nối MongoDB
- ✅ Tạo backup lần đầu

### 2. Lệnh Cơ Bản
```bash
npm run backup         # Backup ngay
npm run restore        # Khôi phục
npm run backups:list   # Liệt kê backup
```

### 3. Chọn Hướng Dẫn
- 🚀 **Hướng dẫn nhanh?** → `BACKUP_QUICK_START.md`
- 📚 **Tài liệu đầy đủ?** → `MONGODUMP_GUIDE.md`
- ✨ **Tóm tắt tính năng?** → `MONGODUMP_INTEGRATION_SUMMARY.md`

---

## 📁 Cấu Trúc Thư Mục

```
BE/
├── scripts/
│   ├── backup.js                  # Tạo backup
│   ├── restore.js                 # Khôi phục backup
│   ├── scheduledBackup.js         # Backup tự động
│   └── backupManager.js           # Quản lý backup
├── config/
│   └── backup.config.js           # Cấu hình backup
├── backups/                       # Thư mục lưu backup
│   └── backup_YYYY-MM-DD_HH-MM-SS/
├── setup-backup.js                # Setup script
├── BACKUP_QUICK_START.md          # 📖 Nhanh
├── MONGODUMP_GUIDE.md             # 📚 Chi tiết
└── MONGODUMP_INTEGRATION_SUMMARY.md # ✨ Tóm tắt
```

---

## 🎯 Use Cases

### Case 1: Backup Hàng Ngày
```bash
# Tạo backup lúc 2:00 AM mỗi ngày
# Dùng Windows Task Scheduler hoặc Node-Cron
# (Xem MONGODUMP_GUIDE.md)
```

### Case 2: Dữ Liệu Bị Lỗi
```bash
npm run restore     # Chọn backup từ trước lỗi
```

### Case 3: Chuyển Environments
```bash
# Production
npm run backup

# Copy backups/ sang dev machine

# Development
npm run restore
```

### Case 4: Quản Lý Backup
```bash
npm run backups:list       # Xem tất cả
npm run backups:info 1     # Chi tiết backup #1
npm run backups:delete 3   # Xóa backup #3
```

---

## 📋 Scripts Có Sẵn

| Script | Mô Tả | Cú Pháp |
|--------|-------|--------|
| `backup.js` | Backup ngay | `npm run backup` |
| `restore.js` | Khôi phục | `npm run restore` |
| `backupManager.js` | Quản lý | `npm run backups:list` |
| `scheduledBackup.js` | Backup tự động | (node-cron) |
| `setup-backup.js` | Setup lần đầu | `node setup-backup.js` |

---

## ⚙️ Cấu Hình

### Environment Variables (.env)
```env
MONGO_URI=mongodb://localhost:27017/lol-figures
BACKUP_ENABLED=true              # Enable/disable backup
BACKUP_DIR=./backups             # Thư mục backup
LOGS_DIR=./logs                  # Thư mục logs
```

### Cron Patterns (Nếu dùng Node-Cron)
```javascript
'0 2 * * *'      // Mỗi ngày lúc 2:00 AM
'0 */6 * * *'    // Mỗi 6 giờ
'0 0 * * 0'      // Mỗi chủ nhật lúc midnight
'0 0 1 * *'      // Mỗi tháng lúc 00:00
```

---

## 💾 Cấu Trúc Backup

```
backups/
└── backup_2024-01-13_14-30-45/
    ├── lol-figures/              # Database
    │   ├── users.bson
    │   ├── users.metadata.json
    │   ├── products.bson
    │   ├── products.metadata.json
    │   ├── orders.bson
    │   ├── orders.metadata.json
    │   ├── carts.bson
    │   ├── carts.metadata.json
    │   ├── vouchers.bson
    │   ├── vouchers.metadata.json
    │   ├── shippingfees.bson
    │   ├── shippingfees.metadata.json
    │   └── tokenblacklists.bson
    └── metadata.json             # Backup info
```

---

## 🔒 Best Practices

✅ **Làm:**
- Backup thường xuyên (hàng ngày)
- Lưu backup ở nhiều nơi (local + cloud)
- Test restore định kỳ
- Backup trước khi thay đổi schema
- Monitor kích thước backup

❌ **Không làm:**
- Xóa tất cả backup cũ
- Lưu backup trên cùng ổ cứng
- Commit backup vào git
- Quên test restore
- Để backup size vô hạn

---

## 🐛 Troubleshooting

### mongodump không tìm thấy
```powershell
# Cải MongoDB Database Tools từ:
# https://www.mongodb.com/try/download/database-tools
# Thêm vào PATH hoặc chạy with full path
```

### Kết nối MongoDB thất bại
```powershell
# Kiểm tra service
Get-Service | Where-Object {$_.Name -like '*Mongo*'}

# Kiểm tra MONGO_URI trong .env
cat .env | findstr MONGO_URI
```

### Backup size quá lớn
```bash
# Xóa backup cũ
npm run backups:delete <number>

# Hoặc tự động cleanup (xem config/backup.config.js)
```

---

## 📞 Tài Liệu Chi Tiết

- **BACKUP_QUICK_START.md** - Bắt đầu trong 5 phút
- **MONGODUMP_GUIDE.md** - Hướng dẫn hoàn chỉnh
- **MONGODUMP_INTEGRATION_SUMMARY.md** - Tóm tắt thay đổi
- **config/backup.config.js** - Cấu hình nâng cao

---

## ✅ Checklist Hàng Tháng

- [ ] Chạy: `npm run backup`
- [ ] Liệt kê: `npm run backups:list`
- [ ] Kiểm tra: `npm run backups:info 1`
- [ ] Test: `npm run restore` (với backup lâu nhất)
- [ ] Xóa cũ: `npm run backups:delete <old>`
- [ ] Kiểm tra logs: `cat logs/backup.log`

---

## 🎓 Tóm Tắt

| Công Nghệ | Mục Đích | Cách Dùng |
|-----------|----------|----------|
| **Mongoose** | CRUD operations | `npm run dev` → Create/Read/Update/Delete |
| **Mongodump** | Backup database | `npm run backup` |
| **Mongorestore** | Restore dari backup | `npm run restore` |

**Kết luận:** Dùng **cả 2 cùng nhau**, không thay thế!

---

**Tạo ngày:** 13 January 2024  
**Phiên bản:** 1.0 - Full Integration  
**Trạng thái:** ✅ Ready to Use

Bắt đầu ngay: `node setup-backup.js`
