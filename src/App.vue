<template>
  <ion-app class="font-poppins">
    <ion-router-outlet />
    <app-bottom-bar
      :tabs="bottomBar"
      :tab-is-active="tabIsActive"
      v-if="showBottomNav && bottomBar.length > 1"
    />
    <app-alert v-if="alertSetup.show" :setup="alertSetup" />
    <app-loader v-if="loaderSetup.show" :setup="loaderSetup" />
  </ion-app>
</template>

<script lang="ts">
import { IonApp, IonRouterOutlet, isPlatform } from "@ionic/vue";
import { defineComponent, onMounted, ref, watch } from "vue";
import { App as CapacitorApp, URLOpenListenerEvent } from "@capacitor/app";
import { getPlatforms } from "@ionic/vue";
import { useRoute, useRouter } from "vue-router";
import { Logic } from "@greep/logic";
import {
  SetFrontendLogic,
  AppAlert,
  AppLoader,
  AppBottomBar,
} from "@greep/ui-components";
import { SplashScreen } from "@capacitor/splash-screen";
import { reactive } from "vue";
import { Business } from "@greep/logic/src/gql/graphql";

export default defineComponent({
  name: "App",
  components: {
    IonApp,
    IonRouterOutlet,
    AppAlert,
    AppLoader,
    AppBottomBar,
  },
  setup() {
    const router: any = useRouter();
    const route = useRoute();

    const alertSetup = ref(Logic.Common.alertSetup);
    const loaderSetup = ref(Logic.Common.loaderSetup);
    const showBottomNav = ref<any>();
    const AuthUser = ref(Logic.Auth.AuthUser);

    const selectedTab = ref("");

    // Set routers
    Logic.Common.SetRouter(router);
    // @ts-expect-error no real type for route
    Logic.Common.SetRoute(route);

    // Set UI frontend logic
    SetFrontendLogic(Logic);

    // Set app version
    localStorage.setItem("app_version", "1.00");

    const bottomBar = reactive([
      {
        path: "/",
        icon: "home",
        routeTag: "base",
        name: "Home",
      },
    ]);

    // Set app url

    const setBottomBar = () => {
      bottomBar.length = 0;
      bottomBar.push({
        path: "/",
        icon: "home",
        routeTag: "base",
        name: "Home",
      },
    );
      // Set bottom nav
      if (Logic.Auth.AuthUser) {
        const business: Business = Logic.Auth.GetDefaultBusiness();

        if (business?.business_type == "exchanger") {
          bottomBar.push(
            ...[
              {
                path: "/p2p",
                icon: "ads",
                routeTag: "p2p",
                name: "P2P",
              },
              {
                path: "/orders",
                icon: "order",
                routeTag: "orders",
                name: "Orders",
              },
            ]
          );
        }

        if (business?.business_type == "event_host") {
          bottomBar.push(
            ...[
              {
                path: "/events",
                icon: "events",
                routeTag: "events",
                name: "Events",
              },
              {
                path: "/orders",
                icon: "order",
                routeTag: "orders",
                name: "Orders",
              },
            ]
          );
        }
      }
    };

    Logic.Common.SetApiUrl(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      (import.meta as any).env.VITE_API_URL ?? "http://localhost:3000/graphql"
    );

    const handleMountActions = () => {
      const currentAuthUser = Logic.Auth.AuthUser;

      // If user is authenticated
      if (currentAuthUser) {
        Logic.Common.initiateWebSocket({
          pusherKey: import.meta.env.VITE_PUSHER_APP_KEY,
          pusherHost: import.meta.env.VITE_PUSHER_HOST,
          pusherPort: import.meta.env.VITE_PUSHER_PORT,
          pusherCluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
          socketAuthUrl: import.meta.env.VITE_SOCKET_AUTH_URL,
        });
        Logic.Auth.GetAuthUser();

        const pathContainsIsForceReload =
          window.location.search.includes("isForceReload");

          console.log(window.location.search)

        if (
          localStorage.getItem("auth_passcode") &&
          localStorage.getItem("auth_encrypted_data") && !pathContainsIsForceReload
        ) {
          Logic.Common.GoToRoute("/auth/welcome");
        }  
      } else {
        localStorage.clear();
        // Go to start page
        // Only if the path does not contain /auth
        if (!window.location.pathname.includes("/auth")) {
            const isPWA = isPlatform('pwa');
            console.log("IsPWA", isPWA);
            if(!isPWA) {
               Logic.Common.GoToRoute("/start/pwa");
               return;
            }
            Logic.Common.GoToRoute("/start")
          } else {
            return Logic.Common.GoToRoute("/auth/login")
          }
      }
    };

    watch(AuthUser, () => {
      setBottomBar();
    });

    onMounted(async () => {
      // Logic.Common.GoToRoute("/auth/login");
      // deep link config

      CapacitorApp.addListener(
        "appUrlOpen",
        function (event: URLOpenListenerEvent) {
          // Example url: https://beerswift.app/tabs/tabs2
          // slug = /tabs/tabs2
          const domainType = ".com";
          const slug = event.url.split(domainType).pop();

          // We only push to the route if there is a slug present
          if (slug) {
            if (getPlatforms()[0] == "android") {
              window.location.href = `https://localhost${slug}`;
              return;
            }
            Logic.Common.GoToRoute(slug);
            return;
          }
        }
      );

      handleMountActions();

      // Register watchers
      Logic.Common.watchProperty("alertSetup", alertSetup);
      Logic.Common.watchProperty("loaderSetup", loaderSetup);
      Logic.Common.watchProperty("showBottomNav", showBottomNav);
      Logic.Auth.watchProperty("AuthUser", AuthUser);

      await SplashScreen.show({
        showDuration: 3000,
        autoHide: true,
      });
    });

    const tabIsActive = (tabName: string) => {
      const mainName = tabName;

      if (mainName == "base" && router.currentRoute.value.path == "/") {
        return true;
      } else if (
        mainName != "base" &&
        router.currentRoute.value.path.includes(mainName)
      ) {
        selectedTab.value = mainName;
        return true;
      }

      return false;
    };

    return {
      alertSetup,
      loaderSetup,
      Logic,
      tabIsActive,
      showBottomNav,
      bottomBar,
    };
  },
});
</script>
