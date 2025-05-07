<template>
  <q-page class="q-pa-md">
    <div class="q-ma-lg q-pt-md">
      <div class="row q-col-gutter-md">
        <!-- Form Card -->
        <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
          <q-card flat class="shadow-1">
            <q-card-section>
              <div class="text-h6">{{ isNew ? t('newProduct') : t('editProduct') }}</div>

              <q-form class="q-mt-md" @submit.prevent="save">
                <div class="row q-gutter-md">
                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="product.name"
                      :label="t('name')"
                      outlined
                      dense
                      required
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <q-select
                      v-model="product.category"
                      :options="[
                        { label: t('categoryGlass'), value: 'glass' },
                        { label: t('categoryHardware'), value: 'hardware' },
                        { label: t('categoryService'), value: 'service' },
                      ]"
                      emit-value
                      map-options
                      :label="t('category')"
                      outlined
                      dense
                      required
                    />
                  </div>

                  <div class="col-12 col-md-6">
                    <q-input
                      v-model="product.default_price"
                      type="number"
                      :label="t('defaultPrice')"
                      outlined
                      dense
                      required
                    />
                  </div>
        <div class="col-12 col-md-6">
          <q-select
            v-model="product.price_type"
            :options="[
              { label: t('pricePerPiece'), value: 'piece' },
              { label: t('pricePerSquareMeter'), value: 'sqm' },
            ]"
            emit-value
            map-options
            :label="t('priceType')"
            outlined
            dense
            required
          />
        </div>
        <div class="col-12 col-md-6" v-if="product.category === 'glass'">
          <q-input
            v-model.number="product.markup_factor"
            type="number"
            :label="t('markupFactor')"
            step="0.1"
            min="1"
            outlined
            dense
            required
          />
        </div>
                  <div class="col-12">
                    <q-input
                      v-model="product.description"
                      :label="t('description')"
                      type="textarea"
                      autogrow
                      outlined
                      dense
                    />
                  </div>
                </div>
              </q-form>
            </q-card-section>

            <!-- card-actions intentionally left empty; SaveCreate rendered globally -->
            <q-card-actions />
          </q-card>
        </div>

        <!-- Price tiers card -->
        <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
          <q-card flat class="shadow-1">
            <q-card-section>
              <div class="row items-center">
                <div class="text-h6">{{ t('priceTiers') }}</div>
                <q-space />
                <q-btn
                  color="primary"
                  :label="`+ ${t('addTier')}`"
                  @click="showTierDialog = true"
                  class="q-ml-sm"
                />
              </div>

              <q-table
                flat
                dense
                row-key="id"
                :rows="tiersStore.tiers"
                :loading="tiersStore.loading"
                :columns="tierColumns"
                class="q-mt-md"
              >
                <template v-slot:body-cell-min_quantity="props">
                  <q-td>
                    <q-input
                      dense
                      type="number"
                      v-model.number="props.row.min_quantity"
                      @blur="updateTier(props.row)"
                      style="max-width: 100px"
                    />
                  </q-td>
                </template>
                <template v-slot:body-cell-price="props">
                  <q-td>
                    <q-input
                      dense
                      type="number"
                      v-model.number="props.row.price"
                      @blur="updateTier(props.row)"
                      style="max-width: 120px"
                    />
                  </q-td>
                </template>
                <template v-slot:body-cell-actions="props">
                  <q-td>
                    <q-btn flat round dense icon="delete" color="negative" @click="removeTier(props.row.id)" />
                  </q-td>
                </template>
              </q-table>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Dialog for creating tier -->
    <q-dialog v-model="showTierDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ t('newPriceTier') }}</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model.number="newTier.min_quantity" :label="t('minQuantity')" type="number" outlined dense />
          <q-input v-model.number="newTier.price" :label="t('price')" type="number" outlined dense class="q-mt-sm" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="t('cancel')" v-close-popup />
          <q-btn flat :label="t('create')" color="primary" @click="createTier" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>

  <!-- Floating SaveCreate just like Leads/Offers -->
  <div class="row q-gutter-x-md justify-center">
    <SaveCreate
      :path="'/management/products'"
      :id="editorId"
      :loading="productsStore.loading"
      @save-button-clicked="updateProduct"
      @save-button-initiated-create="createProduct"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProductsStore } from 'stores/products';
