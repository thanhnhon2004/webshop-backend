/**
 * MongoDB Backup Script using mongodump
 * Tạo backup tự động cho database
 * 
 * Usage:
 * - npm run backup              (tạo backup với timestamp)
 * - npm run backup -- --full    (backup đầy đủ tất cả databases)
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lol-figures';
const BACKUP_DIR = path.join(__dirname, '..', 'backups');

// Tạo thư mục backup nếu chưa có
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`✓ Tạo thư mục backup: ${BACKUP_DIR}`);
}

/**
 * Tạo timestamp cho backup
 */
const getTimestamp = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
};

/**
 * Trích xuất thông tin database từ MONGO_URI
 */
const parseMongoUri = (uri) => {
  // URI format: mongodb://[username:password@]host[:port]/[database]
  const match = uri.match(/mongodb:\/\/(?:([^:@]+):([^@]+)@)?([^/:]+)(?::(\d+))?\/(.+)?/);
  
  if (!match) {
    throw new Error('Invalid MONGO_URI format');
  }

  return {
    username: match[1],
    password: match[2],
    host: match[3],
    port: match[4] || '27017',
    database: match[5] || 'lol-figures'
  };
};

/**
 * Chạy mongodump
 */
const runBackup = (args = {}) => {
  const timestamp = getTimestamp();
  const backupPath = path.join(BACKUP_DIR, `backup_${timestamp}`);
  
  try {
    const mongoInfo = parseMongoUri(MONGO_URI);
    
    // Xây dựng command
    let command = `mongodump --uri="${MONGO_URI}" --out="${backupPath}"`;
    
    // Log information
    console.log('\n' + '='.repeat(60));
    console.log('🔄 MONGODB BACKUP STARTED');
    console.log('='.repeat(60));
    console.log(`📦 Database: ${mongoInfo.database}`);
    console.log(`🖥️  Host: ${mongoInfo.host}:${mongoInfo.port}`);
    console.log(`📁 Backup Path: ${backupPath}`);
    console.log(`⏰ Timestamp: ${timestamp}`);
    console.log('='.repeat(60) + '\n');

    // Thực thi backup
    execSync(command, { stdio: 'inherit' });

    // Tính kích thước backup
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

    console.log('\n' + '='.repeat(60));
    console.log('✅ BACKUP COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log(`📊 Backup Size: ${sizeMB} MB`);
    console.log(`📁 Location: ${backupPath}`);
    console.log(`🔑 Database: ${mongoInfo.database}`);
    console.log('='.repeat(60) + '\n');

    // Tạo file metadata
    const metadata = {
      timestamp,
      database: mongoInfo.database,
      host: mongoInfo.host,
      port: mongoInfo.port,
      sizeBytes: backupSize,
      sizeMB: parseFloat(sizeMB),
      path: backupPath
    };

    fs.writeFileSync(
      path.join(backupPath, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );

  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ BACKUP FAILED!');
    console.error('='.repeat(60));
    console.error('Error:', error.message);
    console.error('='.repeat(60) + '\n');
    
    console.error('💡 Troubleshooting:');
    console.error('1. Kiểm tra MongoDB đang chạy: sudo systemctl status mongod');
    console.error('2. Kiểm tra MONGO_URI trong .env file');
    console.error('3. Kiểm tra mongodump đã cài đặt: mongodump --version');
    console.error('4. Kiểm tra quyền access thư mục backups\n');
    
    process.exit(1);
  }
};

// Chạy backup
runBackup();
