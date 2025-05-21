<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useOffersStore } from 'stores/offers';
import { useProductsStore } from 'stores/products';
import { useI18n } from 'vue-i18n';
import ProductConfigurator from 'components/ProductConfigurator.vue';
import SaveCreate from 'components/SaveCreateComponent.vue';
import FileComponent from 'components/FileComponent.vue';
import ChatComponent from 'components/ChatComponent.vue';
import axios from 'axios';
import { useAuthStore } from 'stores/auth';

const route = useRoute();
const router = useRouter();
// Route param 'id' undefined for create
// Reactive offerId which mirrors the route param. It is `null` on the create
// route.
const offerId = ref<string | null>((route.params.id as string) ?? null);

// Keep `offerId` in sync when we programmatically navigate to the newly
// created offer (same component instance is reused by vue-router).
watch(
  () => route.params.id,
  (newId) => {
    offerId.value = (newId as string) ?? null;
  }
);

const offersStore = useOffersStore();
// products list for selection
const productsStore = useProductsStore();
const { t } = useI18n();
// Status options for select field
const offerStatusOptions = [
  { label: t('offerStatuses.draft'), value: 'draft' },
  { label: t('offerStatuses.sent'), value: 'sent' },
  { label: t('offerStatuses.accepted'), value: 'accepted' },
  { label: t('offerStatuses.declined'), value: 'declined' },
];

// Load existing offer if editing
const loadOfferData = async () => {
  if (offerId.value) {
    await offersStore.fetchOfferDetails(offerId.value);
  }
};

// Product selection for line items
const newProductId = ref<string | null>(null);
const newProductQty = ref<number>(1);
// Dialog visibility for product configuration
const showConfigurator = ref(false);
// after product picked and '+' clicked, open configurator
const openConfigurator = () => {
  if (!newProductId.value) return;
  showConfigurator.value = true;
};

const handleConfiguratorConfirm = async (data: any) => {
  if (!newProductId.value) return;
  // Übergebe nur quantity & payload – Preis wird im Backend berechnet.
  const success = await offersStore.addOfferProduct(
    newProductId.value,
    data.quantity,
    data.payload
  );
  if (success) {
    newProductId.value = null;
    newProductQty.value = 1;
  }
};
// update existing line item quantity
const updateLineItem = async (item: any) => {
  await offersStore.updateOfferProduct(item);
};
// delete line item
const deleteLineItem = async (itemId: string) => {
  await offersStore.deleteOfferProduct(itemId);
};

// Create new offer
const createOffer = async () => {
  await offersStore.createOffer(offersStore.offer);
  if (offersStore.offer.id) {
    router.push(`/offers/${offersStore.offer.id}`);
  }
};

// Update existing offer
const updateOffer = async () => {
  if (offerId.value) {
    await offersStore.updateOffer(offerId.value, offersStore.offer);
  }
};

