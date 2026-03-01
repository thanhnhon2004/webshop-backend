#!/usr/bin/env node

/**
 * First Time Setup - Mongodump Backup System
 * 
 * Chạy: node setup-backup.js
 * 
 * Script này sẽ:
 * 1. Kiểm tra MongoDB đang chạy
 * 2. Kiểm tra mongodump/mongorestore
 * 3. Tạo thử backup lần đầu
 * 4. In ra hướng dẫn tiếp theo
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️ ${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ️ ${colors.reset} ${msg}`),
  step: (msg) => console.log(`\n${colors.cyan}▶${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}\n${msg}\n${colors.cyan}${'='.repeat(60)}${colors.reset}\n`),
};

/**
 * Kiểm tra command có tồn tại không
 */
const commandExists = (cmd) => {
  try {
    execSync(`where ${cmd}`, { stdio: 'ignore', shell: 'cmd.exe' });
    return true;
  } catch {
    return false;
  }
};

/**
 * Chạy setup
 */
const runSetup = async () => {
  log.title('🔧 MONGODUMP BACKUP SYSTEM - First Time Setup');

  console.log('Bước 1️⃣  Kiểm tra MongoDB...\n');

  // Check MongoDB Service
  if (!commandExists('mongodump')) {
    log.error('mongodump không được cài đặt');
    console.log(`
Hướng dẫn cài đặt:
1. Tải MongoDB Database Tools từ: https://www.mongodb.com/try/download/database-tools
2. Trích xuất file zip
3. Thêm vào Windows PATH hoặc sao chép vào C:\\Program Files\\mongodump

Sau đó chạy lại: node setup-backup.js
    `);
    process.exit(1);
  }

  log.success('mongodump được cài đặt');

  if (!commandExists('mongorestore')) {
    log.error('mongorestore không được cài đặt');
    process.exit(1);
  }

  log.success('mongorestore được cài đặt');

  // Check .env
  console.log('\nBước 2️⃣  Kiểm tra cấu hình...\n');

  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    log.error('.env file không tồn tại');
    console.log('Tạo file .env với nội dung:');
    console.log('MONGO_URI=mongodb://localhost:27017/lol-figures\n');
    process.exit(1);
  }

  log.success('.env file tồn tại');

  // Read MONGO_URI
  const envContent = fs.readFileSync(envPath, 'utf8');
  const mongoMatch = envContent.match(/MONGO_URI=(.+)/);

  if (!mongoMatch) {
    log.error('MONGO_URI không được tìm thấy trong .env');
    process.exit(1);
  }

  const mongoUri = mongoMatch[1].trim();
  log.success(`MONGO_URI: ${mongoUri}`);

  // Test connection
  console.log('\nBước 3️⃣  Kiểm tra kết nối MongoDB...\n');

  try {
    execSync(`mongodump --uri="${mongoUri}" --help > nul`, { stdio: 'ignore' });
    log.success('MongoDB kết nối thành công');
  } catch (error) {
    log.error('Không thể kết nối tới MongoDB');
    console.log(`\nMongoDB URI: ${mongoUri}`);
    console.log('\nKiểm tra:');
    console.log('1. MongoDB service đang chạy?');
    console.log('   Windows: Get-Service | Where-Object {$_.Name -like "*Mongo*"}');
    console.log('2. URI có đúng không?');
    console.log('3. Cổng 27017 có open không?');
    process.exit(1);
  }

  // Test backup
  console.log('\nBước 4️⃣  Tạo backup lần đầu tiên...\n');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const backupPath = path.join(__dirname, 'backups', `backup_${timestamp}`);

  try {
    log.info(`Tạo backup tại: ${backupPath}`);
    execSync(`mongodump --uri="${mongoUri}" --out="${backupPath}"`, { stdio: 'inherit' });
    
    if (fs.existsSync(backupPath)) {
      log.success('Backup thành công!');
      
      // Get size
      const getSize = (dir) => {
        let size = 0;
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          const stat = fs.statSync(path.join(dir, file));
          size += stat.isDirectory() ? getSize(path.join(dir, file)) : stat.size;
        });
        return size;
      };

      const size = getSize(backupPath);
      log.success(`Kích thước backup: ${(size / 1024 / 1024).toFixed(2)} MB`);
    }
  } catch (error) {
    log.error(`Lỗi tạo backup: ${error.message}`);
    process.exit(1);
  }

  // Summary
  log.title('✅ SETUP HOÀN THÀNH');

  console.log('📋 Các lệnh có sẵn:\n');
  console.log('  npm run backup              - Tạo backup ngay');
  console.log('  npm run restore             - Khôi phục từ backup');
  console.log('  npm run backups:list        - Liệt kê backup');
  console.log('  npm run backups:info 1      - Xem chi tiết backup');
  console.log('  npm run backups:delete 1    - Xóa backup\n');

  console.log('📚 Tài liệu:\n');
  console.log('  BACKUP_QUICK_START.md       - Hướng dẫn nhanh');
  console.log('  MONGODUMP_GUIDE.md          - Tài liệu đầy đủ\n');

  console.log('🎯 Bước tiếp theo:\n');
  console.log('  1. Đọc: BACKUP_QUICK_START.md');
  console.log('  2. Thử: npm run backup');
  console.log('  3. Xem: npm run backups:list');
  console.log('  4. Cấu hình backup tự động (xem MONGODUMP_GUIDE.md)\n');

  console.log(`${colors.green}Tất cả sẵn sàng! Bạn có thể bắt đầu sử dụng backup system.${colors.reset}\n`);
};

// Run setup
runSetup().catch(error => {
  log.error(`Setup failed: ${error.message}`);
  process.exit(1);
});
