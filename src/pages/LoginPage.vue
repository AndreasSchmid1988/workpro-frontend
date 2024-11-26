<template>
  <div class="main_bg">
    <div class="flex flex-center" style="min-height: 100vh">
      <q-card
        @keydown.enter="authStore.login()"
        flat
        class="bg-white shadow_custom q-card-responsive q-pa-none"
      >
        <q-card-section class="q-pa-none">
          <div class="row">
            <!-- Diese Spalte wird nur auf großen Bildschirmen angezeigt -->
            <div class="col-lg-5 loginSidepanel" v-if="$q.screen.gt.md">
              <div
                class="flex items-center justify-center"
                style="width: 100%; height: 100%"
              >
                <div
                  class="row text-white text-caption text-center q-pa-md q-col-gutter-y-xl"
                  style="font-size: 15px"
                >
                  <div>
                    <div>
                      <q-icon style="font-size: 40pt" class="q-mb-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24.621" height="14.121" viewBox="0 0 24.621 14.121">
                          <g id="Interface-Essential_Stats_graph-stats-ascend" data-name="Interface-Essential / Stats / graph-stats-ascend" transform="translate(-206.694 -2259.939)">
                            <g id="Group_206" data-name="Group 206">
                              <g id="graph-stats-ascend">
                                <path id="Shape_919" data-name="Shape 919" d="M230.255,2267.75V2261h-6.75" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                                <path id="Shape_920" data-name="Shape 920" d="M230.255,2261l-7.939,7.939a1.5,1.5,0,0,1-2.122,0l-3.128-3.128a1.5,1.5,0,0,0-2.122,0L207.755,2273" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                              </g>
                            </g>
                          </g>
                        </svg>


                      </q-icon>
                    </div>
                    {{ $t('login.first') }}
                  </div>
                  <div>
                    <div>
                      <q-icon style="font-size: 40pt" class="q-mb-md">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                        >
                          <g
                            id="Transportation_Dashboard-Symbols_car-dashboard-speed"
                            data-name="Transportation / Dashboard-Symbols / car-dashboard-speed"
                            transform="translate(-666 -1987.779)"
                          >
                            <g id="Group_150" data-name="Group 150">
                              <g id="car-dashboard-speed">
                                <path
                                  id="Oval_177"
                                  data-name="Oval 177"
                                  d="M678,2011.029a11.25,11.25,0,1,0-11.25-11.25A11.25,11.25,0,0,0,678,2011.029Z"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="1.5"
                                />
                                <path
                                  id="Oval_178"
                                  data-name="Oval 178"
                                  d="M678,2000.529a1.5,1.5,0,1,0-1.5-1.5A1.5,1.5,0,0,0,678,2000.529Z"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="1.5"
                                />
                                <path
                                  id="Shape_1141"
                                  data-name="Shape 1141"
                                  d="M682.5,2005.029a1.5,1.5,0,0,1-1.5,1.5h-6a1.5,1.5,0,0,1,0-3h6A1.5,1.5,0,0,1,682.5,2005.029Z"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="1.5"
                                />
                                <path
                                  id="Shape_1142"
                                  data-name="Shape 1142"
                                  d="M675.178,1991.279l.513,1.409"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="1.5"
                                />
                                <path
                                  id="Shape_1143"
                                  data-name="Shape 1143"
                                  d="M670.855,1994.9l1.3.75"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="1.5"
                                />
                                <path
                                  id="Shape_1144"
                                  data-name="Shape 1144"
                                  d="M669.875,2000.46l1.478-.261"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="1.5"
                                />
                                <path
                                  id="Shape_1145"
                                  data-name="Shape 1145"
                                  d="M680.822,1991.279l-.513,1.409"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="1.5"
                                />
                                <path
                                  id="Shape_1146"
                                  data-name="Shape 1146"
                                  d="M685.145,1994.9l-5.846,3.375"
                                  fill="none"
                                  stroke="currentColor"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="1.5"
                                />
                                <path
                                  id="Shape_1147"
                                  data-name="Shape 1147"
                                  d="M686.125,2000.46l-1.478-.261"
                                  fill="none"
                                  stroke="currentColor"
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

                    {{ $t('login.second') }}
                  </div>
                  <div>
                    <div>
                      <q-icon style="font-size: 40pt" class="q-mb-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                          <g id="Interface-Essential_Lock_Unlock_lock-shield" data-name="Interface-Essential / Lock/Unlock / lock-shield" transform="translate(-207.005 -1463)">
                            <g id="Group_130" data-name="Group 130">
                              <g id="lock-shield">
                                <path id="Rectangle-path_50" data-name="Rectangle-path 50" d="M213.755,1474.25a1.5,1.5,0,0,1,1.5-1.5h7.5a1.5,1.5,0,0,1,1.5,1.5v4.5a1.5,1.5,0,0,1-1.5,1.5h-7.5a1.5,1.5,0,0,1-1.5-1.5Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                                <path id="Shape_623" data-name="Shape 623" d="M219.005,1476.12a.374.374,0,1,0,.265.109.375.375,0,0,0-.265-.109h0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                                <path id="Shape_624" data-name="Shape 624" d="M215.255,1472.75v-2.25a3.75,3.75,0,0,1,7.5,0v2.25" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                                <path id="Shape_625" data-name="Shape 625" d="M219.005,1486.25c-6.676-1.781-11.25-5.74-11.25-12.75v-9.75h22.5v9.75C230.255,1480.505,225.688,1484.467,219.005,1486.25Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                              </g>
                            </g>
                          </g>
                        </svg>
                      </q-icon>
                    </div>
                    {{ $t('login.third') }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Diese Spalte wird auf allen Bildschirmgrößen angezeigt -->
            <div
              class="col-xs-12 col-lg-7 q-px-xl q-py-lg"
              :class="{
                loginPanelBorders: $q.screen.gt.md && !$q.dark.isActive,
                loginPanel: !$q.dark.isActive,
              }"
            >
              <div class="row q-mt-lg text-center">
                <q-toolbar-title
                  style="
                    color: #566a7f;
                    font-size: 1.6rem;
                    letter-spacing: -0.5px;
                  "
                  class="text-weight-medium"
                >
                  <img
                    alt="workpro"
                    src="/Logo_v2.svg"
                    :class="$q.dark.isActive ? 'logo-white' : ''"
                    style="width: 180px; height: auto"
                  />
                </q-toolbar-title>
              </div>

              <div
                style="font-size: 23px"
                class="row q-mt-lg text-weight-medium"
              >
                {{ $t('welcomeToWorkPro') }}
              </div>
              <div
                style="color: #697a8d; font-size: 15px"
                class="text-caption q-mt-xs"
              >
                {{ $t('signInPrompt') }}
              </div>

              <div class="q-mt-lg">
                <q-input
                  v-model="authStore.username"
                  class="q-py-sm"
                  outlined
                  :label="$t('Email')"
                  type="email"
                />
                <q-input
                  v-model="authStore.password"
                  class="q-py-sm"
                  :type="authStore.isPassword ? 'password' : 'text'"
                  outlined
                  :label="$t('Password')"
                >
                  <template v-slot:append>
                    <q-icon
                      :name="
                        authStore.isPassword ? 'visibility' : 'visibility_off'
                      "
                      class="cursor-pointer"
                      @click="authStore.isPassword = !authStore.isPassword"
                    />
                  </template>
                </q-input>
              </div>
              <!--
                            <div class="q-py-sm q-pa-none text-grey-9">
                              <q-checkbox v-model="authStore.remember_me"/>
                              {{ $t('rememberMe') }}
                            </div>
                            -->
              <div class="text-grey-8">
                <q-btn
                  to="/forgot-password"
                  flat
                  dense
                  class="text-capitalize text-blue q-px-sm"
                  :label="$t('forgotPassword')"
                />
              </div>
              <div class="row q-pt-lg">
                <q-btn
                  :loading="authStore.loading"
                  class="full-width"
                  :label="$t('signIn')"
                  @click="authStore.login()"
                  :disabled="!authStore.isValidLogin"
                  type="button"
                  color="primary"
                />
              </div>
              <div class="q-my-lg text-center text-grey-8">
                {{ $t('newOnPlatform') }}
                <q-btn
                  to="/register"
                  flat
                  dense
                  class="text-capitalize text-blue q-px-sm"
                  :label="$t('createAccount')"
                />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from 'stores/auth';

const authStore = useAuthStore();
</script>

<style scoped>
.main_bg {
  /*background-color: white;*/
}

.loginSidepanel {
  border-radius: 4px 0 0 4px;
  background: url('/background.jpg');
  background-position: top left;
  background-repeat: no-repeat;
  background-size: cover;

  /*
    background: url('background.jpg');
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
      */
}

.loginPanel {
  border-radius: 4px;
  background-color: white !important;
}

.loginPanelBorders {
  border-radius: 0 4px 4px 0;
  background-color: white !important;
}

.loginPanel-dark {
  border-radius: 4px;
}

.loginPanelBorders-dark {
  border-radius: 0 4px 4px 0;
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

:deep(.shadow_custom) {
  box-shadow: none !important;
}

/* Mobile-first approach */
.q-card-responsive {
  background-color: transparent !important;
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
    width: 750px;
  }
}
</style>
