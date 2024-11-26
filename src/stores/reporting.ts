// src/stores/auth.ts
import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from 'stores/auth';

export interface ChartData {
  categories: string[];
  incomingCountSum: number[];
  openCountSum: number[];
  confirmedCountSum: number[];
  paidCountSum: number[];
  rejectedCountSum: number[];
}

interface monthCategory {
  id: string;
  label: string;
}

interface marketNumbers {
  market: string;
  clicks: number;
  payout: number;
  openAmount: number;
  confirmedAmount: number;
  rejectedCount: number;
}

interface marketStatsNumbers {
  incomingCountSum: number;
  paidAmountSum: number;
  openAmountSum: number;
  confirmedAmountSum: number;
  rejectedCountSum: number;
  paidCountSum: number;
  confirmedCountSum: number;
  openCountSum: number;
}

interface marketStatistics {
  markets: marketNumbers[];
  statistics: marketStatsNumbers;
}

interface country {
  alpha2Code: string;
  callingCodes: string[];
  flag: string;
  independent: boolean;
  name: string;
  translations: object;
}

export interface selectableMonth {
  name: string;
  value: number;
}

export interface merchStatus {
  status: string;
  loading: boolean;
  loaded: boolean;
}

export interface merchant {
  id: string | null;
  statusObj: merchStatus;
}

