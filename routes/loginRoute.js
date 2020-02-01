const express = require('express');
const loginRoute = express.Router();
const loginController = require('../controllers/loginController');

loginRoute.post('/', loginController.login);

module.exports = loginRoute;
