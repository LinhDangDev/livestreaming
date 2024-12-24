const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Stream = sequelize.define('Stream', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  stream_key: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  streamer_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'inactive'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'streams',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['stream_key']
    }
  ]
});

module.exports = Stream;
