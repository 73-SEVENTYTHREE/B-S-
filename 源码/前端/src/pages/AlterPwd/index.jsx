import React, {Component} from 'react';
import {Button, Card, Form, Input, message} from "antd";
import {LockOutlined, MailOutlined, SendOutlined} from "@ant-design/icons";
import cookie from "react-cookies";
import axios from "axios";
import "./index.css"

class AlterPwd extends Component {

    state = {
        oldPassword: '',
        newPassword:'',
        email:'',
        securityCode:'',
        emailHelp:null,
        sendPermit:true,
        leftTime:0,
        hasSend:false,
        username:cookie.load('username')
    }

    //修改密码的页面不需要验证邮箱是否存在
    handleEmail = e => {
        this.setState({email: e.target.value})
        const email = e.target.value
        const reg = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/
        if (!reg.test(email)) {
            this.setState({emailStyle:'warning', emailHelp:'请输入正确的邮箱格式'})
        }
        else{
            this.setState({emailStyle:'success', emailHelp:null})
        }
    }

    repeatPwd = (rule, value) => {
        if (value && value !== this.state.newPassword) return Promise.reject('两次密码不一致')
        return Promise.resolve()
    }

    handleOldPassword = e => {
        this.setState({oldPassword: e.target.value})
    }
    handleNewPassword = e => {
        this.setState({newPassword: e.target.value})
    }
    handleSecurityCode = e => {
        this.setState({securityCode: e.target.value})
    }

