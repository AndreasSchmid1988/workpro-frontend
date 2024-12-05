<script lang="ts" setup>
import {onMounted} from 'vue';
import {RequestProps, useUsersStore} from 'stores/users';

const usersStore = useUsersStore();
onMounted(() => {
  usersStore.fetchUsers();
});
const handleRequest = async (props: RequestProps) => {
  // Update usersStore.pagination based on props
  usersStore.pagination.page = props.pagination.page;
  usersStore.pagination.rowsPerPage = props.pagination.rowsPerPage;
  usersStore.pagination.sortBy = props.pagination.sortBy;
  usersStore.pagination.descending = props.pagination.descending;
  // Fetch new data
  await usersStore.fetchUsers();
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
    <!-- content -->
    <div class="q-ma-lg q-pt-md">
      <div class="row q-col-gutter-md">
        <div class="col-xs-12">
          <q-table
            class="shadow_custom"
            style="border-radius: 4px"
            flat
            :title="$t('nav.userManagement')"
            :rows="usersStore.users"
            rowKey="id"
            :columns="usersStore.columns"
            :rows-per-page-options="[10, 25, 50, 100]"
            v-model:pagination="usersStore.pagination"
            :loading="usersStore.loading"
            :filter="usersStore.searchTerm"
            @request="handleRequest"
          >
            <template v-slot:top-right>
              <q-input
                outlined
                dense
                debounce="300"
                v-model="usersStore.searchTerm"
                :placeholder="$t('searchTable')"
              >
                <template v-slot:append>
                  <q-icon
                    class="cursor-pointer"
                    @click="usersStore.searchTerm = ''"
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
                      v-if="
                        col.name === 'created_at' ||
                        col.name === 'updated_at' ||
                        col.name === 'last_login'
                      "
                    >
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
                    <template v-else-if="col.name === 'id'">
                      <div class="text-sm">{{ col.value }}</div>
                    </template>
                    <template v-else-if="col.name === 'blocked'">
                      <q-badge
                        v-if="col.value"
                        color="negative"
                        class="q-pa-sm text-weight-bold"
                      >
                        <q-icon size=".6rem" class="q-mr-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24.621"
                            height="24.621"
                            viewBox="0 0 24.621 24.621"
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
                                    stroke-width="2.5"
                                  />
                                  <path
                                    id="Shape_1766"
                                    data-name="Shape 1766"
                                    d="M230.255,4406.25l-22.5-22.5"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2.5"
                                  />
                                </g>
                              </g>
                            </g>
                          </svg>
                        </q-icon>
                        {{ $t('inactive') }}
                      </q-badge>
                      <q-badge
                        v-else
                        color="positive"
                        class="q-pa-sm text-weight-bold"
                      >
                        <q-icon size=".6rem" class="q-mr-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24.595"
                            height="24.297"
                            viewBox="0 0 24.595 24.297"
                          >
                            <g
                              id="Interface-Essential_Form-Validation_check-1"
                              data-name="Interface-Essential / Form-Validation / check-1"
                              transform="translate(-206.705 -4334.706)"
                            >
                              <g id="Group_385" data-name="Group 385">
                                <g id="check-1">
                                  <path
                                    id="Shape_1749"
                                    data-name="Shape 1749"
                                    d="M230.255,4335.75l-15.092,21.559a2.2,2.2,0,0,1-3.569.059l-3.839-5.118"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2.5"
                                  />
                                </g>
                              </g>
                            </g>
                          </svg>
                        </q-icon>
                        {{ $t('active') }}
                      </q-badge>
                    </template>
                    <template v-else-if="col.name === 'active'">
                      <q-badge
                        v-if="col.value"
                        color="positive"
                        class="q-pa-sm text-weight-bold"
                      >
                        <q-icon size=".6rem" class="q-mr-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24.595"
                            height="24.297"
                            viewBox="0 0 24.595 24.297"
                          >
                            <g
                              id="Interface-Essential_Form-Validation_check-1"
                              data-name="Interface-Essential / Form-Validation / check-1"
                              transform="translate(-206.705 -4334.706)"
                            >
                              <g id="Group_385" data-name="Group 385">
                                <g id="check-1">
                                  <path
                                    id="Shape_1749"
                                    data-name="Shape 1749"
                                    d="M230.255,4335.75l-15.092,21.559a2.2,2.2,0,0,1-3.569.059l-3.839-5.118"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2.5"
                                  />
                                </g>
                              </g>
                            </g>
                          </svg>
                        </q-icon>
                        {{ $t('active') }}
                      </q-badge>
                      <q-badge
                        v-else
                        color="warning"
                        class="q-pa-sm text-weight-bold"
                      >
                        <q-icon size=".6rem" class="q-mr-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24.621"
                            height="24.621"
                            viewBox="0 0 24.621 24.621"
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
                                    stroke-width="2.5"
                                  />
                                  <path
                                    id="Shape_1766"
                                    data-name="Shape 1766"
                                    d="M230.255,4406.25l-22.5-22.5"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2.5"
                                  />
                                </g>
                              </g>
                            </g>
                          </svg>
                        </q-icon>
                        {{ $t('inactive') }}
                      </q-badge>
                    </template>
                    <template v-else-if="col.name === 'email_verified_at'">
                      <span>
                        {{
                          col.value
                            ? formatDateIntl(col.value)
                            : $t('notYetVerified')
                        }}

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
                    <div class="row q-col-gutter-lg q-mr-lg">
                      <div class="col-4 q-mr-sm" v-if="!props.row.blocked">
                        <q-btn
                          :loading="usersStore.blockingLoading === props.row.id"
                          flat
                          round
                          @click="usersStore.block(true, props.row.id)"
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
                                id="Interface-Essential_Delete_delete"
                                data-name="Interface-Essential / Delete / delete"
                                transform="translate(-255.005 -3239)"
                              >
                                <g id="Group_325" data-name="Group 325">
                                  <g id="delete">
                                    <path
                                      id="Oval_188"
                                      data-name="Oval 188"
                                      d="M267.005,3262.25a11.25,11.25,0,1,0-11.25-11.25A11.25,11.25,0,0,0,267.005,3262.25Z"
                                      fill="none"
                                      stroke="currentColor"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                      stroke-width="1.5"
                                    />
                                    <path
                                      id="Shape_1518"
                                      data-name="Shape 1518"
                                      d="M259.05,3258.95l15.91-15.91"
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
                            {{ $t('lockUser') }}
                          </q-tooltip>
                        </q-btn>
                      </div>
                      <div class="col-4 q-mr-sm" v-else>
                        <q-btn
                          :loading="usersStore.blockingLoading === props.row.id"
                          flat
                          round
                          @click="usersStore.block(false, props.row.id)"
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
                                id="Interface-Essential_Form-Validation_check-circle-1"
                                data-name="Interface-Essential / Form-Validation / check-circle-1"
                                transform="translate(-399.005 -4335)"
                              >
                                <g id="Group_389" data-name="Group 389">
                                  <g id="check-circle-1">
                                    <path
                                      id="Shape_1754"
                                      data-name="Shape 1754"
                                      d="M405.005,4348.225l2.45,3.477a1.049,1.049,0,0,0,1.707.051l7.843-9.923"
                                      fill="none"
                                      stroke="currentColor"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                      stroke-width="1.5"
                                    />
                                    <path
                                      id="Oval_227"
                                      data-name="Oval 227"
                                      d="M411.005,4358.25a11.25,11.25,0,1,0-11.25-11.25A11.25,11.25,0,0,0,411.005,4358.25Z"
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
                            {{ $t('unlockUser') }}
                          </q-tooltip>
                        </q-btn>
                      </div>
                      <div class="col-4">
                        <q-btn
                          flat
                          round
                          @click="usersStore.edit(props.row.id)"
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
