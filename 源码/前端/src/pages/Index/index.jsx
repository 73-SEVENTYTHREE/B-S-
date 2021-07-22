import React, {Component} from 'react';
import {Typography, Breadcrumb, Button, Layout, Menu, message} from 'antd'
import DevicesChart from "../DevicesChart";
import Footer from "../../components/Footer";
import LeftMenu from "../../components/LeftMenu";
import PersonalInfo from "../PersonalInfo";
import AlterPwd from "../AlterPwd";
import CreateDevice from "../createDevice";
import EditDevice from "../EditDevice";
import queryMessages from "../queryMessage";
import StaticsReport from "../StatisticsReport";
import './index.css'
import cookie from "react-cookies";
import {Route, Switch} from "react-router-dom";
import axios from "axios";


const { Header, Content } = Layout;
const { Title } = Typography;

export default class Index extends Component {

    state = {currentPage:"", username:cookie.load('username'), ws:null}

    constructor (props) {
        super (props);
        const username = cookie.load('username');
        if(username === undefined) {
            window.location.href = '/login'
        }
    }
    handleLoginOut = () => {
        cookie.remove('username', { path: '/' })
        cookie.remove('loginSuccess', { path: '/' })
        cookie.remove('webSocket', {path:'/'})
        cookie.remove('email', {path:'/'})
        const ws = this.state.ws;
        if(ws !== null) ws.close();
        window.location.href = '/login'
    }
    changePage = name => {
        this.setState({currentPage:name});
    }

    getMyDevice = () => {
        axios.post("/getPersonalInfo", {
            username:this.state.username
        }).then(response => {
            const data =  response.data;
            if(data.code === "success"){
                let array = data.deviceArray.map((item, index) => {
                    return {
                        deviceName: item.deviceName,
                        deviceID: item.deviceID
                    }
                });

                cookie.save('deviceArray', array, {path:'/'});
            }
            else{
                message.warning ("获取个人信息出错").then (r  => console.log(r));
            }
        })
    }

    componentDidMount () {
        this.getMyDevice();
        const webSocket = cookie.load('webSocket');
        if(webSocket === undefined){
            // 打开一个 web socket  这里端口号和上面监听的需一致
            const ws = new WebSocket ('ws://localhost:4000');
            ws.onopen = function(e){
                console.log("连接服务器成功");
                ws.send('hello');
                // 向服务器发送消息
                ws.send("test");
            }
            ws.onclose = (e) => {
                this.setState({ws:null});
                cookie.remove('webSocket');
                console.log('websocket连接关闭')
            }
            // 这里接受服务器端发过来的消息
            ws.onmessage = function(e) {
                console.log(e.data);
                const array = cookie.load('deviceArray');
                if(e.data.indexOf("上线") !== -1){
                    array.forEach(item => {
                        if(e.data.indexOf(item.deviceID) !== -1){
                            const str = e.data.replace(item.deviceID, "");
                            message.success( str, 10)
                                .then(value => console.log(value), reason => console.log(reason))
                        }
                    })
                }
                else{
                    array.forEach(item => {
                        if(e.data.indexOf(item.deviceID) !== -1){
                            const str = e.data.replace(item.deviceID, "");
                            message.warning( str, 10)
                                .then(value => console.log(value), reason => console.log(reason))
                        }
                    })
                }
            }
            this.setState({ws:ws});
            cookie.save('webSocket', true, {path:'/'});
        }

    }

    render () {
        return (
            <div>
            <Layout>
                <Header className="header">
                    <Menu theme="dark" mode="horizontal" id="banner">
                        <div id="myTitle"><Title style={{color:"white"}} level={3}>浙联智慧平台</Title></div>
                        <Button type="primary" id="exitBtn" onClick = {this.handleLoginOut}>退出登录</Button>
                    </Menu>
                </Header>
                <Layout>
                    <LeftMenu changePag={this.changePage}/>
                    <Layout style={{ padding: '0 24px 24px', position:'relative' }}>
                        <Breadcrumb style={{ margin: '16px 0' }}>
                            <Breadcrumb.Item>首页</Breadcrumb.Item>
                            <Breadcrumb.Item>{this.state.currentPage}</Breadcrumb.Item>
                        </Breadcrumb>
                        <Content
                            className="site-layout-background"
                            style={{
                                padding: 24,
                                margin: 0,
                                minHeight: "90vh",
                            }}
                        >
                            <Switch>
                                <Route exact path={"/index"} component={DevicesChart}/>
                                <Route exact path={"/index/personalInfo"} component={PersonalInfo}/>
                                <Route exact path={"/index/alterPwd"} component={AlterPwd}/>
                                <Route exact path={"/index/createDevice"} component={CreateDevice}/>
                                <Route exact path={"/index/editDevice"} component={EditDevice}/>
                                <Route exact path={"/index/queryMessage"} component={queryMessages}/>
                                <Route exact path={"/index/staticsReport"} component={StaticsReport}/>
                            </Switch>
                            <Footer/>
                        </Content>
                    </Layout>
                </Layout>
            </Layout>

            </div>
        );
    }
}