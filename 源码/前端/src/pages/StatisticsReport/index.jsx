import React, {Component} from 'react';
import axios from "axios";
import cookie from "react-cookies";
import {message} from "antd";

class StaticsReport extends Component {

    state = {deviceArray:[], messages:{}}

    componentDidMount () {
        axios.post("/getPersonalInfo", {
            username:cookie.load('username')
        }).then(response => {
            const data =  response.data;
            if(data.code === "success"){
                let array = data.deviceArray.map((item, index) => {
                    return {
                        key: index + 1,
                        deviceName: item.deviceName,
                        deviceID: item.deviceID,
                        deviceStatus: item.isOnline
                    }
                });
                this.setState({deviceArray:array});
                array.forEach(item => {
                    const deviceID = item.deviceID;
                    axios.post('/getDeviceInfo', {
                        deviceID:deviceID
                    }).then(response => {
                        const data = response.data;
                        const message = data.deviceMessage;
                        if(data.status === 'failed'){
                            message.warning("获取设备信息失败")
                        }
                        else if(data.status === 'notExist'){
                            message.warning('设备不存在')
                        }
                        else{

                            const messageArray = message.map((item, index) => {
                                const obj = JSON.parse(item.content);
                                let infoItem = {
                                    key: item.messageID,
                                    messageID: item.messageID,
                                    messageType: obj.alert,
                                    messageContent: obj.info,
                                    lat:obj.lat,
                                    lng:obj.lng,
                                    timestamp:obj.timestamp,
                                    time:(new Date(parseInt(obj.timestamp))).toLocaleDateString() + ' '+ (new Date(parseInt(obj.timestamp))).toLocaleTimeString(),
                                    location: ""
                                }
                                axios.get(`https://restapi.amap.com/v3/geocode/regeo?" +
                                    "output=xml&location=${infoItem.lng},${infoItem.lat}&key=167046dfd610b3eea087876e05ee0181&radius=1000&extensions=base`)
                                    .then(response => {
                                        const data = response.data;
                                        infoItem.location = data.regeocode.formatted_address;
                                    });
                                return infoItem;
                            });
                            const messages = {...this.state.messages};
                            messages[deviceID] = messageArray;
                            this.setState({messages:messages});
                        }
                    })
                })
            }
            else{
                message.warning ("获取个人信息出错").then (r  => console.log(r));
            }
        })
    }

    render () {
        return (
            <div>

            </div>
        );
    }
}

export default StaticsReport;