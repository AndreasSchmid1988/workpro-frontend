<template>
  <div class="row q-col-gutter-xs">
    <div class="col-12">
      <!-- Username/Email -->
      <q-input
        v-model="authStore.username"
        class=""
        outlined
        dense
        :label="$t('Email')"
        :error="!!authStore.usernameError"
        :error-message="authStore.usernameError"
        type="email"
        @blur="authStore.typedUsername()"
        @update:model-value="() => authStore.typedUsername()"
      />
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from 'stores/auth';
const authStore = useAuthStore();
</script>
