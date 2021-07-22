import React, {Component} from 'react';
import axios from "axios";
import cookie from 'react-cookies'
import {Descriptions, message, Spin, Table, Tag} from "antd";
import EditDeviceModal from "../EditDeviceModal";

const messageColumns = [
    {
        title: '消息ID',
        dataIndex: 'messageID',
        key: 'messageID',
    },
    {
        title: '发送位置',
        dataIndex: 'location',
        key: 'location'
    },
    {
        title: '消息类型',
        key: 'messageType',
        dataIndex: 'messageType',
        render: tag => {
            if(tag === 0) return <Tag color={'green'} key={tag}>正常消息</Tag>
            if(tag === 1) return <Tag color={'red'} key={tag}>告警消息</Tag>
            if(tag === 2) return <Tag color={'blue'} key={tag}>设备上线</Tag>
            if(tag === 3) return <Tag color={'yellow'} key={tag}>设备离线</Tag>

        }
    },
    {
        title: '消息内容',
        dataIndex: 'messageContent',
        key: 'messageContent',
    }

]

class EditDevice extends Component {

    state = {deviceID:"", deviceInfo:{}, deviceMessage:[], deviceName:"", path:[], isLoading:true}

    deviceColumns = [
        {
            title: '设备ID',
            dataIndex: 'deviceID',
            key: 'deviceID',
        },
        {
            title: '设备名称',
            dataIndex: 'deviceName',
            key: 'deviceName',
        },
        {
            title: '拥有者ID',
            dataIndex: 'ownerName',
            key: 'ownerName',
        },
        {
            title: '设备状态',
            key: 'deviceStatus',
            dataIndex: 'deviceStatus',
            render: tag => <Tag color={tag === 0 ? 'red' : 'green'} key={tag}>{tag === 0 ? '离线' : '在线'}</Tag>
        },
        {
            title: '操作',
            key: 'edit',
            render: (text, record) => <EditDeviceModal deviceID={this.state.deviceID} deviceName={this.state.deviceName} deleteDevice={this.deleteDevice}
                                        path={this.state.path}/>,
        }
    ];

    static getDerivedStateFromProps(props, state) {
        if (props.location.state.deviceID !== "") {
            return {
                deviceID: props.location.state.deviceID
            }
        }
        return null
    }

    setMessage = message => {
        this.setState({deviceMessage:message})
    }

    componentDidMount () {
        setTimeout(() => this.setState({...this.state}), 500);
        const deviceID = this.state.deviceID;
        let path = [];
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
                    let infoItem =  {
                        key: item.messageID,
                        messageID: item.messageID,
                        messageType: obj.alert,
                        messageContent: obj.info,
                        location:"无",
                        lat:obj.lat,
                        lng:obj.lng
                    }
                    if(obj.lat !== undefined && obj.lng !== undefined) {
                        path = [...path, [{lng:obj.lng, lat:obj.lat}, obj.alert]];
                        axios.get(`https://restapi.amap.com/v3/geocode/regeo?" +
                                    "output=xml&location=${infoItem.lng},${infoItem.lat}&key=167046dfd610b3eea087876e05ee0181&radius=1000&extensions=base`)
                            .then(response => {
                                const data = response.data;
                                infoItem.location = data.regeocode.addressComponent.city;
                            });
                    }
                    return infoItem;
                });
                setTimeout(() => {
                    this.setState({deviceInfo:data.deviceInfo, deviceMessage:[...messageArray], deviceName: data.deviceInfo.deviceName, path:path, isLoading:false});
                }, 1000);
            }
        })

    }

    deleteDevice = () => {
        const deviceID = this.state.deviceID;
        console.log(deviceID)
        axios.post('/deleteDevice', {
            deviceID:deviceID
        }).then(response => {
            const data = response.data;
            if(data.status === 'success') {
                cookie.save('deleteSuccess', true, {path: '/'});
                window.location.href='/index/personalInfo';
            }
            else{
                message.warning('删除失败');
            }
        })
    }

    updateDevice = deviceName => {
       this.setState({deviceName}) ;
    }

    render () {
        const { deviceID, isOnline, ownerName} = this.state.deviceInfo;
        const {deviceName, isLoading} = this.state;
        const info = [{key:1, deviceName, deviceID, deviceStatus:isOnline, ownerName}];
        const messageArray = this.state.deviceMessage;
        return (
            <div>
                <Descriptions
                    title="设备信息"
                    bordered
                    column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
                />
                {
                    isLoading ? <Spin style={{marginTop:'20px'}}/> : <Table columns={this.deviceColumns} dataSource={info} pagination={false}/>
                }

                <Descriptions
                    title="消息信息"
                    bordered
                    column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
                    style={{marginTop:'50px'}}
                />
                {
                    isLoading ? <Spin style={{marginTop:'20px'}}/> : <Table columns={messageColumns} dataSource={messageArray}/>
                }

            </div>
        );
    }
}

export default EditDevice;