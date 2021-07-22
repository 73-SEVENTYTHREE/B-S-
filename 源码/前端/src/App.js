import React, {Component} from 'react';
import Header from "./components/Header";
import Login from "./pages/Login";
import cookie from 'react-cookies';
import {Route, Switch, Redirect} from 'react-router-dom'
import {message} from 'antd';
import Index from "./pages/Index";
import Register from "./pages/Register";
import ForgetPwd from "./pages/ForgetPwd";

import './App.css'

class App extends Component {
    state = {
        username: cookie.load('username')
    }

    //从cookie中判断是否是第一次进入首页
    componentDidMount () {
        const success = cookie.load('loginSuccess')
        if (success !== undefined) {
            message.success('登陆成功。欢迎您，' + this.state.username, 10)
                .then(value => console.log(value), reason => console.log(reason))
            cookie.remove('loginSuccess',{ path: '/' })
        }
    }

    render () {
        return (
            <div>
                {
                    this.state.username !== undefined ? <div/> : <Header/>
                }
                <Switch>
                    <Route path="/index" component={Index} />
                    <Route path="/login" component={Login} />
                    <Route path="/register" component={Register} />
                    <Route path="/forgetPwd" component={ForgetPwd} />
                    <Redirect to={this.state.username ? "/login" : "/index"}/>
                </Switch>
            </div>
        );
    }
}


export default App;