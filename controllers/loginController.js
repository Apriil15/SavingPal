const connection = require('../utils/connection');
const authController = require('../controllers/authController');
const jwt = require('jsonwebtoken');

// 登入
const login = async (req, res, next) => {
    try {
        const userIdArr = await getAllUserId();
        const checkResult = await checkId(req, userIdArr);
        const result = await addUserInfo(req);
        res.json({ "errorCode": -1, "data": result });
    } catch (err) {
        res.json({ "errorCode": -1, "data": err });
    }
};

const getAllUserId = () => {
    return new Promise((resolve, reject) => {
        let userIdArr = [];
        let sql = 'SELECT user_id FROM user;';
        connection.query(sql, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            for (let i = 0; i < result.length; i++) {
                userIdArr.push(result[i].user_id);
            }
            resolve(userIdArr);
        });
    });
};

const checkId = (req, userIdArr) => {
    return new Promise(async (resolve, reject) => {
        const user_id = userIdArr.find(user_id => user_id === req.body.user_id);
        if (user_id) {
            try {
                var token = await authController.getToken(req);
                const result = await updateToken(user_id, token);
                console.log('result: ' + result);
            } catch (err) {
                console.log('checkId: ' + err);
            }
            reject({
                'msg1': 'user_id 之前已經存入 database',
                'msg2': 'Token has been updated',
                'token': token,
            });
            return;
        }
        resolve(!user_id);
    });

};

const updateToken = (user_id, token) => {
    return new Promise((resolve, reject) => {
        let sql = 'UPDATE user SET token = ? WHERE user_id = ?';
        let post = [token, user_id];
        connection.query(sql, post, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result);
        });
    });
};

const addUserInfo = (req) => {
    return new Promise(async (resolve, reject) => {
        let sql = 'INSERT INTO user SET ?';
        let post = {
            user_id: req.body.user_id,
            user_email: req.body.user_email,
            user_name: req.body.user_name,
            token: ""
        };
        const token = await authController.getToken(req);
        post.token = token;
        connection.query(sql, post, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            result = {
                user_id: req.body.user_id,
                user_email: req.body.user_email,
                user_name: req.body.user_name,
                token: token,
                "msg": "成功存進 database"
            };
            resolve(result);
        });
    });
};

module.exports = {
    login
};
