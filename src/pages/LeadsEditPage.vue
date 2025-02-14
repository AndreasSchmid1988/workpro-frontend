<script setup>
import { onMounted, ref } from 'vue';
import { useLeadsStore } from 'stores/leads';
import { useRoute, useRouter } from 'vue-router';

// Get route parameters
const route = useRoute();
const router = useRouter();
const leadId = ref(route.params.id);

const leadsStore = useLeadsStore();

// Dropdown Options
const leadTypeOptions = [
  { label: 'Private', value: 'private' },
  { label: 'Company', value: 'company' },
];

const leadSourceOptions = [
  { label: 'Website', value: 'website' },
  { label: 'Email', value: 'email' },
  { label: 'Phone', value: 'phone' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'Twitter', value: 'twitter' },
  { label: 'Other', value: 'other' },
];

const leadStatusOptions = [
  { label: 'New', value: 'new' },
  { label: 'Contacted', value: 'contacted' },
  { label: 'Qualified', value: 'qualified' },
  { label: 'Lost', value: 'lost' },
  { label: 'Converted', value: 'converted' },
];

// Data fetching method
const loadLeadData = async () => {
  await leadsStore.fetchLeadDetails(leadId.value);
};

// Data updating method
const updateLead = async () => {
  await leadsStore.updateLead(leadId.value, leadsStore.lead);
  // Navigate back to the leads list or show a success message
  router.push('/leads');
};

onMounted(() => {
  loadLeadData();
});
</script>

<template>
  <q-page padding>
    <q-form @submit.prevent="updateLead" class="q-gutter-md">
      <q-card flat class="shadow-1">
        <q-card-section>
          <div class="text-h6">
            {{ $t('editLead') }}
          </div>

          <!-- Lead Details -->
          <div class="row q-col-gutter-md q-mt-md">
            <div class="col-md-4 col-sm-12">
              <q-select
                v-model="leadsStore.lead.lead_type"
                :options="leadTypeOptions"
                :label="$t('leadType')"
                outlined
                dense
                required
              />
            </div>
            <div class="col-md-4 col-sm-12">
              <q-select
                v-model="leadsStore.lead.lead_source"
                :options="leadSourceOptions"
                :label="$t('leadSource')"
                outlined
                dense
                required
              />
            </div>
            <div class="col-md-4 col-sm-12">
              <q-select
                v-model="leadsStore.lead.lead_status"
                :options="leadStatusOptions"
                :label="$t('leadStatus')"
                outlined
                dense
                required
              />
            </div>
          </div>

          <!-- Personal Information -->
          <div class="text-subtitle1 q-mt-lg">
            {{ $t('personalDetails') }}
          </div>
          <div class="row q-col-gutter-md q-mt-sm">
            <div class="col-md-6 col-sm-12">
              <q-input
                v-model="leadsStore.lead.users.user_settings.firstname"
                :label="$t('firstname')"
                outlined
                dense
                required
              />
            </div>
            <div class="col-md-6 col-sm-12">
              <q-input
                v-model="leadsStore.lead.users.user_settings.lastname"
                :label="$t('lastname')"
                outlined
                dense
                required
              />
            </div>
          </div>

          <!-- Contact Details -->
          <div class="text-subtitle1 q-mt-lg">
            {{ $t('contactDetails') }}
          </div>
          <div class="row q-col-gutter-md q-mt-sm">
            <div class="col-md-6 col-sm-12">
              <q-input
                v-model="leadsStore.lead.users.user_settings.address"
                :label="$t('address')"
                outlined
                dense
                required
              />
            </div>
            <div class="col-md-6 col-sm-12">
              <q-input
                v-model="leadsStore.lead.users.user_settings.city"
                :label="$t('city')"
                outlined
                dense
                required
              />
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            :loading="leadsStore.loading"
            :disable="leadsStore.loading"
            :label="$t('save')"
            color="primary"
            type="submit"
          />
        </q-card-actions>
      </q-card>
    </q-form>
  </q-page>
</template>
