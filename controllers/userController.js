const connection = require('../utils/connection');

const getUsers = (req, res, next) => {
    let sql = 'SELECT user_id, user_email, user_name FROM user';
    connection.query(sql, (err, results) => {
        if (err) res.json({ "errorCode": 404, "data": err });
        res.json({ "errorCode": -1, "data": results });
    });
};

module.exports = {
    getUsers
}