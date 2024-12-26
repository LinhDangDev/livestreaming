const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
    database: process.env.DB_NAME || 'streaming_db',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'cntt15723',
    host: process.env.DB_HOST || 'mysql_db',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false
});

module.exports = sequelize;
