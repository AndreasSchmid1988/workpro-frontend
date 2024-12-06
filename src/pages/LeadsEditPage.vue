<script setup>
import { onMounted, ref } from 'vue';
import { useLeadsStore } from 'stores/leads';

// Assuming id is passed in or extracted via route params
const leadId = ref(null);
const leadsStore = useLeadsStore();
const leadData = ref({
  lead_type: '',
  lead_source: '',
  lead_status: '',
  personalDetails: {
    firstname: '',
    lastname: '',
  },
  contactDetails: {
    address: '',
    city: '',
  },
});

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
  leadData.value = leadsStore.lead;
};

// Data updating method
const updateLead = () => {
  leadsStore.updateLead(leadId.value, leadData.value);
};

onMounted(() => {
  loadLeadData();
});
</script>

<template>
  <q-page>
    <div class="q-ma-lg q-pt-md">
      <q-form @submit.prevent="updateLead" class="q-gutter-md">
        <q-card flat class="shadow_custom q-pa-none q-ma-none">
          <q-card-section>
            <div class="text-h6">{{ $t('editLead') }}</div>
            <div class="row q-col-gutter-xs">
              <!-- Lead Type -->
              <q-select
                v-model="leadData.value.lead_type"
                :options="leadTypeOptions"
                label="Lead Type"
                outlined
                dense
              />

              <!-- Lead Source -->
              <q-select
                v-model="leadData.value.lead_source"
                :options="leadSourceOptions"
                label="Lead Source"
                outlined
                dense
              />

              <!-- Lead Status -->
              <q-select
                v-model="leadData.value.lead_status"
                :options="leadStatusOptions"
                label="Lead Status"
                outlined
                dense
              />

              <!-- Personal Information -->
              <q-input
                v-model="leadData.value.personalDetails.firstname"
                label="First Name"
                outlined
              />
              <q-input
                v-model="leadData.value.personalDetails.lastname"
                label="Last Name"
                outlined
              />

              <!-- Contact Details -->
              <q-input
                v-model="leadData.value.contactDetails.address"
                label="Address"
                outlined
              />
              <q-input
                v-model="leadData.value.contactDetails.city"
                label="City"
                outlined
              />
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              :loading="leadsStore.loading"
              :disable="leadsStore.loading"
              label="Save"
              color="primary"
              type="submit"
            />
          </q-card-actions>
        </q-card>
      </q-form>
    </div>
  </q-page>
</template>
