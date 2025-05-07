import { defineStore } from 'pinia';
import axios, {AxiosResponse} from 'axios';
import { useAuthStore } from 'stores/auth';
import { Composer, useI18n } from 'vue-i18n';

export interface RequestProps {
  pagination: {
    page: number;
    rowsPerPage: number;
    sortBy: string;
    descending: boolean;
  };
}

interface TableColumn<T = unknown> {
  name: string;
  label: string;
  field: string | ((row: T) => unknown);
  required?: boolean;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
  sort?: (a: unknown, b: unknown, rowA: T, rowB: T) => number;
  sortOrder?: 'ad' | 'da';
  format?: (val: unknown, row: T) => unknown;
  style?: string | ((row: T) => string);
  classes?: string | ((row: T) => string);
  headerStyle?: string;
  headerClasses?: string;
}

export const useChatsStore = defineStore({
  id: 'chats',
  state: () => ({
    darkMode: false,
    loading: false,
    i18n: useI18n() as Composer,
    columns: [
      {
        name: 'created_at',
        required: true,
        label: useI18n().t('created'),
        align: 'left',
        field: 'created_at',
        sortable: true,
      },
      {
        name: 'updated_at',
        label: useI18n().t('updated'),
        align: 'left',
        field: 'updated_at',
        sortable: true,
      },
      {
        name: 'actions',
        required: true,
        label: useI18n().t('actions'),
        align: 'right',
        field: null,
        sortable: false,
      },
    ] as TableColumn[],
    chats: [],
    chat: {
      id: '',
      subject_uuid: '',
      users_id: '',
      message: '',
      created_at: '',
      updated_at: '',
      deleted_at: null,
      users: {
        id: '',
        name: '',
        email: '',
        email_verified_at: '',
        // ... (other user properties)
        user_settings: {
          id: '',
          users_id: '',
          company: '',
          salutation: '',
          title: '',
          firstname: '',
          lastname: '',
          mobile: '',
          address: '',
          postalcode: '',
          city: '',
          country: '',
          // ... (other settings)
        },
      },
    },
    searchTerm: '',
    pagination: {
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0,
      sortBy: 'created_at',
      descending: true,
    },
  }),
  actions: {
    // Fetch all chats
    async fetchChats(subject_uuid?: string) {
      // Guard clause – we can not fetch chats without an id. This prevents
      // requests like `/subject/undefined` that used to return an empty
      // response.
      if (!subject_uuid) {
        return;
      }

      this.chats = [];
      this.loading = true;
      try {
        const authStore = useAuthStore();
        const chatEndpoint = '/api/v1/chats/subject/' + subject_uuid;
        const response = await axios.get(process.env.APP_API_BASE_URL + chatEndpoint, {
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`,
          },
          params: {
            search: this.searchTerm,
            page: this.pagination.page,
            itemsPerPage: this.pagination.rowsPerPage,
            sortBy: [
              {
                key: this.pagination.sortBy ?? 'id',
                order: this.pagination.descending ? 'desc' : 'asc',
              },
            ],
          },
        });

        this.chats = response.data.data;
        this.pagination.rowsNumber = response.data.total;
        this.pagination.rowsPerPage = response.data.per_page;
      } catch (e) {
        console.log(e);
      } finally {
        this.loading = false;
      }
    },

    // Fetch a single chat
    async fetchChat(id: string) {
      try {
        this.loading = true;
        const authStore = useAuthStore();
        const response: AxiosResponse = await axios.get(`${process.env.APP_API_BASE_URL}/api/v1/chats/${id}`, {
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`,
          },
        });

        this.chat = response.data;
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },

    // Create a new chat
    async createChat(chatData: any) {
      try {
        this.loading = true;
        const authStore = useAuthStore();
        const response: AxiosResponse = await axios.post(`${process.env.APP_API_BASE_URL}/api/v1/chats`, chatData, {
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`,
          },
        });

        // Optionally, refetch chats here or add to existing list
        await this.fetchChats(chatData.subject_uuid);
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },

    // Update a chat
    async updateChat(id: string, chatData: any) {
      try {
        const authStore = useAuthStore();
        await axios.put(`${process.env.APP_API_BASE_URL}/api/v1/chats/${id}`, chatData, {
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`,
          },
        });

        // Optionally, refetch chats here or update the current chat
        await this.fetchChats(chatData.subject_uuid);
      } catch (error) {
        console.log(error);
      }
    },

    // Delete a chat
    async deleteChat(id: string, chatData: any) {
      try {
        const authStore = useAuthStore();
        await axios.delete(`${process.env.APP_API_BASE_URL}/api/v1/chats/${id}`, {
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`,
          },
        });

        // Optionally, refetch chats here
        await this.fetchChats(chatData.subject_uuid);
      } catch (error) {
        console.log(error);
      }
    },
  },
});
