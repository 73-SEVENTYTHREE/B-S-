import React, {Component} from 'react';
import {Form, Input, Button, message, Card} from 'antd';
import axios from "axios";
import cookie from "react-cookies";

class CreateDevice extends Component {
    onFinish = (values) => {
        console.log('Success:', values);
        axios.post('/createDevice', {
            deviceID:values.deviceID,
            deviceName:values.deviceName,
            ownerName:cookie.load('username')
        }).then(response => {
            const data = response.data;
            if(data.status === "success"){
                message.success("设备创建成功", 2);
                let deviceArray = cookie.load('deviceArray');
                cookie.remove('deviceArray', {path:'/'});
                deviceArray = [...deviceArray, values.deviceID];
                cookie.save('deviceArray', deviceArray, {path:'/'});

            }
            else if(data.status === "duplicated"){
                message.warning("该设备已被绑定", 2)
            }
            else{
                message.warning("创建设备失败", 2)
            }
        })
    }
    onFinishFailed = (errorInfo) => {
        message.warning("请正确填写表单！",2)
    }
    render () {
        return (

        <div style={{display:'flex', justifyContent:'center'}}>
            <Card title="创建设备" bordered={false} style={{ width: '60%' }} headStyle={{display:'flex', justifyContent:'center'}}>
                <Form
                    initialValues={{
                        remember: true,
                    }}
                    onFinish={this.onFinish}
                    onFinishFailed={this.onFinishFailed}
                    style={{margin:"auto", width:"40%", marginTop:"15px"}}
                >
                    <Form.Item
                        name="deviceID"
                        rules={[
                            {
                                required: true,
                                message: '请输入设备ID!',
                            },
                        ]}
                    >
                        <Input placeholder="设备ID"/>
                    </Form.Item>

                    <Form.Item
                        name="deviceName"
                        rules={[
                            {
                                required: true,
                                message: '请输入设备名称！',
                            },
                        ]}
                    >
                        <Input placeholder="设备名称"/>
                    </Form.Item>

                    <Form.Item
                        wrapperCol={{
                            offset: 10,
                            span: 16,
                        }}
                    >
                        <Button type="primary" htmlType="submit">
                            创建设备
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
        );
    }
}

export default CreateDevice;