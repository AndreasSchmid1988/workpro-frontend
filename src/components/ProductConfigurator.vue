<template>
  <q-dialog v-model="internalVisible" persistent>
    <q-card style="min-width: 400px; max-width: 90vw;">
      <q-card-section>
        <div class="text-h6">{{ product?.name }}</div>
        <div v-if="loading" class="q-mt-md flex flex-center">
          <q-spinner-dots color="primary" size="lg" />
        </div>

        <div v-else>
          <div v-for="feature in features" :key="feature.id" class="q-mb-md">
            <component
              :is="inputComponent(feature)"
              v-model="featureValues[feature.key]"
              v-bind="inputProps(feature)"
              :label="feature.label"
              outlined
              dense
              :required="feature.required"
            />
          </div>

  <q-input
            v-model.number="localQty"
            type="number"
            min="1"
            outlined
            dense
            :label="t('quantity')"
            class="q-mb-md"
          />

          <div class="text-subtitle1 text-right q-my-sm">
            <span>{{ t('price') }}:</span> {{ unitPrice?.toFixed(2) }} €
          </div>
          <div v-if="areaSqm" class="text-subtitle2 text-right q-my-xs">
            <span>{{ t('area') }}:</span> {{ areaSqm }} m²
          </div>
          <div class="text-subtitle1 text-right">
            <span>{{ t('lineTotal') }}:</span> {{ lineTotal?.toFixed(2) }} €
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat :label="t('cancel')" v-close-popup />
        <q-btn
          color="primary"
          :label="t('add')"
          :disable="!formValid"
          @click="confirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from 'stores/auth';
import { useI18n } from 'vue-i18n';

interface FeatureOption {
  id: string;
  value: string;
  label: string;
}

interface Feature {
  id: string;
  key: string;
  label: string;
  input_type: string;
  required: boolean;
  options?: FeatureOption[];
}

const props = defineProps<{ modelValue: boolean; productId: string; quantity: number }>();
const emit = defineEmits(['update:modelValue', 'confirmed']);

const { t } = useI18n();

const internalVisible = ref<boolean>(props.modelValue);
watch(
  () => props.modelValue,
  (v) => {
    internalVisible.value = v;
  }
);
watch(internalVisible, (v) => emit('update:modelValue', v));

const loading = ref(false);
const product = ref<any>(null);
const features = ref<Feature[]>([]);
const featureValues = ref<Record<string, any>>({});
const unitPrice = ref<number | null>(null);
const lineTotal = ref<number | null>(null);
const localQty = ref<number>(props.quantity);

const areaSqm = computed(() => {
  // Derive area (in m²) if width/height features are present and numeric.
  const width = Number(featureValues.value['width']);
  const height = Number(featureValues.value['height']);
  if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
    return (width * height).toFixed(3);
  }
  return null;
});

function inputProps(feature: Feature) {
  if (feature.input_type === 'select') {
    return { options: featureOptions(feature), emitValue: true, mapOptions: true };
  }
  if (feature.input_type === 'number') {
    return { type: 'number' };
  }
  if (feature.input_type === 'textarea') {
    return { type: 'textarea' };
  }
  return {};
}

// fetch product details & features
async function loadProduct() {
  if (!props.productId) {
    return;
  }
  loading.value = true;
  try {
    const auth = useAuthStore();
    const resp = await axios.get(`${process.env.APP_API_BASE_URL}/api/v1/products/${props.productId}`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    });
    if (resp.data && resp.data.data) {
      product.value = resp.data.data;
      features.value = product.value.features || [];
      // init default values
      const defaults: Record<string, any> = {};
      features.value.forEach((f: any) => {
        defaults[f.key] = f.pivot?.default_value ?? null;
      });
      featureValues.value = defaults;
    }
  } catch (e) {
    console.error('Error loading product features', e);
  } finally {
    loading.value = false;
    await calcPrice();
  }
}

// Lade Produktdaten jedes Mal neu, wenn der Dialog geöffnet wird und sich die
// productId geändert hat.
watch(
  () => [internalVisible.value, props.productId] as const,
  ([visible, pid]) => {
    if (visible && pid) {
      loadProduct();
    }
  },
  { immediate: true }
);

function inputComponent(feature: Feature) {
  switch (feature.input_type) {
    case 'number':
      return 'q-input';
    case 'select':
      return 'q-select';
    case 'boolean':
      return 'q-toggle';
    case 'textarea':
      return 'q-input';
    default:
      return 'q-input';
  }
}

function featureOptions(feature: Feature) {
  if (feature.input_type === 'select') {
    return (feature.options || []).map((o) => ({ label: o.label, value: o.value }));
  }
  return undefined;
}

// Watch for changes to recalc price
watch([featureValues, localQty], () => calcPrice(), { deep: true });

async function calcPrice() {
  if (!product.value) return;
  try {
    const auth = useAuthStore();
    const resp = await axios.post(
      `${process.env.APP_API_BASE_URL}/api/v1/products/${product.value.id}/calculate`,
      {
        quantity: localQty.value,
        features: featureValues.value,
      },
      { headers: { Authorization: `Bearer ${auth.accessToken}` } }
    );
    if (resp.data && resp.data.data) {
      unitPrice.value = resp.data.data.unit_price;
      lineTotal.value = resp.data.data.line_total;
    }
  } catch (e) {
    console.error('Error calculating price', e);
  }
}

const formValid = computed(() => {
  return features.value.every((f) => {
    if (f.required) {
      return featureValues.value[f.key] !== null && featureValues.value[f.key] !== '';
    }
    return true;
  });
});

function confirm() {
  emit('confirmed', {
    quantity: localQty.value,
    payload: featureValues.value,
    price: unitPrice.value,
    line_total: lineTotal.value,
  });
  internalVisible.value = false;
}
</script>

<style scoped>
</style>