// Export the current offer as a PDF via backend mpdf generator.
const exportPdf = async () => {
  if (!offerId.value) return;
  try {
    const auth = useAuthStore();
    const response = await axios.get(
      `${process.env.APP_API_BASE_URL}/api/v1/offers/${offerId.value}/download`,
      {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
        responseType: 'blob',
      }
    );
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `offer_${offerId.value}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (e) {
    console.error('Error exporting offer PDF:', e);
  }
};

onMounted(async () => {
  // When the create-route is opened we immediately create a draft offer so
  // that related child components (file upload, chat, …) already have a valid
  // UUID to work with.
  if (!offerId.value) {
    await offersStore.createOffer({
      offer_status: 'draft',
    });

    if (offersStore.offer.id) {
      // Update local id and navigate to the edit route so the id is present in
      // the URL, keeping the UX consistent with existing edit pages.
      offerId.value = offersStore.offer.id;
      router.replace(`/offers/${offersStore.offer.id}`);
    }
  } else {
    // Edit mode: load existing offer details & products.
    await loadOfferData();
    offersStore.fetchOfferProducts(offerId.value);
  }

  // Ensure products for select list are always loaded.
  productsStore.fetchProducts();
});

/**
 * Creates a short human-readable summary of the payload / feature values that
 * were stored for a product line item. Example output:
 *   "width: 1.2, height: 2.5, color: satiniert"
 */
function formatPayload(payload: Record<string, any>): string {
  if (!payload) return '';
  return Object.entries(payload)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');
}
</script>

<template>
  <q-page>
    <q-pull-to-refresh :disable="!$q.platform.is.mobile" @refresh="loadOfferData">
      <div class="q-ma-lg q-pt-md">
        <div class="row q-col-gutter-md">
          <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
            <q-card flat class="shadow-1">
              <q-card-section>
                <div class="text-h6">
                  {{ offerId ? t('editOffer') : t('createOffer') }}
                </div>
                <div class="row q-col-gutter-md q-mt-md">
                  <!-- Offer number (readonly) -->
                  <div class="col-12">
                    <q-input
                      v-model="offersStore.offer.offers_number"
                      :label="t('offersNumber')"
                      outlined
                      dense
                      disable
                    />
                  </div>
                  <!-- Offer status -->
                  <div class="col-12 q-mt-md">
                    <q-select
                      v-model="offersStore.offer.offer_status"
                      :options="offerStatusOptions"
                      option-value="value"
                      option-label="label"
                      :label="t('offerStatus')"
                      outlined
                      dense
                      required
                    />
                  </div>
                  <!-- Offer subject -->
                  <div class="col-12 q-mt-md">
                    <q-input
                      v-model="offersStore.offer.subject"
                      :label="t('subject')"
                      outlined
                      dense
                      required
                    />
                  </div>
                  <div class="col-12 q-mt-md">
                    <q-editor
                      v-model="offersStore.offer.description"
                      :label="t('offerMessage')"
                      :definitions="{}"
                      :toolbar="[['bold', 'italic', 'underline']]"
                    />
                  </div>
                  <div class="col-12 q-mt-md">
                    <FileComponent :external-uuid="offerId" />
                  </div>
                  <div class="col-12 q-mt-md">
                    <ChatComponent :external-uuid="offerId" />
                  </div>
                  <!-- Product line item selection -->
                  <div class="col-12 q-mt-md">
                    <div class="row items-center q-col-gutter-md">
                      <div class="col-sm-6 col-xs-12">
                        <q-select
                          v-model="newProductId"
                          :options="productsStore.products.map(p => ({ label: p.name, value: p.id }))"
                          option-value="value"
                          option-label="label"
                          emit-value
                          :label="t('product')"
                          outlined
                          dense
                        />
                      </div>
                      <div class="col-sm-2 col-xs-4">
                        <q-input
                          v-model.number="newProductQty"
                          type="number"
                          min="1"
                          :label="t('quantity')"
                          outlined
                          dense
                        />
                      </div>
                      <div class="col-auto">
                        <q-btn
                          color="primary"
                          label="+"
                          @click="openConfigurator"
                          :disable="!newProductId"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              <!-- Offer products line items table -->
              <div class="row q-col-gutter-md q-mt-lg">
                <div class="col-12">
                  <q-table
                    flat
                    dense
                    row-key="id"
                    :rows="offersStore.offerProducts"
                    :loading="offersStore.productLoading"
                  >
                    <template v-slot:header>
                      <q-tr>
                        <q-th>{{ t('product') }}</q-th>
                        <q-th>{{ t('price') }}</q-th>
                        <q-th>{{ t('quantity') }}</q-th>
                        <q-th>{{ t('lineTotal') }}</q-th>
                        <q-th>{{ t('details') }}</q-th>
                        <q-th>{{ t('actions') }}</q-th>
                      </q-tr>
                    </template>
                    <template v-slot:body="props">
                      <q-tr :props="props">
                        <q-td>{{ props.row.product.name }}</q-td>
                        <q-td>{{ props.row.price }}</q-td>
                        <q-td>
                          <q-input
                            dense
                            type="number"
                            min="1"
                            v-model.number="props.row.quantity"
                            @blur="updateLineItem(props.row)"
                            style="max-width: 80px"
                          />
                        </q-td>
                        <q-td>{{ props.row.line_total }}</q-td>
                        <q-td>
                          <span
                            v-if="props.row.payload && Object.keys(props.row.payload).length"
                            style="white-space: pre-wrap"
                          >
                            {{ formatPayload(props.row.payload) }}
                          </span>
                        </q-td>
                        <q-td>
                          <q-btn
                            flat
                            round
                            dense
                            icon="content_copy"
                            @click="offersStore.addOfferProduct(props.row.product.id, props.row.quantity, props.row.payload, props.row.price, props.row.line_total)"
                            class="q-mr-xs"
                          />
                          <q-btn
                            flat
                            round
                            dense
                            icon="delete"
                            color="negative"
                            @click="deleteLineItem(props.row.id)"
                          />
                        </q-td>
                      </q-tr>
                    </template>
                  </q-table>
                </div>
              </div>


              <!-- Die Tabelle für Glas-Positionen war ein früherer Spezial-Fall und
                   wird nun nicht mehr benötigt, weil Produkte generell als
                   eigenständige Zeilenartikel mit individuellen Features über
                   das Angebots-Modul gepflegt werden.  -->
              </q-card-section>
              <q-card-actions align="center">
                <SaveCreate
                  :path="'/offers'"
                  :id="offerId"
                  :loading="offersStore.loading"
                  @save-button-clicked="updateOffer"
                  @save-button-initiated-create="createOffer"
                />
                <q-btn
                  flat
                  color="primary"
                  icon="picture_as_pdf"
                  :label="t('exportPdf')"
                  :disable="!offerId"
                  @click="exportPdf"
                  class="q-ml-md"
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </div>
    </q-pull-to-refresh>

    <!-- Product configurator dialog -->
    <ProductConfigurator
      v-model="showConfigurator"
      :product-id="newProductId as string"
      :quantity="newProductQty"
      @confirmed="handleConfiguratorConfirm"
    />
  </q-page>
</template>