const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',      // Teu utilizador do MySQL
    password: '',      // Tua password do MySQL
    database: 'gestor_de_escola',
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = pool.promise();