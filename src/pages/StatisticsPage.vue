<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { useReportingStore } from 'stores/reporting';
import { useI18n } from 'vue-i18n';

const reportingStore = useReportingStore();

const tableData = ref(null);
const i18n = useI18n();

function getLocalizedMonths() {
  const months = [];
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();

  for (let month = 0; month < currentMonth + 1; month++) {
    const date = new Date(2020, month, 1);
    months.push({
      name: new Intl.DateTimeFormat(navigator.language, {
        month: 'long',
      }).format(date),
      value: month + 1,
    });
  }
  return months;
}

function getLastTwoYears() {
  return [new Date().getFullYear(), new Date().getFullYear() - 1];
}

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

function filterTable() {
  if (
    reportingStore.statistics_selectedMarket &&
    reportingStore.statistics?.data
  ) {
    tableData.value = reportingStore.statistics?.data.filter(
      (item) =>
        item.market.toLowerCase() ===
        reportingStore.statistics_selectedMarket?.alpha2Code.toLowerCase()
    );
  } else {
    tableData.value = reportingStore.statistics?.data;
  }
}

watch(
  () => reportingStore.statistics_selectedMonth,
  () => {
    reportingStore.getStatistics().then(() => {
      tableData.value = reportingStore.statistics?.data;
    });
  }
);

watch(
  () => reportingStore.statistics_selectedYear,
  () => {
    reportingStore.getStatistics().then(() => {
      tableData.value = reportingStore.statistics?.data;
    });
  }
);

onMounted(() => {
  const months = getLocalizedMonths();

  if (!reportingStore.statistics_selectedMonth && months) {
    reportingStore.statistics_selectedMonth = months[0];
  }

  reportingStore.getCountries().then(() => {
    reportingStore.getStatistics().then(() => {
      tableData.value = reportingStore.statistics?.data;
    });
  });
});

const statisticsFilter = ref('');

const pagination = ref({
  sortBy: 'merchantName',
  descending: false,
});

