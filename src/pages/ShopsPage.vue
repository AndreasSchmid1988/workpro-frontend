<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { useReportingStore } from 'stores/reporting';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

import { copyToClipboard } from 'quasar';

const reportingStore = useReportingStore();
const $q = useQuasar();
const { t } = useI18n();

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

function formatDateIntl(date: string) {
  return Intl.DateTimeFormat(navigator.language, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date));
}

function getStatus(id: string) {
  if (!reportingStore.merchantsLoading) {
    reportingStore.getMerchantStatus(id);
  }
}

function toClipboard(text: string) {
  copyToClipboard(text)
    .then(() => {
      $q.notify({
        type: 'positive',
        message: t('clipboardSuccess'),
      });
    })
    .catch(() => {
      $q.notify({
        type: 'negative',
        message: t('clipboardError'),
      });
    });
}

watch(
  () => reportingStore.selectedMarket,
  () => {
    reportingStore.getMerchants();
  }
);

onMounted(() => {
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
      reportingStore.getMerchants();
    });
  });
});

const merchantFilter = ref('');

const merchantCols = [
  {
    name: 'id',
    label: 'Shop ID',
    align: 'left',
    field: 'id',
    sortable: true,
  },
  {
    name: 'domain',
    label: 'Domain',
    align: 'left',
    field: 'domain',
    sortable: true,
  },
  {
    name: 'status',
    required: true,
    label: 'Status',
    align: 'left',
    field: null,
    sortable: false,
  },
  {
    name: 'clickUrl',
    label: 'Click URL',
    align: 'left',
    field: 'clickUrl',
    sortable: true,
  },
  {
    name: 'actions',
    required: true,
    label: '',
    align: 'right',
    field: null,
    sortable: false,
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
                  <div class="text-h6">{{ $t('shopOverview') }}</div>
                  <div class="text-subtitle2 text-grey-6">
                    {{
                      formatNumberIntl(
                        reportingStore.merchants
                          ? reportingStore.merchants.length
                          : 0
                      )
                    }}
                    Shops
                  </div>
                </div>
              </div>
              <div
                class="flex justify-end"
                :class="{ 'q-pt-sm': !$q.screen.gt.sm }"
              >
                <div class="flex q-gutter-md items-center">
                  <q-input
                    v-model="merchantFilter"
                    :placeholder="$t('searchTable')"
                    debounce="300"
                    outlined
                    dense
                  >
                    <template v-slot:append>
                      <q-icon
                        class="cursor-pointer"
                        @click="merchantFilter = ''"
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
                </div>
              </div>
            </q-card-section>

            <q-card-section class="row q-pa-none">
              <q-table
                style="max-width: 100%; width: 100%"
                class="no-shadow"
                :filter="merchantFilter"
                :rows="reportingStore?.merchants ?? []"
                :columns="merchantCols as [] ?? []"
                :rows-per-page-options="[10, 5, 25]"
                row-key="id"
              >
                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td
                      v-for="col in props.cols"
                      :key="col.name"
                      :props="props"
                    >
                      <template v-if="col.name === 'clickDate'">
                        {{ formatDateIntl(col.value) }}
                      </template>

                      <template v-else-if="col.name === 'revenue'">
                        {{ formatCurrencyIntl(col.value) }}
                      </template>

                      <template v-else-if="col.name === 'clickUrl'">
                        <div @click="copyToClipboard(col.value)">
                          {{ col.value }}
                        </div>
                      </template>

                      <template v-else-if="col.name === 'actions'">
                        <q-btn
                          flat
                          round
                          @click="toClipboard(props.row.clickUrl)"
                          style="font-size: 0.7rem"
                        >
                          <q-icon>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                            >
                              <g
                                id="Interface-Essential_Copy_Paste_Copy_Paste"
                                data-name="Interface-Essential / Copy/Paste / Copy/Paste"
                                transform="translate(-207.005 -3887)"
                              >
                                <g id="Group_367" data-name="Group 367">
                                  <g id="copy-paste">
                                    <path
                                      id="Shape_1662"
                                      data-name="Shape 1662"
                                      d="M227.255,3895.25v-3a1.5,1.5,0,0,0-1.5-1.5h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                      stroke-width="1.5"
                                    />
                                    <path
                                      id="Shape_1663"
                                      data-name="Shape 1663"
                                      d="M213.255,3890.75h-4a1.5,1.5,0,0,0-1.5,1.5v16.5a1.5,1.5,0,0,0,1.5,1.5h6"
                                      fill="none"
                                      stroke="currentColor"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                      stroke-width="1.5"
                                    />
                                    <path
                                      id="Shape_1664"
                                      data-name="Shape 1664"
                                      d="M221.426,3891.737a.752.752,0,0,1-.712.513H214.3a.751.751,0,0,1-.712-.513l-1-3a.748.748,0,0,1,.712-.987h8.418a.75.75,0,0,1,.712.987Z"
                                      fill="none"
                                      stroke="currentColor"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                      stroke-width="1.5"
                                    />
                                    <path
                                      id="Rectangle-path_101"
                                      data-name="Rectangle-path 101"
                                      d="M218.255,3899.75a1.5,1.5,0,0,1,1.5-1.5h9a1.5,1.5,0,0,1,1.5,1.5v9a1.5,1.5,0,0,1-1.5,1.5h-9a1.5,1.5,0,0,1-1.5-1.5Z"
                                      fill="none"
                                      stroke="currentColor"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                      stroke-width="1.5"
                                    />
                                    <path
                                      id="Shape_1665"
                                      data-name="Shape 1665"
                                      d="M221.255,3901.25h6"
                                      fill="none"
                                      stroke="currentColor"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                      stroke-width="1.5"
                                    />
                                    <path
                                      id="Shape_1666"
                                      data-name="Shape 1666"
                                      d="M221.255,3904.25h6"
                                      fill="none"
                                      stroke="currentColor"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                      stroke-width="1.5"
                                    />
                                    <path
                                      id="Shape_1667"
                                      data-name="Shape 1667"
                                      d="M221.255,3907.25h2.25"
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

                          <q-tooltip
                            anchor="top middle"
                            self="bottom middle"
                            :offset="[0, 5]"
                          >
                            {{ $t('toClipboard') }}
                          </q-tooltip>
                        </q-btn>
                      </template>

                      <template v-else-if="col.name === 'status'">
                        {{ getStatus(props.row.id) }}
                        <!-- <div :id="props.row.statusObj.loading">-->
                        <div v-if="props.row.statusObj.loading">
                          <q-spinner color="primary" size="2em" />
                        </div>
                        <div v-else>
                          <!--  <q-badge v-if="props.row.statusObj.status === 'true'" >{{ $t('active') }}</q-badge>-->
                          <q-badge
                            v-if="props.row.statusObj.status === 'true'"
                            class="text-weight-bold"
                            color="positive"
                          >
                            {{ $t('active') }}
                          </q-badge>
                          <q-badge
                            v-if="props.row.statusObj.status === 'false'"
                            class="text-weight-bold"
                            color="negative"
                          >
                            {{ $t('inactive') }}
                          </q-badge>
                        </div>
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
                reportingStore.summaryLoading || reportingStore.merchantsLoading
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
