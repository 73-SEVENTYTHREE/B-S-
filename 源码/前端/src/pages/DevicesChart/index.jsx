import React, {Component} from 'react';
import * as echarts from 'echarts/core';
import {GridComponent, TitleComponent, TooltipComponent, ToolboxComponent } from 'echarts/components';
import {CanvasRenderer} from 'echarts/renderers';
import {Card, Statistic, Progress, message} from 'antd';
import { AppstoreTwoTone, CloudTwoTone, ApiTwoTone } from '@ant-design/icons'
import { LineChart } from 'echarts/charts';
import './index.css'
import axios from "axios";
import cookie from "react-cookies";
import object_sizeof from 'object-sizeof';
import moment from 'moment'
import sizeof from "object-sizeof";

echarts.use(
    [GridComponent, LineChart, CanvasRenderer, TitleComponent, TooltipComponent, ToolboxComponent]
);

export default class DevicesChart extends Component {

    state = {deviceArray:[], messages:{}, onlineTimeInterval:{}, onlineTimePoint:{}, onlineNumber:0, offlineNumber:0}

    async componentDidMount () {
        console.log(object_sizeof({abc:'def'}))
        await axios.post("/getPersonalInfo", {
            username:cookie.load('username')
        }).then(response => {
            const data =  response.data;
            let online = 0, offline = 0;
            if(data.code === "success"){
                let array = data.deviceArray.map((item, index) => {
                    if (item.isOnline === 1) online++;
                    else offline++;
                    return {
                        key: index + 1,
                        deviceName: item.deviceName,
                        deviceID: item.deviceID,
                        deviceStatus: item.isOnline
                    }
                });
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
                                    date:(new Date(parseInt(obj.timestamp))).toLocaleDateString()
                                }
                                return infoItem;
                            });
                            const messages = {...this.state.messages};
                            messages[deviceID] = messageArray;

                            this.setState({deviceArray:array, onlineNumber:online, offlineNumber:offline, messages:messages}, () => {

                                const today = moment();
                                const dateArray = [
                                    moment(moment().subtract(6, 'days')).format('YYYY/M/D'),
                                    moment(moment().subtract(5, 'days')).format('YYYY/M/D'),
                                    moment(moment().subtract(4, 'days')).format('YYYY/M/D'),
                                    moment(moment().subtract(3, 'days')).format('YYYY/M/D'),
                                    moment(moment().subtract(2, 'days')).format('YYYY/M/D'),
                                    moment(moment().subtract(1, 'days')).format('YYYY/M/D'),
                                    today.format('YYYY/M/D')]
                                console.log(dateArray)

                                let messageRound = [];
                                const {messages, deviceArray} = this.state;
                                let normal = 0, warning = 0, online = 0, offline = 0, day1 = 0, day2 = 0,
                                day3 = 0, day4 = 0, day5 = 0, day6 = 0, day7 = 0;

                                deviceArray.forEach(device => {
                                    if(messages[device.deviceID] !== undefined){
                                        messages[device.deviceID].forEach(message => {
                                            if(message.messageType === 0) normal++;
                                            if(message.messageType === 1) warning++;
                                            if(message.messageType === 2) online++;
                                            if(message.messageType === 3) offline++;
                                            const m2 = moment((new Date(message.timestamp).toLocaleDateString()));
                                            const diff = today.diff(m2, 'day');
                                            if(diff === 0) day1 += sizeof(message.messageContent) / 1000;
                                            if(diff === 1) day2 += sizeof(message.messageContent) / 1000;
                                            if(diff === 2) day3 += sizeof(message.messageContent) / 1000;
                                            if(diff === 3) day4 += sizeof(message.messageContent) / 1000;
                                            if(diff === 4) day5 += sizeof(message.messageContent) / 1000;
                                            if(diff === 5) day6 += sizeof(message.messageContent) / 1000;
                                            if(diff === 6) day7 += sizeof(message.messageContent) / 1000;
                                        })
                                    }
                                })
                                messageRound.push({value:normal, name:'正常信息'});
                                messageRound.push({value:warning, name:'告警信息'});
                                messageRound.push({value:online, name:'上线信息'});
                                messageRound.push({value:offline, name:'下线信息'});

                                const chartDom = document.getElementById ('dataChart');
                                let myChart = echarts.init (chartDom);
                                let option = {
                                    xAxis: {
                                        type: 'category',
                                        data: dateArray
                                    },
                                    yAxis: {
                                        name: '单位(KB)',
                                        type: 'value'
                                    },
                                    tooltip: {
                                        trigger: 'axis'
                                    },
                                    series: [
                                        {
                                            data: [day7.toFixed(3),
                                                day6.toFixed(3),
                                                day5.toFixed(3),
                                                day4.toFixed(3),
                                                day3.toFixed(3),
                                                day2.toFixed(3),
                                                day1.toFixed(3)],
                                            type: 'line',
                                            symbol: 'circle',
                                            symbolSize: 10,
                                            lineStyle: {
                                                color: '#5470C6',
                                                width: 4,
                                                type: 'dashed'
                                            },
                                            itemStyle: {
                                                borderWidth: 3,
                                                borderColor: '#EE6666',
                                                color: 'yellow'
                                            }
                                        }
                                    ]
                                };
                                option && myChart.setOption(option);

                                const chartDom1 = document.getElementById ('messageChart');
                                let myChart1 = echarts.init (chartDom1);
                                let option1 = {
                                    tooltip: {
                                        trigger: 'item'
                                    },
                                    legend: {
                                        top: '5%',
                                        left: 'center'
                                    },
                                    color:['rgb(134, 197, 106)', 'rgb(235, 91, 91)', 'rgb(74, 101, 191)', 'rgb(249, 193, 78)'],
                                    series: [
                                        {
                                            type: 'pie',
                                            radius: ['40%', '70%'],
                                            avoidLabelOverlap: false,
                                            label: {
                                                show: false,
                                                position: 'center'
                                            },
                                            emphasis: {
                                                label: {
                                                    show: true,
                                                    fontSize: '40',
                                                    fontWeight: 'bold'
                                                }
                                            },
                                            labelLine: {
                                                show: false
                                            },
                                            data: messageRound
                                        }
                                    ]
                                };
                                option1 && myChart1.setOption(option1);
                                window.addEventListener("resize", function () {
                                    myChart.resize();
                                    myChart1.resize();
                                });
                            });
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
        const {onlineNumber, offlineNumber, deviceArray} = this.state;
        return (
            <div id='chartContainer'>
                <div id="deviceChart">
                    <Card title="设备总览" bordered={false} style={{ width: '100%' }}>
                        <div id={'Cards'}>
                            <div className='myCard'>
                                <Card title='总设备数' hoverable bordered={false} headStyle={{backgroundImage: 'linear-gradient(120deg, #00e795 0, #0095e2 100%)'}}>
                                    <div className="cardItem">
                                        <div className='item1'>
                                            <Statistic
                                                value={deviceArray.length}
                                                prefix={<AppstoreTwoTone />}
                                                width={50}
                                            />
                                        </div>
                                        <div className='item2'>
                                            <Progress
                                                status='active'
                                                strokeColor={{
                                                    '0%': '#00e795',
                                                    '100%': '#0095e2',
                                                }}
                                                percent={100}
                                                size={'small'}
                                            />
                                        </div>
                                    </div>
                                </Card>
                            </div>
                            <div className='myCard'>
                                <Card title="在线设备数" hoverable bordered={false} headStyle={{backgroundImage: 'linear-gradient(120deg, #f6d365 0, #ff7850 100%)'}}>
                                    <div className="cardItem">
                                        <div className='item1'>
                                            <Statistic
                                                value={onlineNumber}
                                                prefix={<CloudTwoTone />}
                                            />
                                        </div>
                                        <div className='item2'>
                                            <Progress
                                                status='active'
                                                strokeColor={{
                                                    '0%': '#f6d365',
                                                    '100%': '#ff7850',
                                                }}
                                                percent={(onlineNumber * 100 / deviceArray.length).toFixed(0)}
                                                size={'small'}
                                            />
                                        </div>
                                    </div>
                                </Card>
                            </div>
                            <div className='myCard'>
                                <Card title="离线设备数" hoverable bordered={false} headStyle={{backgroundImage: 'linear-gradient(120deg, #7b78c9 0, #60c6f3 100%)'}}>
                                    <div className="cardItem">
                                        <div className='item1'>
                                            <Statistic
                                                value={offlineNumber}
                                                prefix={<ApiTwoTone />}
                                            />
                                        </div>
                                        <div className='item2'>
                                            <Progress
                                                status = 'active'
                                                strokeColor={{
                                                    '0%': '#7b78c9',
                                                    '100%': '#60c6f3',
                                                }}
                                                percent={(offlineNumber * 100 / deviceArray.length).toFixed(0)}
                                                size={'small'}
                                            />
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </Card>
                </div>
                <div id="dataContainer" style={{display:'flex', justifyContent:'space-between'}}>
                    <Card title="近一周接收数据量统计" bordered={false} className={'indexChart'}>
                        <div style={{width:'100%'}}>
                            <div id='dataChart'/>
                        </div>
                    </Card>
                    <Card title="信息分类" bordered={false} className={'indexChart'}>
                        <div style={{width:'100%'}}>
                            <div id='messageChart'/>
                        </div>
                    </Card>
                </div>
            </div>

        );
    }
}