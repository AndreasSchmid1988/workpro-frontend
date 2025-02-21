<script setup>
import {computed, onMounted, ref} from 'vue';
import {useLeadsStore} from 'stores/leads';
import {useRoute} from 'vue-router';
import {useI18n} from 'vue-i18n';
import SaveCreate from 'components/SaveCreateComponent.vue';
import moment from 'moment';
import CountrySelector from 'components/CountrySelector.vue';
import FileComponent from 'components/FileComponent.vue';
import ChatComponent from 'components/ChatComponent.vue';

const {t} = useI18n();

// Get route parameters
const route = useRoute();
const leadId = ref(route.params.id);

const leadsStore = useLeadsStore();

const countryError = ref(false); // or a computed property based on specific logic
const countryErrorMessage = ref(''); // or a computed property returning the actual error message


// Dropdown Options
const leadTypeOptions = computed(() => [
  {label: t('private'), value: 'private'},
  {label: t('company'), value: 'company'},
]);

const leadSourceOptions = [
  {label: 'Website', value: 'website'},
  {label: 'Email', value: 'email'},
  {label: 'Phone', value: 'phone'},
  {label: 'Facebook', value: 'facebook'},
  {label: 'Instagram', value: 'instagram'},
  {label: 'Twitter', value: 'twitter'},
  {label: 'Other', value: 'other'},
];

const leadStatusOptions = [
  {label: t('leadStatuses.new'), value: 'new'},
  {label: t('leadStatuses.contacted'), value: 'contacted'},
  {label: t('leadStatuses.qualified'), value: 'qualified'},
  {label: t('leadStatuses.lost'), value: 'lost'},
  {label: t('leadStatuses.converted'), value: 'converted'},
];

const leadSalutationOptions = [
  {label: t('salutations.Mr'), value: 'Mr'},
  {label: t('salutations.Mrs'), value: 'Mrs'},
  {label: t('salutations.Diverse'), value: 'Diverse'},
];

// Data fetching method
const loadLeadData = async () => {
  await leadsStore.fetchLeadDetails(leadId.value);
};

// Data updating method
const updateLead = async () => {
  await leadsStore.updateLead(leadId.value, leadsStore.lead);
  // Navigate back to the leads list or do any other required action
};

onMounted(() => {
  loadLeadData();
});
</script>

<template>
  <q-page>
    <q-pull-to-refresh :disable="!$q.platform.is.mobile" @refresh="loadLeadData">
      <div class="q-ma-lg q-pt-md">
        <div class="row q-col-gutter-md">
          <!--  Lead Rating and Infos -->
          <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
            <div class="q-gutter-md q-mt-md">
              <q-card flat class="shadow-1">
                <q-card-section>
                  <div class="text-h6">
                    {{ $t('leadInformation') }}
                  </div>
                  <!-- Lead Details -->
                  <div class="row q-col-gutter-md q-mt-md">
                    <div class="col-md-4 col-12">
                      <q-select
                        v-model="leadsStore.lead.lead_type"
                        :options="leadTypeOptions"
                        :label="$t('leadType')"
                        outlined
                        dense
                        required
                        emit-value
                        map-options
                      />
                    </div>
                    <div class="col-md-4 col-12">
                      <q-select
                        v-model="leadsStore.lead.lead_source"
                        :options="leadSourceOptions"
                        :label="$t('leadSource')"
                        outlined
                        dense
                        required
                        emit-value
                        map-options
                      />
                    </div>
                    <div class="col-md-4 col-12">
                      <q-select
                        v-model="leadsStore.lead.lead_status"
                        :options="leadStatusOptions"
                        :label="$t('leadStatus')"
                        outlined
                        dense
                        required
                        emit-value
                        map-options
                      />
                    </div>
                  </div>

                  <div class="text-subtitle1 q-mt-lg">
                    {{ $t('revenuePotential') }}
                  </div>
                  <div class="row q-col-gutter-md q-mt-sm">
                    <div class="col-12">
                      <q-rating
                        v-model="leadsStore.lead.rating"
                        max="5"
                        size="2em"
                        color="primary"
                        icon="star_border"
                        icon-selected="star"
                        icon-half="star_half"
                        no-dimming
                      />
                    </div>
                  </div>

                  <div class="text-subtitle1 q-mt-lg">
                    {{ $t('leadMessage') }}
                  </div>
                  <div class="row q-col-gutter-md q-mt-md">
                    <div class="col-12">
                      <q-input
                        v-model="leadsStore.lead.subject"
                        :label="$t('subject')"
                        outlined
                        dense
                        required
                      />
                    </div>
                    <div class=" col-12">
                      <q-editor
                        v-model="leadsStore.lead.message"
                        :definitions="{
