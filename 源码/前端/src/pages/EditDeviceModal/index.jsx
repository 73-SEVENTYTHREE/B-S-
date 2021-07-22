import React, {Component} from 'react';
import {Modal, Button, Form, Input, message} from 'antd';
import { Map, Polyline, Marker } from 'react-amap';
import {FormOutlined} from "@ant-design/icons";
import axios from "axios";

class EditDeviceModal extends Component {
    state = {
        editVisible: false,
        removeVisible:false,
        trackVisible:false,
        deviceID: "",
        deviceName: "",
        path:[],
        points:[]
    };

    static getDerivedStateFromProps(props, state) {
        if (props.deviceName !== state.deviceName) {
            console.log(props.path)
            return {
                deviceID: props.deviceID,
                deviceName: props.deviceName,
                path:props.path
            }
        }
        return null
    }

    showModal1 = () => {
        this.setState({
            editVisible: true,
        });
    };

    showModal2 = () => {
        this.setState({
            removeVisible:true,
        });
    };

    showModal3 = () => {
        this.setState({
            trackVisible:true,
        });
    }


    handleOk = () => {
        const {deviceID} = this.state;
        const deviceName = this.deviceName.props.value;
        if (deviceName === undefined) message.warning('请输入修改后的设备名称', 10);
        else if(deviceName === this.state.deviceName) message.warning('设备名称未变化', 10);
        else{
            console.log(deviceName)
            axios.post('/alterDeviceName', {
                deviceID,
                deviceName
            }).then(response => {
                const data = response.data;
                if(data.status === 'success'){
                    console.log(data)
                    message.success('修改成功', 10);
                    // this.props.updateDevice(data.deviceName);
                }
                else{
                    message.warning('修改失败', 10);
                }
                this.setState({ loading: true });
                this.setState({ loading: false, visible: false });
            })
        }

    };

    handleCancel = () => {
        this.setState({ editVisible: false, removeVisible:false, trackVisible:false });
    };

    render() {
        const { editVisible, loading, deviceName, removeVisible, trackVisible,path } = this.state;
        let track = path.map(item => item[0]);
        const styleC = {
            background: `url('http://icons.iconarchive.com/icons/paomedia/small-n-flat/1024/map-marker-icon.png')`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            width: '30px',
            height: '40px',
            color: '#000',
            textAlign: 'center',
            lineHeight: '40px'
        }
        return (
            <>
                <a onClick={this.showModal2}>删除&nbsp; &nbsp; &nbsp;</a>
                <a onClick={this.showModal1}>编辑名称&nbsp; &nbsp; &nbsp;</a>
                <a onClick={this.showModal3}>查看轨迹</a>
                <Modal
                    visible={editVisible}
                    title="编辑设备名称"
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    footer={[
                        <Button key="back" onClick={this.handleCancel}>
                            关闭
                        </Button>,
                        <Button key="submit" type="primary" loading={loading} onClick={this.handleOk}>
                            确认修改
                        </Button>,
                    ]}
                >
                    <Form>
                        <Form.Item
                            name="deviceName"
                            rules={[
                                {
                                    required: true,
                                    message: '请输入设备名称',
                                    trigger: 'blur'
                                }
                            ]}
                        >
                            <Input prefix={<FormOutlined className="site-form-item-icon" />} placeholder={deviceName} ref={e => this.deviceName = e}/>
                        </Form.Item>
                    </Form>
                </Modal>
                <Modal title="确认删除" visible={removeVisible}
                       footer={[
                           <Button key="back" onClick={this.handleCancel}>
                               取消
                           </Button>,
                           <Button key="submit" type="primary" onClick={event => this.props.deleteDevice()}>
                               确认删除
                           </Button>,
                       ]}
                       onCancel={this.handleCancel}>
                    <p>{`确定删除设备${deviceName}?`}</p>
                </Modal>
                <Modal title="轨迹展示" visible={trackVisible}
                       footer={[
                           <Button key="back" onClick={this.handleCancel}>
                               返回
                           </Button>
                       ]}
                    width={800}
                       onCancel={this.handleCancel}
                >
                    <div id={"map"} style={{width:"100%", height:"450px"}}>
                        <Map plugins={['ToolBar']} zoom={10} center={track.length === 0 ? '' : track[0]}>
                            <Polyline
                                path={ track }
                                strokeColor={'black'}
                            />
                            {
                                path.map(item => item[1] === 0 ? <Marker position={item[0]} /> :
                                    <Marker position={item[0]}><div style={styleC}/></Marker>)
                            }

                        </Map>
                    </div>
                </Modal>
            </>
        );
    }
}

export default EditDeviceModal;