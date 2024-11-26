<script lang="ts" setup>
import { onMounted, onBeforeUnmount, watch, ref } from 'vue';
import ECharts from 'vue-echarts';
import * as echarts from 'echarts/core';
import { LineChart, BarChart, PieChart, GaugeChart } from 'echarts/charts';
import {
  GridComponent,
  MarkPointComponent,
  TooltipComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { useReportingStore } from 'stores/reporting';
import { useAuthStore } from 'stores/auth';
import { useI18n } from 'vue-i18n';

const reportingStore = useReportingStore();
const authStore = useAuthStore();
const i18n = useI18n();

echarts.use([
  LineChart,
  BarChart,
  PieChart,
  GaugeChart,
  GridComponent,
  CanvasRenderer,
  MarkPointComponent,
  TooltipComponent,
]);

function formatCurrencyIntl(num: number) {
  return new Intl.NumberFormat(navigator.language, {
    style: 'currency',
    currency: 'EUR',
  }).format(num);
}

function formatNumberIntl(num: number) {
  return new Intl.NumberFormat(navigator.language, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

const total_revenue_options = ref({
  xAxis: {
    type: 'category',
    data: [],
    axisTick: {
      show: false,
    },
    axisLine: {
      show: false,
    },
    axisLabel: {
      formatter: function (value: string | number | Date) {
        const date = new Date(value);
        return new Intl.DateTimeFormat(navigator.language, { month: 'short' })
          .format(date)
          .toUpperCase();
      },
    },
  },
  yAxis: [
    {
      type: 'value',
      splitLine: {
        show: true,
      },
      axisTick: {
        show: false,
      },
      alignTicks: true,
      axisLine: {
        show: false,
      },
      axisLabel: {
        show: false,
      },
    },
    {
      type: 'value',
      splitLine: {
        show: true,
      },
      alignTicks: true,
      axisTick: {
        show: false,
      },
      axisLine: {
        show: false,
      },
      axisLabel: {
        show: false,
      },
    },
  ],
  grid: {
    top: 20,
    bottom: 20,
    left: 0,
    right: '0',
  },
  tooltip: {
    show: true,
    trigger: 'axis',
    formatter: function (
      params: {
        axisValueLabel: string;
        marker: string;
        seriesName: string;
        value: number | string;
      }[]
    ) {
      const locale = navigator.language;

      // Error handling for date
      const date = new Date(params[0].axisValueLabel);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }

      const numberFormatter = new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });

      let res = `<b>${new Intl.DateTimeFormat(locale, { month: 'long' }).format(
        date
      )}</b><br/>`;

      params.forEach((param) => {
        res += `${param.marker} ${param.seriesName}: ${numberFormatter.format(
          Number(param.value)
        )}<br/>`;
      });

      return res;
    },
  },
  series: [
    {
      name: i18n.t('summary.unconfirmedCount'),
      data: [],
      type: 'bar',
      stack: false,
      barWidth: '15%',
      showGrid: false,
      itemStyle: {
        borderRadius: [2, 2, 0, 0],
        color: 'rgba(105, 122, 140, 0.35)',
      },
    },
    {
      name: i18n.t('summary.confirmedCount'),
      data: [],
      type: 'bar',
      stack: true,
      barWidth: '15%',
      showGrid: false,
      itemStyle: {
        borderRadius: [0, 0, 0, 0],
      },
    },
    {
      name: i18n.t('summary.paidCount'),
      data: [],
      type: 'bar',
      stack: true,
      barWidth: '15%',
      showGrid: false,
      itemStyle: {
        borderRadius: [0, 0, 0, 0],
        color: '#00a8a4',
      },
    },
    {
      name: i18n.t('summary.rejectedCount'),
      data: [],
      type: 'bar',
      stack: true,
      barWidth: '15%',
      showGrid: false,
      itemStyle: {
        borderRadius: [2, 2, 0, 0],
        color: 'rgba(193, 0, 21, .5)',
      },
    },
    {
      name: i18n.t('overallClicks'),
      data: [],
      yAxisIndex: 1,
      type: 'line',
      smooth: false,
      stack: false,
      showGrid: false,
      itemStyle: {},
    },
  ],
});

const revenue_option = ref({
  xAxis: {
    type: 'category',
    data: [],
    axisTick: {
      show: false,
    },
    axisLine: {
      show: false,
    },
  },
  yAxis: {
    type: 'value',
    splitLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    axisLine: {
      show: false,
    },
    axisLabel: {
      show: false,
    },
  },
  grid: {
    top: 0,
    left: '0',
    right: '0',
  },
  tooltip: {
    show: true,
    trigger: 'axis',
    formatter: function (
      params: {
        axisValueLabel: string;
        marker: string;
        seriesName: string;
        value: number | string;
      }[]
    ) {
      let res = `<b>${params[0].axisValueLabel}</b><br/>`;

      params.forEach((param) => {
        res += `${param.marker} ${param.seriesName}: ${new Intl.NumberFormat(
          navigator.language,
          {
            style: 'currency',
            currency: 'EUR',
          }
        ).format(param.value)}<br/>`;
      });

      return res;
    },
  },
  series: [
    {
      name: 'Auszahlung',
      data: [],
      type: 'bar',
      stack: true,
      barWidth: '70%',
      showGrid: false,
      itemStyle: {
        borderRadius: [2, 2, 2, 2],
        color: '#00a8a4',
      },
    },
  ],
});

