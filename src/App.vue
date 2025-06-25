<template>
  <ion-app class="font-poppins">
    <ion-router-outlet />
    <app-bottom-bar
      :tabs="bottomBar"
      :tab-is-active="tabIsActive"
      v-if="showBottomNav"
    />
    <app-alert v-if="alertSetup.show" :setup="alertSetup" />
    <app-loader v-if="loaderSetup.show" :setup="loaderSetup" />
  </ion-app>
</template>

<script lang="ts">
import { IonApp, IonRouterOutlet } from "@ionic/vue";
import { defineComponent, onMounted, ref } from "vue";
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

    const selectedTab = ref("");

    // Set routers
    Logic.Common.SetRouter(router);
    Logic.Common.SetRoute(route);

    // Set UI frontend logic
    SetFrontendLogic(Logic);

    // Set app version
    localStorage.setItem("app_version", "1.00");

    // Set app url
    console.log('(import.meta as any).env.VITE_API_URL', (import.meta as any).env.VITE_API_URL);
    
    Logic.Common.SetApiUrl(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      'https://api-pos-dev.greep.io/graphql' ?? "http://localhost:3000/graphql"
    );

    const handleMountActions = () => {
      const currentAuthUser = Logic.Auth.AuthUser;

      // If user is authenticated
      if (currentAuthUser) {
        Logic.Auth.GetAuthUser();

        if (
          localStorage.getItem("auth_passcode") &&
          localStorage.getItem("auth_encrypted_data")
        ) {
          Logic.Common.GoToRoute("/auth/welcome");
        } else {
          Logic.Auth.SignOut();
        }
      } else {
        // Go to start page
        // Only if the path does not contain /auth
        if (!window.location.pathname.includes("/auth")) {
          Logic.Common.GoToRoute("/start");
        }
      }
    };

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

    const bottomBar = reactive([
      {
        path: "/",
        icon: "home",
        routeTag: "base",
        name: "Home",
      },
      {
        path: "/p2p",
        icon: "ads",
        routeTag: "p2p",
        name: "P2P",
      },
      // {
      //   path: "/shop",
      //   icon: "shop",
      //   routeTag: "shop",
      //   name: "Shop",
      // },
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
    ]);

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
