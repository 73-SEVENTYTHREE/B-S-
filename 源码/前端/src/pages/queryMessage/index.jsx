import React, {Component} from 'react';
import {message, Timeline, Select, Table, Empty} from 'antd';
import './index.css'
import axios from "axios";
import cookie from 'react-cookies';
import { DatePicker, Space, Spin } from 'antd';
import {CheckCircleOutlined, StopOutlined} from "@ant-design/icons";
import { Card } from 'antd';
import OnlineChart from "../../components/OnlineChart";
import CityChart from "../../components/CityChart";
const { RangePicker } = DatePicker;
const { Option } = Select;

class queryMessages extends Component {

    state = {deviceArray:[], messages:{}, targetDevice:'', startTime:'', endTime:'', isFirst:true, onlineTimeInterval:{},
            onlineTimePoint:{}, cities:{}, isLoading:true, isEmpty:true}

    handleDeviceChange = value => {
        console.log(`selected ${value}`);
        this.setState({targetDevice:value, isFirst: false});
    }

    onChange = (value, dateString) => {
        console.log('Selected Time: ', value);
        console.log('Formatted Selected Time: ', dateString);
        console.log(new Date(dateString[0]).getTime())
        if(dateString[0] !== undefined){
            this.setState({startTime:new Date(dateString[0]).getTime(), isFirst: false});
        }
        if(dateString[1] !== undefined){
            this.setState({endTime:new Date(dateString[1]).getTime(), isFirst: false});
        }
        const {messages, targetDevice} = this.state;
        if(dateString[0] !== undefined && dateString[1] !== undefined){
            const data = messages[targetDevice];
            let flag = 0;
            data.forEach(item => {
                if (item.timestamp >= dateString[0] && item.timestamp <= dateString[1]){
                    flag = 1;
                }
            })
            if(flag) this.setState({isEmpty: false}, () => {console.log(this.state.isEmpty)});
        }
    }

    onOk = (value) => {
        console.log('onOk: ', value);
        const {messages, targetDevice} = this.state;
        let flag = 0;
        if(value[0] !== undefined && value[1] !== undefined){
            const data = messages[targetDevice];
            data.forEach(item => {
                if (item.timestamp >= value[0] && item.timestamp <= value[1]){
                    flag = 1;
                }
            })
        }
        if(flag) this.setState({isEmpty: false}, () => {console.log(this.state.isEmpty)});
    }

    async componentDidMount () {
        const {data} = await axios.post("/getPersonalInfo", {
            username:cookie.load('username')
        });
        if(data.code === "success"){
            let array = data.deviceArray.map((item, index) => {
                return {
                    key: index + 1,
                    deviceName: item.deviceName,
                    deviceID: item.deviceID,
                    deviceStatus: item.isOnline
                }
            });
            this.setState({deviceArray:array, targetDevice:array.length > 0 ? array[0].deviceID:''});
            let length = array.length;
            let messages = {};
            let timeInterval = {};
            let point = {};
            let city = {};

            for(let i = 0;i < length; i++){
                let onlineTime = [];
                let onlineTimePoint = [];
                let start = 0;
                let online = '';
                let cities = {};
                let messageArray = [];
                const deviceID = array[i].deviceID;
                let data1 = (await axios.post ('/getDeviceInfo', {
                    deviceID: deviceID
                })).data;
                const message = data1.deviceMessage;
                if(data1.status === 'failed'){
                    message.warning("获取设备信息失败")
                }
                else if(data1.status === 'notExist'){
                    message.warning('设备不存在')
                }
                else{
                    for(let j = 0, len2 = message.length; j < len2; j++){
                        const obj = JSON.parse(message[j].content);
                        if(obj.alert === 2){
                            start = obj.timestamp;
                            online = new Date(parseInt(start)).toLocaleDateString();
                        }
                        if(obj.alert === 3){
                            if(start !== 0){
                                onlineTime = [...onlineTime, ((obj.timestamp - start) / (1000 * 60)).toFixed(2)];
                                onlineTimePoint = [...onlineTimePoint, online];
                            }
                        }
                        let infoItem = {
                            key: message[j].messageID,
                            messageID: message[j].messageID,
                            messageType: obj.alert,
                            messageContent: obj.info,
                            lat:obj.lat,
                            lng:obj.lng,
                            timestamp:obj.timestamp,
                            time:(new Date(parseInt(obj.timestamp))).toLocaleDateString() + ' '+ (new Date(parseInt(obj.timestamp))).toLocaleTimeString(),
                            location: ""
                        }
                        if(obj.lat !== undefined && obj.lng !== undefined) {
                            let data2 = (await axios.get (`https://restapi.amap.com/v3/geocode/regeo?" +
                                    "output=xml&location=${infoItem.lng},${infoItem.lat}&key=167046dfd610b3eea087876e05ee0181&radius=1000&extensions=base`)).data;
                            // console.log(data2);
                            infoItem.location = data2.regeocode.addressComponent.city;
                            if(cities[infoItem.location] === undefined && infoItem.location !== ""){
                                cities[infoItem.location] = {value:0, name:infoItem.location};
                            }
                            else if(cities[infoItem.location] !== undefined){
                                cities[infoItem.location].value++;
                            }
                        }
                        messageArray = [...messageArray, infoItem];
                    }
                    messages[deviceID] = messageArray;
                    timeInterval[deviceID] = onlineTime;
                    point[deviceID] = onlineTimePoint;
                    city[deviceID] = Object.values(cities);
                }
            }
            this.setState({messages:messages, onlineTimeInterval:timeInterval,onlineTimePoint:point, cities:city, isLoading:false});
        }
        else{
            message.warning ("获取个人信息出错").then (r  => console.log(r));
        }
    }

