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
            {{ $t('verifyingEmail') }}
          </div>
          <div
            v-if="authStore.loading"
            style="color: #697a8d; font-size: 15px"
            class="text-caption q-mt-xs"
          >
            {{ $t('tryToVerifyEmail') }}
          </div>
          <div
            v-if="authStore.emailVerified"
            style="color: #697a8d; font-size: 15px"
            class="text-caption q-mt-xs"
          >
            {{ $t('emailVerifySuccess') }}
          </div>
          <div
            v-if="authStore.emailVerifyError"
            style="color: #697a8d; font-size: 15px"
            class="text-caption q-mt-xs"
          >
            {{ $t('emailVerifyError') }}
          </div>
          <div
            v-if="authStore.emailVerified"
            class="row q-mt-lg text-grey-7 text-weight-medium justify-center"
          >
            <q-icon size="48px">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24.003"
                height="23.999"
                viewBox="0 0 24.003 23.999"
              >
                <g
                  id="Social-Medias-Rewards-Rating_Likes_like"
                  data-name="Social-Medias-Rewards-Rating / Likes/ like"
                  transform="translate(-475 -468)"
                >
                  <g id="Group_38" data-name="Group 38">
                    <g :stroke="getPaletteColor('primary')" id="like">
                      <path
                        id="Shape_152"
                        data-name="Shape 152"
                        d="M475.75,489.75v-10.5h1.5a7.5,7.5,0,0,0,7.5-7.5V471a2.25,2.25,0,0,1,4.5,0v3.75a1.5,1.5,0,0,0,1.5,1.5h3a4.5,4.5,0,0,1,4.477,4.95l-.465,4.649a6,6,0,0,1-5.97,5.4h-6.2a6.007,6.007,0,0,1-1.648-.231l-3.636-1.037a6.007,6.007,0,0,0-1.648-.231h-2.91"
                        fill="none"
                        stroke="inherit"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                      />
                    </g>
                  </g>
                </g>
              </svg>
            </q-icon>
          </div>
          <div
            v-if="authStore.emailVerifyError"
            class="row q-mt-lg text-grey-7 text-weight-medium justify-center"
          >
            <q-icon size="48px">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24.004"
                height="24"
                viewBox="0 0 24.004 24"
              >
                <g
                  id="Social-Medias-Rewards-Rating_Likes_dislike"
                  data-name="Social-Medias-Rewards-Rating / Likes/ dislike"
                  transform="translate(-282.996 -420)"
                >
                  <g id="Group_24" data-name="Group 24">
                    <g stroke="#851d1d" id="dislike">
                      <path
                        id="Shape_110"
                        data-name="Shape 110"
                        d="M306.25,422.25v10.5h-1.5a7.5,7.5,0,0,0-7.5,7.5V441a2.25,2.25,0,0,1-4.5,0v-3.75a1.5,1.5,0,0,0-1.5-1.5h-3a4.5,4.5,0,0,1-4.477-4.95l.465-4.649a6,6,0,0,1,5.97-5.4h6.2a6.007,6.007,0,0,1,1.648.231l3.634,1.038a6,6,0,0,0,1.648.231h2.91"
                        fill="none"
                        stroke="inherit"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                      />
                    </g>
                  </g>
                </g>
              </svg>
            </q-icon>
          </div>
          <div
            style="font-size: 23px"
            class="row q-mt-lg text-grey-7 text-weight-medium justify-center"
          >
            <q-spinner v-if="authStore.loading" color="primary" size="3em" />
          </div>
        </q-card-section>

        <q-card-section>
          <div class="row q-px-sm">
            <q-btn
              v-if="!authStore.loading"
              class="q-mt-lg full-width"
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

<script setup>
import { useAuthStore } from 'stores/auth';
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { colors } from 'quasar';

const authStore = useAuthStore();
const route = useRoute();
const { getPaletteColor } = colors;

onMounted(() => {
  const id = route.params.id;
  const hash = route.params.hash;

  authStore.verifyEmail(id, hash);
});
</script>

<style scoped>
/*.main_bg {
  background: linear-gradient(90deg, #f3f3f7 21px, transparent 1%) center,
  linear-gradient(#f3f3f7 21px, transparent 1%) center, #00a8a4;
  background-size: 23px 23px;
}*/

.shadow_custom {
  box-shadow: 0 2px 6px 0 rgb(67 89 113 / 12%) !important;
}
</style>