export const useReportingStore = defineStore('reporting', {
  state: () => ({
    commissionsLoading: false,
    summaryLoading: false,
    merchantsLoading: false,
    chartData: {
      categories: [],
      incomingCountSum: [],
      openCountSum: [],
      confirmedCountSum: [],
      paidCountSum: [],
      rejectedCountSum: [],
    } as ChartData,
    selectedMonth: {
      id: '',
      label: '',
    } as monthCategory,
    marketStats: {} as marketStatistics,
    selectedMonthDetails: {
      paidAmount: 0,
      openAmount: 0,
      confirmedAmount: 0,
    },
    countryList: [] as country[],
    statistics_selectedYear: new Date().getFullYear(),
    statistics_selectedMarket: {
      alpha2Code: '',
      callingCodes: [],
      flag: '',
      independent: false,
      name: '',
      translations: {},
    } as country,
    statistics_selectedMonth: null as selectableMonth | null,
    selectedDate: '',
    selectedMarket: {
      alpha2Code: '',
      callingCodes: [],
      flag: '',
      independent: false,
      name: '',
      translations: {},
    } as country,
    marketList: [] as country[],
    commissions: null,
    statistics: null,
    statisticsCountries: [] as country[],
    merchants: [] as merchant[],
    merchantStatus: [] as merchStatus[],
    payoutSumShare: 0,
    summary: null,
    accessToken: null,
    onlyModified: false,
  }),
  getters: {
    totalOpenSum: function (): number | null {
      if (
        this.marketStats &&
        this.marketStats.statistics &&
        this.marketStats.statistics.openAmountSum
      ) {
        return this.marketStats.statistics.openAmountSum;
      } else {
        return null;
      }
    },
    totalPayoutSum: function (): number | null {
      if (
        this.marketStats &&
        this.marketStats.statistics &&
        this.marketStats.statistics.paidAmountSum
      ) {
        return this.marketStats.statistics.paidAmountSum;
      } else {
        return null;
      }
    },
    rejectionRate: function (): number | null {
      if (this.marketStats && this.marketStats.statistics) {
        const totalCount =
          (this.marketStats.statistics.paidCountSum ?? 0) +
          (this.marketStats.statistics.openCountSum ?? 0) +
          (this.marketStats.statistics.confirmedCountSum ?? 0);

        if (totalCount > 0) {
          return (
            (this.marketStats.statistics.rejectedCountSum * 100) / totalCount
          );
        }

        return 0;
      } else {
        return null;
      }
    },
    totalConfirmedSum: function (): number | null {
      if (
        this.marketStats &&
        this.marketStats.statistics &&
        this.marketStats.statistics.confirmedAmountSum
      ) {
        return this.marketStats.statistics?.confirmedAmountSum;
      } else {
        return null;
      }
    },
    topPayoutMarkets: function (): marketNumbers[] | null {
      if (this.marketStats && this.marketStats.markets) {
        const topPayouts = [...this.marketStats.markets];
        return topPayouts.sort((a, b) => b.payout - a.payout);
      } else {
        return null;
      }
    },
    topClickMarkets: function (): marketNumbers[] | null {
      if (this.marketStats && this.marketStats.markets) {
        const topClicks = [...this.marketStats.markets];
        return topClicks.sort((a, b) => b.clicks - a.clicks);
      } else {
        return null;
      }
    },
    monthData: function (): monthCategory[] {
      const categories = [...this.chartData.categories];
      return categories
        .sort((a, b) => b.localeCompare(a))
        .map((date) => {
          return {
            id: date,
            label: new Intl.DateTimeFormat(navigator.language, {
              month: 'long',
            })
              .format(new Date(date))
              .toUpperCase(),
          };
        });
    },
  },
  actions: {
    getCountryObject: function (iso: string) {
      if (!this.countryList) return iso;
      const countries = [...this.countryList];
      return countries.filter(
        (obj) => obj.alpha2Code.toLowerCase() === iso.toLowerCase()
      );
    },
    setMarketList: function () {
      if (!this.topClickMarkets) return [];

      const keySet = new Set(this.topClickMarkets.map((obj) => obj.market));
      this.marketList = this.countryList.filter((obj) =>
        keySet.has(obj.alpha2Code.toLowerCase())
      );
      this.marketList.map((obj) => {
        obj.alpha2Code = obj.alpha2Code.toLowerCase();
      });
      this.marketList.sort((a, b) => a.name.localeCompare(b.name));
    },
    getSelectedMonthData: async function () {
      if (this.summary && this.selectedMonth && this.selectedMonth.id !== '') {
        this.selectedMonthDetails = this.summary[this.selectedMonth.id];
        if (
          this.selectedMonthDetails.paidAmount === 0 ||
          this.selectedMonthDetails.confirmedAmount === 0
        ) {
          this.payoutSumShare = 0;
        } else {
          this.payoutSumShare = Math.round(
            Number(
              (Number(this.selectedMonthDetails.paidAmount) * 100) /
                (Number(this.selectedMonthDetails.confirmedAmount) +
                  Number(this.selectedMonthDetails.paidAmount))
            )
          );
        }
      }
    },
    getSummary: async function () {
      try {
        if (this.summaryLoading) return false;

        this.summaryLoading = true;

        const authStore = useAuthStore();
        const userEndpoint = '/api/v1/reports/summary';
        const response = await axios.get(
          process.env.APP_API_BASE_URL + userEndpoint,
          {
            headers: {
              Authorization: `Bearer ${authStore.accessToken}`,
            },
          }
        );

        if (
          response.data.data?.chartData?.categories[
            response.data.data?.chartData?.categories.length - 1
          ]
        ) {
          const date = response.data.data?.chartData?.categories[
            response.data.data?.chartData?.categories.length - 1
          ] as string;
          this.selectedMonth = {
            id: date,
            label: new Intl.DateTimeFormat(navigator.language, {
              month: 'long',
            })
              .format(new Date(date))
              .toUpperCase(),
          };
        }

        this.chartData = response.data.data?.chartData;
        this.summary = response.data.data?.summary;
        this.marketStats = response.data.data?.marketStats;

        this.summaryLoading = false;

        return response;
      } catch (e) {
        this.summaryLoading = false;
        console.log(e);
        return e;
      }
    },
    getMerchants: async function () {
      try {
        if (this.merchantsLoading) return false;

        this.merchantsLoading = true;

        const authStore = useAuthStore();

        const merchantEndpoint = '/api/v1/merchants';
        const responseMerchant = await axios.get(
          process.env.APP_API_BASE_URL + merchantEndpoint,
          {
            headers: {
              Authorization: `Bearer ${authStore.accessToken}`,
            },
            params: {
              market: this.selectedMarket.alpha2Code.toLowerCase(),
            },
          }
        );

        this.merchants = responseMerchant.data.data?.merchants;

        this.merchants.forEach((item) => {
          item.statusObj = {
            loading: false,
            loaded: false,
            status: '-',
          };
        });
        this.merchantsLoading = false;

        return responseMerchant;
      } catch (e) {
        this.merchantsLoading = false;
        console.log(e);
        return e;
      }
    },
    getMerchantStatus: async function (id: string) {
      try {
        if (id === null) {
          return false;
        }
        let statusObject = this.merchants.find((item) => item.id === id);
        if (statusObject && statusObject.statusObj.loaded) {
          return true;
        }
        if (statusObject && statusObject.statusObj.loading) {
          return true;
        } else if (statusObject) {
          statusObject.statusObj.loading = true;
          statusObject.statusObj.status = '-';
        } else {
          return false;
        }

        const authStore = useAuthStore();

        const statusEndpoint = '/api/v1/merchants/status';
        const responseStatus = await axios.get(
          process.env.APP_API_BASE_URL + statusEndpoint,
          {
            headers: {
              Authorization: `Bearer ${authStore.accessToken}`,
            },
            params: {
              id: id,
            },
          }
        );

        statusObject = this.merchants.find((item) => item.id === id);

        if (statusObject) {
          statusObject.statusObj.loading = false;
          statusObject.statusObj.loaded = true;
          statusObject.statusObj.status = String(
            responseStatus.data.data?.status ?? false
          );
        }
      } catch (e) {
        console.log(e);
      }
    },
    getStatistics: async function () {
      try {
        if (this.commissionsLoading) return false;

        this.commissionsLoading = true;

        const authStore = useAuthStore();

        const statisticsEndpoint = '/api/v1/reports/statistics';
        const responseStatistics = await axios.get(
          process.env.APP_API_BASE_URL + statisticsEndpoint,
          {
            headers: {
              Authorization: `Bearer ${authStore.accessToken}`,
            },
            params: {
              month: this.statistics_selectedMonth?.value,
              year: this.statistics_selectedYear,
            },
          }
        );

        const countries = [...this.countryList];
        this.statistics = responseStatistics.data.data;
        this.statisticsCountries = countries.filter((item) =>
          this.statistics?.markets.includes(item.alpha2Code.toLowerCase())
        );

        this.statisticsCountries.sort((a, b) => a.name.localeCompare(b.name));
        this.statistics_selectedMarket = {
          alpha2Code: '',
          callingCodes: [],
          flag: '',
          independent: false,
          name: '',
          translations: {},
        };

        this.commissionsLoading = false;

        return responseStatistics;
      } catch (e) {
        this.commissionsLoading = false;
        console.log(e);
        return e;
      }
    },
    getCommissions: async function () {
      try {
        if (this.commissionsLoading) return false;

        this.commissionsLoading = true;

        const authStore = useAuthStore();
        const from_date = (): string => {
          if (this.selectedDate && this.selectedDate !== '')
            return this.selectedDate;

          const today = new Date();
          today.setDate(today.getDate() - 1);

          const year = today.getFullYear();
          const month = String(today.getMonth() + 1).padStart(2, '0');
          const day = String(today.getDate()).padStart(2, '0');

          return `${year}-${month}-${day}`;
        };

        const reportEndpoint = '/api/v1/reports/commissions';
        const responseReport = await axios.get(
          process.env.APP_API_BASE_URL + reportEndpoint,
          {
            headers: {
              Authorization: `Bearer ${authStore.accessToken}`,
            },
            params: {
              date_from: from_date(),
              market: this.selectedMarket.alpha2Code.toLowerCase(),
              modified: this.onlyModified,
            },
          }
        );

        this.commissions = responseReport.data.data?.commissions;

        this.commissionsLoading = false;

        return responseReport;
      } catch (e) {
        this.commissionsLoading = false;
        console.log(e);
        return e;
      }
    },
    getCountries: async function () {
      try {
        const countryEndpoint = '/api/v1/countries';
        const countryResponse = await axios.get(
          process.env.APP_API_BASE_URL + countryEndpoint,
          {
            params: {
              locale: navigator.language
                ? navigator.language.substring(0, 2)
                : 'de',
            },
          }
        );
        this.countryList = countryResponse.data?.data;

        return countryResponse;
      } catch (e) {
        console.log(e);
        return e;
      }
    },
  },
});
