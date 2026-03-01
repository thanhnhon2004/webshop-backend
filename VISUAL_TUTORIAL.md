# 🎬 Visual Tutorial - Mongodump Backup System

## Step 1️⃣: Setup Lần Đầu

```
TERMINAL:
$ node setup-backup.js

OUTPUT:
============================================================
🔧 MONGODUMP BACKUP SYSTEM - First Time Setup
============================================================

▶ Bước 1️⃣  Kiểm tra MongoDB...
✅ mongodump được cài đặt
✅ mongorestore được cài đặt

▶ Bước 2️⃣  Kiểm tra cấu hình...
✅ .env file tồn tại
✅ MONGO_URI: mongodb://localhost:27017/lol-figures

▶ Bước 3️⃣  Kiểm tra kết nối MongoDB...
✅ MongoDB kết nối thành công

▶ Bước 4️⃣  Tạo backup lần đầu tiên...
ℹ️  Tạo backup tại: C:\...\backups\backup_2024-01-13_14-30-45

... (mongodump output)

✅ Backup thành công!
✅ Kích thước backup: 12.45 MB

============================================================
✅ SETUP HOÀN THÀNH
============================================================

📋 Các lệnh có sẵn:
  npm run backup              - Tạo backup ngay
  npm run restore             - Khôi phục từ backup
  npm run backups:list        - Liệt kê backup
  npm run backups:info 1      - Xem chi tiết backup
  npm run backups:delete 1    - Xóa backup

📚 Tài liệu:
  BACKUP_QUICK_START.md       - Hướng dẫn nhanh
  MONGODUMP_GUIDE.md          - Tài liệu đầy đủ

🎯 Bước tiếp theo:
  1. Đọc: BACKUP_QUICK_START.md
  2. Thử: npm run backup
  3. Xem: npm run backups:list
  4. Cấu hình backup tự động (xem MONGODUMP_GUIDE.md)

Tất cả sẵn sàng! Bạn có thể bắt đầu sử dụng backup system.
```

---

## Step 2️⃣: Tạo Backup

```
TERMINAL:
$ npm run backup

OUTPUT:
============================================================
🔄 MONGODB BACKUP STARTED
============================================================
📦 Database: lol-figures
🖥️  Host: localhost:27017
📁 Backup Path: C:\Users\...\backups\backup_2024-01-13_14-30-45
⏰ Timestamp: 2024-01-13_14-30-45
============================================================

2024-01-13T14:30:45.123Z	connecting to: mongodb://localhost:27017/lol-figures
2024-01-13T14:30:45.456Z	succeeded to open local database lol-figures, done.
2024-01-13T14:30:46.789Z	dumped users (5 documents)
2024-01-13T14:30:46.890Z	dumped products (12 documents)
2024-01-13T14:30:46.991Z	dumped orders (8 documents)
2024-01-13T14:30:47.092Z	dumped carts (3 documents)
2024-01-13T14:30:47.193Z	dumped vouchers (5 documents)
2024-01-13T14:30:47.294Z	dumped shippingfees (4 documents)
2024-01-13T14:30:47.395Z	dumped tokenblacklists (2 documents)

============================================================
✅ BACKUP COMPLETED SUCCESSFULLY!
============================================================
📊 Backup Size: 12.45 MB
📁 Location: C:\Users\ASUS\Desktop\chuyende\BE\backups\backup_2024-01-13_14-30-45
🔑 Database: lol-figures
============================================================
```

---

## Step 3️⃣: Liệt Kê Backup

```
TERMINAL:
$ npm run backups:list

OUTPUT:
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

## Step 4️⃣: Xem Chi Tiết Backup

```
TERMINAL:
$ npm run backups:info 1

OUTPUT:
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
   - shippingfees (1 file)
   - tokenblacklists (1 file)
```

---

## Step 5️⃣: Khôi Phục Backup

```
TERMINAL:
$ npm run restore

OUTPUT:
📋 Các backup có sẵn:
============================================================
1. backup_2024-01-13_14-30-45
   📊 Size: 12.45 MB
   🕐 Time: 2024-01-13_14-30-45
   🗄️  DB: lol-figures
2. backup_2024-01-12_02-00-00
   📊 Size: 11.20 MB
   🕐 Time: 2024-01-12_02-00-00
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

============================================================
🔄 RESTORE STARTED...
============================================================

2024-01-13T14:35:30.123Z	restoring from: C:\...\backups\backup_2024-01-13_14-30-45
2024-01-13T14:35:30.456Z	restoring users from ...
2024-01-13T14:35:30.789Z	restoring 5 documents
2024-01-13T14:35:31.012Z	restoring products from ...
2024-01-13T14:35:31.345Z	restoring 12 documents
... (more collections)

============================================================
✅ RESTORE COMPLETED SUCCESSFULLY!
============================================================
```

---

## Step 6️⃣: Xóa Backup Cũ

```
TERMINAL:
$ npm run backups:delete 3

