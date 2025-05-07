import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from 'stores/auth';
import { LocalStorage, Dark, Notify } from 'quasar';
import { useI18n, Composer } from 'vue-i18n';

interface RequestProps {
  pagination: {
    page: number;
    rowsPerPage: number;
    sortBy: string;
    descending: boolean;
  };
}

type StatusCountsMap = Record<string, number>;

export const useOffersStore = defineStore({
  id: 'offers',
  state: () => ({
    darkMode: false as boolean,
    loading: false as boolean,
    i18n: useI18n() as Composer,
    columns: [
      {
        name: 'offers_number',
        required: true,
        label: useI18n().t('offersNumber'),
        align: 'left',
        field: 'offers_number',
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
        name: 'offer_status',
        required: true,
        label: useI18n().t('offerStatus'),
        align: 'left',
        field: 'offer_status',
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
    offers: [] as any[],
    offer: {
      id: '',
      offers_number: '',
      subject: '',
      description: '',
      offer_status: '',
      created_at: '',
      updated_at: '',
      deleted_at: null,
    } as any,
    statusCounts: { draft: 0, sent: 0, accepted: 0, declined: 0 } as StatusCountsMap,
    searchTerm: '' as string,
    // list of products added to the current offer
    offerProducts: [] as any[],
    // loading state for offer products
    productLoading: false as boolean,
    pagination: {
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0,
      sortBy: 'created_at',
      descending: true,
    },
  }),
  actions: {
    async fetchOffers(selectedStatus?: string) {
      this.loading = true;
      try {
        const authStore = useAuthStore();
        const endpoint = '/api/v1/offers';
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
          }
        );
        if (response.data && response.data.data !== undefined) {
          this.offers = response.data.data;
          this.pagination.rowsNumber = response.data.total;
          this.pagination.rowsPerPage = response.data.per_page;
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
    async fetchOfferDetails(id: string) {
      this.loading = true;
      try {
        const authStore = useAuthStore();
        const endpoint = `/api/v1/offers/${id}`;
        const response = await axios.get(
          process.env.APP_API_BASE_URL + endpoint,
          {
            headers: { Authorization: `Bearer ${authStore.accessToken}` },
          }
        );
        this.offer = response.data.data;
      } catch (e) {
        console.error(`Error fetching offer details for ID ${id}:`, e);
      } finally {
        this.loading = false;
      }
    },
    async createOffer(offerData: any) {
      this.loading = true;
      try {
        const authStore = useAuthStore();
        const endpoint = '/api/v1/offers';
        const response = await axios.post(
          process.env.APP_API_BASE_URL + endpoint,
          offerData,
          {
            headers: {
              Authorization: `Bearer ${authStore.accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
        this.offer = response.data.data;
        Notify.create({
          message: this.i18n.t('messages.offerSaved'),
          color: 'positive',
          position: 'top',
        });
      } catch (e) {
        console.error('Error creating offer:', e);
        Notify.create({
          message: this.i18n.t('messages.errorCreatingOffer'),
          color: 'negative',
          position: 'top',
        });
      } finally {
        this.loading = false;
      }
    },
    async updateOffer(id: string, offerData: any) {
      this.loading = true;
      try {
        const authStore = useAuthStore();
        const endpoint = `/api/v1/offers/${id}`;
        const response = await axios.put(
          process.env.APP_API_BASE_URL + endpoint,
          offerData,
          {
            headers: {
              Authorization: `Bearer ${authStore.accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
        this.offer = response.data.data;
        Notify.create({
          message: this.i18n.t('messages.offerSaved'),
          color: 'positive',
          position: 'top',
        });
      } catch (e) {
        console.error(`Error updating offer ${id}:`, e);
        Notify.create({
          message: this.i18n.t('messages.errorUpdatingOffer'),
          color: 'negative',
          position: 'top',
        });
      } finally {
        this.loading = false;
      }
    },
    async fetchStatusCounts() {
      this.loading = true;
      try {
        const authStore = useAuthStore();
        const endpoint = '/api/v1/offers/statuses';
        const response = await axios.get(
          process.env.APP_API_BASE_URL + endpoint,
          {
            headers: { Authorization: `Bearer ${authStore.accessToken}` },
          }
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
        }, { draft: 0, sent: 0, accepted: 0, declined: 0 } as StatusCountsMap);
      } catch (e) {
        console.error('Error fetching offer status counts:', e);
      } finally {
        this.loading = false;
      }
    },
    /**
     * Fetch all product line items for the current offer.
     */
    async fetchOfferProducts(offerId?: string) {
      this.productLoading = true;
      try {
        const authStore = useAuthStore();
        const id = offerId ?? this.offer.id;
        const response = await axios.get(
          `${process.env.APP_API_BASE_URL}/api/v1/offers/${id}/products`,
          {
            headers: { Authorization: `Bearer ${authStore.accessToken}` }
          }
        );
        if (Array.isArray(response.data)) {
          this.offerProducts = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          this.offerProducts = response.data.data;
        }
      } catch (e) {
        console.error('Error fetching offer products:', e);
      } finally {
        this.productLoading = false;
      }
    },
    /**
     * Add a product to the current offer.
     * @returns true on success, false on failure
     */
    async addOfferProduct(productId: string, quantity: number): Promise<boolean> {
      this.productLoading = true;
      try {
        const authStore = useAuthStore();
        const id = this.offer.id;
        await axios.post(
          `${process.env.APP_API_BASE_URL}/api/v1/offers/${id}/products`,
          { offer_id: String(id), product_id: String(productId), quantity },
          {
            headers: {
              Authorization: `Bearer ${authStore.accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        // reload offer products after successful addition
        await this.fetchOfferProducts(id);
        return true;
      } catch (e: any) {
        // log detailed server response for debugging
        if (e.response) {
          console.error(`Error adding offer product (status ${e.response.status}):`, e.response.data);
        } else {
          console.error('Error adding offer product:', e);
        }
        return false;
      } finally {
        this.productLoading = false;
      }
    },
    /**
     * Update quantity for an existing offer product.
     */
    async updateOfferProduct(item: any) {
      this.productLoading = true;
      try {
        const authStore = useAuthStore();
        const id = this.offer.id;
        await axios.put(
          `${process.env.APP_API_BASE_URL}/api/v1/offers/${id}/products/${item.id}`,
          { quantity: item.quantity },
          { headers: { Authorization: `Bearer ${authStore.accessToken}` } }
        );
        await this.fetchOfferProducts(id);
      } catch (e) {
        console.error('Error updating offer product:', e);
      } finally {
        this.productLoading = false;
      }
    },
    /**
     * Remove a product from an offer.
     */
    async deleteOfferProduct(itemId: string) {
      this.productLoading = true;
      try {
        const authStore = useAuthStore();
        const id = this.offer.id;
        await axios.delete(
          `${process.env.APP_API_BASE_URL}/api/v1/offers/${id}/products/${itemId}`,
          { headers: { Authorization: `Bearer ${authStore.accessToken}` } }
        );
        await this.fetchOfferProducts(id);
      } catch (e) {
        console.error('Error deleting offer product:', e);
      } finally {
        this.productLoading = false;
      }
    },
    edit(id: string) {
      this.router.push('offers/' + id);
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