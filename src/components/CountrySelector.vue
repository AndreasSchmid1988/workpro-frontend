<template>
  <q-select
    dense
    class=""
    popup-content-style="height: 150px;"
    use-input
    input-debounce="300"
    outlined
    option-value="alpha2Code"
    option-label="name"
    :label="$t('country')"
    v-model="selectedCountry"
    :options="filteredCountries"
    :error="!!countryError"
    :error-message="countryErrorMessage"
    @filter="countryFilterFn"
    @update:model-value="handleModelUpdate"
  >
    <template v-slot:prepend>
      <img
        class="q-mr-sm"
        v-if="selectedCountry?.flag"
        :src="selectedCountry.flag"
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
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useReportingStore } from 'stores/reporting';

interface Country {
  alpha2Code: string;
  name: string;
  flag?: string;
  callingCodes?: string[];
}

const props = defineProps<{
  modelValue: Country | null;
  error: boolean;
  errorMessage: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: Country | null): void;
}>();

const reportingStore = useReportingStore();
onMounted(() => {
  reportingStore.getCountries(); // Ensure countries are loaded
});

const { t } = useI18n();

const countryUserInput = ref<string>('');
const selectedCountry = ref<Country | null>(props.modelValue);

const countryFilterFn = (val: string, update: (fn: () => void) => void) => {
  update(() => {
    countryUserInput.value = val;
  });
};

const commonCountries = [
  'DE', 'AT', 'CH', 'US', 'CA', 'GB', 'FR', 'IT', 'ES', 'AU', 'BR', 'JP', 'IN',
];

const filteredCountries = computed<Country[]>(() => {
  const needle = countryUserInput.value.toLowerCase();

  let commonContries = reportingStore.countryList.filter((country: Country) =>
    commonCountries.includes(country.alpha2Code)
  );

  commonContries.sort((a: Country, b: Country) =>
    commonCountries.indexOf(a.alpha2Code) - commonCountries.indexOf(b.alpha2Code)
  );

  const allCountries = [...commonContries, ...reportingStore.countryList.filter((country: Country) =>
    !commonCountries.includes(country.alpha2Code)
  )];

  if (needle.length > 0) {
    return allCountries.filter((country: Country) =>
      country.name.toLowerCase().includes(needle)
    );
  }
  return allCountries;
});

const handleModelUpdate = (val: Country | null) => {
  selectedCountry.value = val;
  emit('update:modelValue', val);
};

watch(() => props.modelValue, (newVal) => {
  selectedCountry.value = newVal;
});

const countryError = computed(() => props.error);
const countryErrorMessage = computed(() => props.errorMessage);
</script>
