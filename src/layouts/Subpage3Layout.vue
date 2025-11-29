<template>
  <div
    class="w-full h-full flex flex-col pb-4 lg:text-sm mdlg:text-[12px] text-xs font-poppins"
    style="
      padding-top: calc(env(safe-area-inset-top) + 0px) !important;
      padding-bottom: calc(env(safe-area-inset-bottom) + 0px) !important;
    "
  >
    <div class="w-full flex flex-col relative h-full">
      <!-- Top section -->
      <div class="sticky top-0 z-10">
        <app-image-loader
          class="w-full justify-between relative !bg-[#00683F] !h-[144px]"
          :photo-url="coverImage"
        >
          <div
            class="absolute flex justify-between flex-col h-full w-full bg-gradient-to-b from-black/30 to-transparent"
          >
            <div class="flex justify-between items-center p-4">
              <app-icon name="arrow-left-white" @click="handleBack" />

              <slot
                name="right-top-content"
                v-if="!hasExtraTopContent && Logic.Auth.AccessToken"
                class="flex justify-start"
              >
                <div class="flex justify-between gap-4">
                  <!-- <app-icon
                    name="close-circle-white"
                    :customClass="'h-[22px]'"
                    @click="Logic.Common.GoToRoute('/')"
                  /> -->
                  <app-icon
                    name="export-outlined-white"
                    @click="handleBack"
                    v-if="false"
                  />
                  <app-icon
                    name="favourite-outlined-white"
                    @click="handleBack"
                    v-if="false"
                  />
                </div>
              </slot>
            </div>

            <div class="bg-white w-fit h-fit mx-4 rounded-full p-1 -mb-9">
              <app-avatar :src="logo" class="!size-[72px]" />
            </div>
          </div>
        </app-image-loader>

        <div class="py-4 bg-white" :class="headerContentClass">
          <div class="-mt-2 flex items-center justify-end px-4">
            <span
              :class="'bg-gradient-green px-4 py-2 text-white font-medium rounded-full  text-xs '"
              @click="Logic.Common.GoToRoute('/profile/share-asset')"
            >
              Share Profile
            </span>
          </div>

          <slot name="header-content" />
        </div>
      </div>

      <!-- Content -->
      <div class="hide-scrollbar overflow-y-auto bg-white">
        <slot />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { AppImageLoader, AppIcon, AppAvatar } from "@greep/ui-components";
import { Logic } from "@greep/logic";

export default defineComponent({
  components: {
    AppImageLoader,
    AppIcon,
    AppAvatar,
  },
  props: {
    title: {
      type: String,
      default: "",
    },
    coverImage: {
      type: String,
      default: "",
    },
    logo: {
      type: String,
      default: "/images/products/3.png",
    },
    hideCartIcon: {
      type: Boolean,
      default: false,
    },
    headerContentClass: {
      type: String,
      default: "",
    },
    hasExtraTopContent: {
      type: Boolean,
      default: false,
    },
  },
  name: "Subpage2Layout",
  setup() {
    const defaultCoverImage = "/images/shop-cover-image.png";

    const isCustomer = ref(false);
    const router = useRouter();
    const route = useRoute();

    const goToRoute = (route: string) => {
      router.push(route);
    };

    const ignoreBackRoute = route.query.ignoreBackRoute
      ? route.query.ignoreBackRoute.toString()
      : null;

    const goBack = () => {
      const routeMiddlewares: any = route.meta.middlewares;
      const goBackRoute = routeMiddlewares?.goBackRoute;
      if (typeof goBackRoute == "function" && !ignoreBackRoute) {
        goToRoute(goBackRoute());
      } else if (typeof goBackRoute == "string" && !ignoreBackRoute) {
        goToRoute(goBackRoute);
      } else {
        window.history.length > 1 ? router.go(-1) : router.push("/");
      }
    };

    const handleBack = () => {
      goBack();
    };

    return {
      Logic,
      handleBack,
      defaultCoverImage,
      isCustomer,
    };
  },
});
</script>
