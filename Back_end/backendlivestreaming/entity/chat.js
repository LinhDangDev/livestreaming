const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Chat = sequelize.define('Chat', {
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
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    sent_time: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    has_attachment: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'chats',
    timestamps: false
});

module.exports = Chat;
