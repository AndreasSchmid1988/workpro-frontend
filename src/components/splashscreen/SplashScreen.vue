<template>
  <transition name="fade" @after-leave="afterLeave">
    <div
      v-if="visible"
      class="splash-screen"
      :class="$q.dark.isActive ? 'bg-dark q-pa-md' : 'bg-light q-pa-md'"
    >
      <!-- You can place your SVG logo here -->
      <img alt="workpro" src="/Logo_v2.svg" style="width: 180px; height: auto" />
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const visible = ref(true);

onMounted(() => {
  if (document.readyState === 'complete') {
    hideSplash();
  } else {
    window.addEventListener('load', hideSplash);
  }
});

const hideSplash = () => {
  setTimeout(() => {
    visible.value = false;
  }, 500);
};

const afterLeave = () => {
  // Any action you want to perform after the splash screen has completely disappeared
};
</script>

<style scoped>
.splash-screen {
  z-index: 10000;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-dark {
  background-color: #1d1d1d; /* Adjust with your dark mode color */
}

.bg-light {
  background-color: #ffffff; /* Adjust with your light mode color */
}

/* Transition Styles */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
