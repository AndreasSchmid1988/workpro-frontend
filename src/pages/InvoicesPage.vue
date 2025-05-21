<script lang="ts" setup>
import { ref, computed, onMounted, watch, onBeforeMount } from 'vue';
import { RequestProps, useInvoicesStore } from 'stores/invoices';
import { useI18n } from 'vue-i18n';

const invoicesStore = useInvoicesStore();
const { t } = useI18n();

// Tab definitions
const invoiceStatusOptions = [
  { label: t('all') || 'All', value: 'all' },
  { label: t('invoiceStatuses.draft') || 'Draft', value: 'draft' },
  { label: t('invoiceStatuses.sent') || 'Sent', value: 'sent' },
  { label: t('invoiceStatuses.paid') || 'Paid', value: 'paid' },
  { label: t('invoiceStatuses.overdue') || 'Overdue', value: 'overdue' },
  { label: t('invoiceStatuses.cancelled') || 'Cancelled', value: 'cancelled' },
];

const selectedStatus = ref('all');

// Ensure we always access defined properties to avoid NaN issues
const statusCountsSafe = computed(() => ({
  draft: invoicesStore.statusCounts.draft ?? 0,
  sent: invoicesStore.statusCounts.sent ?? 0,
  paid: invoicesStore.statusCounts.paid ?? 0,
  overdue: invoicesStore.statusCounts.overdue ?? 0,
  cancelled: invoicesStore.statusCounts.cancelled ?? 0,
}));

const allCount = computed(() =>
  statusCountsSafe.value.draft +
  statusCountsSafe.value.sent +
  statusCountsSafe.value.paid +
  statusCountsSafe.value.overdue +
  statusCountsSafe.value.cancelled,
);

onBeforeMount(() => {
  invoicesStore.fetchStatusCounts();
});

onMounted(() => {
  invoicesStore.fetchInvoices(selectedStatus.value);
});

// React to tab changes
watch(selectedStatus, () => {
  invoicesStore.pagination.page = 1;
  invoicesStore.fetchInvoices(selectedStatus.value);
});

// React to search field changes
watch(
  () => invoicesStore.searchTerm,
  () => {
    invoicesStore.pagination.page = 1;
    invoicesStore.fetchInvoices(selectedStatus.value);
  },
);

const handleRequest = async (props: RequestProps) => {
  invoicesStore.pagination.page = props.pagination.page;
  invoicesStore.pagination.rowsPerPage = props.pagination.rowsPerPage;
  invoicesStore.pagination.sortBy = props.pagination.sortBy;
  invoicesStore.pagination.descending = props.pagination.descending;
  await invoicesStore.fetchInvoices(selectedStatus.value);
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
    case 'paid':
      return 'positive';
    case 'overdue':
      return 'negative';
    case 'cancelled':
      return 'orange';
    default:
      return 'grey';
  }
}
</script>

<template>
  <q-page>
    <div class="q-ma-lg q-pt-md">
      <!-- Status Tabs & Global Actions -->
      <q-card flat class="shadow-1 q-pa-sm">
        <q-tabs v-model="selectedStatus" dense class="q-mb-md" align="justify">
          <q-tab
            v-for="option in invoiceStatusOptions"
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
          <q-btn color="primary" flat icon="add" :label="t('createInvoice')" to="/invoices/create" />
        </div>
      </q-card>

      <!-- Invoices Table -->
      <q-table
        class="shadow_custom q-mt-md"
        style="border-radius: 4px"
        flat
        :title="t('nav.invoices')"
        :rows="invoicesStore.invoices"
        row-key="id"
        :columns="invoicesStore.columns"
        :rows-per-page-options="[10, 25, 50, 100]"
        v-model:pagination="invoicesStore.pagination"
        :loading="invoicesStore.loading"
        @request="handleRequest"
      >
        <!-- Search bar -->
        <template v-slot:top-right>
          <q-input
            outlined
            dense
            debounce="300"
            v-model="invoicesStore.searchTerm"
            :placeholder="t('searchTable')"
            class="q-ml-sm"
            style="max-width: 200px"
          />
        </template>

        <!-- Table body -->
        <template v-slot:body="props">
          <q-tr :props="props">
            <template v-for="col in props.cols" :key="col.name">
              <q-td :props="props">
                <template v-if="col.name !== 'actions'">
                  <template v-if="col.name === 'created_at' || col.name === 'updated_at'">
                    <span>
                      {{
                        formatDateIntl(
                          typeof col.field === 'function' ? col.field(props.row) : props.row[col.field]
                        )
                      }}
                      <q-tooltip v-if="props.row[col.field]" anchor="top middle" self="bottom middle" :offset="[0, 5]">
                        {{
                          formatDateTimeIntl(
                            typeof col.field === 'function' ? col.field(props.row) : props.row[col.field]
                          )
                        }}
                      </q-tooltip>
                    </span>
                  </template>
                  <template v-else-if="col.name === 'invoice_status'">
                    <q-chip outline ripple :dark="false" text-color="white" :color="getStatusChipColor(props.row[col.field])">
                      {{ t(`invoiceStatuses.${props.row[col.field]}`) || props.row[col.field] }}
                    </q-chip>
                  </template>
                  <template v-else>
                    {{ typeof col.field === 'function' ? col.field(props.row) : props.row[col.field] }}
                  </template>
                </template>
                <template v-else>
                  <q-btn flat round @click="invoicesStore.edit(props.row.id)" style="font-size: 0.7rem">
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