import { usePriceTiersStore } from 'stores/priceTiers';
import { useI18n } from 'vue-i18n';
import SaveCreate from 'components/SaveCreateComponent.vue';

// stores, router, i18n
const route = useRoute();
const router = useRouter();
const productsStore = useProductsStore();
const tiersStore = usePriceTiersStore();
const { t } = useI18n();

// The /management/products/create route has NO :id param, while the edit route
// is /management/products/:id. Therefore, if route.params.id is undefined we
// are in "create" mode. We treat any falsy (undefined or empty string)
// parameter as a new product.
const paramId = route.params.id as string | undefined;

// true when we are creating a new product
const isNew = !paramId;

// Pass null to <SaveCreate> when creating to toggle its behaviour
const editorId: string | null = isNew ? null : paramId!;

// Local editable product object. Start with empty defaults so we don't show
// data from a previously viewed product when creating a new one.
const product = reactive({ id: '', name: '', description: '', category: 'glass', price_type: 'piece', markup_factor: 1, default_price: 0 });
const showTierDialog = ref(false);
const newTier = reactive({ min_quantity: 1, price: 0 });

import { computed } from 'vue';

const tierColumns = computed(() => [
  {
    name: 'min_quantity',
    label: product.price_type === 'sqm' ? t('minSquareMeters') : t('minQuantity'),
    field: 'min_quantity',
  },
  {
    name: 'price',
    label: product.price_type === 'sqm' ? t('pricePerSquareMeter') : t('price'),
    field: 'price',
  },
  { name: 'actions', label: t('actions'), field: 'actions' },
]);

async function loadData() {
  if (!isNew && paramId) {
    const data = await productsStore.fetchProduct(paramId);
    if (data) {
      Object.assign(product, data);
    }
    // Fetch the price tiers only after we have a valid product id
    await tiersStore.fetchPriceTiers(paramId);
  }
}


// Not used currently; kept for parity with other pages if needed in template
function cancel() {
  router.push('/management/products');
}

// Create product (called when SaveCreate emits save-button-initiated-create)
async function createProduct() {
  const created = await productsStore.createProduct({
    name: product.name,
    description: product.description,
      category: product.category,
      price_type: product.price_type,
      markup_factor: product.markup_factor,
    default_price: product.default_price,
  });
  if (created && created.id) {
    product.id = created.id;
    await tiersStore.fetchPriceTiers(created.id);
    // Navigate to edit route so subsequent saves update
    router.replace(`/management/products/${created.id}`);
  }
}

// Update existing product (called when SaveCreate emits save-button-clicked)
async function updateProduct() {
  if (!paramId) return;
  await productsStore.updateProduct(paramId, {
    name: product.name,
    description: product.description,
      category: product.category,
      price_type: product.price_type,
      markup_factor: product.markup_factor,
    default_price: product.default_price,
  });
}

// Generic handler wired to <q-form @submit>, decides based on mode
function save() {
  if (isNew) {
    createProduct();
  } else {
    updateProduct();
  }
}

async function createTier() {
  // We need a valid product id
  const id = isNew ? product.id : paramId!;
  if (!id) return;
  const tier = await tiersStore.createPriceTier(id, newTier);
  if (tier) {
    tiersStore.fetchPriceTiers(id);
    showTierDialog.value = false;
    newTier.min_quantity = 1;
    newTier.price = 0;
  }
}

function updateTier(row: any) {
  const id = isNew ? product.id : paramId!;
  if (!id) return;
  tiersStore.updatePriceTier(id, row.id, {
    min_quantity: row.min_quantity,
    price: row.price,
  });
}

function removeTier(id: string) {
  const pId = isNew ? product.id : paramId!;
  if (!pId) return;
  tiersStore.deletePriceTier(pId, id);
}

onMounted(() => {
  loadData();
});
</script>