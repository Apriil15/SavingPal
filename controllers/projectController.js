const connection = require('../utils/connection');
const avatarController = require('./avatarController');
const historyController = require('./historyController');
const invitationCode = require('../utils/invitationCode');

// 新增 project
const addProject = async (req, res, next) => {
    try {
        const avatarName = await avatarController.uploadServer(req, res); // 上傳 server => 取得 avatarName
        const invitation_code = invitationCode.genInvitationCode();
        const result1 = await buildProject(req, avatarName, invitation_code);
        const project_id = await findProjectId();
        const result2 = await buildUserProjectConnection(req, project_id);
        res.json({
            errorCode: -1,
            data: {
                msg: 'add project successful',
                project_id: project_id,
                avatar_name: avatarName,
                invitation_code: invitation_code
            }
        });
    } catch (err) {
        res.json({ errorCode: 404, data: err });
    }
};

const buildProject = (req, avatarName, invitation_code) => {
    return new Promise((resolve, reject) => {
        let sql = 'INSERT INTO project SET ?';
        let post = {
            project_name: req.body.project_name,
            project_target: req.body.project_target,
            project_freq: req.body.project_freq,
            project_start: req.body.project_start,
            project_end: req.body.project_end,
            project_count: req.body.project_count,
            project_number: req.body.project_number,
            project_photo: avatarName,
            invitation_code: invitation_code
        };
        // if (req.body.project_number == 1) {
        //     post.is_begin = 'true';
        // }
        connection.query(sql, post, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result);
        });
    });
};

const findProjectId = () => {
    return new Promise((resolve, reject) => {
        sql = 'SELECT MAX(project_id) AS id FROM project';
        connection.query(sql, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            let project_id = result[0].id;
            resolve(project_id);
        });
    });
};

const buildUserProjectConnection = (req, project_id) => {
    return new Promise((resolve, reject) => {
        let sql = 'INSERT INTO user_project SET ?';
        let post2 = {
            user_id: req.params.user_id,
            project_id: project_id,
            history_id: null
        };
        connection.query(sql, post2, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result);
        });
    });
};

// 新增 project (共同存)
const addProjectTogether = async (req, res, next) => {
    try {
        const project_id = await getProjectId(req, res);
        let result = await checkAdd(req, res, project_id);
        result = await addIntoProject(req, project_id);
        res.json({
            errorCode: -1,
            data: 'add project together successful'
        });
    } catch (err) {
        res.json({ errorCode: 404, data: err });
    }
};

// invitation_code => project_id
const getProjectId = (req, res) => {
    return new Promise((resolve, reject) => {
        let sql = 'select project_id from project where invitation_code = ?';
        let post = req.body.invitation_code;
        connection.query(sql, post, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            if (!result[0]) {
                result = res.json({
                    errorCode: 404,
                    data: 'invitation_code error'
                });
                resolve(result);
                return;
            }
            resolve(result[0].project_id);
        });
    });
};

// 確認是否已經加過了
const checkAdd = (req, res, project_id) => {
    return new Promise((resolve, reject) => {
        let sql = `select * 
                   from user_project 
                   where user_id = ${req.params.user_id} and project_id = ${project_id}`;
        connection.query(sql, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            if (result[0]) {
                result = res.json({
                    errorCode: 404,
                    data: 'you had joined, dude'
                });
                resolve(result);
                return;
            }
            resolve(result);
        });
    });
};

const addIntoProject = (req, project_id) => {
    return new Promise((resolve, reject) => {
        let sql = 'INSERT INTO user_project SET ?';
        let post = {
            user_id: req.params.user_id,
            project_id: project_id,
            admin_level: 0,
            history_id: null
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

// 取得所有 projects
const getProjects = async (req, res, next) => {
    try {
        const result = await getStatusAndAdminLevel(req); // 取得 status, admin_level => 塞在 info => res
        const info = await getInfo(req);
        for (let i = 0; i < info.length; i++) {
            let checkTimeResult = await checkTime(info[i].project_id, info[i].project_start);
            if (checkTimeResult === 'true') {
                info[i].is_begin = 'true';
            }
            let userIdHistoryId = await getUserIdHistoryId(info[i].project_id);
            let teammate = [];
            for (let j = 0; j < userIdHistoryId.length; j++) {
                let user_id = userIdHistoryId[j].user_id;
                let user_name = await getUserNameFromUserId(user_id); // 用上面找到的 user_id => 去找 user_name
                let current_total_money = await historyController.getTotalMoney(userIdHistoryId[j].history_id);
                teammate.push({ user_id, user_name, current_total_money });
            }
            info[i].status = result[i].status;
            info[i].admin_level = result[i].admin_level;
            info[i].teammate = teammate;
        }
        res.json({ errorCode: -1, data: info });
    } catch (err) {
        res.json({ errorCode: 404, data: err });
    }
};

const checkTime = (project_id, project_start) => {
    return new Promise((resolve, reject) => {
        let projectTime = project_start.split('/');
        let year = new Date().getFullYear();
        let month = new Date().getMonth() + 1;
        let actualDay = new Date().getDate();
        if (year > projectTime[0]) {
            let sql = `update project set is_begin = 'true' where project_id = ${project_id}`;
            connection.query(sql, (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                result = 'true';
                resolve(result);
            });
        } else if (month > projectTime[1]) {
            let sql = `update project set is_begin = 'true' where project_id = ${project_id}`;
            connection.query(sql, (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                result = 'true';
                resolve(result);
            });
        } else if (actualDay >= projectTime[2]) {
            let sql = `update project set is_begin = 'true' where project_id = ${project_id}`;
            connection.query(sql, (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }
                result = 'true';
                resolve(result);
            });
        } else {
            resolve('false');
        }
    });
};

// 取得邀請碼
const getInvitationCode = (req, res) => {
    let sql = `select invitation_code from project where project_id = ${req.params.project_id}`;
    connection.query(sql, (err, result) => {
        if (err) {
            res.json({ errorCode: 404, data: err });
        }
        res.json({ errorCode: -1, data: { invitation_code: result[0].invitation_code } });
    });
};

const getUserNameFromUserId = user_id => {
    return new Promise((resolve, reject) => {
        let sql = `select user_name from user where user_id = ${user_id}`;
        connection.query(sql, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result[0].user_name);
        });
    });
};

const getUserIdHistoryId = project_id => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT user_id, history_id FROM user_project where project_id = ${project_id}`;
        connection.query(sql, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result);
        });
    });
};

const getInfo = req => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * 
                   FROM project 
                   WHERE project_id in (
                                        SELECT project_id 
                                        FROM user_project 
                                        WHERE user_project.user_id = ${req.params.user_id})`;
        connection.query(sql, (err, info) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(info);
        });
    });
};

