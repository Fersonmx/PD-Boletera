const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PromoCode = sequelize.define('PromoCode', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    discountType: {
        type: DataTypes.ENUM('percentage', 'fixed'),
        allowNull: false,
        defaultValue: 'fixed'
    },
    discountValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    usageLimit: {
        type: DataTypes.INTEGER,
        allowNull: true // Null means unlimited
    },
    usedCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    validFrom: {
        type: DataTypes.DATE,
        allowNull: true
    },
    validUntil: {
        type: DataTypes.DATE,
        allowNull: true
    },
    eventId: {
        type: DataTypes.INTEGER,
        allowNull: true // Optional: Link to a specific event if needed, or null for global/multi-event
    }
});

module.exports = PromoCode;
