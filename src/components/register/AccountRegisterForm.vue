<template>
  <q-card flat class="bg-white shadow_custom q-card-responsive q-pa-lg q-ma-lg">
    <q-card-section class="q-px-lg">
      <div class="row q-mt-lg text-center">
        <q-toolbar-title
          style="color: #566a7f; font-size: 1.6rem; letter-spacing: -0.5px"
          class="text-weight-medium"
        >
          <img
            alt="workpro"
            src="/Logo_v2.svg"
            :class="$q.dark.isActive ? 'logo-white' : ''"
            style="width: 175px; height: auto"
          />
        </q-toolbar-title>
      </div>
      <div style="font-size: 23px" class="row q-mt-lg text-weight-medium">
        {{ $t('welcomeToWorkPro') }}
      </div>
      <div style="color: #697a8d; font-size: 15px" class="text-caption q-mt-xs">
        {{ $t('signUpWithEmailPassword') }}
      </div>
    </q-card-section>
    <q-card-section>
      <div class="q-px-sm">
        <AccountDetailsForm></AccountDetailsForm>
        <div class="row q-mb-md">
          <div class="col-12">
            <q-separator class="q-mt-sm q-mb-sm"></q-separator>
          </div>
        </div>
        <AccountCredentialsForm></AccountCredentialsForm>
      </div>
      <div class="q-pb-sm row">
        <q-checkbox v-model="confirmTC" size="sm"> </q-checkbox>
        <div class="q-pl-sm" style="width: 90%" v-html="$t('agbConsent')"></div>
      </div>
      <div class="row q-px-sm">
        <q-btn
          :loading="authStore.loading"
          class="q-mt-lg full-width"
          :label="$t('signUp')"
          @click="authStore.register()"
          :disable="!confirmTC"
          type="button"
          color="primary"
        />
      </div>
      <div class="q-ma-md text-center text-grey-8">
        {{ $t('alreadyHaveAccount') }}
        <q-btn
          to="/login"
          flat
          dense
          class="text-capitalize text-blue q-px-sm"
          :label="$t('signInWithAccount')"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from 'stores/auth';
import AccountDetailsForm from 'components/account/AccountDetailsForm.vue';
import AccountCredentialsForm from 'components/account/AccountCredentialsForm.vue';

const authStore = useAuthStore();
const confirmTC = ref(false);
</script>
