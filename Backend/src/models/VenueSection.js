const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const VenueSection = sequelize.define('VenueSection', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    layoutId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'VenueLayouts',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    visualData: {
        type: DataTypes.JSON, // Stores SVG path or coordinates
        allowNull: true
    }
});

module.exports = VenueSection;
