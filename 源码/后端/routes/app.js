// 模块引入
const express = require ('express');
const app = express ();
const mosca = require ('mosca');
const ws = require ('nodejs-websocket');
const deviceModule = require('../modules/handleMqttMessage')
const device = require('../modules/handleDevice')

function initMqttServer (){
    //构建自带服务器
    const MqttServer = new mosca.Server ({
        port: 1883
    });

    let res = {
        send: str => str
    }

    let isConnect = false;

    let server = ws.createServer (function (socket) {
        //监听关闭
        socket.on("close", function (code, reason) {
            // isConnect = false;
            console.log("连接关闭")
        })
        socket.on("error", function (code, reason) {
            // isConnect = false;
            console.log("异常关闭")
        })
        socket.on("text", function (str) {
            if(isConnect) {
                console.log('重复连接')
            }
            else{
                //对服务器端口进行配置， 在此端口进行监听
                MqttServer.on('clientConnected', async function(client) {
                    let param = {deviceID:client.id};
                    //监听连接
                    console.log('client connected', client.id);
                    deviceModule.addData(JSON.stringify({alert:2, info:'设备上线', timestamp:new Date().getTime()}), client.id, 'onlineRecord');
                    device.setOnline(client.id);
                    await device.getDeviceInfo(param, res, 1);
                    setTimeout(() => {
                        if(param.deviceName !== undefined) socket.sendText(param.deviceName + '已上线' + client.id);
                    },1000)
                });
                MqttServer.on('clientDisconnected', async function(client){
                    let param = {deviceID:client.id};
                    console.log('client disconnected', client.id);
                    deviceModule.addData(JSON.stringify({alert:3, info:'设备下线', timestamp:new Date().getTime()}), client.id, 'offlineRecord');
                    device.setOffline(client.id);
                    await device.getDeviceInfo(param, res, 1);
                    setTimeout(() => {
                        if(param.deviceName !== undefined) socket.sendText(param.deviceName + '已离线' + client.id);
                    }, 1000);
                });
                isConnect = true;
                console.log('websocket已连接');
            }
        })
    }).listen (4000);

    MqttServer.on('published', function(packet, client) {
        //当客户端有连接发布主题消息
        const topic = packet.topic;
        const content = packet.payload.toString();

        // console.log(Buffer.from(packet.payload).toString());
        if(content[0] === '{'){
            deviceModule.addData(packet.payload.toString(), JSON.parse(packet.payload.toString()).clientId, topic);
        }

    });

    MqttServer.on('ready', function() {
        //当服务开启时
        console.log('mqtt服务器开启成功');
    });
}

// 路由划分
app.use('/login',require('./routers/user/login'))
app.use('/register',require('./routers/user/register'))
app.use('/getPersonalInfo',require('./routers/user/getPersonalInfo'))
app.use('/createDevice', require('./routers/device/createDevice'))
app.use('/getDeviceInfo', require('./routers/device/getDeviceInfo'))
app.use('/alterDeviceName', require('./routers/device/alterDeviceName'))
app.use('/deleteDevice', require('./routers/device/deleteDevice'))
app.use('/sendSecurityCode', require('./routers/user/sendSecurityCode'))
app.use('/forgetPwd', require('./routers/user/forgetPwd'))
app.use('/alterPwd', require('./routers/user/alterPwd'))

let server = app.listen(5000, (err) => {
    if (!err) console.log('express开启成功')
    initMqttServer();
})
server.setTimeout(0);


