const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StreamRecording = sequelize.define('StreamRecording', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    stream_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    file_path: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    size: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('recording', 'completed', 'failed'),
        defaultValue: 'recording'
    },
    started_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    ended_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'stream_recordings',
    timestamps: false,
    underscored: true
});

module.exports = StreamRecording;
