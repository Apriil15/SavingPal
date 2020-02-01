const express = require('express');
const projectRoute = express.Router();
const projectController = require('../controllers/projectController');

// /api/projects/
projectRoute.post('/:user_id', projectController.addProject);
projectRoute.post('/together/:user_id', projectController.addProjectTogether); // 加進共同存
projectRoute.get('/:user_id', projectController.getProjects);
projectRoute.get('/code/:project_id', projectController.getInvitationCode); // 取得邀請碼
projectRoute.put('/:user_id', projectController.updateProject);
projectRoute.delete('/:user_id', projectController.deleteProject);

// callback hell test
projectRoute.get(
    '/callbackhell/:user_id',
    projectController.callbackHellVersion
);

module.exports = projectRoute;