    handleSubmit1 = () => {
        let that = this
        const {oldPassword, newPassword, email} = that.state
        const reg1 =/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/
        const reg2 = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/
        if (oldPassword === '' || newPassword === '' || email === '' || !reg1.test(newPassword) || !reg2.test(email) ||
            this.verifyPwd !== newPassword) {
            console.log(1);
            return
        }
        axios.post('/alterPwd', {
            oldPassword,
            newPassword,
            email
        })
            .then(function (response) {
                const data = response.data
                const result = data.status
                if (result === 'success'){
                    cookie.save('changeSuccess', true, { path: '/' });
                    cookie.remove('username', {path:'/'});
                    cookie.remove('email', {path:'/'});
                    window.location.href = '/login'
                }
                else{
                    message.warning('邮箱或密码错误', 10);
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    sendSecurityCode = () => {
        const {email} = this.state;
        const reg2 = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/
        if(email === '' || !reg2.test(email)) return;
        else{
            axios.post('/sendSecurityCode', {email: email})
                .then(response => {
                    this.setState({sendPermit:false});
                    setTimeout(() => this.setState({sendPermit:true}), 60000);
                    this.setState({leftTime:60});
                    let id = setInterval(() => {
                        const number = this.state.leftTime;
                        this.setState({leftTime:number - 1});
                        if(number === 1){
                            clearInterval(id);
                        }
                    }, 1000);
                    const data = response.data;
                    if(data.status === 'success'){
                        message.success('验证码已发送至您的邮箱，请注意查收', 10);
                    }
                    else{
                        message.warning('验证码发送失败，请稍后再试', 10);
                    }
                })
        }
    }

    handleSubmit3 = () => {
        const {securityCode} = this.state;
        let that = this
        const {newPassword, email} = that.state
        const reg1 =/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/
        const reg2 = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/
        if (newPassword === '' || email === '' || securityCode === '' || !reg1.test(newPassword) || !reg2.test(email) ||
            this.verifyPwd !== newPassword) {
            return
        }
        else{
            axios.post('/forgetPwd', {newPassword: newPassword, email: email, securityCode: securityCode})
                .then(response => {
                    console.log(response)
                    const data = response.data;
                    if(data.status === 'wrong'){
                        message.warning('验证码错误，请重试', 10);
                    }
                    else if(data.status === 'success'){
                        message.success('密码更改成功，请登录', 10);
                    }
                    else if(data.status === 'unRegister'){
                        message.warning('该邮箱未注册，请先注册', 10);
                    }
                    else{
                        message.warning('服务器繁忙，请稍后再试', 10);
                    }
                })
        }
    }

    render () {
        const {username} = this.state
        if(username === undefined){
            return (
                <Form style={{width: this.state.username === undefined ? "100%" : "40%"}} className={'trueForm'}>
                        <Form.Item
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    message: '请输入您的邮箱地址',
                                    trigger: 'blur'
                                }
                            ]}
                            validateStatus={this.state.emailStyle}
                            hasFeedback
                            help={this.state.emailHelp}
                        >
                            <Input prefix={<MailOutlined className="site-form-item-icon" />} placeholder="邮箱" onChange={this.handleEmail}/>
                        </Form.Item>

                        <Form.Item
                            name="newPassword"
                            rules={[
                                {
                                    required: true,
                                    message: '请输入您的密码',
                                },
                                {
                                    min: 6,
                                    max: 24,
                                    message: '密码长度应为8-16个字符',
                                    trigger: 'blur'
                                },
                                {
                                    pattern:/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/,
                                    message: '密码应包含数字和字母，不能有特殊字符'
                                }
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined className="site-form-item-icon"/>}
                                type="password"
                                placeholder="新密码"
                                onChange={this.handleNewPassword}
                            />
                        </Form.Item>

                        <Form.Item
                            name="password2"
                            rules={[
                                {
                                    required: true,
                                    message: '请再次确认密码',
                                },
                                {
                                    validator: this.repeatPwd
                                }
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined className="site-form-item-icon"/>}
                                type="password"
                                placeholder="确认新密码"
                                onChange={e => this.verifyPwd = e.target.value}
                            />
                        </Form.Item>

                        <Form.Item
                            name="securityCode"
                            rules={[
                                {
                                    required: true,
                                    message: '请输入验证码',
                                }
                            ]}
                        >
                            <Input
                                prefix={<SendOutlined className="site-form-item-icon"/>}
                                placeholder="验证码"
                                onChange={this.handleSecurityCode}
                            />
                        </Form.Item>


                        <Form.Item id='buttons'>
                            <div className='myBtn'>
                                {
                                    this.state.sendPermit ? <Button type="primary" className="login-form-button" onClick={this.sendSecurityCode}>
                                            发送验证码
                                        </Button>:
                                        <Button type="primary" htmlType="submit" className="login-form-button" onClick={this.sendSecurityCode} disabled>
                                            {`${this.state.leftTime}s后再次发送`}
                                    </Button>

                                }

                                <Button type="primary" htmlType="submit" className="login-form-button" onClick={this.handleSubmit3}>
                                    修改密码
                                </Button>
                            </div>
                        </Form.Item>
                    </Form>
            )
        }
        else{
            return (
                <div style={{display:'flex', justifyContent:'center'}}>
                    <Card title="修改密码" bordered={false} style={{ width: '50%' }} headStyle={{display:'flex', justifyContent:'center'}}>
                        <Form style={{width: "60%", marginTop:"15px"}} id={"forgetPwd"}>
                            <Form.Item
                                name="email"
                                rules={[
                                    {
                                        required: true,
                                        message: '请输入您的邮箱地址',
                                        trigger: 'blur'
                                    }
                                ]}
                                validateStatus={this.state.emailStyle}
                                hasFeedback
                                help={this.state.emailHelp}
                            >
                                <Input prefix={<MailOutlined className="site-form-item-icon" />} placeholder="邮箱" onChange={this.handleEmail}/>
                            </Form.Item>

                            <Form.Item
                                name="oldPassword"
                                rules={[
                                    {
                                        required: true,
                                        message: '请输入旧密码',
                                    }
                                ]}
                            >
                                <Input
                                    prefix={<LockOutlined className="site-form-item-icon"/>}
                                    type="password"
                                    placeholder="旧密码"
                                    onChange={this.handleOldPassword}
                                />
                            </Form.Item>

                            <Form.Item
                                name="newPassword"
                                rules={[
                                    {
                                        required: true,
                                        message: '请输入您的密码',
                                    },
                                    {
                                        min: 6,
                                        max: 24,
                                        message: '密码长度应为8-16个字符',
                                        trigger: 'blur'
                                    },
                                    {
                                        pattern:/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$/,
                                        message: '密码应包含数字和字母，不能有特殊字符'
                                    }
                                ]}
                            >
                                <Input
                                    prefix={<LockOutlined className="site-form-item-icon"/>}
                                    type="password"
                                    placeholder="新密码"
                                    onChange={this.handleNewPassword}
                                />
                            </Form.Item>

                            <Form.Item
                                name="password2"
                                rules={[
                                    {
                                        required: true,
                                        message: '请再次确认密码',
                                    },
                                    {
                                        validator: this.repeatPwd
                                    }
                                ]}
                            >
                                <Input
                                    prefix={<LockOutlined className="site-form-item-icon"/>}
                                    type="password"
                                    placeholder="确认新密码"
                                    onChange={e => this.verifyPwd = e.target.value}
                                />
                            </Form.Item>


                            <Form.Item id='buttons'>
                                <div className='myBtn'>
                                    <Button type="primary" htmlType="submit" className="login-form-button" onClick={this.handleSubmit1}>
                                        修改密码
                                    </Button>
                                </div>
                            </Form.Item>
                        </Form>
                    </Card>
                </div>
            );
        }
    }
}

export default AlterPwd;