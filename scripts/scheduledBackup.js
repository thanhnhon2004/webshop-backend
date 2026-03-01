/**
 * Scheduled Backup Script
 * Chạy backup tự động theo lịch định kỳ (sử dụng cron)
 * 
 * Installation:
 * npm install node-cron
 * 
 * Cron pattern: "0 2 * * *" = 2:00 AM mỗi ngày
 * Cron pattern: "0 6 * * *" = Mỗi 6 giờ
 * Cron pattern: "0 0 * * 0" = Mỗi chủ nhật lúc 0:00
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lol-figures';
const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const BACKUP_LOG = path.join(__dirname, '..', 'logs', 'backup.log');

// Tạo thư mục nếu cần
[BACKUP_DIR, path.dirname(BACKUP_LOG)].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Log message
 */
const log = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(BACKUP_LOG, logMessage + '\n');
};

/**
 * Lấy timestamp cho backup
 */
const getTimestamp = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
};

/**
 * Xóa backup cũ (giữ lại N bản gần nhất)
 */
const cleanOldBackups = (maxBackups = 30) => {
  try {
    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup_'))
      .sort()
      .reverse();

    if (backups.length > maxBackups) {
      const toDelete = backups.slice(maxBackups);
      
      toDelete.forEach(backup => {
        const backupPath = path.join(BACKUP_DIR, backup);
        // Xóa thư mục recursively
        execSync(`rmdir /s /q "${backupPath}"`, { shell: 'cmd.exe' });
        log(`🗑️  Xóa backup cũ: ${backup}`);
      });
    }
  } catch (error) {
    log(`⚠️  Lỗi khi xóa backup cũ: ${error.message}`);
  }
};

/**
 * Thực hiện backup
 */
const performBackup = () => {
  const timestamp = getTimestamp();
  const backupPath = path.join(BACKUP_DIR, `backup_${timestamp}`);

  try {
    log(`🔄 Bắt đầu backup lúc ${new Date().toLocaleString('vi-VN')}`);

    const command = `mongodump --uri="${MONGO_URI}" --out="${backupPath}"`;
    execSync(command, { stdio: 'pipe' });

    // Tính kích thước
    const getDirectorySize = (dir) => {
      let size = 0;
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          size += getDirectorySize(filePath);
        } else {
          size += stat.size;
        }
      });
      
      return size;
    };

    const backupSize = getDirectorySize(backupPath);
    const sizeMB = (backupSize / 1024 / 1024).toFixed(2);

    // Tạo metadata
    const metadata = {
      timestamp,
      sizeBytes: backupSize,
      sizeMB: parseFloat(sizeMB),
      status: 'completed'
    };

    fs.writeFileSync(
      path.join(backupPath, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );

    log(`✅ Backup hoàn tất! Size: ${sizeMB} MB`);
    log(`📁 Location: ${backupPath}`);

    // Xóa backup cũ
    cleanOldBackups(30);

  } catch (error) {
    log(`❌ Backup FAILED: ${error.message}`);
  }
};

// Nếu chạy trực tiếp
if (require.main === module) {
  log(`=== SCHEDULED BACKUP SERVICE STARTED ===`);
  performBackup();
}

module.exports = { performBackup, log };
