/**
 * Utility to list and manage backups
 * Liệt kê, so sánh, và quản lý các backup
 */

const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(__dirname, '..', 'backups');

/**
 * Lấy thông tin tất cả backup
 */
const getBackupInfo = () => {
  if (!fs.existsSync(BACKUP_DIR)) {
    console.log('❌ Không tìm thấy thư mục backups');
    return [];
  }

  const backups = fs.readdirSync(BACKUP_DIR)
    .filter(file => file.startsWith('backup_'))
    .sort()
    .reverse();

  return backups.map(backup => {
    const backupPath = path.join(BACKUP_DIR, backup);
    const metadataPath = path.join(backupPath, 'metadata.json');

    let metadata = { timestamp: backup.replace('backup_', ''), sizeMB: 0 };

    try {
      if (fs.existsSync(metadataPath)) {
        metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      }
    } catch (e) {
      // Ignore metadata errors
    }

    return {
      name: backup,
      path: backupPath,
      timestamp: metadata.timestamp,
      sizeMB: metadata.sizeMB,
      sizeBytes: metadata.sizeBytes
    };
  });
};

/**
 * Hiển thị danh sách backup
 */
const listBackups = () => {
  const backups = getBackupInfo();

  if (backups.length === 0) {
    console.log('\n📭 Không có backup nào\n');
    return;
  }

  console.log('\n' + '='.repeat(70));
  console.log('📋 DANH SÁCH CÁC BACKUP');
  console.log('='.repeat(70));
  console.log(`${'#'.padEnd(3)} ${'Tên Backup'.padEnd(30)} ${'Timestamp'.padEnd(20)} ${'Size'.padEnd(10)}`);
  console.log('-'.repeat(70));

  backups.forEach((backup, index) => {
    console.log(
      `${(index + 1).toString().padEnd(3)} ${backup.name.padEnd(30)} ${backup.timestamp.padEnd(20)} ${backup.sizeMB.toFixed(2)} MB`
    );
  });

  console.log('='.repeat(70) + '\n');

  // Thống kê
  const totalSize = backups.reduce((sum, b) => sum + (b.sizeBytes || 0), 0);
  console.log(`📊 Tổng cộng: ${backups.length} backup, ${(totalSize / 1024 / 1024).toFixed(2)} MB\n`);
};

/**
 * Hiển thị chi tiết một backup
 */
const showBackupDetails = (backupIndex) => {
  const backups = getBackupInfo();

  if (backupIndex < 1 || backupIndex > backups.length) {
    console.error(`❌ Backup không tồn tại (chọn 1-${backups.length})`);
    return;
  }

  const backup = backups[backupIndex - 1];

  console.log('\n' + '='.repeat(60));
  console.log('📦 CHI TIẾT BACKUP');
  console.log('='.repeat(60));
  console.log(`Tên:        ${backup.name}`);
  console.log(`Timestamp:  ${backup.timestamp}`);
  console.log(`Size:       ${backup.sizeMB.toFixed(2)} MB`);
  console.log(`Path:       ${backup.path}`);
  console.log('='.repeat(60) + '\n');

  // Liệt kê các collections
  try {
    const collections = fs.readdirSync(backup.path)
      .filter(file => file !== 'metadata.json' && fs.statSync(path.join(backup.path, file)).isDirectory());

    if (collections.length > 0) {
      console.log('🗄️  Collections:');
      collections.forEach(collection => {
        const collPath = path.join(backup.path, collection);
        const files = fs.readdirSync(collPath);
        console.log(`   - ${collection} (${files.length} files)`);
      });
      console.log();
    }
  } catch (e) {
    // Ignore errors
  }
};

/**
 * Xóa backup
 */
const deleteBackup = (backupIndex) => {
  const backups = getBackupInfo();

  if (backupIndex < 1 || backupIndex > backups.length) {
    console.error(`❌ Backup không tồn tại (chọn 1-${backups.length})`);
    return;
  }

  const backup = backups[backupIndex - 1];
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question(`⚠️  Bạn chắc chắn muốn xóa "${backup.name}"? (yes/no): `, (answer) => {
    rl.close();

    if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
      try {
        const { execSync } = require('child_process');
        execSync(`rmdir /s /q "${backup.path}"`, { shell: 'cmd.exe' });
        console.log(`✅ Đã xóa: ${backup.name}`);
      } catch (error) {
        console.error(`❌ Lỗi khi xóa: ${error.message}`);
      }
    } else {
      console.log('❌ Hủy bỏ');
    }
  });
};

// CLI
const command = process.argv[2];
const arg = process.argv[3];

switch (command) {
  case 'list':
  case 'ls':
    listBackups();
    break;
  case 'info':
  case 'show':
    if (arg) {
      showBackupDetails(parseInt(arg));
    } else {
      console.log('💡 Usage: node scripts/backupManager.js info <number>');
    }
    break;
  case 'delete':
  case 'rm':
    if (arg) {
      deleteBackup(parseInt(arg));
    } else {
      console.log('💡 Usage: node scripts/backupManager.js delete <number>');
    }
    break;
  default:
    console.log('\n📖 Backup Manager CLI\n');
    console.log('Commands:');
    console.log('  list              - Liệt kê tất cả backup');
    console.log('  info <number>     - Hiển thị chi tiết backup');
    console.log('  delete <number>   - Xóa một backup\n');
    console.log('Example:');
    console.log('  npm run backups:list');
    console.log('  npm run backups:info 1\n');
    listBackups();
}

module.exports = { getBackupInfo, listBackups, showBackupDetails, deleteBackup };
