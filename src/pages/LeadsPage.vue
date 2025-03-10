<script lang="ts" setup>
import { ref, computed, onMounted, watch, onBeforeMount } from 'vue';
import { RequestProps, useLeadsStore } from 'stores/leads';
import { useI18n } from 'vue-i18n';

const leadsStore = useLeadsStore();
const { t } = useI18n();

// Status-Optionen für die Tabs:
const leadStatusOptions = [
  { label: t('all') || 'Alle', value: 'all' },
  { label: t('leadStatuses.new') || 'Neu', value: 'new' },
  { label: t('leadStatuses.contacted') || 'Kontaktiert', value: 'contacted' },
  { label: t('leadStatuses.qualified') || 'Qualifiziert', value: 'qualified' },
  { label: t('leadStatuses.converted') || 'Konvertiert', value: 'converted' },
  { label: t('leadStatuses.lost') || 'Verloren', value: 'lost' },
];

const selectedStatus = ref('all');

// Sicherer Zugriff auf StatusCounts mit Standardwerten:
const statusCountsSafe = computed(() => ({
  new: leadsStore.statusCounts.new ?? 0,
  contacted: leadsStore.statusCounts.contacted ?? 0,
  qualified: leadsStore.statusCounts.qualified ?? 0,
  lost: leadsStore.statusCounts.lost ?? 0,
  converted: leadsStore.statusCounts.converted ?? 0,
}));

const allCount = computed(() =>
  statusCountsSafe.value.new +
  statusCountsSafe.value.contacted +
  statusCountsSafe.value.qualified +
  statusCountsSafe.value.lost +
  statusCountsSafe.value.converted
);

// Vor dem Mounten zuerst die Status Counts abrufen:
onBeforeMount(() => {
  leadsStore.fetchStatusCounts();
});

// Beim Mounten werden die Leads basierend auf dem aktuellen Status geladen:
onMounted(() => {
  leadsStore.fetchLeads(selectedStatus.value);
});

// Beim Wechsel des Tabs:
watch(selectedStatus, (newStatus) => {
  leadsStore.pagination.page = 1;
  leadsStore.fetchLeads(newStatus);
});

const handleRequest = async (props: RequestProps) => {
  leadsStore.pagination.page = props.pagination.page;
  leadsStore.pagination.rowsPerPage = props.pagination.rowsPerPage;
  leadsStore.pagination.sortBy = props.pagination.sortBy;
  leadsStore.pagination.descending = props.pagination.descending;
  await leadsStore.fetchLeads(selectedStatus.value);
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
      <!-- Tabs: Jeder Tab zeigt den Statusnamen und die Anzahl der Leads -->
      <q-tabs
        v-model="selectedStatus"
        dense
        class="q-mb-md"
        align="justify"
      >
        <q-tab
          v-for="option in leadStatusOptions"
          :key="option.value"
          :name="option.value"
          :label="option.value === 'all'
            ? `${option.label} (${allCount})`
            : `${option.label} (${statusCountsSafe[option.value]})`"
        />
      </q-tabs>
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
                <template v-for="col in props.cols" :key="col.name">
                  <q-td :props="props">
                    <!-- Für alle Spalten außer "actions" -->
                    <template v-if="col.name !== 'actions'">
                      <!-- Wenn es sich um ein Datum handelt -->
                      <template v-if="col.type === 'date' || col.name === 'created_at' || col.name === 'updated_at'">
                        <span>
                          {{
                            formatDateIntl(
                              typeof col.field === 'function'
                                ? col.field(props.row)
                                : props.row[col.field]
                            )
                          }}
                          <q-tooltip
                            v-if="props.row[col.field]"
                            anchor="top middle"
                            self="bottom middle"
                            :offset="[0, 5]"
                          >
                            {{
                              formatDateTimeIntl(
                                typeof col.field === 'function'
                                  ? col.field(props.row)
                                  : props.row[col.field]
                              )
                            }}
                          </q-tooltip>
                        </span>
                      </template>
                      <!-- Standardanzeige -->
                      <template v-else>
                        {{
                          typeof col.field === 'function'
                            ? col.field(props.row)
                            : props.row[col.field]
                        }}
                      </template>
                    </template>
                    <!-- Aktionen-Spalte -->
                    <template v-else>
                      <div class="col-4">
                        <q-btn flat round @click="leadsStore.edit(props.row.id)" style="font-size: 0.7rem">
                          <q-icon>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                              <g id="Interface-Essential_Edit_pencil-circle" data-name="Interface-Essential / Edit / pencil-circle" transform="translate(-399.005 -3091)">
                                <g id="Group_308" data-name="Group 308">
                                  <g id="pencil-circle">
                                    <path id="Shape_1444" data-name="Shape 1444" d="M408.751,3108.432l-3.712.531.53-3.713,7.561-7.561a2.25,2.25,0,0,1,3.182,3.182Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                                    <path id="Oval_184" data-name="Oval 184" d="M411.005,3114.25a11.25,11.25,0,1,0-11.25-11.25A11.25,11.25,0,0,0,411.005,3114.25Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                                  </g>
                                </g>
                              </g>
                            </svg>
                          </q-icon>
                          <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 5]">
                            {{ $t('editUser') }}
                          </q-tooltip>
                        </q-btn>
                      </div>
                    </template>
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
