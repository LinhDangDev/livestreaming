const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const Stream = sequelize.define('Stream', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  stream_key: {  // Đổi từ streamKey thành stream_key
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  streamer_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  start_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'inactive'
  },
  has_recording: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'streams',  // Chỉ định tên bảng
  timestamps: false      // Tắt timestamps vì không có created_at và updated_at
});

// Sync model với database
sequelize.sync()
    .then(() => console.log('Stream model synced'))
    .catch(err => console.error('Error syncing Stream model:', err));

module.exports = Stream;
