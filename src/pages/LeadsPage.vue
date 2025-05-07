<script lang="ts" setup>
import {ref, computed, onMounted, watch, onBeforeMount} from 'vue';
import {RequestProps, useLeadsStore} from 'stores/leads';
import {useI18n} from 'vue-i18n';
import {QChip, QDate, QBtn, QSpace} from 'quasar';

const leadsStore = useLeadsStore();
const {t} = useI18n();

// Status-Optionen für die Tabs:
const leadStatusOptions = [
  {label: t('all') || 'Alle', value: 'all'},
  {label: t('leadStatuses.new') || 'Neu', value: 'new'},
  {label: t('leadStatuses.contacted') || 'Kontaktiert', value: 'contacted'},
  {label: t('leadStatuses.qualified') || 'Qualifiziert', value: 'qualified'},
  {label: t('leadStatuses.converted') || 'Konvertiert', value: 'converted'},
  {label: t('leadStatuses.lost') || 'Verloren', value: 'lost'},
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

// Neuer Datumsbereich als Objekt, der an die API übergeben wird:
const dateRange = ref<{ from: string | null; to: string | null }>({
  from: null,
  to: null,
});

// Neue Variablen für den Date Chooser (im Format DD.MM.YYYY):
const formattedStartAt = ref('');
const formattedEndAt = ref('');

// Beispiel: Falls Deine Eingabefelder nicht editierbar sein sollen:
const readOnly = ref(false);

// Hilfsfunktion: Wandelt Datum im Format DD.MM.YYYY in ISO (YYYY-MM-DD) um:
function convertToISO(dateStr: string) {
  const parts = dateStr.split('.');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return '';
}

// Options-Funktion für q-date beim Startdatum: Verhindert, dass ein Datum gewählt wird, das nach dem Enddatum liegt.
function getMaxDate(date: string) {
  if (formattedEndAt.value) {
    // Das hier erwartete Datum-Format von q-date ist YYYY-MM-DD.
    const [day, month, year] = formattedEndAt.value.split('.');
    const endDateISO = `${year}-${month}-${day}`;
    return date <= endDateISO;
  }
  return true;
}

// Options-Funktion für q-date beim Enddatum: Verhindert, dass ein Datum gewählt wird, das vor dem Startdatum liegt.
function getMinDate(date: string) {
  if (formattedStartAt.value) {
    const [day, month, year] = formattedStartAt.value.split('.');
    const startDateISO = `${year}-${month}-${day}`;
    return date >= startDateISO;
  }
  return true;
}

// Wenn sich formattedStartAt oder formattedEndAt ändert, wird auch dateRange aktualisiert:
watch([formattedStartAt, formattedEndAt], () => {
  dateRange.value = {
    from: formattedStartAt.value ? convertToISO(formattedStartAt.value) : null,
    to: formattedEndAt.value ? convertToISO(formattedEndAt.value) : null,
  };
  // Optional: Seite zurücksetzen und Leads neu laden:
  leadsStore.pagination.page = 1;
  leadsStore.fetchLeads(selectedStatus.value, dateRange.value);
});

// Vor dem Mounten zuerst die Status Counts abrufen:
onBeforeMount(() => {
  leadsStore.fetchStatusCounts();
});

// Beim Mounten werden die Leads basierend auf dem aktuellen Status geladen:
onMounted(() => {
  leadsStore.fetchLeads(selectedStatus.value, dateRange.value);
});

// Beim Wechsel des Tabs:
watch(selectedStatus, () => {
  leadsStore.pagination.page = 1;
  leadsStore.fetchLeads(selectedStatus.value, dateRange.value);
});
// reload leads when search term changes
watch(
  () => leadsStore.searchTerm,
  () => {
    leadsStore.pagination.page = 1;
    leadsStore.fetchLeads(selectedStatus.value, dateRange.value);
  }
);

const handleRequest = async (props: RequestProps) => {
  leadsStore.pagination.page = props.pagination.page;
  leadsStore.pagination.rowsPerPage = props.pagination.rowsPerPage;
  leadsStore.pagination.sortBy = props.pagination.sortBy;
  leadsStore.pagination.descending = props.pagination.descending;
  await leadsStore.fetchLeads(selectedStatus.value, dateRange.value);
};

const resetDateRange = () => {
  // Beide Felder zurücksetzen
  formattedStartAt.value = '';
  formattedEndAt.value = '';
  dateRange.value = {from: null, to: null};
  leadsStore.pagination.page = 1;
  leadsStore.fetchLeads(selectedStatus.value, dateRange.value);
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

function getStatusChipColor(status: string) {
  switch (status) {
    case 'new':
      return 'blue';
    case 'contacted':
      return 'orange';
    case 'qualified':
      return 'light-green';
    case 'converted':
      return 'positive';
    case 'lost':
      return 'negative';
    default:
      return 'grey';
  }
}
</script>

<template>
  <q-page>
    <div class="q-ma-lg q-pt-md">
      <q-card flat class="shadow-1">
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
      </q-card>

      <div class="row q-col-gutter-md">
        <div class="col-xs-12">
          <q-card flat class="shadow-1 q-pa-sm">
            <!-- Verwende items-center, um alle Elemente in der Zeile vertikal zu zentrieren -->
            <div class="row items-center q-gutter-md">

              <!-- Datumsbereich und Reset-Button: rechts ausgerichtet -->
              <div class="col-auto">
                <!-- Auch hier sorgt items-center dafür, dass alle Kinder vertikal zentriert sind -->
                <div class="row items-center q-gutter-sm">
                  <!-- Startdatum -->
                  <div class="col-auto" data-cy="start-date">
                    <q-input
                      :readonly="readOnly"
                      v-model="formattedStartAt"
                      :label="$t('campaign.startdate') + ' (' + $t('optional') + ')'"
                      outlined
                      dense
                      mask="##.##.####"
                      fill-mask
                    >
                      <template v-slot:prepend>
                        <q-icon class="cursor-pointer">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                          >
                            <g
                              id="Interface-Essential_Date_Calendar_calendar-3"
                              data-name="Interface-Essential / Date/Calendar / calendar-3"
                              transform="translate(-303.005 -2847)"
                            >
                              <g id="Group_266" data-name="Group 266">
                                <g id="calendar-3">
                                  <path
                                    id="Rectangle-path_79"
                                    data-name="Rectangle-path 79"
                                    d="M303.755,2852.25a1.5,1.5,0,0,1,1.5-1.5h19.5a1.5,1.5,0,0,1,1.5,1.5v16.5a1.5,1.5,0,0,1-1.5,1.5h-19.5a1.5,1.5,0,0,1-1.5-1.5Z"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.5"
                                  />
                                  <path
                                    id="Shape_1209"
                                    data-name="Shape 1209"
                                    d="M303.755,2856.75h22.5"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.5"
                                  />
                                  <path
                                    id="Shape_1210"
                                    data-name="Shape 1210"
                                    d="M309.755,2853v-5.25"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.5"
                                  />
                                  <path
                                    id="Shape_1211"
                                    data-name="Shape 1211"
                                    d="M320.255,2853v-5.25"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.5"
                                  />
                                  <path
                                    id="Shape_1212"
                                    data-name="Shape 1212"
                                    d="M308.63,2860.5a.375.375,0,1,0,.375.375.375.375,0,0,0-.375-.375"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.5"
                                  />
                                  <path
                                    id="Shape_1213"
                                    data-name="Shape 1213"
                                    d="M308.63,2865.75a.375.375,0,1,0,.375.375.375.375,0,0,0-.375-.375"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.5"
                                  />
                                  <path
                                    id="Shape_1214"
                                    data-name="Shape 1214"
                                    d="M315.005,2860.5a.375.375,0,1,0,.375.375.375.375,0,0,0-.375-.375"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.5"
                                  />
                                  <path
                                    id="Shape_1215"
                                    data-name="Shape 1215"
                                    d="M315.005,2865.75a.375.375,0,1,0,.375.375.375.375,0,0,0-.375-.375"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.5"
                                  />
                                  <path
                                    id="Shape_1216"
                                    data-name="Shape 1216"
                                    d="M321.38,2860.5a.375.375,0,1,0,.375.375.375.375,0,0,0-.375-.375"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.5"
                                  />
                                  <path
                                    id="Shape_1217"
                                    data-name="Shape 1217"
                                    d="M321.38,2865.75a.375.375,0,1,0,.375.375.375.375,0,0,0-.375-.375"
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
                          <q-popup-proxy ref="qDateProxyStartAt">
                            <q-date
                              v-model="formattedStartAt"
                              mask="DD.MM.YYYY"
                              :options="getMaxDate"
                              minimal
                              @input="$refs.qDateProxyStartAt.hide()"
                              @update:model-value="$refs.qDateProxyStartAt.hide()"
                            />
                          </q-popup-proxy>
                        </q-icon>
                      </template>
                      <template v-slot:append>
                        <q-icon class="cursor-pointer" @click="formattedStartAt = ''">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                               style="width: 15px; height: auto">
                            <g id="Interface-Essential_Form-Validation_close"
                               data-name="Interface-Essential / Form-Validation / close"
                               transform="translate(-206.694 -4382.689)">
                              <g id="Group_395" data-name="Group 395">
                                <g id="close">
                                  <path id="Shape_1765" data-name="Shape 1765" d="M207.755,4406.25l22.5-22.5"
                                        fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                        stroke-width="1.5"/>
                                  <path id="Shape_1766" data-name="Shape 1766" d="M230.255,4406.25l-22.5-22.5"
                                        fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                        stroke-width="1.5"/>
                                </g>
                              </g>
                            </g>
                          </svg>
                        </q-icon>
                      </template>
                    </q-input>
                  </div>

                  <!-- Enddatum -->
                  <div class="col-auto" data-cy="end-date">
                    <q-input
                      :readonly="readOnly"
                      v-model="formattedEndAt"
                      :label="$t('campaign.enddate') + ' (' + $t('optional') + ')'"
                      outlined
                      dense
                      mask="##.##.####"
                      fill-mask
                    >
                      <template v-slot:prepend>
                        <q-icon class="cursor-pointer">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                          >
                            <g
                              id="Interface-Essential_Date_Calendar_calendar-3"
                              data-name="Interface-Essential / Date/Calendar / calendar-3"
                              transform="translate(-303.005 -2847)"
                            >
                              <g id="Group_266" data-name="Group 266">
                                <g id="calendar-3">
                                  <path
                                    id="Rectangle-path_79"
                                    data-name="Rectangle-path 79"
                                    d="M303.755,2852.25a1.5,1.5,0,0,1,1.5-1.5h19.5a1.5,1.5,0,0,1,1.5,1.5v16.5a1.5,1.5,0,0,1-1.5,1.5h-19.5a1.5,1.5,0,0,1-1.5-1.5Z"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.5"
                                  />
                                  <path
                                    id="Shape_1209"
                                    data-name="Shape 1209"
                                    d="M303.755,2856.75h22.5"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.5"
                                  />
                                  <path
                                    id="Shape_1210"
                                    data-name="Shape 1210"
                                    d="M309.755,2853v-5.25"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.5"
                                  />
                                  <path
                                    id="Shape_1211"
                                    data-name="Shape 1211"
                                    d="M320.255,2853v-5.25"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.5"
                                  />
                                  <path
                                    id="Shape_1212"
                                    data-name="Shape 1212"
                                    d="M308.63,2860.5a.375.375,0,1,0,.375.375.375.375,0,0,0-.375-.375"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.5"
                                  />
                                  <path
                                    id="Shape_1213"
                                    data-name="Shape 1213"
                                    d="M308.63,2865.75a.375.375,0,1,0,.375.375.375.375,0,0,0-.375-.375"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.5"
                                  />
                                  <path
                                    id="Shape_1214"
                                    data-name="Shape 1214"
                                    d="M315.005,2860.5a.375.375,0,1,0,.375.375.375.375,0,0,0-.375-.375"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.5"
                                  />
                                  <path
                                    id="Shape_1215"
                                    data-name="Shape 1215"
                                    d="M315.005,2865.75a.375.375,0,1,0,.375.375.375.375,0,0,0-.375-.375"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.5"
                                  />
                                  <path
                                    id="Shape_1216"
                                    data-name="Shape 1216"
                                    d="M321.38,2860.5a.375.375,0,1,0,.375.375.375.375,0,0,0-.375-.375"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.5"
                                  />
                                  <path
                                    id="Shape_1217"
                                    data-name="Shape 1217"
                                    d="M321.38,2865.75a.375.375,0,1,0,.375.375.375.375,0,0,0-.375-.375"
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
                          <q-popup-proxy ref="qDateProxyEndAt">
                            <q-date
                              v-model="formattedEndAt"
                              mask="DD.MM.YYYY"
                              :options="getMinDate"
                              minimal
                              @input="$refs.qDateProxyEndAt.hide()"
                              @update:model-value="$refs.qDateProxyEndAt.hide()"
                            />
                          </q-popup-proxy>
                        </q-icon>
                      </template>
                      <template v-slot:append>
                        <q-icon class="cursor-pointer" @click="formattedEndAt = ''">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                               style="width: 15px; height: auto">
                            <g id="Interface-Essential_Form-Validation_close"
                               data-name="Interface-Essential / Form-Validation / close"
                               transform="translate(-206.694 -4382.689)">
                              <g id="Group_395" data-name="Group 395">
                                <g id="close">
                                  <path id="Shape_1765" data-name="Shape 1765" d="M207.755,4406.25l22.5-22.5"
                                        fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                        stroke-width="1.5"/>
                                  <path id="Shape_1766" data-name="Shape_1766" d="M230.255,4406.25l-22.5-22.5"
                                        fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                        stroke-width="1.5"/>
                                </g>
                              </g>
                            </g>
                          </svg>
                        </q-icon>
                      </template>
                    </q-input>
                  </div>

                  <!-- Reset-Button -->
                  <div class="col-auto">
                    <q-btn label="Zurücksetzen" color="secondary" flat @click="resetDateRange"/>
                  </div>
                </div>
              </div>
            </div>
          </q-card>
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
                class="q-ml-sm"
                style="max-width: 200px"
              />
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
                      <!-- Anzeige für LeadStatus -->
                      <template v-else-if="col.name === 'lead_status'">
                        <q-chip outline ripple :dark="false" text-color="white"
                                :color="getStatusChipColor(props.row[col.field])">
                          {{
                            t(`leadStatuses.${props.row[col.field]}`) || props.row[col.field]
                          }}
                        </q-chip>
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
                              <g id="Interface-Essential_Edit_pencil-circle"
                                 data-name="Interface-Essential / Edit / pencil-circle"
                                 transform="translate(-399.005 -3091)">
                                <g id="Group_308" data-name="Group 308">
                                  <g id="pencil-circle">
                                    <path id="Shape_1444" data-name="Shape 1444"
                                          d="M408.751,3108.432l-3.712.531.53-3.713,7.561-7.561a2.25,2.25,0,0,1,3.182,3.182Z"
                                          fill="none" stroke="currentColor" stroke-linecap="round"
                                          stroke-linejoin="round" stroke-width="1.5"/>
                                    <path id="Oval_184" data-name="Oval 184"
                                          d="M411.005,3114.25a11.25,11.25,0,1,0-11.25-11.25A11.25,11.25,0,0,0,411.005,3114.25Z"
                                          fill="none" stroke="currentColor" stroke-linecap="round"
                                          stroke-linejoin="round" stroke-width="1.5"/>
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

