const express = require('express');
const testRoute = express.Router();
const testController = require('../controllers/testController');

// /api/
testRoute.get('/', (req, res, next) => {
    res.send('testRoute');
});

// /api/test
testRoute.patch('/test/', testController.test);

testRoute.get('/main/getName', testController.getName);
testRoute.get('/user/register', testController.register);
testRoute.get('/order/add', testController.addOrder);
testRoute.get('/order/check', testController.checkOrder);
testRoute.get('/order/get', testController.getOrdorDetail);

module.exports = testRoute;