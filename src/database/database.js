const path = require('path');
const fs = require('fs');

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
  const sqlitePath = process.env.SQLITE_FILENAME || path.resolve(__dirname, '../../vitasport.sqlite');
  // Asegurar que el directorio existe (necesario en Render para /opt/render/project/data)
  try {
    const dir = path.dirname(sqlitePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (_) {
    // si falla, SQLite intentará igualmente; log no necesario aquí
  }
  dbConfig.connection = {
    filename: sqlitePath
  };
}

const knex = require('knex')(dbConfig);

module.exports = knex;