    getTypeColor = number => {
        if(number === 0 || number === 2) return 'green';
        if(number === 1 || number === 3) return 'red';

    }
    getTypeAvatar = number => {
        if(number === 2) return <CheckCircleOutlined style={{ fontSize: '18px' }}/>;
        if(number === 3) return <StopOutlined style={{ fontSize: '18px' }}/>;
    }

    render () {
        const {deviceArray, messages, targetDevice, startTime, endTime, isFirst} = this.state;
        return (
            this.state.deviceArray.length === 0 ? <Table columns={[
                    {
                        title: '您还未绑定设备'
                    }
                ]} dataSource={[]} /> :
                <div id={"queryShow"}>
            <div id="chooseDevice">
                <div>
                    <Card title="选择设备" bordered={false} style={{ width: 300 }}>
                        <Select defaultValue={deviceArray[0].deviceName} style={{ width: 150 }} onChange={this.handleDeviceChange}>
                            {
                                deviceArray.map((item => <Option value={item.deviceID}>{item.deviceName}</Option>))
                            }
                        </Select>
                    </Card>
                </div>
                <div>
                    <Card title="选择时间范围" bordered={false} style={{ width: 600 }}>
                        <Space direction="vertical" size={12}>
                            <RangePicker
                                showTime={{ format: 'HH:mm' }}
                                format="YYYY-MM-DD HH:mm"
                                onChange={this.onChange}
                                onOk={this.onOk}
                            />
                        </Space>
                    </Card>
                </div>
            </div>
            <div style={{height:'500px', display:'flex', justifyContent:'space-between'}}>
                <Card title="时长统计图" bordered={false} style={{ width: '47%' }}>
                    {this.state.isLoading ? <Spin size="large" /> : ''}
                    <OnlineChart data={this.state.onlineTimeInterval[targetDevice]} onlineTimePoint={this.state.onlineTimePoint[targetDevice]}/>
                </Card>
                <Card title="消息位置统计图" bordered={false} style={{ width: '47%' }}>
                    {this.state.isLoading ? <Spin size="large" /> : ''}
                    <CityChart data={this.state.cities[targetDevice]} device={targetDevice}/>
                </Card>
            </div>
            <div id="myTimeline">
                <Card title="设备信息时间轴" bordered={false} style={{ width: '100%' }}>
                    {this.state.isEmpty ? <Empty/> : <div/>}
                    <Timeline mode={"right"} style={{marginTop:'20px'}}>
                        {
                            messages[targetDevice] === undefined ? "" : messages[targetDevice].map((item, index) => {
                                    if(isFirst){
                                        if(index >= 15) return ""
                                    }
                                    else{
                                        if(item.timestamp >= startTime && item.timestamp <= endTime) {
                                            return (<Timeline.Item dot={this.getTypeAvatar(item.messageType)}
                                                                   color={this.getTypeColor(item.messageType)}
                                                                   label={item.time}>
                                                {item.location}{item.location === '' ? '' : <br/>}{item.messageContent}
                                            </Timeline.Item>)
                                        }
                                        else return "";
                                    }

                                }
                            )
                        }
                    </Timeline>
                </Card>

            </div>
        </div>
        );
    }
}

export default queryMessages;