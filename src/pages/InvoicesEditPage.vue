<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useInvoicesStore } from 'stores/invoices';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const router = useRouter();
const invoicesStore = useInvoicesStore();
const { t } = useI18n();

// When route param id is present we are in edit-mode, otherwise create-mode.
const invoiceId = ref<string | null>((route.params.id as string) ?? null);

watch(
  () => route.params.id,
  (newId) => {
    invoiceId.value = (newId as string) ?? null;
  },
);

// Select options for status field.
const invoiceStatusOptions = [
  { label: t('invoiceStatuses.draft'), value: 'draft' },
  { label: t('invoiceStatuses.sent'), value: 'sent' },
  { label: t('invoiceStatuses.paid'), value: 'paid' },
  { label: t('invoiceStatuses.overdue'), value: 'overdue' },
  { label: t('invoiceStatuses.cancelled'), value: 'cancelled' },
];

// Load invoice data when editing an existing record.
const loadInvoiceData = async () => {
  if (invoiceId.value) {
    await invoicesStore.fetchInvoiceDetails(invoiceId.value);
  }
};

// Create new invoice
const createInvoice = async () => {
  await invoicesStore.createInvoice(invoicesStore.invoice);
  if (invoicesStore.invoice.id) {
    router.push(`/invoices/${invoicesStore.invoice.id}`);
  }
};

// Update existing invoice
const updateInvoice = async () => {
  if (invoiceId.value) {
    await invoicesStore.updateInvoice(invoiceId.value, invoicesStore.invoice);
  }
};

onMounted(async () => {
  if (!invoiceId.value) {
    // Directly create a draft invoice so we get an id for related features.
    await invoicesStore.createInvoice({ invoice_status: 'draft' });
    if (invoicesStore.invoice.id) {
      invoiceId.value = invoicesStore.invoice.id;
      router.replace(`/invoices/${invoicesStore.invoice.id}`);
    }
  } else {
    await loadInvoiceData();
  }
});
</script>

<template>
  <q-page>
    <div class="q-ma-lg q-pt-md">
      <q-card flat class="shadow-1 q-pa-md" style="max-width: 800px; margin: 0 auto;">
        <q-card-section>
          <div class="text-h6">
            {{ invoiceId ? t('editInvoice') : t('createInvoice') }}
          </div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input v-model="invoicesStore.invoice.subject" :label="t('subject')" outlined dense />
          <q-input type="textarea" v-model="invoicesStore.invoice.description" :label="t('description')" outlined dense />

          <q-select
            v-model="invoicesStore.invoice.invoice_status"
            :label="t('invoiceStatus')"
            :options="invoiceStatusOptions"
            emit-value
            map-options
            outlined
            dense
          />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn v-if="invoiceId" color="primary" :label="t('save')" @click="updateInvoice" />
          <q-btn v-else color="primary" :label="t('createInvoice')" @click="createInvoice" />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>
