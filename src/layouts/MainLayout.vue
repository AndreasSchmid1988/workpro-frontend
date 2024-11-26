<template>
  <q-layout view="lHh LpR lFf">
    <q-header
      :class="$q.dark.isActive ? 'q-dark' : 'bg-white'"
      class="shadow_custom q-mx-lg q-mt-md q-py-sm"
      style="right: 8px; border-radius: 4px"
    >
      <q-toolbar class="no-shadow">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          color="grey"
          class="custom-border"
          @click="drawer = !drawer"
        />
        <q-toolbar-title class="q-ml-sm">
          <div class="hidden">
            <q-input
              placeholder="Search"
              class="custom-border q-pl-sm"
              borderless
              dense
            >
              <template v-slot:before>
                <q-icon class="q-pr-sm" color="grey-8" name="search" />
              </template>
            </q-input>
          </div>
        </q-toolbar-title>

        <div>
          <q-btn
            v-if="$q.dark.isActive"
            class="q-mr-xs text-grey-6"
            flat
            round
            @click="userStore.setDarkMode(false)"
            :icon="$q.dark.isActive ? 'nights_stay' : 'wb_sunny'"
          />
          <q-btn
            v-else
            class="q-mr-xs text-grey-6"
            flat
            round
            @click="userStore.setDarkMode(true)"
            :icon="$q.dark.isActive ? 'nights_stay' : 'wb_sunny'"
          />
        </div>
        <notification-dropdown-component></notification-dropdown-component>
        <q-separator
          style="transform: rotate(90deg); width: 32px"
          size="1px"
        ></q-separator>
        <q-btn
          class="q-ml-sm q-mr-sm q-py-xs q-px-sm"
          flat
          round
          color="grey"
          @click="logout()"
        >
          <q-icon>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="23.997"
              height="22.53"
              viewBox="0 0 23.997 22.53"
            >
              <g
                id="Interface-Essential_Login_Logout_logout"
                data-name="Interface-Essential / Login/Logout / logout"
                transform="translate(-351.005 -475.738)"
              >
                <g id="Group_43" data-name="Group 43">
                  <g stroke="grey" id="logout">
                    <path
                      id="Shape_138"
                      data-name="Shape 138"
                      d="M351.755,487h15.75"
                      fill="none"
                      stroke="inherit"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                    />
                    <path
                      id="Shape_139"
                      data-name="Shape 139"
                      d="M363.755,490.754l3.75-3.75-3.75-3.75"
                      fill="none"
                      stroke="inherit"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                    />
                    <path
                      id="Shape_140"
                      data-name="Shape 140"
                      d="M354.311,491.6a10.5,10.5,0,1,0,.179-9.542"
                      fill="none"
                      stroke="inherit"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                    />
                  </g>
                </g>
              </g>
            </svg>
          </q-icon>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawer"
      show-if-above
      :width="260"
      :mini-width="80"
      :mini="!drawer || miniState"
      @click.capture="drawerClick"
      :class="$q.dark.isActive ? '' : 'drawer_cls'"
    >
      <div style="height: calc(100% - 80px); padding: 10px">
        <q-toolbar
          @click="$router.push('/')"
          class="cursor-pointer"
          style="margin-top: 5px; min-height: 65px"
        >
          <img
            v-if="miniState"
            src="/Logo_v1_symbol.svg"
            style="max-width: 35px"
            :class="$q.dark.isActive ? 'logo-white' : ''"
          />
          <img
            v-else
            src="/Logo_v2.svg"
            style="width: 175px; height: auto"
            :class="$q.dark.isActive ? 'logo-white' : ''"
          />

          <q-toolbar-title
            style="color: #566a7f; font-size: 1.4rem; letter-spacing: -0.5px"
            class="text-weight-medium"
          >
          </q-toolbar-title>
        </q-toolbar>
        <q-scroll-area style="height: 100%">
          <q-list padding class="q-pt-lg">
            <q-item
              class="navigation-item q-mx-sm"
              active-class="tab-active"
              to="/"
              exact
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <g
                      id="Interface-Essential_Dashboard_gauge-dashboard-1"
                      data-name="Interface-Essential / Dashboard / gauge-dashboard-1"
                      transform="translate(-303.005 -227.007)"
                    >
                      <g id="Group_13" data-name="Group 13">
                        <g id="gauge-dashboard-1">
                          <path
                            id="Shape_34"
                            data-name="Shape 34"
                            d="M312.005,242.292v-.285a3,3,0,0,1,6,0v.285"
                            fill="none"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.5"
                          />
                          <path
                            id="Shape_35"
                            data-name="Shape 35"
                            d="M317.257,232.257l-2.25,6.75"
                            fill="none"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.5"
                          />
                          <path
                            id="Shape_36"
                            data-name="Shape 36"
                            d="M309.382,234.507a.375.375,0,1,0,.375.375.375.375,0,0,0-.375-.375h0"
                            fill="none"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.5"
                          />
                          <path
                            id="Shape_37"
                            data-name="Shape 37"
                            d="M322.132,238.257a.375.375,0,1,0,.375.375.375.375,0,0,0-.375-.375h0"
                            fill="none"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.5"
                          />
                          <path
                            id="Shape_38"
                            data-name="Shape 38"
                            d="M320.632,234.507a.375.375,0,1,0,.373.375.375.375,0,0,0-.373-.375h0"
                            fill="none"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.5"
                          />
                          <path
                            id="Shape_39"
                            data-name="Shape 39"
                            d="M312.382,231.507a.375.375,0,1,0,.375.375.375.375,0,0,0-.375-.375h0"
                            fill="none"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.5"
                          />
                          <path
                            id="Shape_40"
                            data-name="Shape 40"
                            d="M324.436,245.142a15.753,15.753,0,0,0-18.862,0"
                            fill="none"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.5"
                          />
                          <path
                            id="Oval_4"
                            data-name="Oval 4"
                            d="M315.005,250.257a11.25,11.25,0,1,0-11.25-11.25A11.25,11.25,0,0,0,315.005,250.257Z"
                            fill="none"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.5"
                          />
                          <path
                            id="Shape_41"
                            data-name="Shape 41"
                            d="M307.882,238.257a.375.375,0,1,0,.375.375.375.375,0,0,0-.375-.375"
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
              </q-item-section>

              <q-item-section>{{
                $t('nav.dashboard')
              }}</q-item-section> </q-item
            >

            <q-item
              class="navigation-item q-mx-sm q-mt-xs"
              active-class="tab-active"
              to="/leads"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24.071" viewBox="0 0 24 24.071">
                    <g id="Business-Products_Business_cash-user-message" data-name="Business-Products / Business / cash-user-message" transform="translate(-539.998 -157.498)">
                      <g id="Group_18" data-name="Group 18">
                        <g id="cash-user-message">
                          <path id="Shape_94" data-name="Shape 94" d="M554.248,173.248v4.5l4.5-4.5h3a1.5,1.5,0,0,0,1.5-1.5v-12a1.5,1.5,0,0,0-1.5-1.5h-12a1.5,1.5,0,0,0-1.5,1.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                          <path id="Shape_95" data-name="Shape 95" d="M557.623,162.589H555a1.342,1.342,0,0,0-.5,2.588l2.655.825a1.342,1.342,0,0,1-.5,2.587H553.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                          <path id="Shape_96" data-name="Shape 96" d="M555.748,162.589v-1.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                          <path id="Shape_97" data-name="Shape 97" d="M555.748,170.089v-1.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                          <path id="Oval_17" data-name="Oval 17" d="M546,168a3,3,0,1,0-3-3A3,3,0,0,0,546,168Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                          <path id="Shape_98" data-name="Shape 98" d="M548.623,180.748,549,177h2.25v-2.25a5.25,5.25,0,0,0-10.5,0V177H543l.375,3.75" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                        </g>
                      </g>
                    </g>
                  </svg>
                </q-icon>
              </q-item-section>

              <q-item-section>{{ $t('nav.leads') }}</q-item-section>
            </q-item>

            <q-item
              class="navigation-item q-mx-sm q-mt-xs"
              active-class="tab-active"
              to="/offers"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24.123" viewBox="0 0 24 24.123">
                    <g id="Shopping-E-Commerce_Tags_Codes_tag-euro" data-name="Shopping-E-Commerce / Tags/Codes / tag-euro" transform="translate(-322.498 -898.998)">
                      <g id="Group_91" data-name="Group 91">
                        <g id="tag-euro">
                          <path id="Shape_564" data-name="Shape 564" d="M332.792,915.5c-1.975-1.975-1.975-4.156,0-6.131s4.156-1.975,6.131,0" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                          <path id="Shape_565" data-name="Shape 565" d="M332.791,907.324l4.087,4.087" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                          <path id="Shape_566" data-name="Shape 566" d="M330.748,909.367l3.065,3.065" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                          <path id="Oval_35" data-name="Oval 35" d="M340.742,905.893a1.445,1.445,0,1,0-1.445-1.445A1.445,1.445,0,0,0,340.742,905.893Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                          <path id="Shape_567" data-name="Shape 567" d="M344.2,899.748h-9.374a1.547,1.547,0,0,0-1.127.487l-10.036,10.671a1.536,1.536,0,0,0,.11,2.212l10.031,8.749a1.549,1.549,0,0,0,2.146-.108l9.379-10.017a1.538,1.538,0,0,0,.416-1.051v-9.4a1.541,1.541,0,0,0-1.545-1.54Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                        </g>
                      </g>
                    </g>
                  </svg>
                </q-icon>
              </q-item-section>

              <q-item-section>{{ $t('nav.offers') }}</q-item-section>
            </q-item>

            <q-item
              class="navigation-item q-mx-sm q-mt-xs"
              active-class="tab-active"
              to="/projects"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <g id="Interface-Essential_Date_Calendar_calendar-add-1" data-name="Interface-Essential / Date/Calendar / calendar-add-1" transform="translate(-351.005 -2847)">
                      <g id="Group_267" data-name="Group 267">
                        <g id="calendar-add-1">
                          <path id="Shape_1218" data-name="Shape 1218" d="M359.255,2864.25h-6a1.5,1.5,0,0,1-1.5-1.5v-12a1.5,1.5,0,0,1,1.5-1.5h13.5a1.5,1.5,0,0,1,1.5,1.5v4.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                          <path id="Shape_1219" data-name="Shape 1219" d="M351.755,2853.75h16.5" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5"/>
                          <path id="Shape_1220" data-name="Shape 1220" d="M356.255,2850.75v-3" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                          <path id="Shape_1221" data-name="Shape 1221" d="M363.755,2850.75v-3" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                          <path id="Oval_168" data-name="Oval 168" d="M368.255,2870.25a6,6,0,1,0-6-6A6,6,0,0,0,368.255,2870.25Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                          <path id="Shape_1222" data-name="Shape 1222" d="M368.255,2861.25v6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                          <path id="Shape_1223" data-name="Shape 1223" d="M365.255,2864.25h6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                        </g>
                      </g>
                    </g>
                  </svg>
                </q-icon>
              </q-item-section>

              <q-item-section>{{ $t('nav.projects') }}</q-item-section>
            </q-item>

            <q-item
              class="navigation-item q-mx-sm q-mt-xs"
              active-class="tab-active"
              to="/invoices"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <g id="Files-Folders_Common-Files_common-file-text-cash" data-name="Files-Folders / Common-Files / common-file-text-cash" transform="translate(-244 -286)">
                      <g id="Group_43" data-name="Group 43">
                        <g id="common-file-text-cash">
                          <path id="Shape_128" data-name="Shape 128" d="M262.75,300.25h-2.033a1.342,1.342,0,0,0-.5,2.587l2.064.826a1.342,1.342,0,0,1-.5,2.587H259.75" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                          <path id="Shape_129" data-name="Shape 129" d="M261.25,300.25v-.75" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                          <path id="Shape_130" data-name="Shape 130" d="M261.25,307v-.75" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                          <path id="Oval_18" data-name="Oval 18" d="M261.25,309.25a6,6,0,1,0-6-6A6,6,0,0,0,261.25,309.25Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                          <path id="Shape_131" data-name="Shape 131" d="M247.75,292.75h10.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                          <path id="Shape_132" data-name="Shape 132" d="M247.75,297.25h6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                          <path id="Shape_133" data-name="Shape 133" d="M247.75,301.75h3.75" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                          <path id="Shape_134" data-name="Shape 134" d="M251.5,306.25h-5.25a1.5,1.5,0,0,1-1.5-1.5v-16.5a1.5,1.5,0,0,1,1.5-1.5h10.629a1.5,1.5,0,0,1,1.06.439l2.872,2.872a1.5,1.5,0,0,1,.439,1.06v3.129" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                        </g>
                      </g>
                    </g>
                  </svg>
                </q-icon>
              </q-item-section>

              <q-item-section>{{ $t('nav.invoices') }}</q-item-section>
            </q-item>

            <q-separator class="q-my-md q-mx-lg"></q-separator>

            <q-item
              class="navigation-item q-mx-sm q-mt-xs"
              active-class="tab-active"
              to="/settings"
              exact
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24.042"
                    height="23.999"
                    viewBox="0 0 24.042 23.999"
                  >
                    <g
                      id="Users_Geometric-Close-Up-Single-User-Actions-Neutral_single-neutral-actions-setting"
                      data-name="Users / Geometric-Close-Up-Single-User-Actions-Neutral / single-neutral-actions-setting"
                      transform="translate(-514 -2710)"
                    >
                      <g id="Group_376" data-name="Group 376">
                        <g id="Regular_376" data-name="Regular 376">
                          <path
                            id="Shape_1479"
                            data-name="Shape 1479"
                            d="M514.75,2727.248a6.753,6.753,0,0,1,9.4-6.208"
                            fill="none"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.5"
                          />
                          <path
                            id="Oval_549"
                            data-name="Oval 549"
                            d="M521.5,2719a4.125,4.125,0,1,0-4.125-4.125A4.125,4.125,0,0,0,521.5,2719Z"
                            fill="none"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.5"
                          />
                          <path
                            id="Oval_550"
                            data-name="Oval 550"
                            d="M531.25,2728a1.5,1.5,0,1,0-1.5-1.5A1.5,1.5,0,0,0,531.25,2728Z"
                            fill="none"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.5"
                          />
                          <path
                            id="Shape_1480"
                            data-name="Shape 1480"
                            d="M532.524,2720.7l.442,1.453a.994.994,0,0,0,1.174.681l1.472-.341a1.339,1.339,0,0,1,1.275,2.218l-1.031,1.111a1,1,0,0,0,0,1.362l1.031,1.111a1.339,1.339,0,0,1-1.275,2.218l-1.472-.341a1,1,0,0,0-1.174.681l-.442,1.447a1.33,1.33,0,0,1-2.548,0l-.442-1.453a.994.994,0,0,0-1.174-.681l-1.472.341a1.339,1.339,0,0,1-1.275-2.218l1.031-1.111a1,1,0,0,0,0-1.362l-1.031-1.111a1.339,1.339,0,0,1,1.275-2.218l1.472.341a.993.993,0,0,0,1.174-.681l.442-1.453a1.33,1.33,0,0,1,2.548.006Z"
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
              </q-item-section>
              <q-item-section>{{ $t('nav.settings') }}</q-item-section>
            </q-item>

            <q-item
              v-if="authStore.user?.roles[0]?.name === 'admin'"
              class="navigation-item q-mx-sm q-mt-xs"
              active-class="tab-active"
              to="/users"
              exact
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24.001"
                    height="18.182"
                    viewBox="0 0 24.001 18.182"
                  >
                    <g
                      id="Users_Geomertric-Close-Up-Multiple-Users_multiple-neutral-1"
                      data-name="Users / Geomertric-Close-Up-Multiple-Users / multiple-neutral-1"
                      transform="translate(-562 -3444.818)"
                    >
                      <g id="Group_494" data-name="Group 494">
                        <g
                          stroke="currentColor"
                          id="Regular_494"
                          data-name="Regular 494"
                        >
                          <path
                            id="Oval_715"
                            data-name="Oval 715"
                            d="M569.5,3454a4.125,4.125,0,1,0-4.125-4.125A4.125,4.125,0,0,0,569.5,3454Z"
                            fill="none"
                            stroke="inherit"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.5"
                          />
                          <path
                            id="Shape_2033"
                            data-name="Shape 2033"
                            d="M562.75,3462.25a6.75,6.75,0,0,1,13.5,0"
                            fill="none"
                            stroke="inherit"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.5"
                          />
                          <path
                            id="Shape_2034"
                            data-name="Shape 2034"
                            d="M576.251,3446.416a4.125,4.125,0,1,1-.006,6.914"
                            fill="none"
                            stroke="inherit"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.5"
                          />
                          <path
                            id="Shape_2035"
                            data-name="Shape 2035"
                            d="M577,3455.667a6.757,6.757,0,0,1,8.25,6.583"
                            fill="none"
                            stroke="inherit"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.5"
                          />
                        </g>
                      </g>
                    </g>
                  </svg>
                </q-icon>
              </q-item-section>
              <q-item-section>{{ $t('nav.userManagement') }}</q-item-section>
            </q-item>

            <q-item
              v-if="authStore.user?.roles[0]?.name === 'admin'"
              class="navigation-item q-mx-sm q-mt-xs"
              active-class="tab-active"
              to="/gerneralsettings"
              exact
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="23.927" height="24" viewBox="0 0 23.927 24">
                    <g id="Interface-Essential_Setting_cog-hand-give" data-name="Interface-Essential / Setting / cog-hand-give" transform="translate(-639.11 -1563)">
                      <g id="Group_147" data-name="Group 147">
                        <g id="cog-hand-give">
                          <path id="Shape_692" data-name="Shape 692" d="M639.86,1577.25v9" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                          <path id="Shape_693" data-name="Shape 693" d="M639.86,1584.75h15a3,3,0,0,0-3-3h-3.75a3,3,0,0,0-3-3h-5.25" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                          <path id="Shape_694" data-name="Shape 694" d="M645.11,1581.75h3" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                          <path id="Oval_90" data-name="Oval 90" d="M654.109,1575a2.25,2.25,0,1,0-2.25-2.25A2.25,2.25,0,0,0,654.109,1575Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                          <path id="Shape_695" data-name="Shape 695" d="M655.93,1579.5l.159-1.113a5.955,5.955,0,0,0,1.916-1.1l1.946.781a1.5,1.5,0,0,0,1.858-.642l.2-.345a1.5,1.5,0,0,0-.373-1.93L660,1573.865a5.624,5.624,0,0,0,0-2.231l1.633-1.282a1.5,1.5,0,0,0,.369-1.93l-.2-.345a1.5,1.5,0,0,0-1.858-.642l-1.942.781a5.936,5.936,0,0,0-1.911-1.1l-.3-2.074a1.5,1.5,0,0,0-1.489-1.292h-.4a1.5,1.5,0,0,0-1.48,1.287l-.3,2.074a5.93,5.93,0,0,0-1.91,1.1l-1.943-.776a1.5,1.5,0,0,0-1.857.642l-.2.345a1.5,1.5,0,0,0,.372,1.93l1.635,1.282a5.55,5.55,0,0,0,0,2.231l-1.634,1.282" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                        </g>
                      </g>
                    </g>
                  </svg>
                </q-icon>
              </q-item-section>
              <q-item-section>{{ $t('nav.generalSettings') }}</q-item-section>
            </q-item>

            <q-item
              v-if="authStore.user?.roles[0]?.name === 'admin'"
              class="navigation-item q-mx-sm q-mt-xs"
              active-class="tab-active"
              to="/warehousesettings"
              exact
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="23.818" viewBox="0 0 24 23.818">
                    <g id="Shipping-Delivery_Warehouse_Fullfilment_warehouse-storage-2" data-name="Shipping-Delivery / Warehouse/Fullfilment / warehouse-storage-2" transform="translate(-551.005 -160.082)">
                      <g id="Group_18" data-name="Group 18">
                        <g id="warehouse-storage-2">
                          <path id="Shape_104" data-name="Shape 104" d="M563.005,177.15h-5.25a.75.75,0,0,0-.75.75v4.5a.75.75,0,0,0,.75.75h4.5a.75.75,0,0,0,.75-.75Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                          <path id="Shape_105" data-name="Shape 105" d="M568.255,177.15h-5.25v5.25a.75.75,0,0,0,.75.75h4.5a.75.75,0,0,0,.75-.75v-4.5A.75.75,0,0,0,568.255,177.15Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                          <path id="Shape_106" data-name="Shape 106" d="M565.255,171.15h-4.5a.75.75,0,0,0-.75.75v5.25h6V171.9A.75.75,0,0,0,565.255,171.15Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                          <path id="Shape_107" data-name="Shape 107" d="M574.255,183.15v-15.6a1.5,1.5,0,0,0-.794-1.324l-9.75-5.2a1.5,1.5,0,0,0-1.411,0l-9.75,5.2a1.5,1.5,0,0,0-.795,1.324v15.6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
                        </g>
                      </g>
                    </g>
                  </svg>
                </q-icon>
              </q-item-section>
              <q-item-section>{{ $t('nav.warehouseMaterialSettings') }}</q-item-section>
            </q-item>

          </q-list>
        </q-scroll-area>
      </div>
      <div class="q-mini-drawer-hide absolute" style="top: 30px; right: -17px">
        <q-btn
          dense
          round
          style="
            background-color: black;
            color: white;
            border: 6px solid #f2f2f7;
          "
          unelevated
          icon="chevron_left"
          @click="miniState = true"
        />
      </div>
    </q-drawer>

    <q-page-container>
      <q-page class="row no-wrap">
        <div class="col">
          <div class="full-height">
            <q-scroll-area
              class="col q-pr-sm q-scrollarea--only-vertical full-height"
              visible
            >
              <router-view />
            </q-scroll-area>
          </div>
        </div>
      </q-page>
    </q-page-container>

    <OverlayHint></OverlayHint>
  </q-layout>
