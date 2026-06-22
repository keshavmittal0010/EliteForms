const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Form = require('./Form');

const Response = sequelize.define('Response', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  answers: {
    type: DataTypes.JSON, // Stores key-value pairings of field ID to answers
    allowNull: false,
    defaultValue: {},
  },
}, {
  timestamps: true,
  updatedAt: false, // We only need createdAt (which represents submittedAt)
});

// Define relationships
Response.belongsTo(Form, { foreignKey: 'formId', onDelete: 'CASCADE' });
Form.hasMany(Response, { foreignKey: 'formId' });

module.exports = Response;
