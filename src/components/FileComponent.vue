n
<template>
  <div>
    <div class="text-subtitle1 q-mt-lg">
      {{ $t('attachments') }}
    </div>
    <q-list v-if="filesStore.files.length" bordered>
      <q-item v-for="file in filesStore.files" :key="file.id" clickable>
        <q-item-section avatar>
          <q-icon name="insert_drive_file"/>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ file.filename }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn
            flat round dense
            icon="file_download"
            @click="() => downloadFile(file.id, file.filename)"
          />
        </q-item-section>
      </q-item>
    </q-list>
    <div v-else class="center-banner">
      <q-banner class="q-mb-md" dense>
        {{ $t('noAttachments') }}
      </q-banner>
    </div>

    <div class="text-subtitle1 q-mt-sm q-mb-sm">
      {{ $t('fileUpload') }}
    </div>
    <div
      @dragover.prevent
      @drop="handleFileDrop"
      @dragleave="handleDragLeave"
      @dragenter="handleDragEnter"
      :class="{ 'drag-active': isDragActive }"
      class="drag-drop-area"
      @click="triggerFileInput"
    >
      <div v-if="!isDragActive">
        {{ $t('fileUploadHint') }}
      </div>
      <div v-else>
        {{ $t('fileUploadHintDropActive') }}
      </div>
      <input type="file" multiple @change="handleFileChange" style="display: none;" ref="fileInput"/>
    </div>

    <q-list v-if="selectedFiles.length" bordered>
      <q-item v-for="(file, index) in selectedFiles" :key="index">
        <q-item-section>
          <q-item-label>{{ file.name }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn
            flat icon="delete"
            @click="removeFile(index)"
          />
        </q-item-section>
      </q-item>
    </q-list>

    <q-btn
      icon="cloud_upload"
      :label="selectedFiles.length > 1 ? $t('filesUpload') : $t('fileUpload')"
      outline
      @click="uploadFile"
      :disable="filesStore.loading"
      v-if="selectedFiles.length && !isUploading"
      class="upload-button full-width"
    />

    <div v-if="isUploading" class="upload-progress">
      Uploading...
      <q-spinner></q-spinner>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from 'vue';
import {useFilesStore} from 'stores/files';
import {QSpinner} from 'quasar';

const props = defineProps<{
  externalUuid: string;
}>();

const filesStore = useFilesStore();
const selectedFiles = ref<File[]>([]);
const isDragActive = ref(false);
const isUploading = ref(false);

watch(() => props.externalUuid, (newUuid) => {
  if (newUuid) {
    filesStore.fetchFiles(newUuid);
  }
});

onMounted(() => {
  filesStore.fetchFiles(props.externalUuid);
});

async function uploadFile() {
  if (selectedFiles.value.length) {
    isUploading.value = true;

    for (const file of selectedFiles.value) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('external_uuid', props.externalUuid);

      await filesStore.uploadFile(formData);
    }

    selectedFiles.value = [];
    isUploading.value = false;
  }
}

function downloadFile(fileId: string, fileName: string) {
  filesStore.downloadFile(fileId, fileName);
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    selectedFiles.value = Array.from(target.files);
  }
}

function handleFileDrop(event: DragEvent) {
  event.preventDefault();
  isDragActive.value = false;
  if (event.dataTransfer && event.dataTransfer.files.length) {
    // Concatenate existing files with the newly dropped files
    selectedFiles.value = selectedFiles.value.concat(Array.from(event.dataTransfer.files));
  }
}

function handleDragEnter() {
  isDragActive.value = true;
}

function handleDragLeave() {
  isDragActive.value = false;
}

function triggerFileInput() {
  const inputElement = fileInput.value;
  if (inputElement) {
    inputElement.click();
  }
}

function removeFile(index: number) {
  selectedFiles.value.splice(index, 1);
}

const fileInput = ref<HTMLInputElement | null>(null);
</script>

<style scoped>
.drag-drop-area {
  border: 2px dashed #ccc;
  padding: 20px;
  text-align: center;
  margin-bottom: 20px;
  cursor: pointer;
  border-radius: 4px;
  transition: border-color 0.3s ease, background-color 0.3s ease;
}

.drag-drop-area.drag-active {
  border-color: #3366ff;
  background-color: #f0f8ff;
}

.upload-progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.center-banner {
  display: flex;
  justify-content: center;
  align-items: center;
}

.upload-button {
  margin-top: 10px;
  display: block;
}
</style>
