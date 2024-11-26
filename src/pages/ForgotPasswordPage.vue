<template>
  <div class="main_bg">
    <div class="flex flex-center" style="min-height: 100vh">
      <q-card
        flat
        class="bg-white shadow_custom q-card-responsive q-pa-lg q-ma-lg"
      >
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
            {{ $t('resetPasswordCaption') }}
          </div>
          <div
            style="color: #697a8d; font-size: 15px"
            class="text-caption q-mt-xs"
          >
            {{ $t('passwordForgotInstructions') }}
          </div>
        </q-card-section>
        <q-card-section>
          <div class="q-px-sm">
            <AccountForgotCredentialsForm></AccountForgotCredentialsForm>
          </div>
          <div class="row q-px-sm">
            <q-btn
              :loading="authStore.loading"
              class="q-mt-lg full-width"
              :label="$t('passwordForgotSubmitButton')"
              @click="authStore.forgotPassword()"
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
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from 'stores/auth';
import AccountForgotCredentialsForm from 'components/account/AccountForgotCredentialsForm.vue';

const authStore = useAuthStore();
</script>
<style scoped>
.main_bg {
  /*
    background: url('background.jpg');
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    */
}

input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
textarea:-webkit-autofill,
textarea:-webkit-autofill:hover,
textarea:-webkit-autofill:focus,
select:-webkit-autofill,
select:-webkit-autofill:hover,
select:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0px 1000px #ffffff inset !important;
}

.shadow_custom {
  box-shadow: 0 5px 70px 0 rgb(0, 0, 0, 0.45) !important;
}

/* Mobile-first approach */
.q-card-responsive {
  width: 95%; /* Adjusted for slightly more margins on mobile */
}

/* Medium devices */
@media screen and (min-width: 768px) {
  .q-card-responsive {
    width: 650px;
  }
}

/* Larger devices */
@media screen and (min-width: 1199px) {
  .q-card-responsive {
    width: 750px;
  }
}
</style>