const getStatusAndAdminLevel = req => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT status, admin_level FROM user_project where user_id = ${req.params.user_id}`;
        connection.query(sql, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result);
        });
    });
};

// 編輯 project (共存計畫開始前編輯)
const updateProject = async (req, res, next) => {
    try {
        const admin_level = await getAdminLevel(req);
        if (admin_level == 1) {
            const actual_number = await getActualNumber(req);
            const project_target = await getProjectTarget(req);
            const shared_money = Math.ceil(project_target / actual_number);
            const actual_target = shared_money * actual_number;
            let result = await updateProjectInfo(req, actual_number, actual_target);
            result.shared_money = shared_money;
            result.actual_target = actual_target;
            res.json({ errorCode: -1, data: result });
        } else {
            res.json({
                errorCode: 404,
                data: { msg: 'you are not administrator LUL' }
            });
        }
    } catch (err) {
        res.json({ errorCode: 404, data: err });
    }
};

const getProjectTarget = (req) => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT project_target FROM project where project_id = ${req.body.project_id}`;
        connection.query(sql, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result[0].project_target);
        });
    });
};

const getAdminLevel = req => {
    return new Promise((resolve, reject) => {
        let sql = `select admin_level 
                   from user_project 
                   where user_id = ${req.params.user_id} and project_id = ${req.body.project_id}`;
        connection.query(sql, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result[0].admin_level);
        });
    });
};

const getActualNumber = req => {
    return new Promise((resolve, reject) => {
        let sql = `SELECT COUNT(user_id) AS actual_number 
                   FROM user_project 
                   where project_id = ${req.body.project_id}`;
        connection.query(sql, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result[0].actual_number);
        });
    });
};

const updateProjectInfo = (req, actual_number, actual_target) => {
    return new Promise((resolve, reject) => {
        let sql = `update project 
                   set project_number = ${actual_number}, is_begin = 'true', project_target = ${actual_target}
                   where project_id = ${req.body.project_id}`;
        connection.query(sql, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            result = {
                msg: 'project is going to begin~',
                actual_number: actual_number,
                is_begin: 'true'
            };
            resolve(result);
        });
    });
};

// 刪除 project => 一併刪除存錢歷程
// TODO: 其實還沒寫好，共同存還沒辦法管理員刪除 project => 相關人員歷程全部刪除
// 要做些限制~~
const deleteProject = async (req, res, next) => {
    try {
        const result = await deleteHistory(req);
        const result2 = await deleteProjectId(req);
        res.json({ errorCode: -1, data: 'delete successful' });
    } catch (err) {
        res.json({ errorCode: 404, data: err });
    }
};

const deleteHistory = req => {
    return new Promise((resolve, reject) => {
        let sql = `delete from history 
                   where history_id = (
                                        select history_id 
                                        from user_project 
                                        where user_id = ${req.params.user_id} 
                                        and project_id = ${req.body.project_id})`;
        connection.query(sql, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result);
        });
    });
};

const deleteProjectId = req => {
    return new Promise((resolve, reject) => {
        let sql = `DELETE FROM project WHERE project_id = ${req.body.project_id}`;
        connection.query(sql, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result);
        });
    });
};

// 新增 project => callback hell version
const callbackHellVersion = (req, res, next) => {
    let project_id = -1;
    // buildProject
    let sql = 'INSERT INTO project SET ?';
    let post = {
        project_name: req.body.project_name,
        project_target: req.body.project_target,
        project_freq: req.body.project_freq,
        project_start: req.body.project_start,
        project_end: req.body.project_end,
        project_count: req.body.project_count,
        project_number: req.body.project_number
    };
    connection.query(sql, post, (err, result) => {
        if (err) {
            res.json({ errorCode: 404, buildProject: err });
        } else {
            // findProjectId
            sql = 'SELECT MAX(project_id) AS id FROM project';
            connection.query(sql, (err, result) => {
                if (err) {
                    res.json({ errorCode: 404, findProjectId: err });
                } else {
                    project_id = result[0].id;
                    // buildUserProjectConnection
                    sql = 'INSERT INTO user_project SET ?';
                    post = {
                        user_id: req.params.user_id,
                        project_id: project_id,
                        history_id: null
                    };
                    connection.query(sql, post, (err, result) => {
                        if (err) {
                            res.json({
                                errorCode: 404,
                                buildUserProjectConnection: err
                            });
                        } else {
                            res.json({
                                errorCode: -1,
                                buildUserProjectConnection:
                                    'callback hell test successful'
                            });
                        }
                    });
                }
            });
        }
    });
};

module.exports = {
    addProject,
    addProjectTogether,
    getProjects,
    updateProject,
    deleteProject,
    getInvitationCode,
    callbackHellVersion // 測試用
};
