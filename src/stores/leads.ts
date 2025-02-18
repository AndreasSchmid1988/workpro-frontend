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

export const useLeadsStore = defineStore({
  id: 'leads',
  state: () => ({
    darkMode: false,
    loading: false,
    i18n: useI18n() as Composer,
    columns: [
      {
        name: 'leads_number',
        required: true,
        label: useI18n().t('leadsNumber'),
        align: 'left',
        field: 'leads_number',
        sortable: true,
      },
      {
        name: 'title',
        required: true,
        label: useI18n().t('title'),
        align: 'left',
        field: (row: any) => row.users?.user_settings?.title || '',
        sortable: true,
      },
      {
        name: 'firstname',
        required: true,
        label: useI18n().t('firstname'),
        align: 'left',
        field: (row: any) => row.users?.user_settings?.firstname || '',
        sortable: true,
      },
      {
        name: 'lastname',
        required: true,
        label: useI18n().t('lastname'),
        align: 'left',
        field: (row: any) => row.users?.user_settings?.lastname || '',
        sortable: true,
      },
      {
        name: 'mobile',
        required: true,
        label: useI18n().t('mobile'),
        align: 'left',
        field: (row: any) => row.users?.user_settings?.mobile || '',
        sortable: true,
      },
      {
        name: 'address',
        required: true,
        label: useI18n().t('address'),
        align: 'left',
        field: (row: any) => row.users?.user_settings?.address || '',
        sortable: true,
      },
      {
        name: 'postalcode',
        required: true,
        label: useI18n().t('postalcode'),
        align: 'left',
        field: (row: any) => row.users?.user_settings?.postalcode || '',
        sortable: true,
      },
      {
        name: 'city',
        required: true,
        label: useI18n().t('city'),
        align: 'left',
        field: (row: any) => row.users.user_settings?.city || '',
        sortable: true,
      },
      {
        name: 'country',
        required: true,
        label: useI18n().t('country'),
        align: 'left',
        field: (row: any) => row.users?.user_settings?.country || '',
        sortable: true,
      },
      {
        name: 'lead_count',
        required: true,
        label: useI18n().t('leadCount'),
        align: 'left',
        field: 'lead_count',
        sortable: true,
      },
      {
        name: 'lead_type',
        required: true,
        label: useI18n().t('leadType'),
        align: 'left',
        field: 'lead_type',
        sortable: true,
      },
      {
        name: 'lead_source',
        required: true,
        label: useI18n().t('leadSource'),
        align: 'left',
        field: 'lead_source',
        sortable: true,
      },
      {
        name: 'lead_status',
        required: true,
        label: useI18n().t('leadStatus'),
        align: 'left',
        field: 'lead_status',
        sortable: true,
      },
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
    leads: [],
    lead: {
      id: '',
      leads_number: '',
      users_id: '',
      lead_count: 0,
      lead_type: '',
      lead_source: '',
      lead_status: '',
      rating: 0,
      subject: '',
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
          profile_photo_path: '',
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
    async fetchLeads() {
      this.loading = true;
      try {
        const authStore = useAuthStore();
        const leadEndpoint = '/api/v1/leads';
        const response = await axios.get(
          process.env.APP_API_BASE_URL + leadEndpoint,
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

        this.leads = response.data.data;
        this.pagination.rowsNumber = response.data.total;
        this.pagination.rowsPerPage = response.data.per_page;

        this.loading = false;
      } catch (e) {
        console.log(e);
        this.loading = false;
      }
    },
    async fetchLeadDetails(id: string) {
      this.loading = true;
      try {
        const authStore = useAuthStore();
        const leadDetailEndpoint = `/api/v1/leads/${id}`;
        const response = await axios.get(
          process.env.APP_API_BASE_URL + leadDetailEndpoint,
          {
            headers: {
              Authorization: `Bearer ${authStore.accessToken}`,
            },
          }
        );

        this.lead = response.data.data; // Assuming the response structure contains lead details directly

        this.loading = false;
      } catch (e) {
        console.error(`Error fetching lead details for ID ${id}:`, e);
        this.loading = false;
      }
    },
    edit: async function (id: string) {
      this.router.push('leads/' + id);
    },
    setDarkMode(darkMode: boolean | null) {
      if (darkMode == null) {
        darkMode = LocalStorage.getItem('darkMode') ?? false;
      }
      Dark.set(darkMode);
      this.darkMode = darkMode;
      LocalStorage.set('darkMode', darkMode);
    },
    // Add more lead-specific actions if needed
  },
});
