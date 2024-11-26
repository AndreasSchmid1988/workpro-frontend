import { defineStore } from 'pinia';
import { useAuthStore } from 'stores/auth';
import axios from 'axios';

interface UsersEditState {
  loading: boolean;
  updating: boolean;
  company: string;
  salutation: string;
  firstname: string;
  lastname: string;
  mobile: string;
  address: string;
  postalcode: string;
  city: string;
  country: string;
  errors: Record<string, string>;
  password: string;
  confirmPassword: string;
  apiKey: string;
  apiKeyHidden: string;
  showApiKey: boolean;
  publisherId: string;
  publisherName: string;
}

export const useUsersEditStore = defineStore({
  id: 'usersEdit',
  state: (): UsersEditState => ({
    loading: true,
    updating: false,
    company: '',
    salutation: '',
    firstname: '',
    lastname: '',
    mobile: '',
    address: '',
    postalcode: '',
    city: '',
    country: '',
    errors: {},
    password: '',
    confirmPassword: '',
    apiKey: '******',
    apiKeyHidden: '',
    showApiKey: true,
    publisherId: '',
    publisherName: '',
  }),
  actions: {
    toggleApiKey: function () {
      if (this.showApiKey) {
        this.apiKey = this.apiKeyHidden;
      } else {
        this.apiKeyHidden = this.apiKey;
        this.apiKey = '******';
      }
      this.showApiKey = !this.showApiKey;
    },

    resetValidations() {
      [
        'company',
        'salutation',
        'firstname',
        'lastname',
        'mobile',
        'address',
        'postalcode',
        'city',
        'country',
        'publisherName',
      ].forEach((item) => {
        delete this.errors[item];
      });
    },
    validateField(field: string, tab: string) {
      switch (tab) {
        case 'personal':
          if (
            [
              'company',
              'salutation',
              'firstname',
              'lastname',
              'mobile',
              'address',
              'postalcode',
              'city',
              'country',
            ].includes(field)
          ) {
            const value = this[field as keyof typeof this];
            if (!value) {
              this.errors[field] = `${
                field.charAt(0).toUpperCase() + field.slice(1)
              } is required`;
            } else {
              delete this.errors[field];
            }
          }
          break;
        case 'security':
          if (['publisherName'].includes(field)) {
            const value = this[field as keyof typeof this];
            if (!value) {
              this.errors[field] = `${
                field.charAt(0).toUpperCase() + field.slice(1)
              } is required`;
            } else {
              delete this.errors[field];
            }
          }
          break;
        default:
          console.log('No handled tab: ' + tab);
      }
    },

    validateForm(tab: string): boolean {
      let isValid = true;
      // Only allow keys that exist in the state to be used
      const validKeys = Object.keys(this) as (keyof typeof this)[];
      validKeys.forEach((field) => {
        if (field !== 'errors') {
          // Now TypeScript knows that field is a valid key
          this.validateField(field, tab);
          // We check if this.errors[field] exists
          // Since `this.errors` is a well-defined object, TypeScript won't complain
          if (this.errors[field]) {
            isValid = false;
          }
        }
      });

      /*      // Add your password confirmation logic here
            if (this.password !== this.confirmPassword) {
              this.errors.confirmPassword = 'Passwords do not match';
              isValid = false;
            } else {
              delete this.errors.confirmPassword;
            }*/

      return isValid;
    },
  },
});
