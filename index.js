const express = require('express');
const bodyParser = require('body-parser');
const router = require('./routes');

const app = express();

// DEV: true => 測試環境 / false => 正式環境
var config = require('./config');
config = config.DEV ? config.config : config.prodConfig;

// middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/api', router);

// 啟起來
const PORT = process.env.PORT || config.port;
app.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
});
