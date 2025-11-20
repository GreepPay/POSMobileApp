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

    <!-- Update App  modal -->
    <app-modal
      v-if="showUpdateAppModal"
      :close="
        () => {
          showUpdateAppModal = false;
        }
      "
      :contentClass="'!px-0'"
    >
      <div
        class="w-full flex flex-col items-center pt-4"
        :style="`
          ${getBottomPadding}
        `"
      >
        <img :src="'/images/update-app.svg'" class="!h-[70px]" />

        <div
          class="w-full flex flex-col pt-4 pb-6 px-5 items-center justify-center"
        >
          <app-normal-text
            class="text-center w-full !text-lg !font-semibold pb-2"
          >
            New Update Available
          </app-normal-text>

          <app-normal-text
            is-html
            class="text-center !text-sm !text-gray-two w-full !prose !prose-sm"
            :html-content="`A new version of the app is available. Please update to the latest version for the best experience.`"
          >
          </app-normal-text>
        </div>

        <app-button
          :custom-class="`!bg-secondary !w-full !py-4 !px-8 !text-sm`"
          variant="secondary"
          @click="updateApp"
        >
          Update Now
        </app-button>
      </div>
    </app-modal>
  </ion-app>
</template>

<script lang="ts">
import { IonApp, IonRouterOutlet, isPlatform } from "@ionic/vue";
import { defineComponent, onMounted, ref, watch } from "vue";
import { App as CapacitorApp, URLOpenListenerEvent } from "@capacitor/app";
import { getPlatforms } from "@ionic/vue";
import { useRoute, useRouter } from "vue-router";
import { Logic } from "@greep/logic";
import { registerSW } from "virtual:pwa-register";
import {
  SetFrontendLogic,
  AppAlert,
  AppLoader,
  AppBottomBar,
  AppModal,
  AppNormalText,
  AppButton,
} from "@greep/ui-components";
import { SplashScreen } from "@capacitor/splash-screen";
import { reactive } from "vue";
import { Business } from "@greep/logic/src/gql/graphql";
import { getBottomPadding, showUpdateAppModal } from "./composable";

export default defineComponent({
  name: "App",
  components: {
    IonApp,
    IonRouterOutlet,
    AppAlert,
    AppLoader,
    AppBottomBar,
    AppModal,
    AppNormalText,
    AppButton,
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
    // @ts-ignore
    Logic.Common.SetRoute(route);

    // Set UI frontend logic
    SetFrontendLogic(Logic);

    const appVersion = ref("1.10");

    // Set app version
    localStorage.setItem("app_version", appVersion.value);

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
      });
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
                path: "/exchange-orders",
                icon: "order",
                routeTag: "exchange-orders",
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
                name: "Sales",
              },
            ]
          );
        }

        if (business?.business_type == "delivery") {
          bottomBar.push(
            ...[
              {
                path: "/tasks",
                icon: "task",
                routeTag: "tasks",
                name: "Tasks",
              },
              {
                path: "/delivery",
                icon: "order",
                routeTag: "delivery",
                name: "Orders",
              },
            ]
          );
        }

        if (business?.business_type == "vendor") {
          bottomBar.push(
            ...[
              {
                path: "/shop",
                icon: "shop",
                routeTag: "shop",
                name: "Shop",
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

    const connectSocketChannels = () => {
      if (Logic.Common.laravelEcho && Logic.Auth.AuthUser?.id) {
        console.log("Test 1", Logic.Auth.AuthUser?.id);
        Logic.Common.laravelEcho
          .private(`user.${Logic.Auth.AuthUser.id}`)
          .subscribed(() => {
            console.log("User joined the channel");
          })
          .listen(
            ".transaction.created",
            (data: { event: string; payload: any }) => {
              console.log("transaction created", "data", data);
              if (data.event == ".transaction.created") {
                console.log(data.event, data.payload);
                Logic.Auth.GetAuthUser();
              }
            }
          );
      }
    };

    Logic.Common.SetApiUrl(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // (import.meta as any).env.VITE_API_URL ?? "http://localhost:3000/graphql"
      (import.meta as any).env.VITE_API_URL ??
        "https://api-pos-dev.greep.io/graphql"
    );

    const handleMountActions = () => {
      const authToken = Logic.Auth.AccessToken;

      // If user is authenticated
      if (authToken) {
        Logic.Common.initiateWebSocket({
          pusherKey: import.meta.env.VITE_PUSHER_APP_KEY,
          pusherHost: import.meta.env.VITE_PUSHER_HOST,
          pusherPort: import.meta.env.VITE_PUSHER_PORT,
          pusherCluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
          socketAuthUrl: import.meta.env.VITE_SOCKET_AUTH_URL,
        });
        Logic.Auth.GetAuthUser();

        connectSocketChannels();

        const pathContainsIsForceReload =
          window.location.search.includes("isForceReload");

        if (!AuthUser.value?.phone) {
          Logic.Common.GoToRoute("/auth/setup-account");
          return;
        }

        if ((AuthUser.value?.businesses?.length || 0) == 0) {
          Logic.Common.GoToRoute("/auth/setup");
          return;
        }

        if (
          localStorage.getItem("auth_passcode") &&
          localStorage.getItem("auth_encrypted_data") &&
          !pathContainsIsForceReload
        ) {
          Logic.Common.GoToRoute("/auth/welcome");
        }
      } else {
        localStorage.clear();
        // Set app version
        localStorage.setItem("app_version", appVersion.value);
        // Go to start page
        // Only if the path does not contain /auth
        if (!window.location.pathname.includes("/auth")) {
          // const isPWA = isPlatform("pwa");
          // console.log("IsPWA", isPWA);
          // if (!isPWA) {
          //   Logic.Common.GoToRoute("/start/pwa");
          //   return;
          // }
          Logic.Common.GoToRoute("/start");
        } else {
          return Logic.Common.GoToRoute("/auth/login");
        }
      }
    };

    const updateSW = registerSW({
      onNeedRefresh() {
        // Instead of prompting user, just reload
        showUpdateAppModal.value = true;
      },
      onOfflineReady() {
        console.log("App ready to work offline");
      },
    });

    const updateApp = () => {
      showUpdateAppModal.value = false;
      updateSW(true); // activates new SW
      // window.location.reload()
    };

    watch(AuthUser, () => {
      setBottomBar();
    });

    onMounted(async () => {
      // Logic.Common.GoToRoute("/auth/login");
      // deep link config

      // Logic.Auth.GetCurrentAppVersion()?.then((version) => {
      //   checkAppVersion(version || "1.0");
      // });

      CapacitorApp.addListener(
        "appUrlOpen",
        function (event: URLOpenListenerEvent) {
          // Example url: https://greep.io/tabs/tabs2
          // slug = /tabs/tabs2
          const domainType = ".io";
          const slug = event.url.split(domainType).pop();

          // We only push to the route if there is a slug present
          if (slug) {
            if (getPlatforms()[0] == "android") {
              window.location.href = `https://localhost${slug}`;
              return;
            }
            Logic.Common.GoToRoute(slug, true);
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
      showUpdateAppModal,
      getBottomPadding,
      updateApp,
    };
  },
});
</script>
