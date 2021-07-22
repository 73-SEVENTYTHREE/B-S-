// 引入mysql
const mysql = require ('mysql');
// 引入mysql连接配置
const mysqlConfig = require ('../config/mysql');
// 引入连接池配置
const poolExtend = require ('./poolExtend');
//引入sql语句封装
const sqlStatement = require('./sql').device;
// 使用连接池，提升性能
const pool = mysql.createPool (poolExtend ({}, mysqlConfig));

const mqttData = {
    addData: (content, deviceID, topic) => {
        pool.getConnection((err, connection) => {
            connection.query(sqlStatement.queryDevice, deviceID, (err, result1) => {
                if(result1.length === 0 || err){
                    console.log(err);
                }
                else{
                    pool.getConnection ((err, connection) => {
                        connection.query (sqlStatement.insertMessage, [content, deviceID, topic], (err, result) => {
                            if (err){
                                console.log(err);
                            }
                            else{
                                console.log("添加消息成功");
                            }
                        })
                        connection.release();
                    })
                }
            })
            connection.release();
        })

    }
}

module.exports = mqttData;