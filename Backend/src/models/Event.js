const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Event = sequelize.define('Event', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    layoutId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Can be null if event doesn't use a specific map
        references: {
            model: 'VenueLayouts',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('draft', 'published', 'cancelled', 'completed'),
        defaultValue: 'draft'
    },
    currency: {
        type: DataTypes.STRING(3),
        defaultValue: 'USD',
        allowNull: false
    },
    // Dynamic QR Settings
    isDynamicQr: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    dynamicQrWindow: {
        type: DataTypes.INTEGER, // Minutes before event to enable QR
        defaultValue: 120
    }
});

module.exports = Event;
