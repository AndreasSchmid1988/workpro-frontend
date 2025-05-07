<script setup lang="ts">
import {defineProps} from 'vue';

// id can be null when creating a new record
defineProps<{ id: string | null, loading: boolean, path: string }>();

const emit = defineEmits(['save-button-clicked', 'save-button-initiated-create']);

const saveButtonClicked = () => {
  emit('save-button-clicked');
};

const saveButtonInitiatedCreate = () => {
  emit('save-button-initiated-create');
};
</script>

<template>
  <div class="row non-scrolled q-pb-lg">
    <div class="q-gutter-x-lg">
      <q-btn
        v-if="id == null"
        :loading="loading"
        @click="saveButtonInitiatedCreate"
        color="primary"
        data-cy="save-campaign"
        :label="$t('saveActions.save')"
      />
      <q-btn
        v-else
        :loading="loading"
        @click="saveButtonClicked"
        color="primary"
        data-cy="save-campaign"
        :label="$t('saveActions.save')"
      />
      <q-btn :to="path" color="primary" outline :label="$t('saveActions.cancel')"/>
    </div>
  </div>

  <div class="save-panel">
    <div class="row">
      <div class="q-gutter-x-lg">
        <q-btn
          v-if="id == null"
          :loading="loading"
          @click="saveButtonInitiatedCreate"
          color="primary"
          data-cy="save-campaign"
          :label="$t('saveActions.save')"
        />
        <q-btn
          v-else
          :loading="loading"
          @click="saveButtonClicked"
          color="primary"
          data-cy="save-campaign"
          :label="$t('saveActions.save')"
        />
        <q-btn :to="path" color="primary" outline :label="$t('saveActions.cancel')"/>
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">
.save-panel
  z-index: 10
  opacity: 1
  transform: scale(1)
  background: none
  background-color: transparent
  position: fixed
  bottom: 20px
  transition: all 350ms cubic-bezier(.87, -.41, .19, 1.44)
  left: 0
  right: 24px
  display: flex
  justify-content: center
  pointer-events: none

  & > div
    pointer-events: auto
    border-radius: 4px
    backdrop-filter: blur(3px)
    background-color: rgba(255, 255, 255, .45)
    padding: 24px 34px
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, .15)

  .scroll-bottom &
    transition: all 250ms ease
    z-index: -1
    opacity: 0
    transform: scale(.85)
    bottom: 0
</style>
