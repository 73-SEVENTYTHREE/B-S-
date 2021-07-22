// 引入mysql
const mysql = require ('mysql');
// 引入mysql连接配置
const mysqlConfig = require ('../config/mysql');
// 引入连接池配置
const poolExtend = require ('./poolExtend');
//引入sql语句封装
const sqlStatement = require('./sql').user;
//随机数生成器
const generateRandom = require('../config/generateRandomNumber');
const email   = require("emailjs");
// 使用连接池，提升性能
const pool = mysql.createPool (poolExtend ({}, mysqlConfig));


const userData = {
    rand:generateRandom(6),
    login:(param, res) => {
        pool.getConnection ((err, connection) => {
            connection.query (sqlStatement.queryByUsername, param.username, (err, result) => {
                if (err || result.length === 0){
                    const result = {status:'failed'}
                    res.send(JSON.stringify(result))
                }
                else{
                    if (result[0].password === param.password){
                        const r = {status:'success', username:result[0].username, email:result[0].email}
                        res.send(JSON.stringify(r))
                    }
                    else{
                        const result = {status:'failed'}
                        res.send(JSON.stringify(result))
                    }
                }
            })
            connection.release();
        })
    },
    register:(param, res) => {
        pool.getConnection ((err, connection) => {
            let queryContent = ''
            let queryType = 0
            if (param.username !== undefined) {
                queryContent = param.username
                queryType = 1
            }
            else {
                queryContent = param.email
                queryType = 2
            }
            connection.query ((queryType === 1 ? sqlStatement.queryByUsername : sqlStatement.queryByEmail), queryContent, (err, result) => {
                if (err || result.length === 0){
                    if (param.username !== undefined && param.email !== undefined){
                        connection.query (sqlStatement.insertUser, [param.username, param.password, param.email], (err) => {
                            if (!err) res.send(JSON.stringify({status:'success'}))
                            else res.send(JSON.stringify({status:'failed'}))
                        })
                    }
                    else res.send(JSON.stringify({status:'noRepeated'}))
                }
                else res.send(JSON.stringify({status:'repeated'}))
            })
            connection.release();
        })
    },
    alterPwd : (param, res) => {
        const {newPassword, oldPassword, email} = param

        pool.getConnection ((err, connection) => {
            connection.query (sqlStatement.queryByEmail, email, (err, result) => {
                if (err || result.length === 0) res.send(JSON.stringify({status:'failed'}))
                else{
                    if (result[0].password === oldPassword){
                        connection.query(sqlStatement.updatePassword, [newPassword, email], err => {
                            if (err) res.send(JSON.stringify({status:'failed'}))
                            else res.send(JSON.stringify({status:'success'}))
                        })
                    }
                    else {
                        res.send(JSON.stringify({status:'failed'}))
                    }
                }
            })
            connection.release();
        })
    },
    getInfo: (param, res) => {
        const username = param.username;
        pool.getConnection ((err, connection) => {
            connection.query (sqlStatement.queryDevice, username, (err, result) => {
                if (err){
                    const r = {code:'failed'}
                    res.send(JSON.stringify(r))

                }
                else{
                    const r = {code:'success', deviceArray:result};
                    res.send(JSON.stringify(r));
                }
            })
            connection.release();
        })
    },
    sendSecurityCode: (param, res) => {
        const userEmail = param.email;
        const code = generateRandom(6);
        this.rand = code;
        const server = new email.SMTPClient ({
            user: "xxxxxxxxx",      // 你的QQ用户
            password: "xxxxxxxx",           // 注意，不是QQ密码，而是刚才生成的授权码
            host: "smtp.qq.com",         // 主机，不改
            ssl: true                   // 使用ssl
        });
        //开始发送邮件
        server.send({
            text:    `您的验证码为：${code}，60秒后过期。`,       //邮件内容
            from:    "xxxxxxx",        //谁发送的
            to:      userEmail,       //发送给谁的
            subject: "【浙联智慧平台】验证码"          //邮件主题
        }, function(err, message) {
            //回调函数
            console.log(err || message);
            if (err){
                res.send(JSON.stringify({status:'failed'}));
            }
            else{
                res.send(JSON.stringify({status:'success'}));
            }
        });
    },
    forgetPwd : (param, res) => {
        const {newPassword, securityCode, email} = param;
        if(securityCode !== this.rand) {
            res.send(JSON.stringify({status:'wrong'}));
            return;
        }
        this.rand = generateRandom(6);
        pool.getConnection ((err, connection) => {
            connection.query (sqlStatement.queryByEmail, email, (err, result) => {
                if (err) {
                    console.log(err);
                    res.send(JSON.stringify({status:'failed'}));
                }
                else if(result.length === 0){
                    res.send(JSON.stringify({status:'unRegister'}));
                }
                else{
                    connection.query(sqlStatement.updatePassword, [newPassword, email], err => {
                        if (err) {
                            console.log(err);
                            res.send(JSON.stringify({status:'failed'}))
                        }
                        else res.send(JSON.stringify({status:'success'}))
                    })
                }
            })
            connection.release();
        })
    }
};
module.exports = userData;