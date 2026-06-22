const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Form = sequelize.define('Form', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Form title is required' },
    },
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  fields: {
    type: DataTypes.JSON, // MySQL JSON format holds dynamic fields arrays
    allowNull: false,
    defaultValue: [],
  },
}, {
  timestamps: true,
});

// Define foreign key relationships
Form.belongsTo(User, { foreignKey: 'createdBy', onDelete: 'CASCADE' });
User.hasMany(Form, { foreignKey: 'createdBy' });

module.exports = Form;
