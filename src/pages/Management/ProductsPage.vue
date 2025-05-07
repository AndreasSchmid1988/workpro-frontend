<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-gutter-sm q-mb-md">
      <div class="col">
        <div class="text-h6">{{ t('products') }}</div>
      </div>
      <div class="col-auto">
        <q-btn color="primary" :label="`+ ${t('addProduct')}`" @click="router.push('/management/products/create')" />
      </div>
    </div>
  <q-table
      flat
      :columns="columns"
      :rows="productsStore.products"
      row-key="id"
      :loading="productsStore.loading"
    >
      <template v-slot:body-cell-name="props">
        <q-td>
          {{ props.row.name }}
        </q-td>
      </template>
      <template v-slot:body-cell-default_price="props">
        <q-td>
          {{ props.row.default_price }}
        </q-td>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td>
          <q-btn flat round dense icon="edit" color="primary" @click="edit(props.row.id)" class="q-mr-sm" />
          <q-btn flat round dense icon="delete" color="negative" @click="remove(props.row.id)" />
        </q-td>
      </template>
    </q-table>

  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useProductsStore } from 'stores/products';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const productsStore = useProductsStore();
const router = useRouter();
const { t } = useI18n();

const columns = [
  { name: 'name', label: t('name'), field: 'name' },
  { name: 'default_price', label: t('defaultPrice'), field: 'default_price' },
  { name: 'actions', label: t('actions'), field: 'actions' },
];

// no inline creation; use separate create page


const update = async (row: any) => {
  await productsStore.updateProduct(row.id, {
    name: row.name,
    description: row.description,
    default_price: row.default_price,
  });
};

const remove = async (id: string) => {
  await productsStore.deleteProduct(id);
};
/**
 * Navigate to the edit page for the given product ID
 */
const edit = (id: string) => {
  router.push(`/management/products/${id}`);
};

onMounted(() => {
  productsStore.fetchProducts(1000);
});
</script>