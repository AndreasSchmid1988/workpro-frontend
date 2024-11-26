<template>
  <q-btn
    :loading="notificationStore.loading"
    class="q-mr-sm q-py-xs q-px-sm"
    flat
    round
    color="grey"
    @click="notificationStore.fetchNotifications()"
  >
    <q-icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="19.5"
        height="23.999"
        viewBox="0 0 19.5 23.999"
      >
        <g
          id="Interface-Essential_Alert_alarm-bell"
          data-name="Interface-Essential / Alert / alarm-bell"
          transform="translate(-497.255 -2747)"
        >
          <g id="Group_262" data-name="Group 262">
            <g stroke="gray" id="alarm-bell">
              <path
                id="Shape_1189"
                data-name="Shape 1189"
                d="M505.005,2768.75a2.087,2.087,0,0,0,4.005,0"
                fill="none"
                stroke="inherit"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
              />
              <path
                id="Shape_1190"
                data-name="Shape 1190"
                d="M507.005,2750v-2.25"
                fill="none"
                stroke="inherit"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
              />
              <path
                id="Shape_1191"
                data-name="Shape 1191"
                d="M507.005,2750a7.5,7.5,0,0,1,7.5,7.5c0,7.046,1.5,8.25,1.5,8.25h-18s1.5-1.916,1.5-8.25A7.5,7.5,0,0,1,507.005,2750Z"
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
    <q-badge
      floating
      rounded
      color="red"
      v-if="notificationStore.unreadCount > 0"
      >{{ notificationStore.unreadCount }}
    </q-badge>
    <q-menu v-model="notificationStore.show">
      <q-list bordered class="rounded-borders" style="max-width: 400px">
        <q-item-label header>{{ $t('notifications') }}</q-item-label>
        <q-separator />
        <q-item v-if="notificationStore.notifications.length == 0">
          <q-item-section>
            <q-item-label lines="1"></q-item-label>
            <q-item-label caption lines="2">
              {{ $t('noNotificationsYet') }}
            </q-item-label>
          </q-item-section>
        </q-item>

        <div
          v-for="(notification, index) in notificationStore.notifications"
          :key="index"
        >
          <q-item
            @click="notificationStore.markAsRead(index)"
            clickable
            v-ripple
          >
            <q-badge
              rounded
              style="position: absolute; left: 8px; width: 8px"
              v-if="!notification.read"
              color="primary"
            />
            <q-item-section class="q-ml-md">
              <q-item-label :class="notification.type" lines="1"
                >{{ $t(notification.type) }}
              </q-item-label>
              <q-item-label caption lines="2">
                <!--              <span class="text-weight-bold">{{notification.type.toUpperCase()}}</span>-->
                {{ notification.message }}
              </q-item-label>
            </q-item-section>
            <q-item-section side top>
              <div>
                {{ new Date(notification.created_at).toLocaleString() }}
              </div>
              <q-btn
                :loading="notification.deleting"
                flat
                round
                icon="close"
                @click="notificationStore.removeNotification(index)"
              />
            </q-item-section>
          </q-item>
          <q-separator />
        </div>
      </q-list>
    </q-menu>
  </q-btn>
</template>
<style scoped>
.error {
  color: #851d1d;
}

.warning {
  color: #b29146;
}

.info {
  color: #5c69ea;
}

.q-badge {
  padding: 6px 8px !important;
}
</style>

<script lang="ts" setup>
import { useNotificationsStore } from 'stores/notification';
import { onMounted } from 'vue';

const notificationStore = useNotificationsStore();

onMounted(() => {
  notificationStore.fetchNotifications(true);
});
</script>
