// src/stores/auth.ts
import { defineStore } from 'pinia';
import axios, { isAxiosError } from 'axios';
import { LocalStorage, QVueGlobals, useQuasar } from 'quasar';

import { Notify } from 'quasar';
import { Composer, useI18n } from 'vue-i18n';
import { useReportingStore } from 'stores/reporting';

interface Country {
  alpha2Code: string;
  callingCodes: string[];
  // other properties
}

interface State {
  mobile: string | null;
  // Andere Eigenschaften...
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    showOverlayHint: false,
    emailVerified: false,
    emailVerifyError: false,
    loading: false,
    updatingApiKey: false,
    updating: false,
    userActive: false,
    creatingPublisher: false,
    typedUsernameCount: 0,
    typedPasswordCount: 0,
    typedFirstnameCount: 0,
    typedLastnameCount: 0,
    typedCompanyCount: 0,
    typedAddressCount: 0,
    typedCityCount: 0,
    typedZipCount: 0,
    typedMobileCount: 0,
    typedCountryCount: 0,
    typedApiKeyCount: 0,
    typedPublisherIdCount: 0,
    typedPublisherNameCount: 0,
    selectedSalutationCount: 0,
    last_login: null,
    created_at: null,
    email_verified_at: null,
    updated_at: null,
    user_id: null,
    name: null,
    firstname: null,
    lastname: null,
    company: null,
    salutation: null,
    address: null,
    city: null,
    zip: null,
    mobile: null,
    country: null,
    username: null,
    password: null,
    passwordConfirm: null,
    isPassword: true,
    isPasswordConfirm: true,
    selectedCallingCode: '',
    apiKey: '******',
    apiKeyHidden: '',
    showApiKey: true,
    publisherId: '',
    publisherName: '',
    remember_me: null,
    accessToken: LocalStorage.getItem('accessToken'),
    refreshToken: LocalStorage.getItem('refreshToken'),
    user: {
      id: '',
      active: false,
      hasOpenRequests: false,
      roles: [],
      user_settings: {
        firstname: '',
        lastname: '',
      },
    },
    i18n: useI18n() as Composer,
    q: useQuasar() as QVueGlobals,
  }),
  getters: {
    usernameError(state): string | null {
      if (this.typedUsernameCount <= 0) {
        return null;
      }
      const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!re.test(state.username ?? '')) {
        return this.i18n.t('invalidEmail');
      }
      return null;
    },
    passwordError(state): string | null {
      if (this.typedPasswordCount <= 0) {
        return null;
      }
      const re = /^(?=.*[A-Z])(?=.*\W)[a-zA-Z0-9\W]{8,}$/;
      if (!re.test(state.password ?? '')) {
        return this.i18n.t('passwordValidation');
      }
      return null;
    },
    passwordConfirmError(): string | null {
      if (this.password !== this.passwordConfirm) {
        return this.i18n.t('passwordsDoNotMatch');
      }
      return null;
    },
    firstnameError(state): string | null {
      if (this.typedFirstnameCount <= 0) {
        return null;
      }
      if (!state.firstname) {
        return this.i18n.t('firstnameIsRequired');
      }
      return null;
    },
    lastnameError(state): string | null {
      if (this.typedLastnameCount <= 0) {
        return null;
      }
      if (!state.lastname) {
        return this.i18n.t('lastnameIsRequired');
      }
      return null;
    },
    salutationError(state): string | null {
      if (this.selectedSalutationCount <= 0) {
        return null;
      }
      if (!state.salutation) {
        return this.i18n.t('salutationIsRequired');
      }
      return null;
    },
    companyError(state): string | null {
      if (this.typedCompanyCount <= 0) {
        return null;
      }
      if (!state.company || state.company === '') {
        return this.i18n.t('companyIsRequired');
      }
      return null;
    },
    addressError(state): string | null {
      if (this.typedAddressCount <= 0) {
        return null;
      }
      if (!state.address || state.address === '') {
        return this.i18n.t('addressIsRequired');
      }
      return null;
    },
    cityError(state): string | null {
      if (this.typedCityCount <= 0) {
        return null;
      }
      if (!state.city || state.city === '') {
        return this.i18n.t('cityIsRequired');
      }
      return null;
    },
    zipError(state): string | null {
      if (this.typedZipCount <= 0) {
        return null;
      }
      if (!state.zip || state.zip === '') {
        return this.i18n.t('zipIsRequired');
      }
      return null;
    },
    mobileError(state): string | null {
      if (this.typedMobileCount <= 0) {
        return null;
      }

      if (!state.mobile || state.mobile === '') {
        return this.i18n
          ? this.i18n.t('mobileIsRequired')
          : 'Mobile is required';
      }

      const tempState: State = state ?? ({ mobile: '' } as State);

      // Ein einfacher Regex zum Überprüfen einer Telefonnummer
      const phoneRegex = /^[0-9]{10,15}$/;

      if (
        typeof tempState.mobile === 'string' &&
        !tempState.mobile.match(phoneRegex)
      ) {
        return this.i18n.t('validPhonenumber');
      }

      return null;
    },
    countryError(state): string | null {
      if (this.typedCountryCount <= 0) {
        return null;
      }
      if (!state.country) {
        return this.i18n.t('countryIsRequired');
      }
      return null;
    },
    publisherNameError(state): string | null {
      if (this.typedPublisherNameCount <= 0) {
        return null;
      }
      if (!state.publisherName) {
        return this.i18n.t('publisherNameRequired');
      }
      return null;
    },
    publisherIdError(state): string | null {
      if (this.typedPublisherIdCount <= 0) {
        return null;
      }
      if (!state.publisherId) {
        return this.i18n.t('publisherIdRequired');
      }
      return null;
    },
    apiKeyError(state): string | null {
      if (this.typedApiKeyCount <= 0) {
        return null;
      }
      if (!state.apiKey || state.apiKey.startsWith('****')) {
        return this.i18n.t('apiKeyRequired');
      }
      return null;
    },
    isValid(): boolean {
      return (
        !this.usernameError &&
        !this.passwordError &&
        !this.passwordConfirmError &&
        !this.salutationError &&
        !this.firstnameError &&
        !this.lastnameError &&
        !this.companyError &&
        !this.addressError &&
        !this.zipError &&
        !this.mobileError &&
        !this.countryError &&
        !this.cityError &&
        this.selectedSalutationCount > 0 &&
        this.typedFirstnameCount > 0 &&
        this.typedLastnameCount > 0 &&
        this.typedCompanyCount > 0 &&
        this.typedAddressCount > 0 &&
        this.typedZipCount > 0 &&
        this.typedMobileCount > 0 &&
        this.typedCountryCount > 0 &&
        this.typedCityCount > 0
      );
    },
    isValidUserDetails(): boolean {
      return (
        !this.salutationError &&
        !this.firstnameError &&
        !this.lastnameError &&
        !this.companyError &&
        !this.addressError &&
        !this.zipError &&
        !this.mobileError &&
        !this.countryError &&
        !this.cityError &&
        this.selectedSalutationCount > 0 &&
        this.typedFirstnameCount > 0 &&
        this.typedLastnameCount > 0 &&
        this.typedCompanyCount > 0 &&
        this.typedAddressCount > 0 &&
        this.typedZipCount > 0 &&
        this.typedMobileCount > 0 &&
        this.typedCountryCount > 0 &&
        this.typedCityCount > 0
      );
    },
    isApiKeyData(): boolean {
      return (
        !this.apiKeyError &&
        !this.publisherIdError &&
        !this.publisherNameError &&
        this.typedPublisherIdCount > 0 &&
        this.typedApiKeyCount > 0 &&
        this.typedPublisherNameCount > 0
      );
    },
    isValidLogin(): boolean {
      return (
        (this.username ?? '').length > 0 && (this.password ?? '').length > 0
      );
    },
    isValidPasswordReset(): boolean {
      return (
        !this.passwordConfirmError &&
        !this.usernameError &&
        this.typedPasswordCount > 0 &&
        this.typedUsernameCount > 0
      );
    },
  },
  actions: {
    toggleApiKey: function () {
      if (this.showApiKey) {
        this.apiKey = this.apiKeyHidden;
      }
      /*      else {
        this.apiKeyHidden = this.apiKey;
        this.apiKey = '******';
      }*/
      this.showApiKey = !this.showApiKey;
    },
    setCallingCode() {
      let tempCountry: Country;
      if (this.country) {
        tempCountry = this.country;
        if (tempCountry.callingCodes.length > 0) {
          this.selectedCallingCode = '+' + tempCountry.callingCodes[0];
        }
      }
    },
    typedApiKey() {
      this.typedApiKeyCount++;
    },
    typedPublisherId() {
      this.typedPublisherIdCount++;
    },
    typedPublisherName() {
      this.typedPublisherNameCount++;
    },
    typedUsername() {
      this.typedUsernameCount = this.typedUsernameCount + 1;
    },
    typedPassword() {
      this.typedPasswordCount = this.typedPasswordCount + 1;
    },
    typedFirstname() {
      this.typedFirstnameCount = this.typedFirstnameCount + 1;
    },
    typedLastname() {
      this.typedLastnameCount = this.typedLastnameCount + 1;
    },
    typedAddress() {
      this.typedAddressCount = this.typedAddressCount + 1;
    },
    typedZip() {
      this.typedZipCount = this.typedZipCount + 1;
    },
    typedCity() {
      this.typedCityCount = this.typedCityCount + 1;
    },
    typedCompany() {
      this.typedCompanyCount = this.typedCompanyCount + 1;
    },
    typedCountry() {
      this.typedCountryCount = this.typedCountryCount + 1;
    },
    typedMobile() {
      this.typedMobileCount = this.typedMobileCount + 1;
    },
    selectedSalutation() {
      this.selectedSalutationCount = this.selectedSalutationCount + 1;
    },
    setTokens(accessToken: string, refreshToken: string) {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      LocalStorage.set('accessToken', accessToken);
      LocalStorage.set('refreshToken', refreshToken);
    },
    clearTokens: function () {
      this.accessToken = null;
      this.refreshToken = null;
      LocalStorage.remove('accessToken');
      LocalStorage.remove('refreshToken');
    },
    async login() {
      try {
        this.loading = true;
        const tokenEndpoint = '/oauth/token'; // This may vary based on your Laravel setup.
        const response = await axios.post(
          process.env.APP_API_BASE_URL + tokenEndpoint,
          {
            grant_type: 'password',
            client_id: process.env.APP_CLIENT_ID,
            client_secret: process.env.APP_CLIENT_SECRET,
            username: this.username,
            password: this.password,
            scope: '', // Define any scopes if needed
          }
        );
        this.setTokens(response.data.access_token, response.data.refresh_token);

        await this.userInfo();

        this.loading = false;

        this.password = null;
        this.passwordConfirm = null;

        if (this.user.active) {
          this.router.push('/');
        } else {
          this.showOverlayHint = true;
          this.router.push('/settings');
        }

        // Your try block code here
      } catch (e: unknown) {
        this.loading = false;
        let message = this.i18n.t('defaultError');
        // Type guard to ensure e is of AxiosError type
        if (isAxiosError(e)) {
          const errorData = e.response?.data;
          // Type guard to ensure errorData has 'error' property
          if (
            errorData &&
            typeof errorData === 'object' &&
            'error' in errorData
          ) {
            switch (errorData.error) {
              case 'invalid_grant':
                message = this.i18n.t('credentialsError'); // Type cast i18n return value to string
                break;
              // ... other cases
            }
          }
          if (
            errorData &&
            typeof errorData === 'object' &&
            'message' in errorData
          ) {
            switch (errorData.message) {
              case 'Your email address is not verified.':
                message = this.i18n.t('Your email address is not verified.'); // Type cast i18n return value to string
                break;
              case 'Your account is blocked!.':
                message = this.i18n.t('Your account is blocked!.'); // Type cast i18n return value to string
                break;
              default:
                break;
              // ... other cases
            }
          }
        }
        Notify.create({
          message: message, // Use the message you've determined
          color: 'negative',
          position: 'top',
        });
        console.log(e);
      }
    },
    async fetchRefreshToken() {
      try {
        const tokenEndpoint = '/oauth/token';
        const response = await axios.post(
          process.env.APP_API_BASE_URL + tokenEndpoint,
          {
            grant_type: 'refresh_token',
            refresh_token: this.refreshToken,
            client_id: process.env.APP_CLIENT_ID,
            client_secret: process.env.APP_CLIENT_SECRET,
            scope: '', // Keep consistent with your login scope
          }
        );

        this.setTokens(response.data.access_token, response.data.refresh_token);
      } catch (e) {
        this.logout();
        console.log(e);
      }
    },
    setupAxiosInterceptors() {
      axios.interceptors.response.use(
        (response) => response,
        async (error) => {
          // The arrow function ensures 'this' refers to the store
          if (
            error.response &&
            error.response.status === 401 &&
            !!this.refreshToken &&
            !error.config.__isRetryRequest
          ) {
            try {
              error.config.__isRetryRequest = true;
              await this.fetchRefreshToken();

              // Update Authorization header with new access token
              error.config.headers = {
                ...error.config.headers,
                Authorization: `Bearer ${this.accessToken}`,
              };

              // Retry the request with the new token
              return axios(error.config);
            } catch (err) {
              this.logout();
              return Promise.reject(err);
            }
          } else {
            return Promise.reject(error);
          }
        }
      );
    },
    reset() {
      Object.assign(this, {
        emailVerified: false,
        emailVerifyError: false,
        loading: false,
        updatingApiKey: false,
        updating: false,
        userActive: false,
        creatingPublisher: false,
        typedUsernameCount: 0,
        typedPasswordCount: 0,
        typedFirstnameCount: 0,
        typedLastnameCount: 0,
        typedCompanyCount: 0,
        typedAddressCount: 0,
        typedCityCount: 0,
        typedZipCount: 0,
        typedMobileCount: 0,
        typedCountryCount: 0,
        typedApiKeyCount: 0,
        typedPublisherIdCount: 0,
        typedPublisherNameCount: 0,
        selectedSalutationCount: 0,
        last_login: null,
        created_at: null,
        email_verified_at: null,
        updated_at: null,
        user_id: null,
        name: null,
        firstname: null,
        lastname: null,
        company: null,
        salutation: null,
        address: null,
        city: null,
        zip: null,
        mobile: null,
        country: null,
        username: null,
        password: null,
        passwordConfirm: null,
        isPassword: true,
        isPasswordConfirm: true,
        selectedCallingCode: '',
        apiKey: '',
        showApiKey: true,
        publisherId: '',
        publisherName: '',
        remember_me: null,
        user: {
          id: '',
          active: false,
          roles: [],
          user_settings: {
            firstname: '',
            lastname: '',
          },
        },
      });
    },
    logout() {
      this.clearTokens();
      this.reset();
      this.router.push('/login');
    },
    async register() {
      try {
        this.typedUsernameCount++;
        this.typedPasswordCount++;
        this.selectedSalutationCount++;
        this.typedFirstnameCount++;
        this.typedLastnameCount++;
        this.typedCompanyCount++;
        this.typedAddressCount++;
        this.typedZipCount++;
        this.typedMobileCount++;
        this.typedCountryCount++;
        this.typedCityCount++;

        if (!this.isValid) {
          return null;
        }

        const tempCountry: Country =
          this.country ?? ({ alpha2Code: '' } as Country);

        this.loading = true;
        const registerEndpoint = '/api/v1/register';
        const response = await axios.post(
          process.env.APP_API_BASE_URL + registerEndpoint,
          {
            company: this.company,
            salutation: this.salutation,
            firstname: this.firstname,
            lastname: this.lastname,
            address: this.address,
            postalcode: this.zip,
            city: this.city,
            mobile: this.mobile,
            calling_code: this.selectedCallingCode,
            country: tempCountry.alpha2Code,
            email: this.username,
            password: this.password,
            password_confirmation: this.passwordConfirm,
            terms: true,
          }
        );
        this.loading = false;
        this.router.push('/register/success');
      } catch (e: unknown) {
        this.loading = false;
        let message = this.i18n.t('defaultError');
        if (isAxiosError(e)) {
          const errorData = e.response?.data;
          if (
            errorData &&
            typeof errorData === 'object' &&
            'errors' in errorData
          ) {
            for (const [key, value] of Object.entries(errorData.errors)) {
              switch (key) {
                case 'email':
                  message = this.i18n.t('emailInvalidOrTaken');
                  break;
                default:
                  message = value as string;
                  break;
              }
            }
          }
        }
        Notify.create({
          message: message, // Use the message you've determined
          color: 'negative',
          position: 'top',
        });
        console.log(e);
      }
    },
    async verifyEmail(id: string, hash: string) {
      try {
        this.loading = true;
        const registerEndpoint = '/api/v1/email/verify/' + id + '/' + hash;
        const response = await axios.post(
          process.env.APP_API_BASE_URL + registerEndpoint,
          {}
        );
        console.log(response);
        this.loading = false;
        this.emailVerified = true;
      } catch (e: unknown) {
        this.loading = false;
        this.emailVerifyError = true;
        Notify.create({
          message: this.i18n.t('emailVerifyError'), // Use the message you've determined
          color: 'negative',
          position: 'top',
          timeout: 0, // No auto-dismiss
          actions: [
            {
              label: this.i18n.t('retry'),
              color: 'white',
              handler: () => {
                // Add your refresh logic here. For example:
                window.location.reload();
              },
            },
          ],
        });
        console.log(e);
      }
    },
    userInfo: async function () {
      try {
        if (!this.accessToken) {
          throw new Error('No access token');
        }
        const userEndpoint = '/api/v1/user/infos';
        const response = await axios.get(
          process.env.APP_API_BASE_URL + userEndpoint,
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
            },
          }
        );
        this.user = response.data;
        return response;
      } catch (e) {
        this.logout();
        console.log(e);
        throw e;
      }
    },
    fetchUserDetails: async function () {
      this.loading = true;
      try {
        const userId = this.router.currentRoute.value.params.id;
        const userEndpoint = '/api/v1/user/settings';
        const response = await axios.get(
          process.env.APP_API_BASE_URL + userEndpoint,
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
            },
            params: {
              users_id: userId,
            },
          }
        );

        const reportingStore = useReportingStore();
        const userData = response.data;
        this.company = userData.company;
        this.salutation = userData.salutation;
        this.firstname = userData.firstname;
        this.lastname = userData.lastname;
        this.mobile = userData.mobile;
        this.address = userData.address;
        this.zip = userData.postalcode;
        this.city = userData.city;
        this.userActive = userData.active;
        this.last_login = userData.last_login;
        this.created_at = userData.created_at;
        this.email_verified_at = userData.email_verified_at;
        this.updated_at = userData.updated_at;
        this.user_id = userData.users_id;

        console.dir(userData);

        const item = reportingStore.countryList.find(
          (country) => country.alpha2Code === userData.country
        );
        if (item) {
          this.country = item as any;
        }

        this.setCallingCode();

        this.apiKeyHidden = userData.api_key;
        this.apiKey = userData.api_key; // '******'; Disabled Toggle function
        this.publisherName = userData.publisher_name;
        this.publisherId = userData.publisher_id;
        this.loading = false;
        return true;
      } catch (e) {
        console.log(e);
        this.loading = false;
        throw e;
      }
    },
    async saveUserDetails() {
      try {
        this.typedUsernameCount++;
        this.typedPasswordCount++;
        this.selectedSalutationCount++;
        this.typedFirstnameCount++;
        this.typedLastnameCount++;
        this.typedCompanyCount++;
        this.typedAddressCount++;
        this.typedZipCount++;
        this.typedMobileCount++;
        this.typedCountryCount++;
        this.typedCityCount++;

        this.updating = true;

        const tempCountry: Country =
          this.country ?? ({ alpha2Code: '' } as Country);

        if (this.isValidUserDetails) {
          const authStore = useAuthStore();
          const userId = this.router.currentRoute.value.params.id;
          const userEndpoint = '/api/v1/user/settings';
          // Prepare the data you want to send in the request
          const payload = {
            company: this.company,
            salutation: this.salutation,
            firstname: this.firstname,
            lastname: this.lastname,
            mobile: this.mobile,
            address: this.address,
            postalcode: this.zip,
            city: this.city,
            country: tempCountry.alpha2Code,
            calling_code: this.selectedCallingCode,
            tab: 'account-details',
          };

          const response = await axios.put(
            `${process.env.APP_API_BASE_URL}${userEndpoint}`,
            payload,
            {
              headers: {
                Authorization: `Bearer ${authStore.accessToken}`,
              },
              params: {
                users_id: userId,
              },
            }
          );
          this.q.notify({
            type: 'positive',
            message: this.i18n.t('userUpdateSuccess'),
          });
          console.log('Update successful', response);
          this.updating = false;
        } else {
          throw new Error('client validation error');
        }
      } catch (e) {
        this.q.notify({
          type: 'negative',
          message: this.i18n.t('userUpdateError'),
        });

        this.updating = false;
        console.log('Update failed', e);
      }
    },
    async saveApiKey() {
      try {
        this.typedApiKeyCount++;
        this.typedPublisherIdCount++;
        this.typedPublisherNameCount++;

        this.updatingApiKey = true;
        if (this.isApiKeyData) {
          const authStore = useAuthStore();
          const userId = this.router.currentRoute.value.params.id;
          const userEndpoint = '/api/v1/user/settings';
          // Prepare the data you want to send in the request
          const payload = {
            publisher_name: this.publisherName,
            publisher_id: this.publisherId,
            api_key: this.apiKey,
            tab: 'api-key',
          };

          const response = await axios.put(
            `${process.env.APP_API_BASE_URL}${userEndpoint}`,
            payload,
            {
              headers: {
                Authorization: `Bearer ${authStore.accessToken}`,
              },
              params: {
                users_id: userId,
              },
            }
          );
          console.log('Update successful', response);
          await this.fetchUserDetails();
          this.q.notify({
            type: 'positive',
            message: this.i18n.t('apiUpdateSuccess'),
          });
          this.updatingApiKey = false;
        } else {
          throw new Error('client validation error');
        }
      } catch (e) {
        this.q.notify({
          type: 'negative',
          message: this.i18n.t('apiUpdateError'),
        });
        this.updatingApiKey = false;
        console.log('Update failed', e);

        let message = '';
        // Type guard to ensure e is of AxiosError type
        if (isAxiosError(e)) {
          const errorData = e.response?.data;
          // Type guard to ensure errorData has 'error' property
          if (
            errorData &&
            typeof errorData === 'object' &&
            'message' in errorData
          ) {
            switch (errorData.message) {
              case 'apiKeyError':
                message = this.i18n.t('apiKeyError'); // Type cast i18n return value to string
                break;
              default:
                message = this.i18n.t('defaultError');
                break;
              // ... other cases
            }
          }
          Notify.create({
            message: message, // Use the message you've determined
            color: 'negative',
            position: 'top',
            timeout: 30000,
          });
        }
      }
    },
    createPublisher: async function () {
      try {
        this.typedPublisherNameCount++;
        if (this.publisherNameError) {
          return false;
        }
        this.creatingPublisher = true;
        const userId = this.router.currentRoute.value.params.id;
        const payload = {
          name: this.publisherName,
          user_id: userId,
        };
        const authStore = useAuthStore();
        const endpoint = '/api/v1/publisher/create';
        const response = await axios.post(
          process.env.APP_API_BASE_URL + endpoint,
          payload,
          {
            headers: {
              Authorization: `Bearer ${authStore.accessToken}`,
            },
            params: {},
          }
        );
        if (response.data.success) {
          await authStore.fetchUserDetails();
        } else {
          throw new Error();
        }
        this.creatingPublisher = false;
      } catch (e) {
        console.log(e);
        this.creatingPublisher = false;
      }
    },
    async forgotPassword() {
      try {
        this.typedUsernameCount++;
        if (this.usernameError) {
          return false;
        }
        this.loading = true;
        const payload = {
          email: this.username,
        };
        const endpoint = '/api/v1/password/email';
        const response = await axios.post(
          process.env.APP_API_BASE_URL + endpoint,
          payload,
          {
            params: {},
          }
        );
        this.loading = false;
        Notify.create({
          message: this.i18n.t('passwordResetMailSent'), // Use the message you've determined
          color: 'positive',
          position: 'top',
        });
      } catch (e) {
        console.log(e);
        this.loading = false;
        Notify.create({
          message: this.i18n.t('defaultError'), // Use the message you've determined
          color: 'negative',
          position: 'top',
        });
      }
    },
    async resetPassword() {
      try {
        this.typedPasswordCount++;
        this.typedUsernameCount++;
        if (this.isValidPasswordReset) {
          this.loading = true;
          const payload = {
            email: this.username,
            token: this.router.currentRoute.value.params.token,
            password: this.password,
            password_confirmation: this.passwordConfirm,
          };
          const endpoint = '/api/v1/password/reset';
          const response = await axios.post(
            process.env.APP_API_BASE_URL + endpoint,
            payload,
            {
              params: {},
            }
          );
          this.loading = false;
          Notify.create({
            message: this.i18n.t('passwordSuccessfullyChanged'), // Use the message you've determined
            color: 'positive',
            position: 'top',
            timeout: 0,
            actions: [
              {
                label: this.i18n.t('goToLogin'),
                color: 'white',
                handler: () => {
                  // Add your refresh logic here. For example:
                  this.router.push('/login');
                },
              },
            ],
          });
        } else {
          throw new Error();
        }
      } catch (e) {
        console.log(e);
        this.loading = false;
        Notify.create({
          message: this.i18n.t('defaultError'), // Use the message you've determined
          color: 'negative',
          position: 'top',
        });
      }
    },
  },
});