const growth_options = ref({
  tooltip: {
    formatter: '{b}: {c}%',
  },
  grid: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  series: [
    {
      title: {
        color: 'rgb(117, 117, 117)',
      },
      type: 'gauge',
      color: '#00a8a4',
      progress: {
        show: true,
        width: 18,
      },
      detail: {
        valueAnimation: true,
        formatter: '{value}%',
        offsetCenter: [2, '50%'],
        color: '#ccd1de',
      },
      pointer: {
        show: false,
      },
      splitLine: {
        show: false,
      },
      axisLine: {
        lineStyle: {
          width: 18,
        },
      },
      axisLabel: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      data: [
        {
          value: reportingStore?.payoutSumShare ?? 0,
          name: i18n.t('payout'),
        },
      ],
    },
  ],
});

watch(
  () => reportingStore.selectedMonth,
  () => {
    reportingStore.getSelectedMonthData().then(() => {
      growth_options.value.series[0].data[0].value = Number(
        formatNumberIntl(reportingStore.payoutSumShare)
      );
    });
  }
);

watch(
  () => reportingStore.chartData,
  () => {
    if (revenue_option.value) {
      if (revenue_option.value.xAxis) {
        //(revenue_option.value.xAxis.data as string[]) = reportingStore.topPayoutMarkets?.map(market => market.market.toUpperCase());
        (revenue_option.value.xAxis.data as string[]) =
          reportingStore.topPayoutMarkets?.map((market) =>
            market.market.toUpperCase()
          ) ?? [];
        (revenue_option.value.series[0].data as number[]) =
          reportingStore.topPayoutMarkets?.map((market) => market.payout) ?? [];
      }
    }

    if (total_revenue_options.value) {
      if (total_revenue_options.value.xAxis) {
        (total_revenue_options.value.xAxis.data as string[]) =
          reportingStore.chartData.categories;
      }
      if (total_revenue_options.value.series) {
        if (total_revenue_options.value.series[0]) {
          (total_revenue_options.value.series[0].data as number[]) =
            reportingStore.chartData.openCountSum;
        }
        if (total_revenue_options.value.series[1]) {
          (total_revenue_options.value.series[1].data as number[]) =
            reportingStore.chartData.confirmedCountSum;
        }
        if (total_revenue_options.value.series[2]) {
          (total_revenue_options.value.series[2].data as number[]) =
            reportingStore.chartData.paidCountSum;
        }
        if (total_revenue_options.value.series[3]) {
          (total_revenue_options.value.series[3].data as number[]) =
            reportingStore.chartData.rejectedCountSum;
        }
        if (total_revenue_options.value.series[4]) {
          (total_revenue_options.value.series[4].data as number[]) =
            reportingStore.chartData.incomingCountSum;
        }
      }
    }
  }
);

const loadData = (done: any) => {
  reportingStore.getSummary().then(() => {
    reportingStore.getCountries().then(() => {
      reportingStore.setMarketList();
      reportingStore.selectedMarket = reportingStore.marketList.filter(
        (obj) =>
          obj.alpha2Code ===
          (reportingStore.topClickMarkets &&
          reportingStore.topClickMarkets.length > 0
            ? reportingStore.topClickMarkets[0].market
            : 'us')
      )[0];
      if (done) {
        done();
      }
    });
  });
};
onMounted(() => {
  loadData(null);
});

onBeforeUnmount(() => {
  reportingStore.payoutSumShare = 0;
});

const marketCols = [
  {
    name: 'market',
    label: i18n.t('market'),
    align: 'left',
    field: 'market',
  },
  {
    name: 'clicks',
    label: i18n.t('summary.incomingCount'),
    align: 'right',
    field: 'clicks',
    sortable: true,
  },
  {
    name: 'rejectedCount',
    label: i18n.t('summary.rejectedCount'),
    align: 'right',
    field: 'rejectedCount',
    sortable: true,
  },
  {
    name: 'confirmedAmount',
    label: i18n.t('summary.confirmedAmount'),
    align: 'right',
    field: 'confirmedAmount',
    sortable: true,
  },
  {
    name: 'openAmount',
    label: i18n.t('summary.openAmount'),
    align: 'right',
    field: 'openAmount',
    sortable: true,
  },
  {
    name: 'payout',
    label: i18n.t('summary.paidAmount'),
    align: 'right',
    field: 'payout',
    sortable: true,
  },
];
</script>

