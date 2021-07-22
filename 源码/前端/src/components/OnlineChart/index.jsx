import React, {Component} from 'react';
import * as echarts from 'echarts/core';
import { Empty } from 'antd';
import {
    TitleComponent,
    GridComponent,
    DataZoomComponent
} from 'echarts/components';
import {
    BarChart
} from 'echarts/charts';
import {
    CanvasRenderer
} from 'echarts/renderers';

echarts.use(
    [TitleComponent, GridComponent, DataZoomComponent, BarChart, CanvasRenderer]
);


class OnlineChart extends Component {
    state = {data:[], onlineTimePoint:[]}

    componentWillReceiveProps(nextProps){
        this.setState({
            data: nextProps.data,
            onlineTimePoint:nextProps.onlineTimePoint
        }, () => {
            if(this.state.data !== undefined){
                if(this.state.data.length !== 0){
                    const chartDom = document.getElementById ('onlineChart');
                    const myChart = echarts.init (chartDom);
                    let option;
                    const data = this.state.data;
                    const dataAxis = this.state.onlineTimePoint;

                    option = {
                        title: {
                            text: '在线时长统计/min',
                            subtext: '滑动进行大小缩放'
                        },
                        xAxis: {
                            type: "category",
                            data: dataAxis,
                            axisTick: {
                                show: false
                            },
                            axisLine: {
                                show: false
                            },
                            z: 10
                        },
                        yAxis: {
                            axisLine: {
                                show: false
                            },
                            axisTick: {
                                show: false
                            },
                            axisLabel: {
                                textStyle: {
                                    color: '#999'
                                }
                            }
                        },
                        dataZoom: [
                            {
                                type: 'inside'
                            }
                        ],
                        series: [
                            {
                                type: 'bar',
                                label:{
                                    show:true
                                },
                                showBackground: true,
                                itemStyle: {
                                    color: new echarts.graphic.LinearGradient(
                                        0, 0, 0, 1,
                                        [
                                            {offset: 0, color: '#83bff6'},
                                            {offset: 0.5, color: '#188df0'},
                                            {offset: 1, color: '#188df0'}
                                        ]
                                    )
                                },
                                emphasis: {
                                    itemStyle: {
                                        color: new echarts.graphic.LinearGradient(
                                            0, 0, 0, 1,
                                            [
                                                {offset: 0, color: '#2378f7'},
                                                {offset: 0.7, color: '#2378f7'},
                                                {offset: 1, color: '#83bff6'}
                                            ]
                                        )
                                    }
                                },
                                data: data
                            }
                        ]
                    };
                    // Enable data zoom when user click bar.
                    let zoomSize = 6;
                    myChart.on('click', function (params) {
                        myChart.dispatchAction({
                            type: 'dataZoom',
                            startValue: dataAxis[Math.max(params.dataIndex - zoomSize / 2, 0)],
                            endValue: dataAxis[Math.min(params.dataIndex + zoomSize / 2, data.length - 1)]
                        });
                    });
                    option && myChart.setOption(option);
                }
            }
        })
    }

    render () {
        if(this.state.data.length === 0) return <Empty/>;
        else return <div id={'onlineChart'} style={{height:'400px'}}/>;
    }
}

export default OnlineChart;