/**
 * MongoDB Restore Script using mongorestore
 * Khôi phục dữ liệu từ backup
 * 
 * Usage:
 * - node scripts/restore.js backups/backup_2024-01-13_10-30-45
 * - node scripts/restore.js backups/backup_2024-01-13_10-30-45 --drop
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const readline = require('readline');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lol-figures';
const BACKUPS_DIR = path.join(__dirname, '..', 'backups');

/**
 * Tạo interface readline để hỏi xác nhận
 */
const askConfirmation = (question) => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
};

/**
 * Liệt kê các backup có sẵn
 */
const listBackups = () => {
  if (!fs.existsSync(BACKUPS_DIR)) {
    console.log('❌ Không tìm thấy thư mục backups');
    return [];
  }

  const backups = fs.readdirSync(BACKUPS_DIR)
    .filter(file => file.startsWith('backup_'))
    .sort()
    .reverse();

  if (backups.length === 0) {
    console.log('📭 Không có backup nào');
    return [];
  }

  console.log('\n📋 Các backup có sẵn:');
  console.log('='.repeat(60));
  backups.forEach((backup, index) => {
    const backupPath = path.join(BACKUPS_DIR, backup);
    const metadata = path.join(backupPath, 'metadata.json');
    
    try {
      if (fs.existsSync(metadata)) {
        const data = JSON.parse(fs.readFileSync(metadata, 'utf8'));
        console.log(`${index + 1}. ${backup}`);
        console.log(`   📊 Size: ${data.sizeMB} MB`);
        console.log(`   🕐 Time: ${data.timestamp}`);
        console.log(`   🗄️  DB: ${data.database}`);
      } else {
        console.log(`${index + 1}. ${backup}`);
      }
    } catch (e) {
      console.log(`${index + 1}. ${backup}`);
    }
  });
  console.log('='.repeat(60) + '\n');

  return backups;
};

/**
 * Chạy mongorestore
 */
const runRestore = async (backupPath, options = {}) => {
  try {
    if (!fs.existsSync(backupPath)) {
      console.error(`❌ Backup không tồn tại: ${backupPath}`);
      process.exit(1);
    }

    console.log('\n' + '='.repeat(60));
    console.log('⚠️  MONGODB RESTORE WARNING');
    console.log('='.repeat(60));
    console.log(`📁 Backup: ${path.basename(backupPath)}`);
    console.log(`🎯 Database: ${MONGO_URI}`);
    
    if (options.drop) {
      console.log('🗑️  Mode: DROP (xóa collection cũ rồi restore)');
    } else {
      console.log('➕ Mode: MERGE (thêm/cập nhật dữ liệu)');
    }
    
    console.log('='.repeat(60) + '\n');

    // Hỏi xác nhận
    const confirmed = await askConfirmation('⚡ Bạn chắc chắn muốn restore? (yes/no): ');

    if (!confirmed) {
      console.log('❌ Restore bị hủy bỏ');
      process.exit(0);
    }

    // Xây dựng command
    let command = `mongorestore --uri="${MONGO_URI}" --dir="${backupPath}"`;
    
    if (options.drop) {
      command += ' --drop';
    }

    console.log('\n' + '='.repeat(60));
    console.log('🔄 RESTORE STARTED...');
    console.log('='.repeat(60) + '\n');

    // Thực thi restore
    execSync(command, { stdio: 'inherit' });

    console.log('\n' + '='.repeat(60));
    console.log('✅ RESTORE COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ RESTORE FAILED!');
    console.error('='.repeat(60));
    console.error('Error:', error.message);
    console.error('='.repeat(60) + '\n');

    console.error('💡 Troubleshooting:');
    console.error('1. Kiểm tra MongoDB đang chạy');
    console.error('2. Kiểm tra mongorestore đã cài đặt');
    console.error('3. Kiểm tra backup path có tồn tại');
    console.error('4. Kiểm tra MONGO_URI trong .env file\n');
    
    process.exit(1);
  }
};

/**
 * Main function
 */
const main = async () => {
  const args = process.argv.slice(2);
  let backupName = args[0];
  const options = {
    drop: args.includes('--drop')
  };

  // Nếu không có backup được chỉ định, hiển thị danh sách
  if (!backupName) {
    const backups = listBackups();
    
    if (backups.length === 0) {
      process.exit(1);
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('📌 Chọn backup để restore (nhập số hoặc tên): ', async (answer) => {
      rl.close();

      // Kiểm tra xem có phải số không
      const index = parseInt(answer) - 1;
      if (!isNaN(index) && index >= 0 && index < backups.length) {
        backupName = backups[index];
      } else {
        backupName = answer;
      }

      const fullPath = path.isAbsolute(backupName) 
        ? backupName 
        : path.join(BACKUPS_DIR, backupName);

      await runRestore(fullPath, options);
    });
  } else {
    const fullPath = path.isAbsolute(backupName)
      ? backupName
      : path.join(BACKUPS_DIR, backupName);

    await runRestore(fullPath, options);
  }
};

main();
