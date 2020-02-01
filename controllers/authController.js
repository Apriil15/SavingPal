const jwt = require('jsonwebtoken');

const getToken = req => {
    return new Promise((resolve, reject) => {
        let post = {
            user_id: req.body.user_id,
            user_email: req.body.user_email,
            user_name: req.body.user_name
        };
        jwt.sign({ post }, 'secretKey', { expiresIn: '1d' }, (err, token) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(token);
        });
    });
};

const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization']; // Get auth header value
    if (typeof bearerHeader == 'undefined') {
        // 沒 token
        res.status(403).json({
            errorCode: 403,
            data: 'No token provided'
        });
    } else {
        // 有 token
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        jwt.verify(req.token, 'secretKey', (err, authData) => {
            if (err) {
                res.status(403).json({
                    errorCode: 403,
                    data: 'Failed to authenticate token'
                });
            } else {
                // console.log('Authenticated');
                // console.log(authData);
                //res.json({ msg: 'User Authenticated', authData });
                next();
            }
        });
    }
};

module.exports = {
    getToken,
    verifyToken
};
