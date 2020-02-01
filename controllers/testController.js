const connection = require('../utils/connection');

const getName = (req, res, next) => { };
const register = (req, res, next) => { };
const addOrder = (req, res, next) => { };
const checkOrder = (req, res, next) => { };
const getOrdorDetail = (req, res, next) => { };

const test = (req, res, next) => {
    let sql = `update user set user_email = 'test@gmail.com' where user_id = 1`;
    connection.query(sql, (err, result) => {
        if (err) {
            res.send(err);
        }
        res.send('patch successfully');
    });
};

// const addProject = async (req, res, next) => {
//     try {
//         const avatarName = await avatarController.uploadServer(req, res);
//         const invitationCode = invitationCode.genInvitationCode();
//         await buildProject(req, avatarName, invitationCode);
//         const projectId = await findProjectId();
//         await buildUserProjectConnection(req, projectId);
//         res.json({
//             errorCode: -1,
//             data: {
//                 msg: 'add project successful',
//                 projectId: projectId,
//                 avatarName: avatarName,
//                 invitationCode: invitationCode
//             }
//         });
//     } catch (err) {
//         res.json({ errorCode: 404, data: err });
//     }
// };

// const callbackHellVersion = (req, res, next) => {
//     let projectId = -1;
//     let sql = 'INSERT INTO project SET ?';
//     let post = {
//         projectName: req.body.projectName,
//         projectTarget: req.body.projectTarget,
//         projectFreq: req.body.projectFreq,
//         projectStart: req.body.projectStart,
//         projectEnd: req.body.projectEnd,
//         projectCount: req.body.projectCount,
//         projectNumber: req.body.projectNumber
//     };
//     connection.query(sql, post, (err, result) => {
//         if (err) {
//             res.json({ errorCode: 404, buildProject: err });
//         } else {
//             sql = 'SELECT MAX(projectId) AS id FROM project';
//             connection.query(sql, (err, result) => {
//                 if (err) {
//                     res.json({ errorCode: 404, findProjectId: err });
//                 } else {
//                     projectId = result[0].id;
//                     sql = 'INSERT INTO user_project SET ?';
//                     post = {
//                         userId: req.params.userId,
//                         projectId: projectId,
//                         history_id: null
//                     };
//                     connection.query(sql, post, (err, result) => {
//                         if (err) {
//                             res.json({ errorCode: 404, buildUserProjectConnection: err });
//                         } else {
//                             res.json({
//                                 errorCode: -1,
//                                 buildUserProjectConnection: 'callback hell test successful'
//                             });
//                         }
//                     });
//                 }
//             });
//         }
//     });
// };

module.exports = {
    getName,
    register,
    addOrder,
    checkOrder,
    getOrdorDetail,
    test
}