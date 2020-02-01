const connection = require('../utils/connection');
const multer = require('multer');

var config = require('../config');
config = config.DEV ? config.config : config.prodConfig;

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'uploads/');
    },
    filename: (req, file, callback) => {
        callback(null, file.fieldname + '-' + Date.now() + '.jpg');
    }
});

// form-data => key: image
const upload = multer({ storage: storage }).single('image');

// 上傳圖片
const uploadAvatar = async (req, res, next) => {
    try {
        const avatarName = await uploadServer(req, res);
        const result = await updateAvatarName(req, avatarName);
        if (avatarName == 'null' || avatarName == null) {
            res.json({ errorCode: 404, data: 'upload fail' });
        }
        res.json({
            errorCode: -1,
            data: {
                avatar_name: avatarName,
                msg: 'upload successful'
            }
        });
    } catch (err) {
        res.json({ errorCode: 404, data: err });
    }
};

// 圖片上傳 server => 取得 fileName
const uploadServer = (req, res) => {
    return new Promise((resolve, reject) => {
        upload(req, res, err => {
            if (err) {
                reject(err);
                return;
            }
            if (!req.file) {
                console.log('沒有照片');
                resolve(null);
                return;
            }
            resolve(req.file.filename);
        });
    });
};

const updateAvatarName = (req, avatarName) => {
    return new Promise((resolve, reject) => {
        let sql = 'UPDATE project SET project_photo = ? WHERE project_id = ?';
        let post = [avatarName, req.body.project_id];
        // 寫進 database (依 body 是 project_id or user_id 區分)
        if (!req.body.project_id) {
            sql = 'UPDATE user SET user_photo = ? WHERE user_id = ?';
            post = [avatarName, req.body.user_id];
        }
        connection.query(sql, post, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result);
        });
    });
};

// 取得 project 大頭貼
const getProjectAvatar = (req, res, next) => {
    let project_id = req.params.project_id;
    let sql = `SELECT project_photo FROM project where project_id = ${project_id}`;
    connection.query(sql, (err, result) => {
        if (err) {
            res.json({ errorCode: 404, data: err });
        } else {
            let avatarName = result[0].project_photo;
            res.sendFile(config.photoRoute + avatarName);
        }
    });
};

// 取得 user 大頭貼
const getUserAvatar = (req, res, next) => {
    let user_id = req.params.user_id;
    let sql = `SELECT user_photo FROM user where user_id = ${user_id}`;
    connection.query(sql, (err, result) => {
        if (err) {
            res.json({ errorCode: 404, data: err });
        } else {
            let avatarName = result[0].user_photo;
            res.sendFile(config.photoRoute + avatarName);
            //res.send(avatarName);
        }
    });
};

module.exports = {
    uploadAvatar,
    getProjectAvatar,
    getUserAvatar,
    uploadServer
};