/*                          save: {
                            tip: 'Save your work',
                            icon: 'save',
                            label: 'Save',
                            handler: saveWork
                          },
                          upload: {
                            tip: 'Upload to cloud',
                            icon: 'cloud_upload',
                            label: 'Upload',
                            handler: uploadIt
                          }*/
                        }"
                        :toolbar="[
                          ['bold', 'italic', 'strike', 'underline'],
                          ['upload', 'save']
                        ]"
                      />
                    </div>
                  </div>

                  <div>
                    <div class="row q-col-gutter-md q-mt-md">
                      <div class="col-12">
                        <FileComponent :external-uuid="leadId.toString()"/>
                      </div>
                    </div>
                  </div>

                </q-card-section>
                <!--                <q-card-actions align="center">
                                  <q-btn
                                    :loading="leadsStore.loading"
                                    :disable="leadsStore.loading"
                                    :label="$t('save')"
                                    color="primary"
                                    type="submit"
                                  />
                                </q-card-actions>-->
              </q-card>
            </div>
          </div>
          <!-- Lead Details -->
          <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
            <div class="q-gutter-md q-mt-md">
              <q-card flat class="shadow-1">
                <q-card-section>
                  <div class="text-h6">
                    {{ $t('contactDetails') }}
                  </div>

                  <!-- Personal Information -->
                  <div class="text-subtitle1 q-mt-lg">
                    {{ $t('personalDetails') }}
                  </div>

                  <div class="row q-col-gutter-md q-mt-sm">
                    <div class="col-md-6 col-12">
                      <q-select
                        v-model="leadsStore.lead.users.user_settings.salutation"
                        :options="leadSalutationOptions"
                        :label="$t('salutation')"
                        outlined
                        dense
                        required
                        emit-value
                        map-options
                      />
                    </div>
                    <div class="col-md-6 col-12">
                      <q-input
                        v-model="leadsStore.lead.users.user_settings.title"
                        :label="$t('title')"
                        outlined
                        dense
                        required
                      />
                    </div>
                    <div class="col-md-6 col-12">
                      <q-input
                        v-model="leadsStore.lead.users.user_settings.firstname"
                        :label="$t('firstname')"
                        outlined
                        dense
                        required
                      />
                    </div>
                    <div class="col-md-6 col-12">
                      <q-input
                        v-model="leadsStore.lead.users.user_settings.lastname"
                        :label="$t('lastname')"
                        outlined
                        dense
                        required
                      />
                    </div>
                    <div class="col-md-6 col-12">
                      <q-input
                        v-model="leadsStore.lead.users.user_settings.phone"
                        :label="$t('phone')"
                        outlined
                        dense
                        required
                      />
                    </div>
                    <div class="col-md-6 col-12">
                      <q-input
                        v-model="leadsStore.lead.users.user_settings.mobile"
                        :label="$t('mobile')"
                        outlined
                        dense
                        required
                      />
                    </div>
                    <div class="col-md-6 col-12">
                      <q-input
                        v-model="leadsStore.lead.users.email"
                        :label="$t('email')"
                        outlined
                        dense
                        required
                      />
                    </div>
                  </div>
                  <!-- Address Details -->
                  <div class="text-subtitle1 q-mt-lg">
                    {{ $t('leadAddress') }}
                  </div>
                  <div class="row q-col-gutter-md q-mt-sm">
                    <div class="col-md-12 col-12">
                      <q-input
                        v-model="leadsStore.lead.users.user_settings.company"
                        :label="$t('company')"
                        outlined
                        dense
                        required
                      />
                    </div>
                    <div class="col-md-6 col-12">
                      <q-input
                        v-model="leadsStore.lead.users.user_settings.address"
                        :label="$t('address')"
                        outlined
                        dense
                        required
                      />
                    </div>
                    <div class="col-md-6 col-12">
                      <q-input
                        v-model="leadsStore.lead.users.user_settings.city"
                        :label="$t('city')"
                        outlined
                        dense
                        required
                      />
                    </div>
                    <div class="col-md-6 col-12">
                      <!--                      <CountrySelector
                                              v-model="leadsStore.lead.users.user_settings.country"
                                            />-->
                      <CountrySelector
                        v-model="leadsStore.lead.users.user_settings.country"
                        :error="countryError"
                        :error-message="countryErrorMessage"
                      />
                    </div>
                  </div>
                </q-card-section>
                <!--                <q-card-actions align="center">
                                  <q-btn
                                    :loading="leadsStore.loading"
                                    :disable="leadsStore.loading"
                                    :label="$t('save')"
                                    color="primary"
                                    type="submit"
                                  />
                                </q-card-actions>-->
              </q-card>
            </div>
          </div>
          <!-- Lead Chat -->
          <div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
            <div class="q-gutter-md q-mt-md">
              <ChatComponent :header-text="$t('leadChat')" :subject-id="leadId.toString()"/>
              <!--              <q-card flat class="shadow-1">
                              <q-card-section>
                                <div class="text-h6">
                                  {{ $t('leadChat') }}
                                </div>
                                &lt;!&ndash; Display chat messages &ndash;&gt;
                                <div class="row q-col-gutter-md q-mt-md">
                                  <q-scroll-area class="col-12" style="height: 200px;">
                                    <q-chat-message
                                      v-for="chat in chatsStore.chats"
                                      :key="chat.id"
                                      :name="chat.users.user_settings.firstname + ' ' + chat.users.user_settings.lastname"
                                      :avatar="chat.users.profile_photo_path"
                                      :stamp="formatTimestamp(chat.created_at)"
                                      text-color="white"
                                      bg-color="primary"
                                    >
                                      <div>{{ chat.message }}</div>
                                    </q-chat-message>
                                  </q-scroll-area>
                                </div>
                              </q-card-section>
                              <q-card-section>
                                <div class="row q-col-gutter-md q-mt-md">
                                  <div class="col-12">
                                    <q-input
                                      v-model="chatMessage"
                                      :placeholder="$t('enterYourMessage')"
                                      outlined
                                      dense
                                      @keyup.enter="sendMessage"
                                      :disable="chatsStore.loading"
                                    >
                                      <template v-slot:append>
                                        <q-btn
                                          :disable="!chatMessage"
                                          color="primary"
                                          @click="sendMessage"
                                          icon="send"
                                          flat
                                          rounded
                                          :loading="chatsStore.loading"
                                        />
                                      </template>
                                    </q-input>
                                  </div>
                                </div>
                              </q-card-section>
                            </q-card>-->
            </div>
          </div>
        </div>
      </div>
    </q-pull-to-refresh>
  </q-page>

  <div class="row q-gutter-x-md justify-center">
    <SaveCreate :path="'/leads'" :id="leadId.toString()" :loading="leadsStore.loading"
                @save-button-clicked="updateLead"/>
  </div>

</template>

<style lang="sass">
.my-emoticon
  vertical-align: middle
  height: 2em
  width: 2em

.rating-container
  display: flex
  flex-direction: column
  align-items: start

</style>

<style scoped>
.attachment-list {

  margin: auto;
}
</style>
