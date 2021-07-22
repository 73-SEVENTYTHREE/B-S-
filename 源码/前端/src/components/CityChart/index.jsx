import React, {Component} from 'react';
import * as echarts from 'echarts/core';
import {
    TooltipComponent,
    LegendComponent
} from 'echarts/components';
import {
    PieChart
} from 'echarts/charts';
import {
    CanvasRenderer
} from 'echarts/renderers';
import {Empty} from "antd";

echarts.use(
    [TooltipComponent, LegendComponent, PieChart, CanvasRenderer]
);

class CityChart extends Component {
    state = {data:[]}
    componentWillReceiveProps (nextProps, nextContext) {
        if(nextProps.device !== undefined){
            this.setState({data: nextProps.data}, () => {
                if(this.state.data.length !== 0){
                    const chartDom = document.getElementById ('cityChart');
                    const myChart3 = echarts.init (chartDom);
                    let option3;
                    option3 = {
                        tooltip: {
                            trigger: 'item'
                        },
                        legend: {
                            top: '5%',
                            left: 'center'
                        },
                        series: [
                            {
                                name: '城市名称',
                                type: 'pie',
                                radius: ['40%', '70%'],
                                avoidLabelOverlap: false,
                                label: {
                                    show: false,
                                    position: 'center'
                                },
                                emphasis: {
                                    label: {
                                        show: true,
                                        fontSize: '40',
                                        fontWeight: 'bold'
                                    }
                                },
                                labelLine: {
                                    show: false
                                },
                                data: this.state.data
                            }
                        ]
                    };

                    option3 && myChart3.setOption(option3);
                }
            })
        }
    }

    render () {
        if(this.state.data.length === 0) return <Empty/>;
        else return <div id={'cityChart'} style={{height:'400px'}}/>;
    }
}

export default CityChart;