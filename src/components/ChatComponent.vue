<template>
  <div class="chat-component">
    <q-card flat class="shadow-1">
      <q-card-section>
        <div class="text-h6">
          {{ headerText }}
        </div>
        <div class="chat-messages">
          <q-scroll-area class="chat-scroll" style="height: 200px;">
            <q-chat-message
              v-for="chat in chats"
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
        <q-input
          v-model="chatMessage"
          :placeholder="t('enterYourMessage')"
          outlined
          dense
          @keyup.enter="sendMessage"
          :disable="loading"
        >
          <template v-slot:append>
            <q-btn
              :disable="!chatMessage"
              color="primary"
              @click="sendMessage"
              icon="send"
              flat
              rounded
              :loading="loading"
            />
          </template>
        </q-input>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useChatsStore } from 'stores/chats';
import {useAuthStore} from 'stores/auth';


const { t } = useI18n();
const chatsStore = useChatsStore();
const authStore = useAuthStore();
const chatMessage = ref('');
const loading = computed(() => chatsStore.loading);
const chats = computed(() => chatsStore.chats);

const props = defineProps<{
  subjectId: string;
  headerText: string; // Add headerText prop
}>();

const loadLeadChats = async () => {
  await chatsStore.fetchChats(props.subjectId);
};

const sendMessage = async () => {
  if (chatMessage.value.trim()) {
    // Access user's ID from the auth store
    const users_id = authStore.user.id; // Adjust this based on your actual store structure

    const chatData = {
      subject_uuid: props.subjectId,
      message: chatMessage.value,
      users_id  // Include the users_id
    };

    await chatsStore.createChat(chatData);
    chatMessage.value = '';
  }
};

const formatTimestamp = (timestamp: string) => new Date(timestamp).toLocaleString();

onMounted(() => {
  loadLeadChats();
});
</script>

<style>
.chat-component {
  /* Add any styles for your chat component */
}
.chat-scroll {
  /* Customize scroll area styles */
}
</style>
