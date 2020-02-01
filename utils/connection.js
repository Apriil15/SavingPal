const mysql = require('mysql');
var config = require('../config');

config = (config.DEV) ? config.config : config.prodConfig;

const connection = mysql.createConnection({
    host: config.host,
    user: 'root',
    password: 'password',
    database: 'final_project'
});

connection.connect((err) => {
    if (err) {
        console.log('database connect fail');
        throw err;
    } else {
        console.log('database connect successful');
    }
});

module.exports = connection;