const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Participant = sequelize.define('Participant', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    stream_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ip_address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    display_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    role: {
        type: DataTypes.ENUM('streamer', 'viewer'),
        allowNull: false
    }
  }, {
    tableName: 'participants',
    timestamps: false
  });
module.exports = Participant;
