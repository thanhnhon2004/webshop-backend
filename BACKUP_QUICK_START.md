# 🚀 Quick Start - Mongodump Integration

## Cài Đặt Nhanh

### 1. Kiểm Tra MongoDB Đang Chạy
```powershell
# Windows
Get-Service | Where-Object {$_.Name -like 'MongoDB*'}

# Output: Trạng thái Running
```

### 2. Kiểm Tra mongodump/mongorestore
```powershell
mongodump --version
mongorestore --version
```

Nếu không có, tải từ: [MongoDB Database Tools](https://www.mongodb.com/try/download/database-tools)

### 3. Kiểm Tra .env
```env
MONGO_URI=mongodb://localhost:27017/lol-figures
```

---

## 📌 Lệnh Hay Dùng

| Lệnh | Mô Tả |
|------|-------|
| `npm run backup` | Tạo backup ngay lập tức |
| `npm run restore` | Khôi phục từ backup |
| `npm run backups:list` | Liệt kê tất cả backup |
| `npm run backups:info 1` | Xem chi tiết backup #1 |
| `npm run backups:delete 1` | Xóa backup #1 |

---

## 🎯 Ví Dụ Thực Tế

### Backup Lần Đầu
```bash
npm run backup

# Output:
# ============================================================
# ✅ BACKUP COMPLETED SUCCESSFULLY!
# ============================================================
# 📊 Backup Size: 12.45 MB
# 📁 Location: C:\...\backups\backup_2024-01-13_14-30-45
```

### Liệt Kê Backup
```bash
npm run backups:list

# Output:
# ======================================================================
# 📋 DANH SÁCH CÁC BACKUP
# ======================================================================
# #   Tên Backup                     Timestamp            Size
# 1   backup_2024-01-13_14-30-45     2024-01-13_14-30-45  12.45 MB
# ======================================================================
```

### Khôi Phục Dữ Liệu
```bash
npm run restore

# Sẽ hiển thị:
# 📋 Các backup có sẵn:
# 1. backup_2024-01-13_14-30-45
# 📌 Chọn backup để restore (nhập số hoặc tên): 1
# ⚡ Bạn chắc chắn muốn restore? (yes/no): yes
```

---

## ⚠️ Lưu Ý Quan Trọng

✅ **Nên làm:**
- Backup trước khi cập nhật database schema
- Kiểm tra backup có thể restore được
- Giữ backup ở nơi an toàn (cloud backup)
- Test restore thường xuyên

❌ **Không nên làm:**
- Xóa tất cả backup cũ
- Lưu backup trên cùng ổ cứng (dữ liệu bị hỏng)
- Commit backup vào git (quá lớn)
- Chạy restore mà không backup dữ liệu hiện tại

---

## 📖 Tài Liệu Đầy Đủ

Xem file `MONGODUMP_GUIDE.md` để:
- ⏰ Cấu hình backup tự động
- 🔧 Troubleshooting lỗi
- 📊 Cấu trúc folder backup
- 💾 Chuyển dữ liệu giữa environments

---

**Tóm tắt:**
- ✅ Mongoose: Thực hiện CRUD operations
- ✅ Mongodump: Sao lưu dữ liệu định kỳ  
- ✅ Mongorestore: Khôi phục từ backup

Dùng cả hai, không phải thay thế nhau!
