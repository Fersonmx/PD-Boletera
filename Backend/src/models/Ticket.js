const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Ticket = sequelize.define('Ticket', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING, // e.g., "VIP", "General Admission"
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    sectionId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Optional for general admission not linked to a section
        references: {
            model: 'VenueSections',
            key: 'id'
        }
    },
    tierId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'EventTiers',
            key: 'id'
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('paid', 'free', 'donation'),
        defaultValue: 'paid'
    },
    salesStart: {
        type: DataTypes.DATE,
        allowNull: true
    },
    salesEnd: {
        type: DataTypes.DATE,
        allowNull: true
    },
    visibility: {
        type: DataTypes.ENUM('public', 'hidden', 'locked'),
        defaultValue: 'public'
    },
    minPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true // Only relevant for donation type
    },
    maxLimit: {
        type: DataTypes.INTEGER,
        allowNull: true // Optional limit per user
    },
    available: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Ticket;
