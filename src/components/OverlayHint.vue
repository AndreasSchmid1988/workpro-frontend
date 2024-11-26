<script setup lang="ts">
import { useAuthStore } from 'stores/auth';

const authStore = useAuthStore();
</script>

<template>
  <transition name="fade">
    <div v-if="authStore.showOverlayHint && !authStore.loading" class="overlay">
      <q-card
        class="shadow_custom q-pa-lg text-center"
        style="width: 500px; max-width: 90%"
      >
        <q-card-section>
          <img
            alt="workpro"
            src="/Logo_v2.svg"
            style="width: 150px; height: auto"
          />
        </q-card-section>
        <q-card-section>
          <div class="text-h5">{{ $t('welcomeToWorkPro') }}!</div>
          <div class="q-pt-md">
            {{ $t('accountInfoInactive') }} {{ $t('accountInfoApiKey') }}
          </div>
        </q-card-section>
        <q-card-section>
          <q-btn
            outline
            color="primary"
            @click="authStore.showOverlayHint = false"
            :label="$t('close')"
          ></q-btn>
        </q-card-section>
      </q-card>
    </div>
  </transition>
</template>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2.5px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
