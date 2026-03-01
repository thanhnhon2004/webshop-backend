/**
 * Backup Configuration File
 * Cấu hình cho scheduled backup (sử dụng khi integrate node-cron)
 * 
 * Để sử dụng:
 * 1. Cài đặt: npm install node-cron
 * 2. Import vào server.js
 * 3. Gọi startBackupScheduler() sau khi mongoose connected
 */

module.exports = {
  // Kích hoạt backup tự động?
  enabled: process.env.BACKUP_ENABLED !== 'false',

  // Cron pattern cho scheduled backup
  // Format: "minute hour day month dayOfWeek"
  schedules: {
    // Backup daily at 2:00 AM
    daily: {
      pattern: '0 2 * * *',
      description: 'Daily backup at 2:00 AM',
      enabled: true
    },

    // Backup every 6 hours
    sixHourly: {
      pattern: '0 */6 * * *',
      description: 'Backup every 6 hours',
      enabled: false
    },

    // Backup every 12 hours
    twiceDaily: {
      pattern: '0 0,12 * * *',
      description: 'Backup at 0:00 AM and 12:00 PM',
      enabled: false
    },

    // Backup every Sunday at 3:00 AM
    weekly: {
      pattern: '0 3 * * 0',
      description: 'Weekly backup on Sunday at 3:00 AM',
      enabled: true
    },

    // Backup on the 1st day of month at 4:00 AM
    monthly: {
      pattern: '0 4 1 * *',
      description: 'Monthly backup on the 1st at 4:00 AM',
      enabled: true
    }
  },

  // Backup retention policy
  retention: {
    // Giữ bao nhiêu backup gần nhất?
    maxBackups: 30,

    // Xóa backup cũ hơn bao nhiêu ngày? (0 = disable)
    maxDays: 90,

    // Tính toán kích thước tối đa toàn bộ backups (MB) - 0 = unlimited
    maxTotalSizeMB: 500
  },

  // Paths
  paths: {
    backupDir: process.env.BACKUP_DIR || './backups',
    logsDir: process.env.LOGS_DIR || './logs',
    logFile: 'backup.log'
  },

  // Notification settings (nếu muốn gửi email/slack khi backup xong)
  notifications: {
    enabled: false,

    // Webhook URL để gửi notification (ví dụ: Slack)
    webhookUrl: process.env.BACKUP_WEBHOOK_URL || null,

    // Gửi notification khi:
    // - 'always': Mỗi lần backup hoàn tất
    // - 'failure': Chỉ khi backup thất bại
    // - 'success': Chỉ khi backup thành công
    notifyOn: 'failure',

    // Template cho Slack notification
    slackTemplate: {
      success: {
        text: '✅ Backup thành công: {size} MB at {time}',
        color: '#36a64f'
      },
      failure: {
        text: '❌ Backup thất bại: {error}',
        color: '#ff0000'
      }
    }
  },

  // Compression settings (nếu enable sẽ nén backup)
  compression: {
    enabled: false,
    type: 'gzip', // 'gzip' hoặc 'zip'
    level: 6 // Compression level 1-9
  },

  // Các Cron Patterns Phổ Biến:
  // ┌───────────── minute (0 - 59)
  // │ ┌───────────── hour (0 - 23)
  // │ │ ┌───────────── day of month (1 - 31)
  // │ │ │ ┌───────────── month (1 - 12)
  // │ │ │ │ ┌───────────── day of week (0 - 6) (0 = Sunday)
  // │ │ │ │ │
  // │ │ │ │ │
  // * * * * *
  //
  // Examples:
  // '0 0 * * *'       = Every day at midnight
  // '0 */4 * * *'     = Every 4 hours
  // '0 0 * * 0'       = Every Sunday at midnight
  // '0 0 1 * *'       = First day of every month
  // '30 2 * * *'      = Daily at 2:30 AM
  // '0 9-17 * * *'    = Every hour from 9 AM to 5 PM
  // '*/15 * * * *'    = Every 15 minutes
};
