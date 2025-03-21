<template>
  <div
    class="w-full flex flex-col lg:text-sm mdlg:text-[12px] relative h-full text-xs overflow-y-hidden font-poppins"
    style="
      padding-top: calc(env(safe-area-inset-top) + 0px) !important;
      padding-bottom: calc(env(safe-area-inset-bottom) + 16px) !important;
    "
  >
    <div
      class="w-full flex flex-col relative h-full min-h-screen overflow-y-auto"
    >
      <!-- Top section -->
      <div
        class="w-full flex flex-row items-center py-4 bg-white px-4 sticky top-0 z-10"
        :class="hideBackBtn ? ' justify-center ' : ' justify-between '"
      >
        <div class="flex justify-start" v-if="!hideBackBtn">
          <app-icon
            name="arrow-left"
            :customClass="'h-[22px]'"
            @click="handleBack"
          />
        </div>

        <div class="flex justify-center flex-1">
          <app-header-text class="!text-left">
            {{ title }}
          </app-header-text>
        </div>

        <div v-if="!hasExtraTopContent" class="flex justify-start invisible">
          <app-icon name="arrow-left" :customClass="'h-[22px]'" />
        </div>
        <template v-else>
          <slot name="extra-top-content" />
        </template>
      </div>

      <!-- Content -->
      <slot />
    </div>

    <div
      class="w-full fixed h-[env(safe-area-inset-bottom)] bottom-0 left-0 bg-white z-[89899989998898] dark:bg-black"
    ></div>
    <div class="py-5 w-full"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useRoute, useRouter } from "vue-router";
import { AppHeaderText, AppIcon } from "@greep/ui-components";

export default defineComponent({
  components: {
    AppHeaderText,
    AppIcon,
  },
  props: {
    title: {
      type: String,
      default: "",
    },
    useEmitBack: {
      type: Boolean, // If true, emits "back" instead of using goBack
      default: false,
    },
    hideBackBtn: {
      type: Boolean,
      default: false,
    },
    hasExtraTopContent: {
      type: Boolean,
      default: false,
    },
    hasBottomButton: {
      type: Boolean,
      default: true,
    },
  },
  name: "SubPageLayout",
  emits: ["back"],
  setup(props, { emit }) {
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
      if (props.useEmitBack) emit("back");
      else goBack();
    };

    return {
      handleBack,
      goToRoute,
    };
  },
});
</script>
