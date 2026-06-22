const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'form_builder',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'mysql',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false, // Turn off query logs for clean outputs
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const connectDB = async () => {
  try {
    // 1. Pre-connection check: Create database if it doesn't exist yet
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'mysql',
    });
    
    const dbName = process.env.DB_NAME || 'form_builder';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.end();

    // 2. Authenticate Sequelize connection pool
    await sequelize.authenticate();
    console.log(`MySQL connected successfully to database: "${dbName}"`);
    
    // 3. Synchronize tables
    await sequelize.sync({ alter: true });
    console.log('MySQL schemas synchronized successfully.');

    // 4. Seed Demo User (Requires dynamic import to prevent circular dependency)
    const User = require('../models/User');
    const demoUser = await User.findOne({ where: { email: 'demo@eliteforms.com' } });
    if (!demoUser) {
      await User.create({
        name: 'Demo Account',
        email: 'demo@eliteforms.com',
        password: 'password123', // User model hooks automatically hash this
      });
      console.log('Demo user seeded: demo@eliteforms.com / password123');
    }
  } catch (error) {
    console.error(`Database connection failure: ${error.message}`);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  connectDB,
};
