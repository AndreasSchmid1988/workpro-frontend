<template>
  <q-select
    dense
    popup-content-style="height: 150px;"
    use-input
    input-debounce="300"
    outlined
    option-value="alpha2Code"
    option-label="name"
    :label="$t('country')"
    v-model="selectedCountryAlphaCode"
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

    <template v-slot:selected-item>
      {{ selectedCountry?.name || '' }}
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
  modelValue: string | null; // Expecting alpha2Code
  error: boolean;
  errorMessage: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void;
}>();

const { t } = useI18n();
const reportingStore = useReportingStore();
const countryUserInput = ref<string>('');
const selectedCountryAlphaCode = ref<string | null>(props.modelValue);

const countryError = computed(() => props.error);
const countryErrorMessage = computed(() => props.errorMessage);

const countryFilterFn = (val: string, update: (fn: () => void) => void) => {
  update(() => {
    countryUserInput.value = val.toLowerCase();
  });
};

onMounted(() => {
  reportingStore.getCountries();
});

const commonCountries = ['DE', 'AT', 'CH', 'US', 'CA', 'GB', 'FR', 'IT', 'ES', 'AU', 'BR', 'JP', 'IN'];

const filteredCountries = computed<Country[]>(() => {
  const needle = countryUserInput.value;
  const commonCountriesList = reportingStore.countryList.filter((country: Country) =>
    commonCountries.includes(country.alpha2Code)
  );

  commonCountriesList.sort((a: Country, b: Country) =>
    commonCountries.indexOf(a.alpha2Code) - commonCountries.indexOf(b.alpha2Code)
  );

  const allCountries = [
    ...commonCountriesList,
    ...reportingStore.countryList.filter((country: Country) =>
      !commonCountries.includes(country.alpha2Code)
    )
  ];

  if (needle) {
    return allCountries.filter(country =>
      country.name.toLowerCase().includes(needle)
    );
  }

  return allCountries;
});

watch(() => props.modelValue, newVal => {
  console.log('watching model value', newVal);
  selectedCountryAlphaCode.value = newVal;
});

const selectedCountry = computed(() => {
  return reportingStore.countryList.find(
    country => country.alpha2Code === selectedCountryAlphaCode.value
  ) || null;
});

const handleModelUpdate = (country: Country | null) => {
  selectedCountryAlphaCode.value = country?.alpha2Code || null;
  emit('update:modelValue', country?.alpha2Code || null);
};
</script>
