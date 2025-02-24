<script lang="ts" setup>
import {onMounted} from 'vue';
import {RequestProps, useLeadsStore} from 'stores/leads';

const leadsStore = useLeadsStore();
onMounted(() => {
  leadsStore.fetchLeads();
});

const handleRequest = async (props: RequestProps) => {
  leadsStore.pagination.page = props.pagination.page;
  leadsStore.pagination.rowsPerPage = props.pagination.rowsPerPage;
  leadsStore.pagination.sortBy = props.pagination.sortBy;
  leadsStore.pagination.descending = props.pagination.descending;
  await leadsStore.fetchLeads();
};

function formatDateIntl(date: string) {
  if (!date || date === '') return '';

  return Intl.DateTimeFormat(navigator.language, {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date));
}

function formatDateTimeIntl(date: string) {
  if (!date || date === '') return '';

  return Intl.DateTimeFormat(navigator.language, {
    timeZone: 'Europe/Berlin',
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(new Date(date));
}
</script>

<template>
  <q-page>
    <div class="q-ma-lg q-pt-md">
      <div class="row q-col-gutter-md">
        <div class="col-xs-12">
          <q-table
            class="shadow_custom"
            style="border-radius: 4px"
            flat
            :title="$t('nav.leadManagement')"
            :rows="leadsStore.leads"
            row-key="id"
            :columns="leadsStore.columns"
            :rows-per-page-options="[10, 25, 50, 100]"
            v-model:pagination="leadsStore.pagination"
            :loading="leadsStore.loading"
            :filter="leadsStore.searchTerm"
            @request="handleRequest"
          >
            <template v-slot:top-right>
              <q-input
                outlined
                dense
                debounce="300"
                v-model="leadsStore.searchTerm"
                :placeholder="$t('searchTable')"
              >
                <template v-slot:append>
                  <q-icon
                    class="cursor-pointer"
                    @click="leadsStore.searchTerm = ''"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      style="width: 15px; height: auto"
                    >
                      <g
                        id="Interface-Essential_Form-Validation_close"
                        data-name="Interface-Essential / Form-Validation / close"
                        transform="translate(-206.694 -4382.689)"
                      >
                        <g id="Group_395" data-name="Group 395">
                          <g id="close">
                            <path
                              id="Shape_1765"
                              data-name="Shape 1765"
                              d="M207.755,4406.25l22.5-22.5"
                              fill="none"
                              stroke="currentColor"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="1.5"
                            />
                            <path
                              id="Shape_1766"
                              data-name="Shape 1766"
                              d="M230.255,4406.25l-22.5-22.5"
                              fill="none"
                              stroke="currentColor"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="1.5"
                            />
                          </g>
                        </g>
                      </g>
                    </svg>
                  </q-icon>
                </template>
              </q-input>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <template v-for="col in props.cols">
                  <q-td
                    v-if="col.name !== 'actions'"
                    :key="col.name"
                    :props="props"
                  >
                    <template
                      v-if="col.type === 'date' || col.name === 'created_at' || col.name === 'updated_at'">
                      <span>
                        {{ formatDateIntl(col.value) }}
                        <q-tooltip
                          v-if="col.value"
                          anchor="top middle"
                          self="bottom middle"
                          :offset="[0, 5]"
                        >
                          {{ formatDateTimeIntl(col.value) }}
                        </q-tooltip>
                      </span>
                    </template>
                    <template v-else>
                      {{ col.value }}
                    </template>
                  </q-td>
                  <q-td v-else :key="col.name" auto-width>
                    <div class="col-4">
                      <q-btn
                        flat
                        round
                        @click="leadsStore.edit(props.row.id)"
                        style="font-size: 0.7rem"
                      >
                        <q-icon>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                          >
                            <g
                              id="Interface-Essential_Edit_pencil-circle"
                              data-name="Interface-Essential / Edit / pencil-circle"
                              transform="translate(-399.005 -3091)"
                            >
                              <g id="Group_308" data-name="Group 308">
                                <g id="pencil-circle">
                                  <path
                                    id="Shape_1444"
                                    data-name="Shape 1444"
                                    d="M408.751,3108.432l-3.712.531.53-3.713,7.561-7.561a2.25,2.25,0,0,1,3.182,3.182Z"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.5"
                                  />
                                  <path
                                    id="Oval_184"
                                    data-name="Oval 184"
                                    d="M411.005,3114.25a11.25,11.25,0,1,0-11.25-11.25A11.25,11.25,0,0,0,411.005,3114.25Z"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.5"
                                  />
                                </g>
                              </g>
                            </g>
                          </svg>
                        </q-icon>
                        <q-tooltip
                          anchor="top middle"
                          self="bottom middle"
                          :offset="[0, 5]"
                        >
                          {{ $t('editUser') }}
                        </q-tooltip>
                      </q-btn>
                    </div>
                  </q-td>
                </template>
              </q-tr>
            </template>
          </q-table>
        </div>
      </div>
    </div>
  </q-page>
</template>
