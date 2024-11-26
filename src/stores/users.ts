import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from 'stores/auth';
import { LocalStorage, Dark } from 'quasar';
import { Composer, useI18n } from 'vue-i18n';

export interface RequestProps {
  pagination: {
    page: number;
    rowsPerPage: number;
    sortBy: string;
    descending: boolean;
  };
}

interface Role {
  name: string;
  // ... other fields
}

interface RowData {
  roles: Role[];
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

export const useUsersStore = defineStore({
  id: 'users',
  state: () => ({
    darkMode: false,
    loading: false,
    blockingLoading: '',
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
        name: 'last_login',
        required: true,
        label: useI18n().t('lastLogin'),
        align: 'left',
        field: 'last_login',
        sortable: true,
      },
      {
        name: 'id',
        required: true,
        label: useI18n().t('userId'),
        align: 'left',
        field: 'id',
        sortable: true,
      },
      {
        name: 'name',
        required: true,
        label: useI18n().t('name'),
        align: 'left',
        field: 'name',
        sortable: true,
      },
      {
        name: 'email',
        required: true,
        label: useI18n().t('email'),
        align: 'left',
        field: 'email',
        sortable: true,
      },
      {
        name: 'email_verified_at',
        required: true,
        label: useI18n().t('verified'),
        align: 'left',
        field: 'email_verified_at',
        sortable: true,
      },
      {
        name: 'role',
        required: true,
        label: useI18n().t('role'),
        align: 'left',
        field: (row: RowData) => (row.roles ? row.roles[0]?.name : ''),
        sortable: false,
      },
      {
        name: 'blocked',
        required: true,
        label: useI18n().t('uiAccess'),
        align: 'left',
        field: 'blocked',
        sortable: true,
      },
      {
        name: 'active',
        required: true,
        label: useI18n().t('apiAccess'),
        align: 'left',
        field: 'active',
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
    accessToken: '',
    users: [],
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
    edit: async function (id: string) {
      this.router.push('users/' + id);
    },
    setDarkMode: function (darkMode: boolean | null) {
      if (darkMode == null) {
        darkMode = LocalStorage.getItem('darkMode') ?? false;
      }
      Dark.set(darkMode);
      this.darkMode = darkMode;
      LocalStorage.set('darkMode', darkMode);
    },
    async block(block: boolean, userId: string) {
      this.blockingLoading = userId;
      try {
        const authStore = useAuthStore();
        let userEndpoint = '';
        if (block) {
          userEndpoint = '/api/v1/user/block/' + userId;
        } else {
          userEndpoint = '/api/v1/user/unblock/' + userId;
        }

        const response = await axios.post(
          process.env.APP_API_BASE_URL + userEndpoint,
          {},
          {
            headers: {
              Authorization: `Bearer ${authStore.accessToken}`,
            },
          }
        );

        console.log(response);

        await this.fetchUsers();

        this.blockingLoading = '';
      } catch (e) {
        console.log(e);
        this.blockingLoading = '';
      }
    },
    fetchUsers: async function () {
      this.loading = true;
      try {
        const authStore = useAuthStore();

        const userEndpoint = '/api/v1/users';
        const response = await axios.get(
          process.env.APP_API_BASE_URL + userEndpoint,
          {
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
          }
        );

        this.users = response.data.data;
        this.pagination.rowsNumber = response.data.total;
        this.pagination.rowsPerPage = response.data.per_page;

        this.loading = false;
      } catch (e) {
        console.log(e);
        this.loading = false;
      }
    },
  },
});
