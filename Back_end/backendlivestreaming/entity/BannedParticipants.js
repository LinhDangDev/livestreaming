const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BannedParticipant = sequelize.define('BannedParticipant', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    stream_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    participant_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ip_address: {
        type: DataTypes.STRING,
        allowNull: false
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    ban_duration: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    banned_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    banned_by: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ban_end_time: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'bannedparticipants',
    timestamps: false
});

module.exports = BannedParticipant;
