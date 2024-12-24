const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attachment = sequelize.define('Attachment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    chat_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    file_url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    file_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    upload_time: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'attachments',
    timestamps: false
});

module.exports = Attachment;
