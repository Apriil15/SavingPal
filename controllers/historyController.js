const connection = require('../utils/connection');

// 新增存錢歷程
const addHistory = async (req, res, next) => {
    let history_id = -1;
    try {
        history_id = await findHistoryId(req);
        if (history_id == null) {
            // 還沒有 history_id
            history_id = await buildHistoryId();
            const history_count = await getMaxHistoryCount(history_id);
            console.log('新增一筆前最大 history_count: ' + history_count);
            const result3 = await saveMoney(req, history_id, history_count);
            const totalMoney = await getTotalMoney(history_id);
            const personTarget = await getPersonTarget(req);
            if (totalMoney >= personTarget) {
                const result = await updateStatus(req);
            }
            const result4 = await userProjectConnectHistory(req, history_id);
            res.json({
                errorCode: -1,
                data: {
                    msg: '首次儲值成功OuO/',
                    history_date: req.body.history_date,
                    money: req.body.money
                }
            });
        } else {
            // 已經有 history_id
            const history_count = await getMaxHistoryCount(history_id);
            console.log('新增一筆前最大 history_count: ' + history_count);
            const result5 = await saveMoney(req, history_id, history_count);
            const totalMoney = await getTotalMoney(history_id);
            const personTarget = await getPersonTarget(req);
            if (totalMoney >= personTarget) {
                const result = await updateStatus(req);
            }
            res.json({
                errorCode: -1,
                data: {
                    msg: 'add history successful',
                    history_date: req.body.history_date,
                    money: req.body.money
                }
            });
        }
    } catch (err) {
        console.log(err);
        res.json({ errorCode: 404, data: err });
    }
};

// 確認有沒有 history_id
const findHistoryId = req => {
    return new Promise((resolve, reject) => {
        let sql =
            'SELECT history_id FROM user_project WHERE user_id = ? AND project_id = ?';
        let post = [req.params.user_id, req.body.project_id];
        connection.query(sql, post, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result[0].history_id);
        });
    });
};

// 尚未存過錢 => 沒有 history_id => 給一個 history_id
const buildHistoryId = () => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT MAX(history_id) + ${1} AS history_id FROM history`;
        connection.query(sql, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result[0].history_id);
        });
    });
};

const getMaxHistoryCount = history_id => {
    return new Promise((resolve, reject) => {
        let sql = `select max(history_count) as history_count from history where history_id = ${history_id}`;
        connection.query(sql, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result[0].history_count);
        });
    });
};

const saveMoney = (req, history_id, history_count) => {
    return new Promise((resolve, reject) => {
        if (history_count == null) {
            history_count = 1;
        } else {
            history_count++;
        }
        console.log('saveMoney後來的history_count: ' + history_count);
        let sql = 'INSERT INTO history SET ?';
        let post = {
            history_id: history_id,
            history_count: history_count,
            history_date: req.body.history_date,
            money: req.body.money
        };
        connection.query(sql, post, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result);
        });
    });
};

const getTotalMoney = history_id => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT SUM(money) AS total_money FROM history WHERE history_id = ${history_id}`;
        connection.query(sql, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            if (result[0].total_money == null) {
                result[0].total_money = 0;
            }
            resolve(result[0].total_money);
        });
    });
};

const getPersonTarget = req => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT project_target, project_number FROM project where project_id = ${req.body.project_id}`;
        connection.query(sql, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result[0].project_target / result[0].project_number);
        });
    });
};

const userProjectConnectHistory = (req, history_id) => {
    return new Promise((resolve, reject) => {
        let sql = `update user_project 
                   set history_id = ${history_id}
                   where user_id = ${req.params.user_id} 
                   AND project_id = ${req.body.project_id}`;
        connection.query(sql, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result);
        });
    });
};

// 完成 => 改變 status
const updateStatus = req => {
    return new Promise((resolve, reject) => {
        let sql =
            'UPDATE user_project SET status = 0 WHERE user_id = ? AND project_id = ?';
        let post = [req.params.user_id, req.body.project_id];
        connection.query(sql, post, (err, result) => {
            if (err) {
                console.log('err: ' + err);
                reject(err);
                return;
            }
            console.log('finish target => updateStatus to 0');
            resolve(result);
        });
    });
};

// 獲取存錢歷程
const getHistories = (req, res, next) => {
    let sql = `SELECT history_date, money 
               FROM history 
               WHERE history_id in(
                                   SELECT user_project.history_id 
                                   FROM user_project 
                                   WHERE user_project.user_id = ${req.params.user_id}
                                   AND user_project.project_id = ${req.params.project_id})`;
    connection.query(sql, (err, result) => {
        if (err) {
            res.json({ errorCode: 404, data: err });
        } else {
            let currentTotalMoney = 0; // 計算目前共存多少錢
            for (let i = 0; i < result.length; i++) {
                currentTotalMoney += result[i].money;
            }
            res.json({
                errorCode: -1,
                data: {
                    history: result,
                    current_total_money: currentTotalMoney
                }
            });
        }
    });
};

// 編輯存錢歷程 (最後一個單位時間)
const updateHistory = async (req, res, next) => {
    try {
        const history_id = await findHistoryId(req);
        const history_count = await getMaxHistoryCount(history_id);
        const result = await editMoney(req, history_id, history_count);
        const totalMoney = await getTotalMoney(history_id);
        const personTarget = await getPersonTarget(req);
        if (totalMoney >= personTarget) {
            const result2 = await updateStatus(req);
        }
        res.json({
            errorCode: -1,
            data: {
                msg: 'edit ok',
                edit_history_date: req.body.history_date,
                edit_money: req.body.money
            }
        });
    } catch (err) {
        res.json({ errorCode: 404, data: err });
    }
};

const editMoney = (req, histiry_id, history_count) => {
    return new Promise((resolve, reject) => {
        let sql = `update history 
                   set history_date = ?, money = ? 
                   where history_id = ${histiry_id} and history_count = ${history_count}`;
        let post = [req.body.history_date, req.body.money];
        connection.query(sql, post, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result);
        });
    });
};

module.exports = {
    addHistory,
    getHistories,
    updateHistory,
    getTotalMoney
};
