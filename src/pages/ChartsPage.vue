<template>
  <div class="q-ma-lg q-pt-md">
    <div class="row q-col-gutter-lg">
      <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
        <q-card flat class="shadow_custom">
          <q-card-section class="row">
            <div class="text-grey-7 text-h6 col-12">Area Chart</div>
          </q-card-section>
          <q-card-section class="q-pt-sm q-px-none">
            <ECharts
              style="height: 400px"
              :option="chart_1"
              :resizable="true"
              autoresize
            />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
        <q-card flat class="shadow_custom">
          <q-card-section class="row">
            <div class="text-grey-7 text-h6 col-12">Line Chart</div>
          </q-card-section>
          <q-card-section class="q-pt-sm q-px-none">
            <ECharts
              style="height: 320px"
              :option="chart_2"
              :resizable="true"
              autoresize
            />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
        <q-card flat class="shadow_custom">
          <q-card-section class="row">
            <div class="text-grey-7 text-h6 col-12">Bar Chart</div>
          </q-card-section>
          <q-card-section class="q-pt-sm q-px-none">
            <ECharts
              style="height: 320px"
              :option="chart_3"
              :resizable="true"
              autoresize
            />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
        <q-card flat class="shadow_custom">
          <q-card-section class="row">
            <div class="text-grey-7 text-h6 col-12">Stacked Bar Chart</div>
          </q-card-section>
          <q-card-section class="q-pt-sm q-px-none">
            <ECharts
              style="height: 320px"
              :option="chart_4"
              :resizable="true"
              autoresize
            />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
        <q-card flat class="shadow_custom">
          <q-card-section class="row">
            <div class="text-grey-7 text-h6 col-12">Scatter Plot Chart</div>
          </q-card-section>
          <q-card-section class="q-pt-sm q-px-none">
            <ECharts
              style="height: 320px"
              :option="chart_5"
              :resizable="true"
              autoresize
            />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
        <q-card flat class="shadow_custom">
          <q-card-section class="row">
            <div class="text-grey-7 text-h6 col-12">Pie Chart</div>
          </q-card-section>
          <q-card-section class="q-pt-sm q-px-none">
            <ECharts
              style="height: 320px"
              :option="chart_6"
              :resizable="true"
              autoresize
            />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
        <q-card flat class="shadow_custom">
          <q-card-section class="row">
            <div class="text-grey-7 text-h6 col-12">Donut Chart</div>
          </q-card-section>
          <q-card-section class="q-pt-sm q-px-none">
            <ECharts
              style="height: 320px"
              :option="chart_7"
              :resizable="true"
              autoresize
            />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import ECharts from 'vue-echarts';
import * as echarts from 'echarts/core';
import { LineChart, BarChart, PieChart, ScatterChart } from 'echarts/charts';
import {
  GridComponent,
  MarkPointComponent,
  TooltipComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  LineChart,
  BarChart,
  PieChart,
  ScatterChart,
  GridComponent,
  CanvasRenderer,
  MarkPointComponent,
  TooltipComponent,
]);

