const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const VenueLayout = sequelize.define('VenueLayout', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    venueId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Venues',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false // e.g. "Concert", "Basketball"
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true // Background map image
    }
});

module.exports = VenueLayout;
