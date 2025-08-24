const path = require('path');

// Configuración de la base de datos
const dbConfig = {
  client: 'sqlite3',
  useNullAsDefault: true
};

// Usar una base de datos en memoria para las pruebas
if (process.env.NODE_ENV === 'test') {
  dbConfig.connection = {
    filename: ':memory:'
  };
} else {
  dbConfig.connection = {
    filename: path.resolve(__dirname, '../../vitasport.sqlite')
  };
}

const knex = require('knex')(dbConfig);

module.exports = knex;