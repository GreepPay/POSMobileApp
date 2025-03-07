import { createApp } from 'vue'
import App from './App.vue'
import routes from './router/index'
import { createRouter, createWebHistory } from '@ionic/vue-router'
import { Logic } from '@greep/logic'


// Layouts
import DashboardLayout from './layouts/DashboardLayout.vue'
import SubpageLayout from './layouts/SubpageLayout.vue'
import AuthLayout from './layouts/AuthLayout.vue'

// Wrappers
import AppWrapper from './components/AppWrapper.vue'


import { IonicVue } from '@ionic/vue';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

// You can disable this if you dont want TailwindCss
import './assets/index.css'
import { RouteRecordRaw } from 'vue-router'


routes.then((routes) => {
  const router = createRouter({
    history: createWebHistory(),
    routes: routes.filter(route => route !== null) as RouteRecordRaw[],
  })

  router.beforeEach((to, from, next) => {
    const toRouter: any = to
    const fromRouter: any = from
    return Logic.Common.preFetchRouteData(toRouter, next, fromRouter);
  })

  const app = createApp(App)
    .use(IonicVue, {
      rippleEffect: false,
      scrollPadding: false,
    })
    .component('auth-layout', AuthLayout)
    .component('dashboard-layout', DashboardLayout)
    .component('subpage-layout', SubpageLayout)
    .component('app-wrapper', AppWrapper)
    .use(router);

  app.mount('#app');
})
