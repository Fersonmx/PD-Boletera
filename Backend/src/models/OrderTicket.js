const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const OrderTicket = sequelize.define('OrderTicket', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    uniqueCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    isUsed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    scannedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    qrSecret: {
        type: DataTypes.STRING, // Secret key for generating TOTP/HMAC codes
        allowNull: true
    }
});

module.exports = OrderTicket;
