// 測試
const config = {
    host: 'localhost',
    port: 3000,
    photoRoute: '/Users/Nano/Desktop/final_project/uploads/'
};

// 正式
const prodConfig = {
    host: '35.185.169.97', // database IP
    port: 3000,
    photoRoute: '/home/nlwkobe30/server/uploads/'
};

//  DEV true => 測試 / false => 正式
module.exports = {
    DEV: true,
    config,
    prodConfig
};
