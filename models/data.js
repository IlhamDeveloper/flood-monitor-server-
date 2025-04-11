const { Sequelize, DataTypes } = require('sequelize');

// Konfigurasi PostgreSQL
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  ssl: true,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

// Definisi model FloodData
const FloodData = sequelize.define('FloodData', {
  ketinggian: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = FloodData;