<script lang="ts" setup>
import { ref, computed, onMounted, watch, onBeforeMount } from 'vue';
import { RequestProps, useOffersStore } from 'stores/offers';
import { useI18n } from 'vue-i18n';
import { QChip, QBtn } from 'quasar';

const offersStore = useOffersStore();
const { t } = useI18n();

// Status options for tabs
const offerStatusOptions = [
  { label: t('all') || 'All', value: 'all' },
  { label: t('offerStatuses.draft') || 'Draft', value: 'draft' },
  { label: t('offerStatuses.sent') || 'Sent', value: 'sent' },
  { label: t('offerStatuses.accepted') || 'Accepted', value: 'accepted' },
  { label: t('offerStatuses.declined') || 'Declined', value: 'declined' },
];

const selectedStatus = ref('all');

const statusCountsSafe = computed(() => ({
  draft: offersStore.statusCounts.draft ?? 0,
  sent: offersStore.statusCounts.sent ?? 0,
  accepted: offersStore.statusCounts.accepted ?? 0,
  declined: offersStore.statusCounts.declined ?? 0,
}));

const allCount = computed(() =>
  statusCountsSafe.value.draft +
  statusCountsSafe.value.sent +
  statusCountsSafe.value.accepted +
  statusCountsSafe.value.declined
);

onBeforeMount(() => {
  offersStore.fetchStatusCounts();
});

onMounted(() => {
  offersStore.fetchOffers(selectedStatus.value);
});

watch(selectedStatus, () => {
  offersStore.pagination.page = 1;
  offersStore.fetchOffers(selectedStatus.value);
});
// reload offers when search term changes
watch(
  () => offersStore.searchTerm,
  () => {
    offersStore.pagination.page = 1;
    offersStore.fetchOffers(selectedStatus.value);
  }
);

const handleRequest = async (props: RequestProps) => {
  offersStore.pagination.page = props.pagination.page;
  offersStore.pagination.rowsPerPage = props.pagination.rowsPerPage;
  offersStore.pagination.sortBy = props.pagination.sortBy;
  offersStore.pagination.descending = props.pagination.descending;
  await offersStore.fetchOffers(selectedStatus.value);
};

function formatDateIntl(date: string) {
  if (!date) return '';
  return Intl.DateTimeFormat(navigator.language, {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date));
}

function formatDateTimeIntl(date: string) {
  if (!date) return '';
  return Intl.DateTimeFormat(navigator.language, {
    timeZone: 'Europe/Berlin',
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(new Date(date));
}

function getStatusChipColor(status: string) {
  switch (status) {
    case 'draft':
      return 'grey';
    case 'sent':
      return 'blue';
    case 'accepted':
      return 'positive';
    case 'declined':
      return 'negative';
    default:
      return 'grey';
  }
}
</script>

<template>
  <q-page>
    <div class="q-ma-lg q-pt-md">
      <q-card flat class="shadow-1 q-pa-sm">
        <q-tabs v-model="selectedStatus" dense class="q-mb-md" align="justify">
          <q-tab
            v-for="option in offerStatusOptions"
            :key="option.value"
            :name="option.value"
            :label="
              option.value === 'all'
                ? `${option.label} (${allCount})`
                : `${option.label} (${statusCountsSafe[option.value]})`
            "
          />
        </q-tabs>
        <div class="row justify-end">
          <q-btn color="primary" flat icon="add" :label="t('createOffer')" to="/offers/create" />
        </div>
      </q-card>
      <q-table
        class="shadow_custom q-mt-md"
        style="border-radius: 4px"
        flat
        :title="t('nav.offers')"
        :rows="offersStore.offers"
        row-key="id"
        :columns="offersStore.columns"
        :rows-per-page-options="[10, 25, 50, 100]"
        v-model:pagination="offersStore.pagination"
        :loading="offersStore.loading"
        @request="handleRequest"
      >
        <!-- Search input in table header -->
        <template v-slot:top-right>
          <q-input
            outlined
            dense
            debounce="300"
            v-model="offersStore.searchTerm"
            :placeholder="t('searchTable')"
            class="q-ml-sm"
            style="max-width: 200px"
          />
        </template>
        <template v-slot:body="props">
          <q-tr :props="props">
            <template v-for="col in props.cols" :key="col.name">
              <q-td :props="props">
                <template v-if="col.name !== 'actions'">
                  <template v-if="col.name === 'created_at' || col.name === 'updated_at'">
                    <span>
                      {{
                        formatDateIntl(
                          typeof col.field === 'function'
                            ? col.field(props.row)
                            : props.row[col.field]
                        )
                      }}
                      <q-tooltip
                        v-if="props.row[col.field]"
                        anchor="top middle"
                        self="bottom middle"
                        :offset="[0, 5]"
                      >
                        {{
                          formatDateTimeIntl(
                            typeof col.field === 'function'
                              ? col.field(props.row)
                              : props.row[col.field]
                          )
                        }}
                      </q-tooltip>
                    </span>
                  </template>
                  <template v-else-if="col.name === 'offer_status'">
                    <q-chip outline ripple :dark="false" text-color="white" :color="getStatusChipColor(props.row[col.field])">
                      {{ t(`offerStatuses.${props.row[col.field]}`) || props.row[col.field] }}
                    </q-chip>
                  </template>
                  <template v-else>
                    {{
                      typeof col.field === 'function'
                        ? col.field(props.row)
                        : props.row[col.field]
                    }}
                  </template>
                </template>
                <template v-else>
                  <q-btn flat round @click="offersStore.edit(props.row.id)" style="font-size: 0.7rem">
                    <q-icon name="edit" />
                  </q-btn>
                </template>
              </q-td>
            </template>
          </q-tr>
        </template>
      </q-table>
    </div>
  </q-page>
</template>