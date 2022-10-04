const { DataTypes } = require('sequelize');
const db = require('../config/db')


const model = db.define('Curso', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  sigla: {
    type: DataTypes.CHAR(5),
    unique: true,
    allowNull: false
  },
  descricao: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  duracao_meses: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 6
  },
  carga_horaria: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 80
  },
  valor_total: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false
  }
}, {
    tableName: 'cursos' // --
});

model.sync(); // Criar a tabela caso n exista 

module.exports = model;