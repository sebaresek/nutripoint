// models/Product.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Product', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    price: { type: DataTypes.FLOAT, allowNull: false },
    // AGREGAMOS ESTA LÍNEA:
    weight: { type: DataTypes.INTEGER, defaultValue: 1000 }, // Peso en gramos
    oldPrice: { type: DataTypes.FLOAT, defaultValue: 0 }, 
    stock: { type: DataTypes.INTEGER, defaultValue: 0 },
    image: { type: DataTypes.TEXT },
    active: { type: DataTypes.BOOLEAN, defaultValue: true }
  });
};