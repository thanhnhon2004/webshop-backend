const mongoose = require('mongoose'); // import thư viện mongoose

const connectDB = async () => { // khai báo hàm connectDB bất đồng bộ 
  try {
    // Khuyến nghị: bật strictQuery để tránh cảnh báo filter cũ
    mongoose.set('strictQuery', true); 

    await mongoose.connect(process.env.MONGO_URI, {
      // Với mongoose v7+ thường không cần thêm options, để minh họa:
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      // autoIndex: true, // bật tạo index tự động (tùy nhu cầu)
      // maxPoolSize: 10, // số kết nối tối đa trong pool
      // serverSelectionTimeoutMS: 5000, // timeout chọn server
    });

    console.log(' MongoDB đã kết nối');
  } catch (err) {
    console.error('❌ Lỗi kết nối MongoDB:', err.message);
    // Dừng process nếu kết nối thất bại
    process.exit(1);
  }
  // Đóng kết nối khi process nhận tín hiệu
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('🛑 Kết nối MongoDB đã bị đóng do ứng dụng kết thúc');
    process.exit(0);
  });
};
module.exports = connectDB;