<template>
  <div class="chat-component">
    <q-card flat class="shadow-1">
      <q-card-section>
        <div class="text-h6">
          {{ computedHeaderText }}
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
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useChatsStore } from 'stores/chats';


const { t } = useI18n();

const chatsStore = useChatsStore();
const chatMessage = ref('');

const loading = computed(() => chatsStore.loading);
const chats = computed(() => chatsStore.chats);

// Display header text if provided, otherwise fall back to a generic label.
const computedHeaderText = computed(() => props.headerText ?? t('chat'));

/**
 * The chat component can be used in different contexts (e.g. Leads, Offers, …).
 * Historically the id of the parent object has been passed either as
 * `subject-id` or as `external-uuid`. To remain backwards-compatible we accept
 * both prop names here and always pick the first one that is defined.
 */
const props = defineProps<{
  /**
   * ID/UUID of the parent resource (lead, offer, …). Optional because we can
   * receive the same piece of information via `externalUuid`.
   */
  subjectId?: string;
  /**
   * Alternative prop name that is already used by FileComponent and some
   * pages (e.g. OffersEditPage). Optional for backwards compatibility.
   */
  externalUuid?: string;
  /**
   * Optional header text that is displayed at the top of the card.
   */
  headerText?: string;
}>();

/**
 * Helper that returns the first defined parent id. The return value can be
 * `undefined` while the form/route is not fully initialised yet.
 */
const parentUuid = computed(() => props.subjectId ?? props.externalUuid);

const loadLeadChats = async () => {
  if (!parentUuid.value) {
    // When the parent id is not yet available we simply skip the request.
    return;
  }
  await chatsStore.fetchChats(parentUuid.value);
};

const sendMessage = async () => {
  if (!parentUuid.value) {
    // Should not happen because we normally wait for a valid id before
    // enabling the chat. Still, we guard against it to avoid requests with an
    // invalid uuid.
    return;
  }

  if (chatMessage.value.trim()) {
    // Access user's ID from the auth store
    const chatData = {
      subject_uuid: parentUuid.value,
      message: chatMessage.value,
      // users_id intentionally omitted; backend derives it from JWT token.
    };

    await chatsStore.createChat(chatData);
    chatMessage.value = '';
  }
};

const formatTimestamp = (timestamp: string) => new Date(timestamp).toLocaleString();

onMounted(() => {
  loadLeadChats();
});

// Reload chats whenever a (new) parent uuid is provided (e.g. after the
// resource has been created).
watch(parentUuid, (newUuid, oldUuid) => {
  if (newUuid && newUuid !== oldUuid) {
    loadLeadChats();
  }
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
