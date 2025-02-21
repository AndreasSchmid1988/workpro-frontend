import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from './auth';

export interface File {
  id: string;
  filename: string;
  // Add other file properties if needed
}

interface FileUploadResponse {
  data: File;
}

export const useFilesStore = defineStore('files', {
  state: () => ({
    files: [] as File[],
    loading: false,
  }),
  actions: {
    async fetchFiles(externalUuid: string) {
      this.loading = true;
      try {
        const authStore = useAuthStore();
        const response = await axios.get(`${process.env.APP_API_BASE_URL}/api/v1/files`, {
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`,
          },
          params: {
            external_uuid: externalUuid,
          },
        });
        this.files = response.data.data;
      } catch (error) {
        console.error('Error fetching files:', error);
      } finally {
        this.loading = false;
      }
    },
    async uploadFile(formData: FormData) {
      try {
        const authStore = useAuthStore();
        const response = await axios.post<FileUploadResponse>(`${process.env.APP_API_BASE_URL}/api/v1/files/upload`, formData, {
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        this.files.push(response.data.data);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    },
    async downloadFile(fileId: string, fileName: string) {
      try {
        const authStore = useAuthStore();
        const response = await axios.get(`${process.env.APP_API_BASE_URL}/api/v1/files/${fileId}/download`, {
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`,
          },
          responseType: 'blob',
        });

        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Try to extract the file name from Content-Disposition header
        const contentDisposition = response.headers['Content-Disposition'];
        let filename = fileName;
        if (contentDisposition) {
          const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
          if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
          }
        }

        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();

        // Clean up
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

      } catch (error) {
        console.error('Error downloading file:', error);
      }
    }
  },
});
