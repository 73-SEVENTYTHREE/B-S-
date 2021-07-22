import React, {Component} from 'react';
import axios from "axios";
import { Form, Input, Button, Checkbox, message} from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import cookie from 'react-cookies'
import './index.css'
import {Link} from "react-router-dom";


class Login extends Component {
    //防止修改url访问
    componentWillMount () {
        const username = cookie.load('username');
        const change = cookie.load('changeSuccess');
        if (username !== undefined) window.location.href = '/index';
        if(change !== undefined){
            message.success("密码修改成功，请重新登录", 2);
            cookie.remove('changeSuccess', {path:'/'})
        }
    }

    componentDidMount () {
        if (cookie.load('registerSuccess') !== undefined) {
            message.success('注册成功，请登陆', 2)
            cookie.remove('registerSuccess', {path:'/'})
        }
    }

    state = {
        username: '',
        password: ''
    }

    //保存用户输入的用户名
    handleUsername = e => {
        this.setState({username: e.target.value})
    }

    //保存用户输入的密码
    handlePassword = e => {
        this.setState({password: e.target.value})
    }

    //处理表单请求
    handleSubmit = () => {
        let that = this
        if (that.state.username === '' && that.state.password === '') return
        axios.post('/login', {
            username: this.state.username,
            password: this.state.password
        })
            .then(function (response) {
                const data = response.data
                const result = data.status
                if (result === 'success'){
                    cookie.save('username', that.state.username, { path: '/' });
                    cookie.save('loginSuccess', true, { path: '/' });
                    cookie.save('email', data.email, {path:'/'});
                    window.location.href = '/index';
                }
                else{
                    message.warning('账号或密码错误', 2)
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    //跳转注册界面
    goRegister = () => {
        window.location.href = '/register'
    }

    render () {
        return (
            <div className='myForm'>
                <img src={'./images/loginPicture.jpg'} alt={'loginPicture'} className='leftPicture'/>
                <div className='right'>
                    <h6 className='title'>用户登录</h6>
                    <hr className='line'/>
                    <Form
                        name="normal_login"
                        className="trueForm"
                        initialValues={{
                            remember: true,
                        }}
                    >
                        <Form.Item
                            name="username"
                            rules={[
                                {
                                    required: true,
                                    message: '请输入您的用户名',
                                    trigger: 'blur'
                                },
                                {
                                    min: 6,
                                    max: 18,
                                    message: '用户名长度应为6-18个字符',
                                    trigger: 'blur'
                                }
                            ]}
                        >
                            <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="用户名" onChange={this.handleUsername}/>
                        </Form.Item>
                        <Form.Item
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: '请输入您的密码！',
                                },
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined className="site-form-item-icon"/>}
                                type="password"
                                placeholder="密码"
                                onChange={this.handlePassword}
                            />
                        </Form.Item>
                        <Form.Item >
                            <Form.Item name="remember" noStyle>
                                <Checkbox>记住我</Checkbox>
                            </Form.Item>
                            <Link className="login-form-forgot" to="/forgetPwd" id="forgetPassword">
                                忘记密码？
                            </Link>
                        </Form.Item>

                        <Form.Item id='buttons'>
                            <div className='myBtn'>
                                <Button type="primary" htmlType="submit" className="login-form-button"
                                        onClick = {this.handleSubmit}>
                                    登录
                                </Button>
                                <Button type="primary" className="login-form-button" onClick = {this.goRegister}>
                                    注册
                                </Button>
                            </div>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        );
    }
}

export default Login;