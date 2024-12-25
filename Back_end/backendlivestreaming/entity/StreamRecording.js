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
        allowNull: false,
        references: {
            model: 'streams',
            key: 'id'
        }
    },
    file_url: {
        type: DataTypes.STRING,
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
    timestamps: false
});

module.exports = StreamRecording;
