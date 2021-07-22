const mysql = require ('mysql');
// 引入mysql连接配置
const mysqlConfig = require ('../config/mysql');
// 引入连接池配置
const poolExtend = require ('./poolExtend');
//引入sql语句封装
const sqlStatement = require('./sql').device;
const sqlMessage = require('./sql').message;
// 使用连接池，提升性能
const pool = mysql.createPool (poolExtend ({}, mysqlConfig));

const deviceData = {
    createDevice: (param, res) => {
        const deviceID = param.deviceID;
        const deviceName = param.deviceName;
        const ownerName = param.ownerName;
        pool.getConnection((err, connection) => {
            connection.query(sqlStatement.queryDevice, deviceID, (err, result) => {
                if(err){
                    res.send(JSON.stringify({status:"failed"}));
                }
                if(result.length === 0){
                    pool.getConnection ((err, connection) => {
                        connection.query (sqlStatement.createDevice, [deviceID, deviceName, ownerName], (err, result) => {
                            if (err){
                                res.send(JSON.stringify({status:'failed'}))
                            }
                            else{
                                res.send(JSON.stringify({status:'success'}));
                            }
                        })
                        connection.release();
                    })
                }
                else{
                    res.send(JSON.stringify({status: 'duplicated'}));
                }
            })
            connection.release();
        })

    },
    getDeviceInfo: async (param, res, mode) => {
        const deviceID = param.deviceID;
        await pool.getConnection (async (err, connection) => {
            await connection.query (sqlStatement.queryDevice, deviceID, (err, result1) => {
                if (err){
                    res.send(JSON.stringify({status:'failed'}))
                    if(mode === 1) param.deviceName = undefined;
                }
                if(result1.length === 0){
                    res.send(JSON.stringify({status:'notExist'}))
                    if(mode === 1) param.deviceName = undefined;
                }
                else{
                    if(mode === 1) {
                        param.deviceName = result1[0].deviceName;
                    }
                    let r = {
                        status:'success',
                        deviceInfo:result1[0]
                    }
                    pool.getConnection((err, connection) => {
                        connection.query(sqlMessage.queryMessageByDeviceID, deviceID, (err, result2) => {
                            if(err){
                                res.send(JSON.stringify({status:'failed'}))
                            }
                            else{
                                r.deviceMessage = result2;
                                res.send(JSON.stringify(r));
                            }
                        })
                        connection.release();
                    })
                }
            })
            connection.release();
        })

    },
    setOnline: deviceID => {
        pool.getConnection ((err, connection) => {
            connection.query (sqlStatement.setOnline, deviceID, (err, result) => {
                if (err || result.length === 0){
                    console.log(err);
                }
                else{
                    console.log(deviceID + '设备上线');
                }
            })
            connection.release();
        })
    },
    setOffline: deviceID => {
        pool.getConnection ((err, connection) => {
            connection.query (sqlStatement.setOffline, deviceID, (err, result) => {
                if (err || result.length === 0){
                    console.log(err);
                }
                else{
                    console.log(deviceID + '设备离线');
                }
            })
            connection.release();
        })
    },
    alterDeviceName: (param, res) => {
        const deviceID = param.deviceID;
        const deviceName = param.deviceName;
        pool.getConnection ((err, connection) => {
            connection.query (sqlStatement.alterDeviceName, [deviceName, deviceID], (err, result1) => {
                if (err){
                    res.send(JSON.stringify({status:'failed'}))
                }
                else{
                    res.send(JSON.stringify({status:'success', deviceName}))
                }
            })
            connection.release();
        })
    },
    deleteDevice: (param, res) => {
        const deviceID = param.deviceID;
        pool.getConnection ((err, connection) => {
            connection.query (sqlStatement.deleteDevice, deviceID, (err, result) => {
                if (err){
                    console.log(err);
                    res.send(JSON.stringify({status:'failed'}))
                }
                else{
                    res.send(JSON.stringify({status:'success'}))
                }
            })
            connection.release();
        })
    }
};
module.exports = deviceData;