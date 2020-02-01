const express = require('express');
const avatarRoute = express.Router();
const avatarController = require('../controllers/avatarController');

// /api/avatars
avatarRoute.post('/', avatarController.uploadAvatar);
avatarRoute.get('/users/:user_id', avatarController.getUserAvatar);
avatarRoute.get('/projects/:project_id', avatarController.getProjectAvatar);

module.exports = avatarRoute;