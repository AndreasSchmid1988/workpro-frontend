import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from 'stores/auth';
import { Dark, LocalStorage, Notify } from 'quasar';
import { useI18n, Composer } from 'vue-i18n';

/**
 * The invoices store handles list & detail retrieval as well as basic CRUD
 * actions for invoices.  It follows the same structure as the existing
 * offers/leads stores so that future maintenance stays consistent across
 * modules.
 */

export interface RequestProps {
  pagination: {
    page: number;
    rowsPerPage: number;
    sortBy: string;
    descending: boolean;
  };
}

// Map <status, count>
type StatusCountsMap = Record<string, number>;

export const useInvoicesStore = defineStore({
  id: 'invoices',
  state: () => ({
    darkMode: false as boolean,
    loading: false as boolean,
    i18n: useI18n() as Composer,
    // Data-table column definitions
    columns: [
      {
        name: 'invoices_number',
        required: true,
        label: useI18n().t('invoicesNumber'),
        align: 'left',
        field: 'invoices_number',
        sortable: true,
      },
      {
        name: 'subject',
        required: true,
        label: useI18n().t('subject'),
        align: 'left',
        field: 'subject',
        sortable: true,
      },
      {
        name: 'invoice_status',
        required: true,
        label: useI18n().t('invoiceStatus'),
        align: 'left',
        field: 'invoice_status',
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
    ] as unknown[],

    // Complete collection returned by API list endpoint
    invoices: [] as any[],

    // Single invoice model used in edit view
    invoice: {
      id: '',
      invoices_number: '',
      subject: '',
      description: '',
      invoice_status: '',
      created_at: '',
      updated_at: '',
      deleted_at: null,
    } as any,

    // Tab status counts
    statusCounts: {
      draft: 0,
      sent: 0,
      paid: 0,
      overdue: 0,
      cancelled: 0,
    } as StatusCountsMap,

    searchTerm: '' as string,

    pagination: {
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0,
      sortBy: 'created_at',
      descending: true,
    },
  }),
  actions: {
    /**
     * Load paginated invoice list from API.
     * @param selectedStatus optional – filters by status when provided.
     */
    async fetchInvoices(selectedStatus?: string) {
      this.loading = true;
      try {
        const authStore = useAuthStore();
        const endpoint = '/api/v1/invoices';

        const params: any = {
          search: this.searchTerm,
          page: this.pagination.page,
          itemsPerPage: this.pagination.rowsPerPage,
          sortBy: [
            {
              key: this.pagination.sortBy ?? 'id',
              order: this.pagination.descending ? 'desc' : 'asc',
            },
          ],
        };
        if (selectedStatus && selectedStatus !== 'all') {
          params.status = selectedStatus;
        }

        const response = await axios.get(
          process.env.APP_API_BASE_URL + endpoint,
          {
            headers: { Authorization: `Bearer ${authStore.accessToken}` },
            params,
          },
        );

        if (response.data && response.data.data !== undefined) {
          this.invoices = response.data.data;
          this.pagination.rowsNumber = response.data.total;
          this.pagination.rowsPerPage = response.data.per_page;
        }
      } catch (e) {
        /* eslint-disable no-console */
        console.error(e);
      } finally {
        this.loading = false;
      }
    },

    /** Load single invoice details */
    async fetchInvoiceDetails(id: string) {
      this.loading = true;
      try {
        const authStore = useAuthStore();
        const endpoint = `/api/v1/invoices/${id}`;
        const response = await axios.get(
          process.env.APP_API_BASE_URL + endpoint,
          {
            headers: { Authorization: `Bearer ${authStore.accessToken}` },
          },
        );
        this.invoice = response.data.data;
      } catch (e) {
        console.error(`Error fetching invoice details for ID ${id}:`, e);
      } finally {
        this.loading = false;
      }
    },

    /** Create a new invoice */
    async createInvoice(invoiceData: any) {
      this.loading = true;
      try {
        const authStore = useAuthStore();
        const endpoint = '/api/v1/invoices';
        const response = await axios.post(
          process.env.APP_API_BASE_URL + endpoint,
          invoiceData,
          {
            headers: {
              Authorization: `Bearer ${authStore.accessToken}`,
              'Content-Type': 'application/json',
            },
          },
        );
        this.invoice = response.data.data;
        Notify.create({
          message: this.i18n.t('messages.invoiceSaved'),
          color: 'positive',
          position: 'top',
        });
      } catch (e) {
        console.error('Error creating invoice:', e);
        Notify.create({
          message: this.i18n.t('messages.errorCreatingInvoice'),
          color: 'negative',
          position: 'top',
        });
      } finally {
        this.loading = false;
      }
    },

    /** Update existing invoice */
    async updateInvoice(id: string, invoiceData: any) {
      this.loading = true;
      try {
        const authStore = useAuthStore();
        const endpoint = `/api/v1/invoices/${id}`;
        const response = await axios.put(
          process.env.APP_API_BASE_URL + endpoint,
          invoiceData,
          {
            headers: {
              Authorization: `Bearer ${authStore.accessToken}`,
              'Content-Type': 'application/json',
            },
          },
        );
        this.invoice = response.data.data;
        Notify.create({
          message: this.i18n.t('messages.invoiceSaved'),
          color: 'positive',
          position: 'top',
        });
      } catch (e) {
        console.error(`Error updating invoice for ID ${id}:`, e);
        Notify.create({
          message: this.i18n.t('messages.errorUpdatingInvoice'),
          color: 'negative',
          position: 'top',
        });
      } finally {
        this.loading = false;
      }
    },

    /** Load aggregated status counts for tab badges */
    async fetchStatusCounts() {
      this.loading = true;
      try {
        const authStore = useAuthStore();
        const endpoint = '/api/v1/invoices/statuses';
        const response = await axios.get(
          process.env.APP_API_BASE_URL + endpoint,
          {
            headers: { Authorization: `Bearer ${authStore.accessToken}` },
          },
        );

        let countsData: Array<{ status: string; count: number }> = [];
        if (Array.isArray(response.data)) {
          countsData = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          countsData = response.data.data;
        }

        this.statusCounts = countsData.reduce((acc, item) => {
          acc[item.status] = item.count;
          return acc;
        }, {
          draft: 0,
          sent: 0,
          paid: 0,
          overdue: 0,
          cancelled: 0,
        } as StatusCountsMap);
      } catch (e) {
        console.error('Error fetching invoice status counts:', e);
      } finally {
        this.loading = false;
      }
    },

    /** Navigate to edit page */
    edit(id: string) {
      this.router.push(`/invoices/${id}`);
    },

    setDarkMode(darkMode: boolean | null) {
      if (darkMode == null) {
        darkMode = LocalStorage.getItem('darkMode') ?? false;
      }
      Dark.set(darkMode);
      this.darkMode = darkMode;
      LocalStorage.set('darkMode', darkMode);
    },
  },
});
