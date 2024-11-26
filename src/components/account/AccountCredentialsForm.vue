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
    <div class="col-12">
      <!-- Password -->
      <q-input
        dense
        v-model="authStore.password"
        class=""
        :type="authStore.isPassword ? 'password' : 'text'"
        outlined
        :label="$t('password')"
        :error="!!authStore.passwordError"
        :error-message="authStore.passwordError"
        @update:model-value="authStore.typedPassword()"
        autocomplete="new-password"
      >
        <template v-slot:append>
          <q-icon
            :name="authStore.isPassword ? 'visibility' : 'visibility_off'"
            class="cursor-pointer"
            @click="authStore.isPassword = !authStore.isPassword"
          />
        </template>
      </q-input>
    </div>
    <div class="col-12">
      <!-- Password confirm -->
      <q-input
        dense
        v-model="authStore.passwordConfirm"
        class=""
        :type="authStore.isPasswordConfirm ? 'password' : 'text'"
        outlined
        :label="$t('passwordConfirm')"
        :error="!!authStore.passwordConfirmError"
        :error-message="authStore.passwordConfirmError"
        autocomplete="new-password"
      >
        <template v-slot:append>
          <q-icon
            :name="
              authStore.isPasswordConfirm ? 'visibility' : 'visibility_off'
            "
            class="cursor-pointer"
            @click="authStore.isPasswordConfirm = !authStore.isPasswordConfirm"
          />
        </template>
      </q-input>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from 'stores/auth';
const authStore = useAuthStore();
</script>
