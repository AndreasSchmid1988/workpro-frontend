import { RouteRecordRaw } from 'vue-router';
import MainLayout from 'layouts/MainLayout.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: '/charts', component: () => import('pages/ChartsPage.vue') },
      {
        path: '/leads',
        component: () => import('pages/LeadsPage.vue'),
      },
      {
        path: '/users',
        component: () => import('pages/UsersPage.vue'),
      },
      {
        path: '/commissions',
        component: () => import('pages/CommissionsPage.vue'),
      },
      {
        path: '/statistics',
        component: () => import('pages/StatisticsPage.vue'),
      },
      {
        path: '/shops',
        component: () => import('pages/ShopsPage.vue'),
      },
      {
        path: '/users/:id',
        component: () => import('pages/UsersEditPage.vue'),
      },
      {
        path: '/leads/:id',
        component: () => import('pages/LeadsEditPage.vue'),
      },
      {
        path: '/api',
        component: () => import('pages/APIPage.vue'),
      },
      {
        path: '/settings',
        component: () => import('pages/UsersEditPage.vue'),
      },
    ],
  },
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
  },
  {
    path: '/register',
    component: () => import('pages/RegisterPage.vue'),
  },
  {
    path: '/register/success',
    component: () => import('pages/RegisterSuccess.vue'),
  },
  {
    path: '/email/verify/:id/:hash',
    component: () => import('pages/VerifyEmail.vue'),
  },
  {
    path: '/forgot-password',
    component: () => import('pages/ForgotPasswordPage.vue'),
  },
  {
    path: '/reset-password/:token',
    component: () => import('pages/ResetPasswordPage.vue'),
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
