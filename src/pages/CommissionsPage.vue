<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { useReportingStore } from 'stores/reporting';

const reportingStore = useReportingStore();

function getStatusColor(status: string) {
  switch (status) {
    case 'rejected':
      return 'negative';
      break;
    case 'open':
      return 'warning';
      break;
    case 'paid':
      return 'positive';
      break;
    default:
      return 'primary';
  }
}

function formatCurrencyIntl(num: number) {
  return new Intl.NumberFormat(navigator.language, {
    style: 'currency',
    currency: 'EUR',
  }).format(num);
}

function formatDateIntl(date: string) {
  return Intl.DateTimeFormat(navigator.language, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date));
}

watch(
  () => reportingStore.selectedDate,
  () => {
    reportingStore.getCommissions();
  }
);

watch(
  () => reportingStore.onlyModified,
  () => {
    reportingStore.getCommissions();
  }
);

watch(
  () => reportingStore.selectedMarket,
  () => {
    reportingStore.getCommissions();
  }
);

onMounted(() => {
  reportingStore.getSummary().then(() => {
    if (!reportingStore.selectedDate) {
      const today = new Date();
      today.setDate(today.getDate() - 1);

      const formatter = new Intl.DateTimeFormat('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      reportingStore.selectedDate = formatter.format(today);
    }

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
      reportingStore.getCommissions();
    });
  });
});

const commissionFilter = ref('');