<template>
  <q-pull-to-refresh :disable="!$q.platform.is.mobile" @refresh="loadData">
    <div class="q-ma-lg q-pt-md">
      <div class="row q-col-gutter-lg">
        <div
          class="col-lg-8 col-md-8 col-sm-12 col-xs-12"
          :style="$q.screen.gt.lg ? 'height: 212px' : ''"
        >
          <q-card
            style="height: 100%"
            flat
            class="shadow_custom q-pa-none q-ma-none"
          >
            <q-card-section class="row" style="width: 100%">
              <div class="row" style="width: 100%">
                <div class="col-xs-12">
                  <q-badge
                    v-if="authStore.user.active"
                    color="positive"
                    class="float-right q-pa-sm text-weight-bold"
                  >
                    {{ $t('accountStatusActive') }}
                  </q-badge>
                  <q-badge
                    v-else
                    color="negative"
                    class="float-right q-pa-sm text-weight-bold"
                  >
                    {{ $t('accountStatusInactive') }}
                  </q-badge>
                  <q-badge
                    v-if="
                      authStore.user?.roles[0]?.name === 'admin' &&
                      authStore.user.hasOpenRequests
                    "
                    color="warning"
                    class="float-right q-pa-sm text-weight-bold q-mx-sm"
                  >
                    {{ $t('openRequests') }}:
                    {{ authStore.user.hasOpenRequests }}
                  </q-badge>
                  <div class="text-h6 text-primary">
                    {{ $t('greeting') }}
                    {{ authStore.user?.user_settings?.firstname }}
                    {{ authStore.user?.user_settings?.lastname }},
                  </div>
                  <div v-if="authStore.user?.roles[0]?.name === 'admin'">
                    <p
                      v-if="authStore.user.hasOpenRequests"
                      class="q-mt-md text-body1"
                    >
                      {{ $t('adminInfo') }}
                    </p>
                    <p v-else class="q-mt-md text-body1">
                      {{ $t('adminInfoNoRequests') }}
                    </p>
                    <q-btn
                      color="primary"
                      to="/users"
                      :label="$t('nav.userManagement')"
                    ></q-btn>
                  </div>
                  <div v-else>
                    <p v-if="!authStore.user.active" class="q-mt-md text-body1">
                      {{ $t('accountInfoInactive') }}
                    </p>
                    <p v-else class="q-mt-md text-body1">
                      {{ $t('accountInfo') }}
                    </p>
                    <q-btn
                      v-if="!authStore.user.active"
                      outline
                      color="primary"
                      to="/settings"
                      :label="$t('completeProfileButton')"
                    ></q-btn>
                    <div v-else class="q-gutter-sm">
                      <q-btn
                        outline
                        color="primary"
                        to="/settings"
                        :label="$t('profileButton')"
                      ></q-btn>
                      <q-btn
                        flat
                        color="primary"
                        to="/api"
                        :label="$t('apiDocs')"
                      ></q-btn>
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>

            <q-inner-loading :showing="authStore.loading">
              <q-spinner color="primary" size="3em" />
            </q-inner-loading>
          </q-card>
        </div>

        <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
          <div class="row q-col-gutter-lg">
            <div
              style="height: 212px"
              class="col-lg-6 col-md-6 col-sm-12 col-xs-12"
            >
              <q-card
                style="height: 100%"
                flat
                class="shadow_custom q-pa-none q-ma-none"
              >
                <q-card-section class="row">
                  <div class="text-h6 col-12">
                    <q-icon size="lg" style="color: #6a6cff">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="21"
                        height="24"
                        viewBox="0 0 21 24"
                      >
                        <g
                          id="Money-Payments-Finance_Accounting_Billing_accounting-invoice"
                          data-name="Money-Payments-Finance / Accounting/Billing / accounting-invoice"
                          transform="translate(-589.5 -117)"
                        >
                          <g id="Group_9" data-name="Group 9">
                            <g id="accounting-invoice">
                              <path
                                id="Shape_69"
                                data-name="Shape 69"
                                d="M609.75,138.75a1.5,1.5,0,0,1-1.5,1.5h-16.5a1.5,1.5,0,0,1-1.5-1.5v-19.5a1.5,1.5,0,0,1,1.5-1.5h10.629a1.5,1.5,0,0,1,1.06.439l5.872,5.872a1.5,1.5,0,0,1,.439,1.06Z"
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                              />
                              <path
                                id="Shape_70"
                                data-name="Shape 70"
                                d="M609.75,125.25h-6a1.5,1.5,0,0,1-1.5-1.5v-6"
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                              />
                              <path
                                id="Shape_71"
                                data-name="Shape 71"
                                d="M593.642,126.344a2.221,2.221,0,0,0,1.858.875c1.139,0,2.063-.693,2.063-1.547s-.924-1.546-2.063-1.546-2.062-.693-2.062-1.548.923-1.547,2.062-1.547a2.221,2.221,0,0,1,1.858.875"
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                              />
                              <path
                                id="Shape_72"
                                data-name="Shape 72"
                                d="M595.5,127.219v1.031"
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                              />
                              <path
                                id="Shape_73"
                                data-name="Shape 73"
                                d="M595.5,120v1.031"
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                              />
                              <path
                                id="Rectangle-path_11"
                                data-name="Rectangle-path 11"
                                d="M593.25,131.75a.5.5,0,0,1,.5-.5h12.5a.5.5,0,0,1,.5.5v5a.5.5,0,0,1-.5.5h-12.5a.5.5,0,0,1-.5-.5Z"
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                              />
                              <path
                                id="Shape_74"
                                data-name="Shape 74"
                                d="M593.25,134.25h13.5"
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                              />
                              <path
                                id="Shape_75"
                                data-name="Shape 75"
                                d="M597.75,131.25v6"
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                              />
                              <path
                                id="Shape_76"
                                data-name="Shape 76"
                                d="M602.25,131.25v6"
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                              />
                            </g>
                          </g>
                        </g>
                      </svg>
                    </q-icon>
                  </div>
                  <div class="q-mt-md">
                    <span
                      class="q-mb-md block text-weight-medium text-capitalize"
                      >{{ $t('total') }} - {{ $t('confirmed') }}</span
                    >
                    <div
                      style="font-size: 30px"
                      class="text-weight-medium text-h5 col-12"
                    >
                      {{
                        formatCurrencyIntl(
                          reportingStore.totalConfirmedSum
                            ? reportingStore.totalConfirmedSum
                            : 0
                        )
                      }}
                    </div>
                    <div class="text-sm q-mt-sm">
                      <span class="text-green-4 text-weight-medium">
                        {{
                          formatNumberIntl(
                            reportingStore.totalOpenSum &&
                              reportingStore.totalOpenSum > 0 &&
                              reportingStore.totalConfirmedSum &&
                              reportingStore.totalConfirmedSum > 0
                              ? (reportingStore.totalConfirmedSum * 100) /
                                  (reportingStore.totalOpenSum +
                                    reportingStore.totalConfirmedSum)
                              : 0
                          )
                        }}% {{ $t('confirmed') }}
                      </span>
                      <span class="q-px-sm">&middot;</span>
                      <span class="text-red-4 text-weight-medium">
                        {{ formatNumberIntl(reportingStore.rejectionRate) }}%
                        {{ $t('rejected') }}
                      </span>
                    </div>
                  </div>
                </q-card-section>

                <q-inner-loading :showing="reportingStore.summaryLoading">
                  <q-spinner color="primary" size="3em" />
                </q-inner-loading>
              </q-card>
            </div>
            <div
              :style="$q.screen.gt.lg ? 'height: 212px' : ''"
              class="col-lg-6 col-md-6 col-sm-12 col-xs-12"
            >
              <q-card
                style="height: 100%"
                flat
                class="shadow_custom q-pa-none q-ma-none"
              >
                <q-card-section class="row">
                  <div class="text-h6 col-12">
                    <q-icon size="lg" style="color: #6a6cff">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="23.25"
                        height="24"
                        viewBox="0 0 23.25 24"
                      >
                        <g
                          id="Money-Payments-Finance_Cash-Payments_cash-payment-bill-3"
                          data-name="Money-Payments-Finance / Cash-Payments / cash-payment-bill-3"
                          transform="translate(-396.375 -1221)"
                        >
                          <g id="Group_141" data-name="Group 141">
                            <g id="cash-payment-bill-3">
                              <path
                                id="Shape_937"
                                data-name="Shape 937"
                                d="M403.875,1238.25h-5.25a1.5,1.5,0,0,1-1.5-1.5v-8.25a1.5,1.5,0,0,1,1.5-1.5h18.75a1.5,1.5,0,0,1,1.5,1.5v8.75"
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                              />
                              <path
                                id="Shape_938"
                                data-name="Shape 938"
                                d="M402.264,1240.54l.861,1.206v2.5"
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                              />
                              <path
                                id="Shape_939"
                                data-name="Shape 939"
                                d="M403.875,1225.71a1.5,1.5,0,0,0-3,0V1227"
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                              />
                              <path
                                id="Shape_940"
                                data-name="Shape 940"
                                d="M406.875,1227v-2.288a1.5,1.5,0,0,0-3,0V1227"
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                              />
                              <path
                                id="Shape_941"
                                data-name="Shape 941"
                                d="M409.875,1227v-3.75a1.5,1.5,0,0,0-3,0V1227"
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                              />
                              <path
                                id="Shape_942"
                                data-name="Shape 942"
                                d="M412.875,1227v-2.288a1.5,1.5,0,0,0-3,0v1.038"
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                              />
                              <path
                                id="Shape_943"
                                data-name="Shape 943"
                                d="M412.1,1244.25v-1a2.023,2.023,0,0,1,.771-1.6l2.229-1.8a2.026,2.026,0,0,0,.771-1.6v-4.531a1.479,1.479,0,0,0-1.446-1.469c-1.254,0-1.5,1.415-1.511,1.465l-.285,2.067a2,2,0,0,1-.952,1.453l-1.584.939a2.014,2.014,0,0,0-.972,1.737v1.339"
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                              />
                              <path
                                id="Shape_944"
                                data-name="Shape 944"
                                d="M405.579,1234.845a2.224,2.224,0,0,0,1.858.875c1.139,0,2.063-.693,2.063-1.547s-.924-1.546-2.063-1.546-2.062-.693-2.062-1.548.924-1.547,2.062-1.547a2.221,2.221,0,0,1,1.858.875"
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                              />
                              <path
                                id="Shape_945"
                                data-name="Shape 945"
                                d="M407.437,1235.72v1.031"
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                              />
                              <path
                                id="Shape_946"
                                data-name="Shape 946"
                                d="M407.437,1228.5v1.031"
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                              />
                            </g>
                          </g>
                        </g>
                      </svg>
                    </q-icon>
                  </div>
                  <div class="q-mt-md">
                    <span
                      class="q-mb-md block text-weight-medium text-capitalize"
                      >{{ $t('total') }} - {{ $t('paid') }}</span
                    >
                    <div
                      style="font-size: 30px"
                      class="text-weight-medium text-h5 col-12"
                    >
                      {{
                        formatCurrencyIntl(
                          reportingStore.totalPayoutSum
                            ? reportingStore.totalPayoutSum
                            : 0
                        )
                      }}
                    </div>
                    <span
                      class="text-sm q-mt-sm text-green-4 block text-weight-medium"
                    >
                      {{
                        formatNumberIntl(
                          reportingStore.totalPayoutSum &&
                            reportingStore.totalPayoutSum > 0 &&
                            reportingStore.totalConfirmedSum &&
                            reportingStore.totalConfirmedSum > 0
                            ? (reportingStore.totalPayoutSum * 100) /
                                (reportingStore.totalConfirmedSum +
                                  reportingStore.totalPayoutSum)
                            : 0
                        )
                      }}% {{ $t('paid') }}
                    </span>
                  </div>
                </q-card-section>

                <q-inner-loading :showing="reportingStore.summaryLoading">
                  <q-spinner color="primary" size="3em" />
                </q-inner-loading>
              </q-card>
            </div>
          </div>
        </div>
      </div>

      <div class="row q-mt-none q-col-gutter-lg">
        <div class="col-lg-8 box col-md-8 col-sm-12 col-xs-12">
          <div
            style="height: 100%; border-radius: 4px"
            class="row shadow_custom"
          >
            <div class="col-lg-8 col-md-8 col-sm-12 col-xs-12">
              <q-card
                flat
                class="full-height q-pa-none q-ma-none"
                :style="
                  $q.screen.gt.sm
                    ? { 'border-radius': '4px 0 0 4px' }
                    : { 'border-radius': '4px 4px 0 0' }
                "
              >
                <q-card-section class="row">
                  <div class="text-h6 col-12">{{ $t('sixMonthsChart') }}</div>
                  <!--              <span class="text-grey-6">Check out each column for more details</span>-->
                </q-card-section>
                <q-card-section class="q-pa-none">
                  <ECharts
                    style="height: 300px"
                    :option="total_revenue_options"
                    class="q-mt-md"
                    ref="totalRevenueChart"
                    :resizable="true"
                    autoresize
                  />
                </q-card-section>

                <q-inner-loading :showing="reportingStore.summaryLoading">
                  <q-spinner color="primary" size="3em" />
                </q-inner-loading>
              </q-card>
            </div>
            <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
              <q-card
                flat
                class="q-pa-none q-ma-none"
                style="height: 100%"
                :style="
                  $q.screen.gt.sm
                    ? {
                        'border-radius': '0 4px 4px 0',
                        'border-left': '1px solid lightgrey',
                      }
                    : { 'border-radius': '0 0 4px 4px' }
                "
              >
                <q-card-section class="row">
                  <div
                    class="text-grey-7 text-h6 col-12 text-primary text-center"
                  >
                    <q-select
                      style="width: 140px; margin: auto"
                      color="primary"
                      label-color="primary"
                      outlined
                      dense
                      option-value="id"
                      option-label="label"
                      v-model="reportingStore.selectedMonth"
                      :options="reportingStore.monthData"
                    />
                    <!-- @update:model-value="(options) => reportingStore.getSummary(options)" -->
                  </div>
                  <!--              <span class="text-grey-6">Check out each column for more details</span>-->
                </q-card-section>
                <q-card-section class="q-pa-none">
                  <ECharts
                    style="height: 220px"
                    :option="growth_options"
                    :resizable="true"
                    autoresize
                  />
                </q-card-section>
                <q-card-section
                  class="q-pt-none q-pb-md text-weight-medium text-body1 text-center"
                >
                  {{
                    formatCurrencyIntl(
                      reportingStore.selectedMonthDetails.paidAmount ?? 0
                    )
                  }}
                  {{ $t('paid') }}
                </q-card-section>
                <q-card-section class="text-body1 text-grey-7 q-pt-none">
                  <div class="row">
                    <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                      <q-list>
                        <q-item>
                          <q-item-section
                            style="min-width: auto; padding-right: 9px"
                            avatar
                          >
                            <q-icon
                              size="30px"
                              style="
                                color: #6a6cff;
                                background: #e7e7ff;
                                padding: 7px;
                                border-radius: 5px;
                              "
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="22.5"
                                height="24.002"
                                viewBox="0 0 22.5 24.002"
                              >
                                <g
                                  id="Money-Payments-Finance_Accounting_Billing_accounting-invoice-mail"
                                  data-name="Money-Payments-Finance / Accounting/Billing / accounting-invoice-mail"
                                  transform="translate(-540.75 -117)"
                                >
                                  <g id="Group_8" data-name="Group 8">
                                    <g id="accounting-invoice-mail">
                                      <path
                                        id="Shape_59"
                                        data-name="Shape 59"
                                        d="M559.5,129.88V119.25a1.5,1.5,0,0,0-1.5-1.5H546a1.5,1.5,0,0,0-1.5,1.5v10.63"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="1.5"
                                      />
                                      <path
                                        id="Shape_60"
                                        data-name="Shape 60"
                                        d="M561.284,128.465a.75.75,0,0,1,1.216.587v9.7a1.5,1.5,0,0,1-1.5,1.5H543a1.5,1.5,0,0,1-1.5-1.5v-9.7a.75.75,0,0,1,1.216-.587l7.431,5.894a3,3,0,0,0,3.706,0Z"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="1.5"
                                      />
                                      <path
                                        id="Shape_61"
                                        data-name="Shape 61"
                                        d="M555.808,132.808l2.942,2.942"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="1.5"
                                      />
                                      <path
                                        id="Shape_62"
                                        data-name="Shape 62"
                                        d="M548.192,132.808l-2.942,2.942"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="1.5"
                                      />
                                      <path
                                        id="Shape_63"
                                        data-name="Shape 63"
                                        d="M552.2,127.094a2.224,2.224,0,0,0,1.858.875c1.139,0,2.063-.693,2.063-1.547s-.921-1.546-2.059-1.546S552,124.183,552,123.328s.924-1.547,2.062-1.547a2.221,2.221,0,0,1,1.858.875"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="1.5"
                                      />
                                      <path
                                        id="Shape_64"
                                        data-name="Shape 64"
                                        d="M554.062,127.969V129"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="1.5"
                                      />
                                      <path
                                        id="Shape_65"
                                        data-name="Shape 65"
                                        d="M554.062,120.75v1.031"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="1.5"
                                      />
                                      <path
                                        id="Shape_66"
                                        data-name="Shape 66"
                                        d="M547.5,121.5H549"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="1.5"
                                      />
                                      <path
                                        id="Shape_67"
                                        data-name="Shape 67"
                                        d="M547.5,124.5H549"
                                        fill="none"
                                        stroke="currentColor0"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="1.5"
                                      />
                                      <path
                                        id="Shape_68"
                                        data-name="Shape 68"
                                        d="M547.5,127.5H549"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="1.5"
                                      />
                                    </g>
                                  </g>
                                </g>
                              </svg>
                            </q-icon>
                          </q-item-section>
                          <q-item-section>
                            <q-item-label
                              class="text-weight-medium"
                              style="font-size: 11px"
                              >{{ $t('unconfirmed') }}
                            </q-item-label>
                            <q-item-label class="text-weight-bold text-body2"
                              >{{
                                formatCurrencyIntl(
                                  reportingStore.selectedMonthDetails
                                    .openAmount ?? 0
                                )
                              }}
                            </q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </div>
                    <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                      <q-item>
                        <q-item-section
                          style="min-width: auto; padding-right: 9px"
                          avatar
                        >
                          <q-icon
                            size="30px"
                            style="
                              color: #03c3ec;
                              background: #d7f5fc;
                              padding: 7px;
                              border-radius: 5px;
                            "
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="21"
                              height="24"
                              viewBox="0 0 21 24"
                            >
                              <g
                                id="Money-Payments-Finance_Accounting_Billing_accounting-invoice"
                                data-name="Money-Payments-Finance / Accounting/Billing / accounting-invoice"
                                transform="translate(-589.5 -117)"
                              >
                                <g id="Group_9" data-name="Group 9">
                                  <g id="accounting-invoice">
                                    <path
                                      id="Shape_69"
                                      data-name="Shape 69"
                                      d="M609.75,138.75a1.5,1.5,0,0,1-1.5,1.5h-16.5a1.5,1.5,0,0,1-1.5-1.5v-19.5a1.5,1.5,0,0,1,1.5-1.5h10.629a1.5,1.5,0,0,1,1.06.439l5.872,5.872a1.5,1.5,0,0,1,.439,1.06Z"
                                      fill="none"
                                      stroke="currentColor"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                      stroke-width="1.5"
                                    />
                                    <path
                                      id="Shape_70"
                                      data-name="Shape 70"
                                      d="M609.75,125.25h-6a1.5,1.5,0,0,1-1.5-1.5v-6"
                                      fill="none"
                                      stroke="currentColor"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                      stroke-width="1.5"
                                    />
                                    <path
                                      id="Shape_71"
                                      data-name="Shape 71"
                                      d="M593.642,126.344a2.221,2.221,0,0,0,1.858.875c1.139,0,2.063-.693,2.063-1.547s-.924-1.546-2.063-1.546-2.062-.693-2.062-1.548.923-1.547,2.062-1.547a2.221,2.221,0,0,1,1.858.875"
                                      fill="none"
                                      stroke="currentColor"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                      stroke-width="1.5"
                                    />
                                    <path
                                      id="Shape_72"
                                      data-name="Shape 72"
                                      d="M595.5,127.219v1.031"
                                      fill="none"
                                      stroke="currentColor"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                      stroke-width="1.5"
                                    />
                                    <path
                                      id="Shape_73"
                                      data-name="Shape 73"
                                      d="M595.5,120v1.031"
                                      fill="none"
                                      stroke="currentColor"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                      stroke-width="1.5"
                                    />
                                    <path
                                      id="Rectangle-path_11"
                                      data-name="Rectangle-path 11"
                                      d="M593.25,131.75a.5.5,0,0,1,.5-.5h12.5a.5.5,0,0,1,.5.5v5a.5.5,0,0,1-.5.5h-12.5a.5.5,0,0,1-.5-.5Z"
                                      fill="none"
                                      stroke="currentColor"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                      stroke-width="1.5"
                                    />
                                    <path
                                      id="Shape_74"
                                      data-name="Shape 74"
                                      d="M593.25,134.25h13.5"
                                      fill="none"
                                      stroke="currentColor"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                      stroke-width="1.5"
                                    />
                                    <path
                                      id="Shape_75"
                                      data-name="Shape 75"
                                      d="M597.75,131.25v6"
                                      fill="none"
                                      stroke="currentColor"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                      stroke-width="1.5"
                                    />
                                    <path
                                      id="Shape_76"
                                      data-name="Shape 76"
                                      d="M602.25,131.25v6"
                                      fill="none"
                                      stroke="currentColor"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                      stroke-width="1.5"
                                    />
                                  </g>
                                </g>
                              </g>
                            </svg>
                          </q-icon>
                        </q-item-section>
                        <q-item-section>
                          <q-item-label
                            class="text-weight-medium"
                            style="font-size: 11px"
                            >{{ $t('confirmed') }}
                          </q-item-label>
                          <q-item-label class="text-weight-bold text-body2"
                            >{{
                              formatCurrencyIntl(
                                reportingStore.selectedMonthDetails
                                  .confirmedAmount ?? 0
                              )
                            }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </div>
                  </div>
                </q-card-section>

                <q-inner-loading :showing="reportingStore.summaryLoading">
                  <q-spinner color="primary" size="3em" />
                </q-inner-loading>
              </q-card>
            </div>
          </div>
        </div>

        <div class="col-lg-4 col-md-4 col-sm-12 col-xs-12">
          <div class="row q-col-gutter-lg">
            <div
              class="col-lg-6 col-md-6 col-sm-12 col-xs-12"
              :style="$q.screen.gt.md ? 'height: 212px' : ''"
            >
              <q-card
                style="height: 100%"
                flat
                class="shadow_custom q-pa-none q-ma-none"
              >
                <q-card-section class="row">
                  <div class="text-grey-7 text-h6 col-12">
                    <q-icon size="lg" style="color: #6a6cff">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <g
                          id="Business-Products_Business_cash-pin-radius"
                          data-name="Business-Products / Business / cash-pin-radius"
                          transform="translate(-587.998 -109.498)"
                        >
                          <g id="Group_9" data-name="Group 9">
                            <g id="cash-pin-radius">
                              <path
                                id="Shape_50"
                                data-name="Shape 50"
                                d="M606.4,126.891c2.927.58,4.844,1.547,4.844,2.642,0,1.776-5.037,3.215-11.25,3.215s-11.25-1.439-11.25-3.215c0-1.092,1.908-2.057,4.824-2.638"
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                              />
                              <path
                                id="Shape_51"
                                data-name="Shape 51"
                                d="M606.748,117c0,3.25-5.132,10.527-6.446,12.336a.375.375,0,0,1-.607,0c-1.314-1.809-6.447-9.086-6.447-12.336a6.75,6.75,0,0,1,13.5,0Z"
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                              />
                              <path
                                id="Shape_52"
                                data-name="Shape 52"
                                d="M601.819,114.748H599.2a1.342,1.342,0,0,0-.5,2.587l2.655.825a1.342,1.342,0,0,1-.5,2.588H597.7"
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                              />
                              <path
                                id="Shape_53"
                                data-name="Shape 53"
                                d="M599.944,114.748v-1.5"
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                              />
                              <path
                                id="Shape_54"
                                data-name="Shape 54"
                                d="M599.944,122.248v-1.5"
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                              />
                            </g>
                          </g>
                        </g>
                      </svg>
                    </q-icon>
                  </div>
                  <div class="q-mt-md">
                    <span
                      class="q-mb-md block text-weight-medium text-capitalize"
                      >{{ $t('topMarket') }} - {{ $t('payout') }}
                      {{
                        (reportingStore.topPayoutMarkets &&
                        reportingStore.topPayoutMarkets[0]
                          ? `(${reportingStore.topPayoutMarkets[0]?.market})`
                          : ''
                        ).toUpperCase()
                      }}</span
                    >
                    <div
                      style="font-size: 30px"
                      class="text-weight-medium text-h5 col-12"
                    >
                      {{
                        formatCurrencyIntl(
                          reportingStore.topPayoutMarkets &&
                            reportingStore.topPayoutMarkets[0]?.payout
                            ? reportingStore.topPayoutMarkets[0]?.payout
                            : 0
                        )
                      }}
                    </div>
                    <span
                      class="text-sm q-mt-sm text-green-4 block text-weight-medium"
                    >
                      {{
                        (reportingStore.topPayoutMarkets &&
                        reportingStore.topPayoutMarkets[0]?.payout &&
                        reportingStore.marketStats?.statistics
                          ? (reportingStore.topPayoutMarkets[0]?.payout * 100) /
                            reportingStore.marketStats?.statistics
                              ?.paidAmountSum
                          : 0
                        ).toFixed(2)
                      }}% {{ $t('share') }}
                    </span>
                  </div>
                </q-card-section>

                <q-inner-loading :showing="reportingStore.summaryLoading">
                  <q-spinner color="primary" size="3em" />
                </q-inner-loading>
              </q-card>
            </div>

            <div
              class="col-lg-6 col-md-6 col-sm-12 col-xs-12"
              :style="$q.screen.gt.md ? 'height: 212px' : ''"
            >
              <q-card
                style="height: 100%"
                flat
                class="shadow_custom q-pa-none q-ma-none"
              >
                <q-card-section class="row">
                  <div class="text-grey-7 text-h6 col-12">
                    <q-icon size="lg" style="color: #6a6cff">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="23.995"
                        viewBox="0 0 24 23.995"
                      >
                        <g
                          id="Interface-Essential_Select_cursor-double-click-2"
                          data-name="Interface-Essential / Select / cursor-double-click-2"
                          transform="translate(-399.005 -6603)"
                        >
                          <g id="Group_639" data-name="Group 639">
                            <g id="cursor-double-click-2">
                              <path
                                id="Shape_2734"
                                data-name="Shape 2734"
                                d="M409.566,6614.49l5.216,11.393a.682.682,0,0,0,1.253-.122l1.527-4.209,4.209-1.526a.683.683,0,0,0,.122-1.254l-11.388-5.216a.716.716,0,0,0-.939.934Z"
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                              />
                              <path
                                id="Shape_2735"
                                data-name="Shape 2735"
                                d="M420.728,6615q.027-.371.027-.75a10.5,10.5,0,1,0-10.5,10.5c.253,0,.5-.009.75-.026"
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                              />
                              <path
                                id="Shape_2736"
                                data-name="Shape 2736"
                                d="M416.066,6612.748a6,6,0,1,0-7.311,7.311"
                                fill="none"
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                              />
                            </g>
                          </g>
                        </g>
                      </svg>
                    </q-icon>
                  </div>
                  <div class="q-mt-md">
                    <span
                      class="q-mb-md block text-weight-medium text-capitalize"
                      >{{ $t('topMarket') }} - {{ $t('clicks') }}
                      {{
                        (reportingStore.topClickMarkets &&
                        reportingStore.topClickMarkets[0]
                          ? `(${reportingStore.topClickMarkets[0]?.market})`
                          : ''
                        ).toUpperCase()
                      }}</span
                    >
                    <div
                      style="font-size: 30px"
                      class="text-weight-medium text-h5 col-12"
                    >
                      {{
                        formatNumberIntl(
                          reportingStore.topClickMarkets &&
                            reportingStore.topClickMarkets[0]?.clicks
                            ? reportingStore.topClickMarkets[0]?.clicks
                            : 0
                        )
                      }}
                    </div>
                    <span
                      class="text-sm q-mt-sm text-green-4 block text-weight-medium"
                    >
                      {{
                        (reportingStore.topClickMarkets &&
                        reportingStore.topClickMarkets[0]?.clicks &&
                        reportingStore.marketStats?.statistics
                          ? (reportingStore.topClickMarkets[0]?.clicks * 100) /
                            reportingStore.marketStats?.statistics
                              ?.incomingCountSum
                          : 0
                        ).toFixed(2)
                      }}% {{ $t('share') }}
                    </span>
                  </div>
                </q-card-section>

                <q-inner-loading :showing="reportingStore.summaryLoading">
                  <q-spinner color="primary" size="3em" />
                </q-inner-loading>
              </q-card>
            </div>

            <!--          </div>-->

            <!--          <div class="row q-mt-xs q-col-gutter-lg">-->
            <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-card
                :style="$q.screen.gt.md ? 'height: 212px' : ''"
                flat
                class="shadow_custom q-pa-none q-ma-none"
              >
                <q-card-section>
                  <div class="">
                    <span class="text-h6 q-mb-none block text-weight-medium">{{
                      $t('projectDistribution')
                    }}</span>
                    <ECharts
                      style="height: 200px"
                      :option="revenue_option"
                      class=""
                      :resizable="true"
                      autoresize
                    />
                  </div>
                </q-card-section>

                <q-inner-loading :showing="reportingStore.summaryLoading">
                  <q-spinner color="primary" size="3em" />
                </q-inner-loading>
              </q-card>
            </div>
          </div>
        </div>
        <div class="col-xs-12">
          <div class="row q-col-gutter-lg">
            <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
              <q-card flat class="shadow_custom q-pa-none q-ma-none">
                <q-card-section class="row justify-between">
                  <div class="flex items-center">
                    <div class="block">
                      <div class="text-h6">{{ $t('projectOverview') }}</div>
                    </div>
                  </div>
                </q-card-section>

                <q-card-section class="row q-pa-none">
                  <q-table
                    style="max-width: 100%; width: 100%"
                    class="no-shadow"
                    :rows="reportingStore?.marketStats.markets ?? []"
                    :columns="marketCols as [] ?? []"
                    :rows-per-page-options="[10, 25, 50, 100]"
                    row-key="id"
                  >
                    <template v-slot:body="props">
                      <q-tr :props="props">
                        <q-td
                          v-for="col in props.cols"
                          :key="col.name"
                          :props="props"
                        >
                          <template v-if="col.name === 'market'">
                            <div class="flex items-center">
                              <img
                                v-if="
                                  reportingStore.getCountryObject(col.value)[0]
                                "
                                :src="
                                  reportingStore.getCountryObject(col.value)[0]
                                    .flag
                                "
                                style="width: 30px; height: auto"
                                class="q-mr-md"
                                alt="icon"
                              />
                              {{
                                reportingStore.getCountryObject(col.value)[0]
                                  ?.name ?? col.value
                              }}
                            </div>
                          </template>
                          <template
                            v-else-if="
                              col.name === 'clicks' ||
                              col.name === 'rejectedCount'
                            "
                          >
                            {{ formatNumberIntl(col.value) }}
                          </template>
                          <template v-else>
                            {{ formatCurrencyIntl(col.value) }}
                          </template>
                        </q-td>
                      </q-tr>
                    </template>
                  </q-table>
                </q-card-section>

                <q-inner-loading
                  :showing="
                    reportingStore.commissionsLoading ||
                    reportingStore.summaryLoading
                  "
                >
                  <q-spinner color="primary" size="3em" />
                </q-inner-loading>
              </q-card>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-pull-to-refresh>
</template>

<style lang="scss">
.box {
  height: 390px;
}
</style>

<style lang="scss" scoped>
.overlapping {
  border: 2px solid white;
  position: absolute;
}

.q-icon {
  color: var(--q-primary) !important;
}
</style>
