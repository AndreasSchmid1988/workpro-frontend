<script setup>
import { computed, onMounted, watch } from 'vue';
import { useAuthStore } from 'stores/auth';
import { useUsersStore } from 'stores/users';

const authStore = useAuthStore();
const userStore = useUsersStore();
const isDarkMode = computed(() => userStore.darkMode);

const swaggerDarkMode = (isDark) => {
  const linkElement = document.getElementById('swagger-dark-mode-styles');
  if (isDark) {
    if (!linkElement) {
      const link = document.createElement('link');
      link.id = 'swagger-dark-mode-styles';
      link.rel = 'stylesheet';
      link.href = '/css/swagger-dark-mode.css'; // Adjust the path as needed
      document.head.appendChild(link);
    }
  } else if (linkElement) {
    document.head.removeChild(linkElement);
  }
};

const initSwagger = () => {
  swaggerDarkMode(isDarkMode.value);

  const headers = {
    Authorization: 'Bearer ' + authStore.accessToken,
  };

  window.SwaggerUIBundle({
    url: process.env.APP_API_BASE_URL + '/api/v1/docs',
    dom_id: '#swagger-ui',
    layout: 'BaseLayout',
    requestInterceptor: function (req) {
      return {
        ...req,
        headers: {
          ...req.headers,
          ...headers,
        },
      };
    },
  });
};
onMounted(() => {
  initSwagger();
});

watch(isDarkMode, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    swaggerDarkMode(newVal);
  }
});
</script>
<template>
  <q-page>
    <div class="q-ma-lg q-pt-md">
      <q-card class="shadow_custom q-pa-none q-ma-none" flat>
        <q-card-section>
          <div class="text-h6">
            {{ $t('apiDocs') }}
          </div>
          <div :class="{ 'dark-mode': isDarkMode }" id="swagger-ui"></div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<style scoped></style>

<style lang="scss">
.swagger-ui {
  font-family: inherit !important;

  .main {
    font-family: inherit !important;
    display: none !important;
  }

  .description {
    font-family: inherit !important;
  }

  h3 {
    font-family: inherit !important;
  }

  h2 {
    margin: 30px 0 20px 0 !important;
    font-family: inherit !important;

    font-size: 50px;
    font-weight: 300;
  }

  p {
    font-family: inherit !important;
  }

  /*   remove on smaller devices */
  @media screen and (max-width: 768px) {
    .opblock .opblock-summary-path {
      flex-shrink: 0;
      max-width: 100px;
    }

    .opblock-body {
      border-collapse: collapse;
      width: 100%;
      overflow: auto;
    }

    h2 {
      font-size: 30px !important;
      font-weight: 300 !important;
    }

    .wrapper {
      margin: 0 !important;
      padding: 0 !important;
      max-width: none !important;
    }
  }

  .scheme-container {
    padding: 20px !important;
    box-shadow: rgba(0, 0, 0, 0) 0 0 0 0;
  }
}
</style>
