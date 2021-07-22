import React, {Component} from 'react';
import {Descriptions, message} from 'antd';
import axios from "axios";
import cookie from "react-cookies";
import { Table, Tag } from 'antd';
import {Link} from "react-router-dom";


class PersonalInfo extends Component {

    state = {username:cookie.load('username'), email:cookie.load('email'), deviceArray:[]}
    columns = [
        {
            title: '设备ID',
            dataIndex: 'deviceID',
            key: 'id',
            render: text => <Link to={{pathname:'/index/editDevice', state:{deviceID:text}}} >{text}</Link>,
        },
        {
            title: '设备名称',
            dataIndex: 'deviceName',
            key: 'deviceName',
        },
        {
            title: '设备状态',
            key: 'deviceStatus',
            dataIndex: 'deviceStatus',
            render: tag => <Tag color={tag === 0 ? 'red' : 'green'} key={tag}>{tag === 0 ? '离线' : '在线'}</Tag>
        }
    ];

    componentDidMount () {
        const deleteSuccess = cookie.load('deleteSuccess');
        if(deleteSuccess !== undefined){
            cookie.remove('deleteSuccess', {path:'/'});
            message.success('删除设备成功',2);
        }
        axios.post("/getPersonalInfo", {
            username:this.state.username
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

            }
            else{
                message.warning ("获取个人信息出错").then (r  => console.log(r));
            }
        })
    }

    render () {
        const {username, email, deviceArray} = this.state;
        return (
            <div>
                <Descriptions
                    title="个人信息"
                    bordered
                    column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
                >
                    <Descriptions.Item label="用户名">{username}</Descriptions.Item>
                    <Descriptions.Item label="邮箱">{email}</Descriptions.Item>
                </Descriptions>
                <Descriptions
                    title="设备信息"
                    bordered
                    column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
                    style={{marginTop:'30px'}}
                />
                <Table columns={this.columns} dataSource={deviceArray} />
            </div>
        );
    }
}

export default PersonalInfo;



