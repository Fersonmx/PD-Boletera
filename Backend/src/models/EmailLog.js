const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const EmailLog = sequelize.define('EmailLog', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    toEmail: {
        type: DataTypes.STRING,
        allowNull: false
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('Registration', 'Order', 'PasswordRecovery', 'Test', 'Other'),
        allowNull: false,
        defaultValue: 'Other'
    },
    status: {
        type: DataTypes.ENUM('Sent', 'Failed'),
        allowNull: false
    },
    error: {
        type: DataTypes.TEXT,
        allowNull: true
    }
});

module.exports = EmailLog;