const statisticsCols = [
  {
    name: 'merchantName',
    label: i18n.t('shop'),
    align: 'left',
    field: 'merchantName',
    sortable: true,
  },
  {
    name: 'market',
    label: i18n.t('market'),
    align: 'left',
    field: 'market',
    sortable: true,
  },
  {
    name: 'incomingCount',
    label: i18n.t('summary.incomingCount'),
    align: 'right',
    field: 'incomingCount',
    sortable: true,
  },
  //  {name: 'commissionId', label: 'Commission ID', align: 'left', field: 'commissionId', sortable: true},
  {
    name: 'openCount',
    label: i18n.t('summary.openCount'),
    align: 'right',
    field: 'openCount',
    sortable: true,
  },
  //  {name: 'merchantId', label: 'Händler ID', align: 'left', field: 'merchantId', sortable: true},
  {
    name: 'openAmount',
    label: i18n.t('summary.openAmount'),
    align: 'right',
    field: 'openAmount',
    sortable: true,
  },
  {
    name: 'confirmedCount',
    label: i18n.t('summary.confirmedCount'),
    align: 'right',
    field: 'confirmedCount',
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
    name: 'paidCount',
    label: i18n.t('summary.paidCount'),
    align: 'right',
    field: 'paidCount',
    sortable: true,
  },
  {
    name: 'paidAmount',
    label: i18n.t('summary.paidAmount'),
    align: 'right',
    field: 'paidAmount',
    sortable: true,
  },
  {
    name: 'rejectedCount',
    label: i18n.t('summary.rejectedCount'),
    align: 'right',
    field: 'rejectedCount',
    sortable: true,
  },
];
</script>
<template>
  <q-page>
    <!-- content -->

    <div class="q-ma-lg q-pt-md">
      <div class="row q-col-gutter-lg">
        <div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
          <q-card flat class="shadow_custom q-pa-none q-ma-none">
            <q-card-section class="row justify-between">
              <div class="flex items-center">
                <div class="block">
                  <div class="text-h6">
                    {{ $t('nav.statistics') }}
                  </div>
                </div>
              </div>
              <div
                class="flex justify-end"
                :class="{ 'q-pt-sm': !$q.screen.gt.sm }"
              >
                <div class="flex q-gutter-md items-center">
                  <q-input
                    v-model="statisticsFilter"
                    :placeholder="$t('searchTable')"
                    debounce="300"
                    outlined
                    dense
                  >
                    <template v-slot:append>
                      <q-icon
                        class="cursor-pointer"
                        @click="statisticsFilter = ''"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          style="width: 15px; height: auto"
                        >
                          <g
                            id="Interface-Essential_Form-Validation_close"
                            data-name="Interface-Essential / Form-Validation / close"
                            transform="translate(-206.694 -4382.689)"
                          >
                            <g id="Group_395" data-name="Group 395">
                              <g id="close">
                                <path
                                  id="Shape_1765"
                                  data-name="Shape 1765"
                                  d="M207.755,4406.25l22.5-22.5"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="1.5"
                                />
                                <path
                                  id="Shape_1766"
                                  data-name="Shape 1766"
                                  d="M230.255,4406.25l-22.5-22.5"
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
                    </template>
                  </q-input>

                  <q-separator vertical :class="{ hidden: !$q.screen.gt.sm }" />

                  <q-select
                    v-if="reportingStore.statisticsCountries.length > 0"
                    class="custom-select"
                    outlined
                    dense
                    option-value="alpha2Code"
                    option-label="name"
                    :placeholder="$t('selectCountry')"
                    v-model="reportingStore.statistics_selectedMarket"
                    :options="reportingStore.statisticsCountries"
                    @update:model-value="filterTable"
                  >
                    <template v-slot:selected-item="scope">
                      <div v-if="scope.opt.alpha2Code === ''">
                        {{ $t('selectCountry') }}
                      </div>
                      <div v-else>
                        {{ scope.opt.name }}
                      </div>
                    </template>

                    <template v-slot:prepend>
                      <img
                        v-if="reportingStore.statistics_selectedMarket.flag"
                        :src="reportingStore.statistics_selectedMarket.flag"
                        style="width: 30px; height: auto"
                        alt="icon"
                      />
                    </template>

                    <template v-slot:option="scope">
                      <q-item v-bind="scope.itemProps">
                        <q-item-section avatar>
                          <img
                            v-if="scope.opt.flag"
                            :src="scope.opt.flag"
                            style="width: 30px; height: auto"
                            alt="icon"
                          />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ scope.opt.name }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>

                  <q-select
                    class="custom-select"
                    outlined
                    dense
                    option-value="value"
                    option-label="name"
                    v-model="reportingStore.statistics_selectedMonth"
                    :options="getLocalizedMonths()"
                  ></q-select>

                  <!-- Dropdown für die letzten 2 Jahre -->
                  <q-select
                    class="custom-select"
                    outlined
                    dense
                    v-model="reportingStore.statistics_selectedYear"
                    :options="getLastTwoYears()"
                  ></q-select>
                </div>
              </div>
            </q-card-section>

            <q-card-section class="row q-pa-none">
              <q-table
                style="max-width: 100%; width: 100%"
                class="no-shadow"
                :filter="statisticsFilter"
                :rows="tableData ?? []"
                :columns="statisticsCols as [] ?? []"
                :rows-per-page-options="[10, 25, 50, 100]"
                row-key="id"
                :pagination="pagination"
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
                            v-if="reportingStore.getCountryObject(col.value)[0]"
                            :src="
                              reportingStore.getCountryObject(col.value)[0].flag
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
                          col.name === 'openAmount' ||
                          col.name === 'confirmedAmount' ||
                          col.name === 'paidAmount'
                        "
                      >
                        {{ formatCurrencyIntl(col.value) }}
                      </template>
                      <template
                        v-else-if="
                          col.name === 'incomingCount' ||
                          col.name === 'rejectedCount' ||
                          col.name === 'openCount' ||
                          col.name === 'confirmedCount' ||
                          col.name === 'paidCount'
                        "
                      >
                        {{ formatNumberIntl(col.value) }}
                      </template>

                      <template v-else>
                        {{ col.value }}
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
  </q-page>
</template>
