const express = require('express');
const userRoute = express.Router();
const userController = require('../controllers/userController');

userRoute.get('/', userController.getUsers); // /api/users/

module.exports = userRoute;