</template>

<script>
import { ref } from 'vue';
import { useAuthStore } from 'stores/auth';
import NotificationDropdownComponent from 'components/notification/NotificationDropdownComponent.vue';
import OverlayHint from 'components/OverlayHint.vue';
import { useUsersStore } from 'stores/users';

import { useQuasar } from 'quasar';
import langDe from 'quasar/lang/de';
import { useResetStore } from 'src/utils/resetStore';

export default {
  components: { NotificationDropdownComponent, OverlayHint },
  setup() {
    const resetStore = useResetStore();
    const miniState = ref(false);
    const authStore = useAuthStore();
    const userStore = useUsersStore();
    const $q = useQuasar();

    if ($q.lang.getLocale() === 'de-DE') {
      $q.lang.set(langDe);
    }

    authStore.setupAxiosInterceptors();
    authStore.userInfo();
    return {
      drawer: ref(false),
      miniState,
      authStore,
      userStore,
      drawerClick(e) {
        // if in "mini" state and user
        // click on drawer, we switch it to "normal" mode
        if (miniState.value) {
          miniState.value = false;

          // notice we have registered an event with capture flag;
          // we need to stop further propagation as this click is
          // intended for switching drawer to "normal" mode only
          e.stopPropagation();
        }
      },
      logout() {
        resetStore.all();
        authStore.logout();
      },
    };
  },
};
</script>

<style>
body {
  background-color: #f3f3f7;
}

body.body--dark {
  background: #232333;
}

.q-dark {
  background: #2b2c40 !important;
}

.tab-active {
  background-color: rgba(105, 122, 140, 0.05) !important;
  color: #000000 !important;
}

.navigation-item {
  color: #000;
  border-radius: 5px;
  min-height: 44px !important;
}

.q-dark {
  .navigation-item {
    color: #fff;
  }

  .q-mini-drawer-hide {
    .q-btn {
      background-color: #fff !important;
      color: black !important;
      border-color: #232333 !important;
    }
  }
}

.q-scrollarea--only-vertical .q-scrollarea__content {
  width: 100%;
}

.drawer_cls {
  background-color: #fff !important;
  color: #697a8d !important;
}
</style>
