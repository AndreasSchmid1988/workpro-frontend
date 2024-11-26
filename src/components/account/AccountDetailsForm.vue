<template>
  <div class="row q-col-gutter-xs">
    <div class="col-12">
      <!-- Company -->
      <q-input
        dense
        v-model="authStore.company"
        :error="!!authStore.companyError"
        :error-message="authStore.companyError"
        class=""
        outlined
        :label="$t('company')"
        required
        @blur="authStore.typedCompany()"
        @update:model-value="authStore.typedCompany()"
      />
    </div>
    <div class="col-12 col-sm-4">
      <!-- Salutation -->
      <q-select
        dense
        outlined
        :error="!!authStore.salutationError"
        :error-message="authStore.salutationError"
        v-model="authStore.salutation"
        :options="salutations"
        :label="$t('salutation')"
        @update:model-value="authStore.selectedSalutation()"
        @blur="authStore.selectedSalutation()"
      />
    </div>
    <div class="col-12 col-sm-4">
      <!-- Firstname -->
      <q-input
        dense
        v-model="authStore.firstname"
        :error="!!authStore.firstnameError"
        :error-message="authStore.firstnameError"
        class=""
        outlined
        :label="$t('firstname')"
        @blur="authStore.typedFirstname()"
        @update:model-value="authStore.typedFirstname()"
      />
    </div>
    <div class="col-12 col-sm-4">
      <!-- Lastname -->
      <q-input
        dense
        v-model="authStore.lastname"
        :error="!!authStore.lastnameError"
        :error-message="authStore.lastnameError"
        class=""
        outlined
        :label="$t('lastname')"
        @blur="authStore.typedLastname()"
        @update:model-value="authStore.typedLastname()"
      />
    </div>
    <!-- Address -->
    <div class="col-12">
      <q-input
        dense
        v-model="authStore.address"
        :error="!!authStore.addressError"
        :error-message="authStore.addressError"
        class=""
        outlined
        :label="$t('address')"
        @blur="authStore.typedAddress()"
        @update:model-value="authStore.typedAddress()"
      />
    </div>
    <!-- ZIP -->
    <div class="col-12 col-sm-4">
      <q-input
        dense
        v-model="authStore.zip"
        :error="!!authStore.zipError"
        :error-message="authStore.zipError"
        class=""
        outlined
        :label="$t('zip')"
        @blur="authStore.typedZip()"
        @update:model-value="authStore.typedZip()"
      />
    </div>
    <!-- City -->
    <div class="col-12 col-sm-8">
      <q-input
        dense
        v-model="authStore.city"
        :error="!!authStore.cityError"
        :error-message="authStore.cityError"
        class=""
        outlined
        :label="$t('city')"
        @blur="authStore.typedCity()"
        @update:model-value="authStore.typedCity()"
      />
    </div>
    <!-- Country -->
    <div class="col-12">
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
        v-model="authStore.country"
        :options="filteredCountries"
        :error="!!authStore.countryError"
        :error-message="authStore.countryError"
        @filter="countryFilterFn"
        @update:model-value="authStore.setCallingCode()"
        @blur="authStore.typedCountry()"
      >
        <template v-slot:prepend>
          <img
            class="q-mr-sm"
            v-if="authStore.country?.flag"
            :src="authStore.country.flag"
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
    </div>
    <!-- Phone -->
    <div class="col-12">
      <div class="row q-col-gutter-xs">
        <div class="col-3">
          <!-- Vorwahl-Selector -->
          <q-select
            v-model="authStore.selectedCallingCode"
            :options="authStore.country ? prefixedCallingCodes : []"
            dense
            outlined
            :label="$t('callingCode')"
          >
          </q-select>
        </div>
        <div class="col-9">
          <!-- Telefonnummer Eingabefeld -->
          <q-input
            dense
            type="number"
            v-model="authStore.mobile"
            :error="!!authStore.mobileError"
            :error-message="authStore.mobileError"
            class=""
            outlined
            :label="$t('mobile')"
            @blur="authStore.typedMobile()"
            @update:model-value="authStore.typedMobile()"
          >
          </q-input>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from 'stores/auth';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useReportingStore } from 'stores/reporting';

const props = defineProps({
  initData: Boolean,
});

const reportingStore = useReportingStore();
reportingStore.getCountries();

const authStore = useAuthStore();

const { t } = useI18n();

const salutations = computed(() => [
  t('salutations.Mr'),
  t('salutations.Mrs'),
  t('salutations.Diverse'),
]);

const countryUserInput = ref('');
const countryFilterFn = (val, update) => {
  update(() => {
    countryUserInput.value = val;
  });
};

const commonCountries = [
  'DE',
  'AT',
  'CH',
  'US',
  'CA',
  'GB',
  'FR',
  'IT',
  'ES',
  'AU',
  'BR',
  'JP',
  'IN',
];

const filteredCountries = computed(() => {
  let needle;
  if (countryUserInput.value) {
    needle = countryUserInput.value.toLowerCase();
  }
  let commonContries = reportingStore.countryList.filter((country) => {
    return commonCountries.includes(country.alpha2Code);
  });
  // Sort them based on the commonCountries array
  commonContries.sort((a, b) => {
    return (
      commonCountries.indexOf(a.alpha2Code) -
      commonCountries.indexOf(b.alpha2Code)
    );
  });
  const allCountries = [...commonContries];
  if (needle && needle.length > 0) {
    return allCountries.filter((country) =>
      country.name.toLowerCase().includes(needle)
    );
  }
  return allCountries;
});

const prefixedCallingCodes = computed(() => {
  if (authStore.country && authStore.country.callingCodes) {
    return authStore.country.callingCodes.map((code) => '+' + code);
  }
  return [];
});

onMounted(() => {
  if (props.initData) {
    authStore.fetchUserDetails();
  }
});
</script>
