import React from "react";
import { Menu, Layout } from 'antd';
import { UserOutlined, LaptopOutlined, FileSearchOutlined, HomeOutlined } from '@ant-design/icons';
import {Link} from "react-router-dom";

const { Sider } = Layout;
const { SubMenu } = Menu;

const LeftMenu = (props) => {
    const changePage = props.changePag;
    return (
        <Sider width={200} className="site-layout-background">
            <Menu
                mode="inline"
                defaultSelectedKeys={['1']}
                defaultOpenKeys={['sub1']}
                style={{ height: '100%', borderRight: 0 }}
                theme={'dark'}
            >
                <Menu.Item key="1" icon={<HomeOutlined />} onClick={e => changePage("")}><Link to={{pathname:'/index'}}>首页</Link></Menu.Item>
                <SubMenu key="sub1" icon={<UserOutlined />} title="用户中心">
                    <Menu.Item key="2" onClick={e => changePage("我的设备")}><Link to={{pathname:'/index/personalInfo'}}>我的设备</Link></Menu.Item>
                    <Menu.Item key="3" onClick={e => changePage("修改密码")}><Link to={{pathname:'/index/alterPwd'}}>修改密码</Link></Menu.Item>
                </SubMenu>
                <Menu.Item key="4" icon={<LaptopOutlined />} onClick={e => changePage("创建设备")}><Link to={{pathname:'/index/createDevice'}}>创建设备</Link></Menu.Item>
                <Menu.Item key="5" icon={<FileSearchOutlined />} onClick={e => changePage("数据查询")}><Link to={{pathname:'/index/queryMessage'}}>数据查询</Link></Menu.Item>
            </Menu>
        </Sider>
    );
};
export default LeftMenu;