export default defineComponent({
  components: {
    ECharts,
  },
  setup() {
    return {
      chart_1: ref({
        color: ['#80FFA5', '#00DDFF', '#37A2FF', '#FF0087', '#FFBF00'],
        title: {
          text: 'Gradient Stacked Area Chart',
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985',
            },
          },
        },
        legend: {
          data: ['Line 1', 'Line 2', 'Line 3', 'Line 4', 'Line 5'],
        },
        toolbox: {
          feature: {
            saveAsImage: {},
          },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '3%',
          containLabel: true,
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          },
        ],
        yAxis: [
          {
            type: 'value',
          },
        ],
        series: [
          {
            name: 'Line 1',
            type: 'line',
            stack: 'Total',
            smooth: true,
            lineStyle: {
              width: 0,
            },
            showSymbol: false,
            areaStyle: {
              opacity: 0.8,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: 'rgb(128, 255, 165)',
                },
                {
                  offset: 1,
                  color: 'rgb(1, 191, 236)',
                },
              ]),
            },
            emphasis: {
              focus: 'series',
            },
            data: [140, 232, 101, 264, 90, 340, 250],
          },
          {
            name: 'Line 2',
            type: 'line',
            stack: 'Total',
            smooth: true,
            lineStyle: {
              width: 0,
            },
            showSymbol: false,
            areaStyle: {
              opacity: 0.8,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: 'rgb(0, 221, 255)',
                },
                {
                  offset: 1,
                  color: 'rgb(77, 119, 255)',
                },
              ]),
            },
            emphasis: {
              focus: 'series',
            },
            data: [120, 282, 111, 234, 220, 340, 310],
          },
          {
            name: 'Line 3',
            type: 'line',
            stack: 'Total',
            smooth: true,
            lineStyle: {
              width: 0,
            },
            showSymbol: false,
            areaStyle: {
              opacity: 0.8,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: 'rgb(55, 162, 255)',
                },
                {
                  offset: 1,
                  color: 'rgb(116, 21, 219)',
                },
              ]),
            },
            emphasis: {
              focus: 'series',
            },
            data: [320, 132, 201, 334, 190, 130, 220],
          },
          {
            name: 'Line 4',
            type: 'line',
            stack: 'Total',
            smooth: true,
            lineStyle: {
              width: 0,
            },
            showSymbol: false,
            areaStyle: {
              opacity: 0.8,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: 'rgb(255, 0, 135)',
                },
                {
                  offset: 1,
                  color: 'rgb(135, 0, 157)',
                },
              ]),
            },
            emphasis: {
              focus: 'series',
            },
            data: [220, 402, 231, 134, 190, 230, 120],
          },
          {
            name: 'Line 5',
            type: 'line',
            stack: 'Total',
            smooth: true,
            lineStyle: {
              width: 0,
            },
            showSymbol: false,
            label: {
              show: true,
              position: 'top',
            },
            areaStyle: {
              opacity: 0.8,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: 'rgb(255, 191, 0)',
                },
                {
                  offset: 1,
                  color: 'rgb(224, 62, 76)',
                },
              ]),
            },
            emphasis: {
              focus: 'series',
            },
            data: [220, 302, 181, 234, 210, 290, 150],
          },
        ],
      }),
      chart_2: ref({
        xAxis: {
          type: 'category',
          data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
        },
        yAxis: {
          type: 'value',
          splitLine: {
            show: false,
          },
        },
        tooltip: {
          show: true,
          trigger: 'axis',
        },
        grid: {
          top: 30,
          left: 40,
          right: 40,
        },
        series: [
          {
            name: 'Last Month',
            data: [20, 54, 20, 38, 22, 28, 16, 19],
            type: 'line',
            smooth: true,
            symbolSize: 0,
            lineStyle: {
              color: '#d7d7d7',
              width: 3.8,
              type: [10, 7],
            },
          },
          {
            name: 'This Month',
            data: [20, 32, 22, 65, 40, 46, 34, 70],
            type: 'line',
            smooth: true,
            symbolSize: 0,
            lineStyle: {
              color: '#8082ff',
              width: 3.8,
              shadowColor: '#f4f5ff',
              shadowBlur: 3,
              shadowOffsetY: 15,
            },
          },
        ],
      }),
      chart_3: ref({
        xAxis: {
          type: 'category',
          data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
        },
        yAxis: {
          type: 'value',
          splitLine: {
            show: false,
          },
        },
        tooltip: {
          show: true,
          trigger: 'axis',
        },
        grid: {
          top: 30,
          left: 40,
          right: 40,
        },
        series: [
          {
            name: 'Last Month',
            data: [20, 54, 20, 38, 22, 28, 16, 19],
            type: 'bar',
            smooth: true,
            symbolSize: 0,
            itemStyle: {
              color: '#d3b0ff',
            },
          },
          {
            name: 'This Month',
            data: [20, 32, 22, 65, 40, 46, 34, 70],
            type: 'bar',
            smooth: true,
            symbolSize: 0,
            itemStyle: {
              color: '#8082ff',
            },
          },
        ],
      }),
      chart_4: ref({
        xAxis: {
          type: 'category',
          data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        },
        yAxis: {
          type: 'value',
          splitLine: {
            show: false,
          },
        },
        tooltip: {
          show: true,
          trigger: 'axis',
        },
        grid: {
          top: 30,
          left: 40,
          right: 40,
        },
        series: [
          {
            name: 'Product A',
            data: [75, 50, 55, 60, 50, 82, 60],
            type: 'bar',
            stack: true,
            barWidth: '20%',
            showGrid: false,
            itemStyle: {
              borderRadius: [50, 50, 50, 50],
              color: '#ff3e1d',
            },
          },
          {
            name: 'Product B',
            data: [25, 29, 32, 35, 40, 18, 30],
            type: 'bar',
            stack: true,
            showGrid: false,
            barWidth: '20%',
            itemStyle: {
              borderRadius: [50, 50, 50, 50],
              color: '#445971',
            },
          },
        ],
      }),
      chart_5: ref({
        xAxis: {},
        yAxis: {
          splitLine: {
            show: false,
          },
          axisLine: {
            show: false,
          },
        },
        grid: {
          top: 30,
          left: 40,
          right: 40,
        },
        series: [
          {
            color: 'rgb(1, 191, 236)',
            symbolSize: 20,
            data: [
              [10.0, 8.04],
              [8.07, 6.95],
              [13.0, 7.58],
              [9.05, 8.81],
              [11.0, 8.33],
              [14.0, 7.66],
              [13.4, 6.81],
              [10.0, 6.33],
              [14.0, 8.96],
              [12.5, 6.82],
              [9.15, 7.2],
              [11.5, 7.2],
              [3.03, 4.23],
              [12.2, 7.83],
              [2.02, 4.47],
              [1.05, 3.33],
              [4.05, 4.96],
              [6.03, 7.24],
              [12.0, 6.26],
              [12.0, 8.84],
              [7.08, 5.82],
              [5.02, 5.68],
            ],
            type: 'scatter',
          },
        ],
      }),
      chart_6: ref({
        title: {
          text: 'Customized Pie',
          left: 'center',
          top: 20,
        },
        tooltip: {
          trigger: 'item',
        },
        visualMap: {
          show: false,
          min: 80,
          max: 600,
          inRange: {
            colorLightness: [0, 1],
          },
        },
        series: [
          {
            name: 'Access From',
            type: 'pie',
            radius: '55%',
            center: ['50%', '50%'],
            data: [
              { value: 335, name: 'Direct' },
              { value: 310, name: 'Email' },
              { value: 274, name: 'Union Ads' },
              { value: 235, name: 'Video Ads' },
              { value: 400, name: 'Search Engine' },
            ].sort(function (a, b) {
              return a.value - b.value;
            }),
            roseType: 'radius',
            labelLine: {
              smooth: 0.2,
              length: 10,
              length2: 20,
            },
            animationType: 'scale',
            animationEasing: 'elasticOut',
          },
        ],
      }),
      chart_7: ref({
        tooltip: {
          trigger: 'item',
        },
        legend: {
          top: '5%',
          left: 'center',
        },
        series: [
          {
            name: 'Access From',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2,
            },
            label: {
              show: false,
              position: 'center',
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '40',
                fontWeight: 'bold',
              },
            },
            labelLine: {
              show: false,
            },
            data: [
              { value: 1048, name: 'Search Engine' },
              { value: 735, name: 'Direct' },
              { value: 580, name: 'Email' },
              { value: 484, name: 'Union Ads' },
              { value: 300, name: 'Video Ads' },
            ],
          },
        ],
      }),
    };
  },
});
</script>
