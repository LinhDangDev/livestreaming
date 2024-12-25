const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Participant = require('./Participant');
const Attachment = require('./attachments');

class Chat extends Model {}

Chat.init({
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
        allowNull: true
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
    sequelize,
    modelName: 'Chat',
    tableName: 'chats',
    timestamps: false
});

// Define associations
Chat.belongsTo(Participant, {
    foreignKey: 'participant_id',
    as: 'Sender'
});

Chat.hasOne(Attachment, {
    foreignKey: 'chat_id',
    as: 'Attachment'
});

module.exports = Chat;
