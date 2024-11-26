<template>
  <div class="main_bg">
    <div class="flex flex-center" style="height: 100vh">
      <q-card class="q-card-responsive bg-white shadow_custom">
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
          <div
            style="font-size: 23px"
            class="row q-mt-lg text-grey-7 text-weight-medium"
          >
            {{ $t('registrationSuccess') }}
          </div>
          <div
            style="color: #697a8d; font-size: 15px"
            class="text-caption q-mt-xs"
          >
            {{ $t('verifyEmail') }}
          </div>
        </q-card-section>

        <q-card-section>
          <div class="row justify-center">
            <q-btn
              class="q-mt-lg"
              to="/login"
              :label="$t('goToLogin')"
              flat
              type="button"
              color="primary"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
// Ihr Setup-Code hier
</script>

<style scoped>
:deep(.shadow_custom) {
  box-shadow: none !important;
}

/* Mobile-first approach */
.q-card-responsive {
  width: 90%; /* Adjusted for slightly more margins on mobile */
}

/* Medium devices */
@media screen and (min-width: 768px) {
  :deep(.shadow_custom) {
    box-shadow: 0 5px 70px 0 rgb(0, 0, 0, 0.45) !important;
  }

  .q-card-responsive {
    width: 50%;
  }
}

/* Larger devices */
@media screen and (min-width: 1199px) {
  :deep(.shadow_custom) {
    box-shadow: 0 5px 70px 0 rgb(0, 0, 0, 0.45) !important;
  }

  .q-card-responsive {
    width: 28%;
  }
}
</style>
