const express = require('express');
const historyRoute = express.Router();
const historyController = require('../controllers/historyController');

// /api/histories/:user_id
historyRoute.post('/:user_id', historyController.addHistory);
historyRoute.get('/:user_id/:project_id', historyController.getHistories);
historyRoute.put('/:user_id', historyController.updateHistory);

module.exports = historyRoute;