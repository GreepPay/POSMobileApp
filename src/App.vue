<template>
  <ion-app class="font-poppins">
    <ion-router-outlet />
  </ion-app>
</template>

<script lang="ts">
import { IonApp, IonRouterOutlet } from "@ionic/vue";
import { defineComponent, onMounted } from "vue";
import { App as CapacitorApp, URLOpenListenerEvent } from "@capacitor/app";
import { getPlatforms } from "@ionic/vue";
import { useRoute, useRouter } from "vue-router";
import { Logic } from "@greep/logic";
import { SetFrontendLogic } from "@greep/ui-components";

export default defineComponent({
  name: "App",
  components: {
    IonApp,
    IonRouterOutlet,
  },
  setup() {
    const router: any = useRouter();
    const route: any = useRoute();

    // Set routers
    Logic.Common.SetRouter(router);
    Logic.Common.SetRoute(route);

    // Set UI frontend logic
    SetFrontendLogic(Logic);

    // Set app version
    localStorage.setItem("app_version", "1.00");

    // Set app url
    Logic.Common.SetApiUrl(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      (import.meta as any).env.VITE_API_URL ?? "http://localhost:3000/graphql"
    );

    onMounted(() => {
      Logic.Common.GoToRoute("/auth/login");
      // deep link config
      CapacitorApp.addListener("appUrlOpen", function (event: URLOpenListenerEvent) {
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
      });
    });

    return {};
  },
});
</script>
