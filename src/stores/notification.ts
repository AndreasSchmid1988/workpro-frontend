import { defineStore } from 'pinia';
import axios from 'axios';
import { LocalStorage } from 'quasar';
import { useAuthStore } from 'stores/auth';

interface Notification {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  read: boolean;
  updating: boolean;
  deleting: boolean;
  created_at: string;
}

export const useNotificationsStore = defineStore({
  id: 'notifications',
  state: () => ({
    accessToken: LocalStorage.getItem('accessToken'),
    show: false,
    loading: false,
    notifications: [] as Notification[],
  }),
  getters: {
    unreadCount(): number {
      return this.notifications.filter((notification) => !notification.read)
        .length;
    },
  },
  actions: {
    /*    addNotification(notification: Notification) {
              this.notifications.push({...notification, read: false});
              // TODO call post on api/v1/notifications
            },*/
    async markAsRead(index: number) {
      try {
        this.notifications[index].updating = true;

        const authStore = useAuthStore();
        const userEndpoint =
          '/api/v1/notifications/' + this.notifications[index].id;

        // Prepare the data you want to send in the request
        const payload = this.notifications[index];
        payload.read = true;

        const response = await axios.put(
          `${process.env.APP_API_BASE_URL}${userEndpoint}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${authStore.accessToken}`,
            },
          }
        );

        console.log('Update read successful', response);
        this.notifications[index].updating = false;
        this.notifications[index].read = true;
      } catch (e) {
        this.notifications[index].updating = false;
        console.log('Update failed', e);
      }
    },
    async removeNotification(index: number) {
      try {
        this.notifications[index].deleting = true;

        const authStore = useAuthStore();
        const userEndpoint =
          '/api/v1/notifications/' + this.notifications[index].id;

        const response = await axios.delete(
          `${process.env.APP_API_BASE_URL}${userEndpoint}`,
          {
            headers: {
              Authorization: `Bearer ${authStore.accessToken}`,
            },
          }
        );

        console.log('Deleting successful', response);
        this.notifications.splice(index, 1);
      } catch (e) {
        this.notifications[index].deleting = false;
        console.log('Delete failed', e);
      }
    },
    fetchNotifications: async function (init = false) {
      try {
        this.loading = true;
        if (this.show || init) {
          const authStore = useAuthStore();
          const userEndpoint = '/api/v1/notifications';
          const response = await axios.get(
            process.env.APP_API_BASE_URL + userEndpoint,
            {
              headers: {
                Authorization: `Bearer ${authStore.accessToken}`,
              },
            }
          );
          this.notifications = response.data.data;
        }
        this.loading = false;
      } catch (e) {
        this.loading = false;
        console.log(e);
      }
    },
  },
});
