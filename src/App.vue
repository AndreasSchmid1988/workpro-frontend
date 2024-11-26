<template>
  <SplashScreen></SplashScreen>
  <router-view />
</template>

<script setup lang="ts">
import { useUsersStore } from 'stores/users';
import { useQuasar } from 'quasar';
import SplashScreen from 'components/splashscreen/SplashScreen.vue';

const userStore = useUsersStore();

userStore.setDarkMode(null);

const $q = useQuasar();
$q.addressbarColor.set('#00a8a4');
</script>

<style>
body {
  background-color: #ffffff;
}
</style>
