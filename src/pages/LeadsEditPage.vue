<script setup>
import {computed, onMounted, ref} from 'vue';
import {useLeadsStore} from 'stores/leads';
import {useRoute} from 'vue-router';
import {useI18n} from 'vue-i18n';
import {Notify} from 'quasar';
import SaveCreate from 'components/SaveCreateComponent.vue';
import {useChatsStore} from 'stores/chats';
import {useAuthStore} from 'stores/auth';
import moment from 'moment';

const {t} = useI18n();

// Get route parameters
const route = useRoute();
const leadId = ref(route.params.id);

const leadsStore = useLeadsStore();
const chatsStore = useChatsStore(); // Initialize the chats store
const authStore = useAuthStore(); // Initialize the auth store

const attachments = ref([]);

function fetchAttachments() {
  // Simulating an API call for demonstration
  attachments.value = [
    { name: 'File 1', url: '/path/to/file1' },
    { name: 'File 2', url: '/path/to/file2' },
    { name: 'File 3', url: '/path/to/file3' }
  ];
}

const formatTimestamp = (timestamp) => {
  return moment(timestamp).format('DD.MM.YYYY HH:mm');
};

const chatMessage = ref('');

const sendMessage = async () => {
  if (chatMessage.value.trim()) {
    try {
      // Use the createChat action to send a chat message
      await chatsStore.createChat({
        subject_uuid: leadId.value, // Subject ID corresponds to leadId in this context
        users_id: authStore.user.id, // You may need to replace 'currentUser' with the actual user ID
        message: chatMessage.value
      });

      console.log('Message sent:', chatMessage.value);
      chatMessage.value = ''; // Clear the input after sending
    } catch (error) {
      console.error('Could not send message:', error);
    }
  }
};

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

// Also load chats for the lead
const loadLeadChats = async () => {
  await chatsStore.fetchChats( leadId.value ); // Pass the leadId to fetch chats related to the lead
};
// Data updating method
const updateLead = async () => {
  // await leadsStore.updateLead(leadId.value, leadsStore.lead);
  // Navigate back to the leads list or show a success message
  //await router.push('/leads');
  Notify.create({
    message: t('message.leadSaved'),
    color: 'positive',
    position: 'top',
  });
};

onMounted(() => {
  fetchAttachments();
  loadLeadData();
  loadLeadChats();
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
                    <div class="text-subtitle1 q-mt-lg">
                      {{ $t('leadAttachments') }}
                    </div>
                    <div class="row q-col-gutter-md q-mt-md">
                      <div class="col-12">
                        <q-list bordered class="attachment-list">
                          <q-item v-for="(attachment, index) in attachments" :key="index" clickable>
                            <q-item-section avatar>
                              <q-icon name="insert_drive_file" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label>{{ attachment.name }}</q-item-label>
                            </q-item-section>
                            <q-item-section side>
                              <q-btn flat round dense icon="file_download" :href="attachment.url" target="_blank" />
                            </q-item-section>
                          </q-item>
                        </q-list>
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
                      <q-input
                        v-model="leadsStore.lead.users.user_settings.country"
                        :label="$t('country')"
                        outlined
                        dense
                        required
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
              <q-card flat class="shadow-1">
                <q-card-section>
                  <div class="text-h6">
                    {{ $t('leadChat') }}
                  </div>
                  <!-- Display chat messages -->
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
              </q-card>
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
