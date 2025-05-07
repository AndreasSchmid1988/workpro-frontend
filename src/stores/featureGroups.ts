import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from 'stores/auth';

export const useFeatureGroupsStore = defineStore('featureGroups', {
  state: () => ({
    featureGroups: [] as Array<{ id: number; name: string; sort_order: number }> ,
    loading: false as boolean,
  }),
  actions: {
    async fetchFeatureGroups() {
      this.loading = true;
      try {
        const auth = useAuthStore();
        const resp = await axios.get(
          `${process.env.APP_API_BASE_URL}/api/v1/feature-groups`,
          { headers: { Authorization: `Bearer ${auth.accessToken}` } }
        );
        if (resp.data && resp.data.data) {
          this.featureGroups = resp.data.data;
        }
      } catch (e) {
        console.error('Error fetching feature groups:', e);
      } finally {
        this.loading = false;
      }
    },
    async createFeatureGroup(name: string, sort_order = 0) {
      this.loading = true;
      try {
        const auth = useAuthStore();
        const resp = await axios.post(
          `${process.env.APP_API_BASE_URL}/api/v1/feature-groups`,
          { name, sort_order },
          { headers: { Authorization: `Bearer ${auth.accessToken}` } }
        );
        if (resp.data && resp.data.data) {
          this.featureGroups.push(resp.data.data);
        }
      } catch (e) {
        console.error('Error creating feature group:', e);
      } finally {
        this.loading = false;
      }
    },
    async updateFeatureGroup(id: number, name: string, sort_order = 0) {
      this.loading = true;
      try {
        const auth = useAuthStore();
        const resp = await axios.put(
          `${process.env.APP_API_BASE_URL}/api/v1/feature-groups/${id}`,
          { name, sort_order },
          { headers: { Authorization: `Bearer ${auth.accessToken}` } }
        );
        if (resp.data && resp.data.data) {
          const idx = this.featureGroups.findIndex(f => f.id === id);
          if (idx !== -1) this.featureGroups[idx] = resp.data.data;
        }
      } catch (e) {
        console.error('Error updating feature group:', e);
      } finally {
        this.loading = false;
      }
    },
    async deleteFeatureGroup(id: number) {
      this.loading = true;
      try {
        const auth = useAuthStore();
        await axios.delete(
          `${process.env.APP_API_BASE_URL}/api/v1/feature-groups/${id}`,
          { headers: { Authorization: `Bearer ${auth.accessToken}` } }
        );
        this.featureGroups = this.featureGroups.filter(f => f.id !== id);
      } catch (e) {
        console.error('Error deleting feature group:', e);
      } finally {
        this.loading = false;
      }
    }
  }
});