const commissionCols = [
  {
    name: 'clickDate',
    label: 'Click Datum',
    align: 'left',
    field: 'clickDate',
    sortable: true,
  },
  {
    name: 'modifiedDate',
    label: 'Änderungsdatum',
    align: 'left',
    field: 'modifiedDate',
    sortable: true,
  },
  {
    name: 'clickId',
    label: 'Click ID',
    align: 'left',
    field: 'clickId',
    sortable: true,
  },
  //  {name: 'commissionId', label: 'Commission ID', align: 'left', field: 'commissionId', sortable: true},
  {
    name: 'merchant',
    label: 'Händler',
    align: 'left',
    field: 'merchant',
    sortable: true,
  },
  //  {name: 'merchantId', label: 'Händler ID', align: 'left', field: 'merchantId', sortable: true},
  {
    name: 'placementId',
    label: 'Placement ID',
    align: 'left',
    field: 'placementId',
    sortable: true,
  },
  {
    name: 'placementId2',
    label: 'Placement ID #2',
    align: 'left',
    field: 'placementId2',
    sortable: true,
  },
  {
    name: 'status',
    label: 'Status',
    align: 'left',
    field: 'status',
    sortable: true,
  },
  {
    name: 'revenue',
    label: 'Umsatz',
    align: 'right',
    field: 'revenue',
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
                    {{
                      $t('commissionOverview') +
                      (reportingStore.selectedDate
                        ? `: ${reportingStore.selectedDate}`
                        : '')
                    }}
                  </div>
                  <div class="text-subtitle2 text-grey-6">
                    {{
                      reportingStore.commissions
                        ? reportingStore.commissions.length
                        : 0
                    }}
                    {{ $t('overallClicks') }}
                  </div>
                </div>
              </div>
              <div
                class="flex justify-end"
                :class="{ 'q-pt-sm': !$q.screen.gt.sm }"
              >
                <div class="flex q-gutter-md items-center">
                  <q-input
                    v-model="commissionFilter"
                    :placeholder="$t('searchTable')"
                    debounce="300"
                    outlined
                    dense
                  >
                    <template v-slot:append>
                      <q-icon
                        class="cursor-pointer"
                        @click="commissionFilter = ''"
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

                  <q-checkbox
                    dense
                    v-model="reportingStore.onlyModified"
                    :label="$t('onlyModified')"
                  />

                  <q-select
                    class="custom-select"
                    outlined
                    dense
                    option-value="alpha2Code"
                    option-label="name"
                    v-model="reportingStore.selectedMarket"
                    :options="reportingStore.marketList"
                  >
                    <template v-slot:prepend>
                      <img
                        v-if="reportingStore.selectedMarket.flag"
                        :src="reportingStore.selectedMarket.flag"
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

                  <q-input
                    dense
                    v-model="reportingStore.selectedDate"
                    style="max-width: 150px"
                    outlined
                    mask="##.##.####"
                    fill-mask
                  >
                    <template v-slot:append>
                      <q-icon class="cursor-pointer">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                        >
                          <g
                            id="Interface-Essential_Date_Calendar_calendar-3"
                            data-name="Interface-Essential / Date/Calendar / calendar-3"
                            transform="translate(-303.005 -2847)"
                          >
                            <g id="Group_266" data-name="Group 266">
                              <g id="calendar-3">
                                <path
                                  id="Rectangle-path_79"
                                  data-name="Rectangle-path 79"
                                  d="M303.755,2852.25a1.5,1.5,0,0,1,1.5-1.5h19.5a1.5,1.5,0,0,1,1.5,1.5v16.5a1.5,1.5,0,0,1-1.5,1.5h-19.5a1.5,1.5,0,0,1-1.5-1.5Z"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="1.5"
                                />
                                <path
                                  id="Shape_1209"
                                  data-name="Shape 1209"
                                  d="M303.755,2856.75h22.5"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="1.5"
                                />
                                <path
                                  id="Shape_1210"
                                  data-name="Shape 1210"
                                  d="M309.755,2853v-5.25"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="1.5"
                                />
                                <path
                                  id="Shape_1211"
                                  data-name="Shape 1211"
                                  d="M320.255,2853v-5.25"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="1.5"
                                />
                                <path
                                  id="Shape_1212"
                                  data-name="Shape 1212"
                                  d="M308.63,2860.5a.375.375,0,1,0,.375.375.375.375,0,0,0-.375-.375"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="1.5"
                                />
                                <path
                                  id="Shape_1213"
                                  data-name="Shape 1213"
                                  d="M308.63,2865.75a.375.375,0,1,0,.375.375.375.375,0,0,0-.375-.375"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="1.5"
                                />
                                <path
                                  id="Shape_1214"
                                  data-name="Shape 1214"
                                  d="M315.005,2860.5a.375.375,0,1,0,.375.375.375.375,0,0,0-.375-.375"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="1.5"
                                />
                                <path
                                  id="Shape_1215"
                                  data-name="Shape 1215"
                                  d="M315.005,2865.75a.375.375,0,1,0,.375.375.375.375,0,0,0-.375-.375"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="1.5"
                                />
                                <path
                                  id="Shape_1216"
                                  data-name="Shape 1216"
                                  d="M321.38,2860.5a.375.375,0,1,0,.375.375.375.375,0,0,0-.375-.375"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="1.5"
                                />
                                <path
                                  id="Shape_1217"
                                  data-name="Shape 1217"
                                  d="M321.38,2865.75a.375.375,0,1,0,.375.375.375.375,0,0,0-.375-.375"
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

                        <q-popup-proxy ref="qDateProxy">
                          <q-date
                            v-model="reportingStore.selectedDate"
                            minimal
                            mask="DD.MM.YYYY"
                            @input="this.$refs.qDate.hide()"
                            @update:model-value="$refs.qDateProxy.hide()"
                          ></q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
              </div>
            </q-card-section>

            <q-card-section class="row q-pa-none">
              <q-table
                style="max-width: 100%; width: 100%"
                class="no-shadow"
                :filter="commissionFilter"
                :rows="reportingStore?.commissions ?? []"
                :columns="commissionCols as [] ?? []"
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
                      <template
                        v-if="
                          col.name === 'clickDate' ||
                          col.name === 'modifiedDate'
                        "
                      >
                        {{ formatDateIntl(col.value) }}
                      </template>

                      <template v-else-if="col.name === 'revenue'">
                        {{ formatCurrencyIntl(col.value) }}
                      </template>

                      <template
                        v-else-if="
                          col.name === 'clickId' ||
                          col.name === 'placementId' ||
                          col.name === 'placementId2'
                        "
                      >
                        <div class="text-sm">{{ col.value }}</div>
                      </template>

                      <template v-else-if="col.name === 'status'">
                        <q-badge
                          class="q-pa-sm text-weight-bold"
                          :color="getStatusColor(col.value)"
                          :label="$t(col.value)"
                        />
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