OUTPUT:
⚠️  Bạn chắc chắn muốn xóa "backup_2024-01-11_02-00-00"? (yes/no): yes
✅ Đã xóa: backup_2024-01-11_02-00-00
```

---

## Advanced: Restore với Mode DROP

```
TERMINAL:
$ node scripts/restore.js backups/backup_2024-01-13_14-30-45 --drop

OUTPUT:
⚠️  MONGODB RESTORE WARNING
============================================================
📁 Backup: backup_2024-01-13_14-30-45
🎯 Database: mongodb://localhost:27017/lol-figures
🗑️  Mode: DROP (xóa collection cũ rồi restore)
============================================================

⚡ Bạn chắc chắn muốn restore? (yes/no): yes

... (mongorestore with --drop)

✅ RESTORE COMPLETED SUCCESSFULLY!
```

---

## Folder Structure After Backup

```
BE/
├── backups/
│   ├── backup_2024-01-13_14-30-45/
│   │   ├── lol-figures/
│   │   │   ├── users.bson
│   │   │   ├── users.metadata.json
│   │   │   ├── products.bson
│   │   │   ├── products.metadata.json
│   │   │   ├── orders.bson
│   │   │   ├── orders.metadata.json
│   │   │   ├── carts.bson
│   │   │   ├── carts.metadata.json
│   │   │   ├── vouchers.bson
│   │   │   ├── vouchers.metadata.json
│   │   │   ├── shippingfees.bson
│   │   │   ├── shippingfees.metadata.json
│   │   │   └── tokenblacklists.bson
│   │   └── metadata.json
│   ├── backup_2024-01-12_02-00-00/
│   │   ├── lol-figures/
│   │   │   └── ...
│   │   └── metadata.json
│   └── backup_2024-01-11_02-00-00/
│       └── ...
└── logs/
    └── backup.log
```

---

## Backup Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│         Mongoose CRUD Operations                        │
│  (npm run dev)                                          │
│  - Create: db.users.insert()                           │
│  - Read:   db.users.find()                             │
│  - Update: db.users.update()                           │
│  - Delete: db.users.delete()                           │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│              MongoDB Database                           │
│  ├─ users         (5 documents)                        │
│  ├─ products      (12 documents)                       │
│  ├─ orders        (8 documents)                        │
│  ├─ carts         (3 documents)                        │
│  ├─ vouchers      (5 documents)                        │
│  ├─ shippingfees  (4 documents)                        │
│  └─ tokenblacklists (2 documents)                      │
└─────────────────────────────────────────────────────────┘
         ↙                                        ↖
┌──────────────────┐                  ┌──────────────────┐
│   MONGODUMP      │                  │  MONGORESTORE    │
│ (Backup)         │                  │  (Restore)       │
│ npm run backup   │                  │ npm run restore  │
└──────────────────┘                  └──────────────────┘
         ↓                                        ↑
┌─────────────────────────────────────────────────────────┐
│   Backup Files (BSON Format)                           │
│   backups/backup_2024-01-13_14-30-45/                  │
│  ├─ lol-figures/                                       │
│  │  ├─ users.bson                                      │
│  │  ├─ users.metadata.json                             │
│  │  └─ ...                                             │
│  └─ metadata.json                                      │
└─────────────────────────────────────────────────────────┘
```

---

## Use Case Examples

### Example 1: Daily Backup

```
Schedule: Every day at 2:00 AM

2024-01-10 02:00 → backup_2024-01-10_02-00-00 created (10 MB)
2024-01-11 02:00 → backup_2024-01-11_02-00-00 created (11 MB)
2024-01-12 02:00 → backup_2024-01-12_02-00-00 created (11.2 MB)
2024-01-13 02:00 → backup_2024-01-13_02-00-00 created (12 MB)
                    (Keep last 30 backups)
```

### Example 2: Emergency Restore

```
Timeline:
10:00 AM - Everything working fine
11:30 AM - Database corrupted
11:35 AM - Alert received

Action:
$ npm run restore
> Choose backup #4: backup_2024-01-13_02-00-00
> Confirm: yes
> Restore complete in 2 minutes

11:37 AM - Data restored, server back online!
```

### Example 3: Production to Development

```
Production Server:
$ npm run backup
→ Creates: backups/backup_2024-01-13_14-30-45/

Transfer:
Copy backups/ folder to Dev machine

Development Server:
$ npm run restore
> Choose backup #1
> Confirm: yes
> Data synced to dev environment
```

---

## Command Summary

```
═══════════════════════════════════════════════════════════════════
COMMAND                           PURPOSE
═══════════════════════════════════════════════════════════════════
node setup-backup.js              Setup & verify installation
npm run backup                    Create backup now
npm run restore                   Restore from backup
npm run backups:list              List all backups
npm run backups:info 1            Show details of backup #1
npm run backups:delete 1          Delete backup #1
═══════════════════════════════════════════════════════════════════
```

---

Bây giờ bạn đã sẵn sàng để sử dụng Mongodump backup system! 🚀

Bắt đầu: `node setup-backup.js`
