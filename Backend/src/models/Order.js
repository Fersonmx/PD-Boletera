const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
        defaultValue: 'pending'
    },
    paymentIntentId: {
        type: DataTypes.STRING, // Stripe Payment Intent
        allowNull: true
    },
    guestName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    guestEmail: {
        type: DataTypes.STRING,
        allowNull: true
    },
    discountAmount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    promoCodeUsed: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Order;
