import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from 'stores/auth';

export const usePriceTiersStore = defineStore('priceTiers', {
  state: () => ({
    tiers: [] as Array<{ id: string; min_quantity: number; price: number }> ,
    loading: false as boolean,
  }),
  actions: {
    /** Fetch all price tiers for a product */
    async fetchPriceTiers(productId: string) {
      this.loading = true;
      try {
        const auth = useAuthStore();
        const resp = await axios.get(
          `${process.env.APP_API_BASE_URL}/api/v1/products/${productId}/price-tiers`,
          { headers: { Authorization: `Bearer ${auth.accessToken}` } }
        );
        if (resp.data && resp.data.data) {
          this.tiers = resp.data.data;
        }
      } catch (e) {
        console.error('Error fetching price tiers:', e);
      } finally {
        this.loading = false;
      }
    },
    /** Create a price tier */
    async createPriceTier(productId: string, data: { min_quantity: number; price: number }) {
      this.loading = true;
      try {
        const auth = useAuthStore();
        const resp = await axios.post(
          `${process.env.APP_API_BASE_URL}/api/v1/products/${productId}/price-tiers`,
          data,
          { headers: { Authorization: `Bearer ${auth.accessToken}`, 'Content-Type': 'application/json' } }
        );
        if (resp.data && resp.data.data) {
          this.tiers.push(resp.data.data);
          return resp.data.data;
        }
      } catch (e: any) {
        console.error('Error creating price tier:', e.response ? e.response.data : e);
      } finally {
        this.loading = false;
      }
      return null;
    },
    /** Update a price tier */
    async updatePriceTier(productId: string, tierId: string, data: { min_quantity?: number; price?: number }) {
      this.loading = true;
      try {
        const auth = useAuthStore();
        const resp = await axios.put(
          `${process.env.APP_API_BASE_URL}/api/v1/products/${productId}/price-tiers/${tierId}`,
          data,
          { headers: { Authorization: `Bearer ${auth.accessToken}`, 'Content-Type': 'application/json' } }
        );
        if (resp.data && resp.data.data) {
          const updated = resp.data.data;
          const idx = this.tiers.findIndex(t => t.id === tierId);
          if (idx !== -1) this.tiers[idx] = updated;
          return updated;
        }
      } catch (e: any) {
        console.error('Error updating price tier:', e.response ? e.response.data : e);
      } finally {
        this.loading = false;
      }
      return null;
    },
    /** Delete a price tier */
    async deletePriceTier(productId: string, tierId: string) {
      this.loading = true;
      try {
        const auth = useAuthStore();
        await axios.delete(
          `${process.env.APP_API_BASE_URL}/api/v1/products/${productId}/price-tiers/${tierId}`,
          { headers: { Authorization: `Bearer ${auth.accessToken}` } }
        );
        this.tiers = this.tiers.filter(t => t.id !== tierId);
        return true;
      } catch (e: any) {
        console.error('Error deleting price tier:', e.response ? e.response.data : e);
        return false;
      } finally {
        this.loading = false;
      }
    }
  }
});