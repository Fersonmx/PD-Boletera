const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Page = sequelize.define('Page', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false
        // unique: true // Removed to allow multilang (unique per lang ideally)
    },
    language: {
        type: DataTypes.STRING(2),
        defaultValue: 'es',
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT, // HTML content
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    includeContactForm: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    formConfig: {
        type: DataTypes.JSON,
        defaultValue: [] // Array of { label, type, name, required, placeholder }
    },
    notifyEmail: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Page;
