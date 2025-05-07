import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from 'stores/auth';

export const useProductsStore = defineStore({
  id: 'products',
  state: () => ({
    products: [] as Array<{ id: string; name: string; description?: string; category?: string; price_type?: string; markup_factor?: number; default_price: number }> ,
    currentProduct: { id: '', name: '', description: '', category: 'glass', price_type: 'sqm', markup_factor: 1, default_price: 0 } as { id: string; name: string; description?: string; category?: string; price_type?: string; markup_factor?: number; default_price: number },
    loading: false as boolean,
  }),
  actions: {
    async fetchProducts(perPage = 100) {
      this.loading = true;
      try {
        const auth = useAuthStore();
        const response = await axios.get(
          `${process.env.APP_API_BASE_URL}/api/v1/products`,
          {
            headers: { Authorization: `Bearer ${auth.accessToken}` },
            params: { per_page: perPage }
          }
        );
        // Response returns paginator with data array
        if (response.data && Array.isArray(response.data.data)) {
          this.products = response.data.data;
        }
      } catch (e) {
        console.error('Error fetching products:', e);
      } finally {
        this.loading = false;
      }
    },
    /**
     * Create a new product.
     * @returns created product or null on failure
     */
    async createProduct(data: { name: string; description?: string; category?: string; price_type?: string; markup_factor?: number; default_price: number }): Promise<any> {
      this.loading = true;
      try {
        const auth = useAuthStore();
        const resp = await axios.post(
          `${process.env.APP_API_BASE_URL}/api/v1/products`,
          data,
          { headers: { Authorization: `Bearer ${auth.accessToken}`, 'Content-Type': 'application/json' } }
        );
        if (resp.data && resp.data.data) {
          this.products.push(resp.data.data);
          return resp.data.data;
        }
        return null;
      } catch (e: any) {
        console.error('Error creating product:', e.response ? e.response.data : e);
        return null;
      } finally {
        this.loading = false;
      }
    },
    /**
     * Fetch a single product by ID.
     * @returns the product data or null
     */
    async fetchProduct(id: string): Promise<any> {
      this.loading = true;
      try {
        const auth = useAuthStore();
        const resp = await axios.get(
          `${process.env.APP_API_BASE_URL}/api/v1/products/${id}`,
          { headers: { Authorization: `Bearer ${auth.accessToken}` } }
        );
        if (resp.data && resp.data.data) {
          this.currentProduct = resp.data.data;
          return resp.data.data;
        }
        return null;
      } catch (e: any) {
        console.error('Error fetching product:', e.response ? e.response.data : e);
        return null;
      } finally {
        this.loading = false;
      }
    },
    /**
     * Update an existing product.
     * @returns updated product or null on failure
     */
    async updateProduct(id: string, data: { name?: string; description?: string; category?: string; price_type?: string; markup_factor?: number; default_price?: number }): Promise<any> {
      this.loading = true;
      try {
        const auth = useAuthStore();
        const resp = await axios.put(
          `${process.env.APP_API_BASE_URL}/api/v1/products/${id}`,
          data,
          { headers: { Authorization: `Bearer ${auth.accessToken}`, 'Content-Type': 'application/json' } }
        );
        if (resp.data && resp.data.data) {
          const updated = resp.data.data;
          // update products list
          const idx = this.products.findIndex(p => p.id === id);
          if (idx !== -1) {
            this.products[idx] = updated;
          }
          // update currentProduct if matching
          if (this.currentProduct.id === id) {
            this.currentProduct = updated;
          }
          return updated;
        }
        return null;
      } catch (e: any) {
        console.error('Error updating product:', e.response ? e.response.data : e);
        return null;
      } finally {
        this.loading = false;
      }
    },
    /**
     * Delete a product by id.
     * @returns true on success, false on failure
     */
    async deleteProduct(id: string): Promise<boolean> {
      this.loading = true;
      try {
        const auth = useAuthStore();
        await axios.delete(
          `${process.env.APP_API_BASE_URL}/api/v1/products/${id}`,
          { headers: { Authorization: `Bearer ${auth.accessToken}` } }
        );
        this.products = this.products.filter(p => p.id !== id);
        return true;
      } catch (e: any) {
        console.error('Error deleting product:', e.response ? e.response.data : e);
        return false;
      } finally {
        this.loading = false;
      }
    }
  }
});