<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-gutter-sm q-mb-md">
      <div class="col">
        <div class="text-h6">{{ t('featureGroups') }}</div>
      </div>
      <div class="col-auto">
        <q-btn color="primary" label="+ {{ t('addGroup') }}" @click="showDialog = true" />
      </div>
    </div>
    <q-table
      flat
      :columns="columns"
      :rows="featureGroupsStore.featureGroups"
      row-key="id"
      :loading="featureGroupsStore.loading"
    >
      <template v-slot:body-cell-name="props">
        <q-td>
          <q-input
            dense
            v-model="props.row.name"
            @blur="update(props.row)"
          />
        </q-td>
      </template>
      <template v-slot:body-cell-sort_order="props">
        <q-td>
          <q-input
            dense
            type="number"
            v-model.number="props.row.sort_order"
            @blur="update(props.row)"
          />
        </q-td>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td>
          <q-btn flat round dense icon="delete" color="negative" @click="remove(props.row.id)" />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="showDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ t('newFeatureGroup') }}</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="newName" :label="t('name')" outlined dense />
          <q-input v-model.number="newSort" :label="t('sortOrder')" type="number" outlined dense class="q-mt-sm" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="{{ t('cancel') }}" v-close-popup />
          <q-btn flat label="{{ t('create') }}" color="primary" @click="create" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useFeatureGroupsStore } from 'stores/featureGroups';
import { useI18n } from 'vue-i18n';

const featureGroupsStore = useFeatureGroupsStore();
const { t } = useI18n();

const columns = [
  { name: 'name', label: t('name'), field: 'name' },
  { name: 'sort_order', label: t('sortOrder'), field: 'sort_order' },
  { name: 'actions', label: t('actions'), field: 'actions' },
];

const showDialog = ref(false);
const newName = ref('');
const newSort = ref(0);

const create = async () => {
  await featureGroupsStore.createFeatureGroup(newName.value, newSort.value);
  showDialog.value = false;
  newName.value = '';
  newSort.value = 0;
};

const update = async (row: any) => {
  await featureGroupsStore.updateFeatureGroup(row.id, row.name, row.sort_order);
};

const remove = async (id: number) => {
  await featureGroupsStore.deleteFeatureGroup(id);
};

onMounted(() => {
  featureGroupsStore.fetchFeatureGroups();
});
</script>