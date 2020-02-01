const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// router 所管理的路由
const testRoute = require('./testRoute');
const userRoute = require('./userRoute');
const loginRoute = require('./loginRoute');
const projectRoute = require('./projectRoute');
const avatarRoute = require('./avatarRoute');
const historyRoute = require('./historyRoute');

// middleware
router.use('/', testRoute); // /api
router.use('/login', loginRoute); // /api/login
router.use('/users', userRoute); // /api/users
router.use('/avatars', avatarRoute); // /api/avatars
// router.use(authController.verifyToken); // -------------------驗證 (測試時先 comment)
router.use('/projects', projectRoute); // /api/projects
router.use('/histories', historyRoute); // /api/histories

module.exports = router;
