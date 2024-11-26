<script setup>
import { onMounted, ref } from 'vue';
import { useAuthStore } from 'stores/auth';
import AccountDetailsForm from 'components/account/AccountDetailsForm.vue';

const authStore = useAuthStore();

const loadData = (done) => {
  authStore.fetchUserDetails();
  authStore.userInfo().then(() => {
    if (done) {
      done();
    }
  });
};

const showPassword = ref(false);

function formatDateTimeIntl(date) {
  if (!date) return '';

  return Intl.DateTimeFormat(navigator.language, {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(new Date(date));
}

// Fetch the data when the component is mounted
onMounted(() => {
  loadData(null);
});
</script>
<template>
  <q-page>
    <q-pull-to-refresh :disable="!$q.platform.is.mobile" @refresh="loadData">
      <div class="q-ma-lg q-pt-md">
        <div class="row q-col-gutter-md">
          <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
            <q-card flat class="shadow_custom q-pa-none q-ma-none">
              <div v-if="authStore.user?.roles[0]?.name === 'admin'">
                <q-card-section>
                  <div class="row">
                    <div class="col-12 flex justify-between">
                      <div class="text-h6">{{ $t('User details') }}</div>
                    </div>
                  </div>
                </q-card-section>
                <q-card-section class="q-pt-none q-pb-lg">
                  <div class="row">
                    <div class="col-xs-12">
                      <div class="text-caption text-weight-bold">
                        {{ $t('userId') }}
                      </div>
                      <div>
                        {{ authStore.user_id }}
                      </div>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-xs-12 col-lg-3 q-pt-md">
                      <div class="text-caption text-weight-bold">
                        {{ $t('created') }}
                      </div>
                      <div>
                        {{ formatDateTimeIntl(authStore.created_at) }}
                      </div>
                    </div>
                    <div class="col-xs-12 col-lg-3 q-pt-md">
                      <div class="text-caption text-weight-bold">
                        {{ $t('updated') }}
                      </div>
                      <div>
                        {{ formatDateTimeIntl(authStore.updated_at) }}
                      </div>
                    </div>
                    <div class="col-xs-12 col-lg-3 q-pt-md">
                      <div class="text-caption text-weight-bold">
                        {{ $t('verified') }}
                      </div>
                      <div>
                        {{
                          authStore.email_verified_at
                            ? formatDateTimeIntl(authStore.email_verified_at)
                            : $t('notYetVerified')
                        }}
                      </div>
                    </div>
                    <div class="col-xs-12 col-lg-3 q-pt-md">
                      <div class="text-caption text-weight-bold">
                        {{ $t('lastLogin') }}
                      </div>
                      <div>
                        {{
                          authStore.last_login
                            ? formatDateTimeIntl(authStore.last_login)
                            : $t('noLoginYet')
                        }}
                      </div>
                    </div>
                  </div>
                </q-card-section>

                <q-separator class="q-ma-md"></q-separator>
              </div>

              <!-- Title Section -->
              <q-card-section>
                <div class="row">
                  <div class="col-12 flex q-gutter-x-sm">
                    <div class="text-h6">{{ $t('profileData') }}</div>
                    <q-badge
                      v-if="authStore.userActive"
                      color="positive"
                      class="text-weight-bold"
                    >
                      {{ $t('accountStatusActive') }}
                    </q-badge>
                    <q-badge v-else color="warning" class="text-weight-bold">
                      {{ $t('accountStatusInactive') }}
                    </q-badge>
                  </div>
                </div>
                <q-banner
                  class="q-my-md bg-grey-2 q-pa-lg"
                  v-if="
                    !authStore.userActive &&
                    !authStore.user?.roles[0]?.name === 'admin'
                  "
                >
                  {{ $t('profileInfo') }}
                  <template v-slot:avatar>
                    <q-icon>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <g
                          id="Interface-Essential_Alerts_information-circle"
                          data-name="Interface-Essential / Alerts / information-circle"
                          transform="translate(-447.005 -1907)"
                        >
                          <g id="Group_186" data-name="Group 186">
                            <g id="information-circle">
                              <path
                                id="Shape_838"
                                data-name="Shape 838"
                                d="M461.255,1923.5h-.75a1.5,1.5,0,0,1-1.5-1.5v-3.75a.75.75,0,0,0-.75-.75h-.75"
                                fill="none"
                                stroke="#000"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                              />
                              <path
                                id="Shape_839"
                                data-name="Shape 839"
                                d="M458.63,1913.75a.375.375,0,1,0,.375.375.375.375,0,0,0-.375-.375h0"
                                fill="none"
                                stroke="#000"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                              />
                              <path
                                id="Oval_118"
                                data-name="Oval 118"
                                d="M459.005,1930.25a11.25,11.25,0,1,0-11.25-11.25A11.25,11.25,0,0,0,459.005,1930.25Z"
                                fill="none"
                                stroke="#000"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                              />
                            </g>
                          </g>
                        </g>
                      </svg>
                    </q-icon>
                  </template>
                </q-banner>
              </q-card-section>

              <q-card-section class="q-pt-none">
                <q-form
                  autocorrect="off"
                  autocapitalize="off"
                  autocomplete="off"
                  spellcheck="false"
                >
                  <!-- Personal Information Fields -->
                  <AccountDetailsForm></AccountDetailsForm>
                </q-form>
              </q-card-section>
              <q-card-actions align="center">
                <div v-if="!authStore.loading">
                  <q-btn
                    :loading="authStore.updating"
                    class="q-mx-md q-mb-md"
                    :label="$t('saveProfileData')"
                    color="primary"
                    @click="authStore.saveUserDetails()"
                  />
                </div>
              </q-card-actions>
              <q-inner-loading :showing="authStore.loading">
                <q-spinner color="primary" size="3em" />
              </q-inner-loading>
            </q-card>
          </div>
          <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
            <q-card flat class="shadow_custom q-pa-none q-ma-none">
              <!-- Title Section -->
              <q-card-section>
                <div class="text-h6">{{ $t('apiAccessData') }}</div>

                <q-banner
                  class="q-my-md bg-grey-2 q-pa-lg"
                  v-if="!authStore.user?.roles[0]?.name === 'admin'"
                >
                  {{ $t('apiAccessInfo') }}
                  <template v-slot:avatar>
                    <q-icon>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <g
                          id="Interface-Essential_Alerts_information-circle"
                          data-name="Interface-Essential / Alerts / information-circle"
                          transform="translate(-447.005 -1907)"
                        >
                          <g id="Group_186" data-name="Group 186">
                            <g id="information-circle">
                              <path
                                id="Shape_838"
                                data-name="Shape 838"
                                d="M461.255,1923.5h-.75a1.5,1.5,0,0,1-1.5-1.5v-3.75a.75.75,0,0,0-.75-.75h-.75"
                                fill="none"
                                stroke="#000"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                              />
                              <path
                                id="Shape_839"
                                data-name="Shape 839"
                                d="M458.63,1913.75a.375.375,0,1,0,.375.375.375.375,0,0,0-.375-.375h0"
                                fill="none"
                                stroke="#000"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                              />
                              <path
                                id="Oval_118"
                                data-name="Oval 118"
                                d="M459.005,1930.25a11.25,11.25,0,1,0-11.25-11.25A11.25,11.25,0,0,0,459.005,1930.25Z"
                                fill="none"
                                stroke="#000"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                              />
                            </g>
                          </g>
                        </g>
                      </svg>
                    </q-icon>
                  </template>
                </q-banner>
                <q-banner
                  class="q-my-md bg-grey-2 q-pa-lg"
                  v-if="
                    authStore.user?.roles[0]?.name === 'admin' &&
                    (!authStore.apiKey || authStore.apiKey.length === 0)
                  "
                >
                  {{ $t('apiAdminInfo') }}
                  <template v-slot:avatar>
                    <q-icon>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <g
                          id="Interface-Essential_Alerts_information-circle"
                          data-name="Interface-Essential / Alerts / information-circle"
                          transform="translate(-447.005 -1907)"
                        >
                          <g id="Group_186" data-name="Group 186">
                            <g id="information-circle">
                              <path
                                id="Shape_838"
                                data-name="Shape 838"
                                d="M461.255,1923.5h-.75a1.5,1.5,0,0,1-1.5-1.5v-3.75a.75.75,0,0,0-.75-.75h-.75"
                                fill="none"
                                stroke="#000"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                              />
                              <path
                                id="Shape_839"
                                data-name="Shape 839"
                                d="M458.63,1913.75a.375.375,0,1,0,.375.375.375.375,0,0,0-.375-.375h0"
                                fill="none"
                                stroke="#000"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                              />
                              <path
                                id="Oval_118"
                                data-name="Oval 118"
                                d="M459.005,1930.25a11.25,11.25,0,1,0-11.25-11.25A11.25,11.25,0,0,0,459.005,1930.25Z"
                                fill="none"
                                stroke="#000"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="1.5"
                              />
                            </g>
                          </g>
                        </g>
                      </svg>
                    </q-icon>
                  </template>
                </q-banner>
              </q-card-section>

              <q-card-section class="q-pt-none">
                <q-form
                  autocorrect="off"
                  autocapitalize="off"
                  autocomplete="off"
                  spellcheck="false"
                >
                  <div class="row q-col-gutter-xs">
                    <!-- API Key -->
                    <div class="col-xs-12">
                      <q-input
                        outlined
                        dense
                        :type="showPassword ? 'text' : 'password'"
                        :error="!!authStore.apiKeyError"
                        :error-message="authStore.apiKeyError"
                        v-model="authStore.apiKey"
                        label="API-Key"
                        @update:model-value="authStore.typedApiKey()"
                      >
                        <template v-slot:append>
                          <q-icon
                            :name="
                              !showPassword ? 'visibility' : 'visibility_off'
                            "
                            class="cursor-pointer"
                            @click="showPassword = !showPassword"
                          />
                        </template>
                      </q-input>
                    </div>
                    <!-- Publisher Id -->
                    <div class="col-xs-12">
                      <q-input
                        outlined
                        dense
                        :error="!!authStore.publisherIdError"
                        :error-message="authStore.publisherIdError"
                        v-model="authStore.publisherId"
                        label="Publisher ID"
                        @blur="authStore.typedPublisherId()"
                        @update:model-value="authStore.typedPublisherId()"
                      />
                    </div>
                    <!-- Publisher Name -->
                    <div class="col-xs-12">
                      <q-input
                        outlined
                        dense
                        :error="!!authStore.publisherNameError"
                        :error-message="authStore.publisherNameError"
                        v-model="authStore.publisherName"
                        label="Publisher Name"
                        @blur="authStore.typedPublisherName()"
                        @update:model-value="authStore.typedPublisherName()"
                      />
                    </div>
                  </div>
                </q-form>
              </q-card-section>
              <q-card-actions align="center">
                <div v-if="!authStore.loading" class="q-gutter-sm">
                  <q-btn
                    :loading="authStore.updatingApiKey"
                    class="q-mb-md"
                    :label="$t('saveApiAccess')"
                    type="submit"
                    color="primary"
                    @click="authStore.saveApiKey()"
                  />
                  <q-btn
                    :loading="authStore.creatingPublisher"
                    v-if="authStore.user?.roles[0]?.name === 'admin'"
                    :disable="
                      authStore.apiKeyHidden &&
                      authStore.apiKeyHidden.length > 0 &&
                      authStore.apiKey &&
                      authStore.apiKey.length > 0
                    "
                    outline
                    class="q-mb-md"
                    :label="$t('createPublisher')"
                    color="primary"
                    @click="authStore.createPublisher()"
                  />
                </div>
              </q-card-actions>
              <q-inner-loading :showing="authStore.loading">
                <q-spinner color="primary" size="3em" />
              </q-inner-loading>
            </q-card>
          </div>
        </div>
      </div>
    </q-pull-to-refresh>
  </q-page>
</template>
