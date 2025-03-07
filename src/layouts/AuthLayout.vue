<template>
  <div
    class="w-full h-full flex flex-col px-4 pb-4 lg:text-sm mdlg:text-[12px] text-xs font-poppins"
    style="
      padding-top: calc(env(safe-area-inset-top) + 16px) !important;
      padding-bottom: calc(env(safe-area-inset-bottom) + 16px) !important;
    "
  >
    <div class="w-full flex flex-col items-center justify-between h-full">
      <div class="w-full flex flex-row items-center justify-between pb-6">
        <app-image-loader
          photo-url="/images/icons/logo.svg"
          custom-class="h-[35px] w-[50px] -ml-[10px]"
        />
        <slot name="top-action" />
      </div>
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useRouter } from "vue-router";
import { AppImageLoader } from "@greep/ui-components";
export default defineComponent({
  components: { AppImageLoader },
  props: {
    title: {
      type: String,
      default: "",
    },
  },
  name: "AuthLayout",
  setup() {
    const router = useRouter();

    const goBack = () => {
      window.history.length > 1 ? router.go(-1) : router.push("/");
    };

    const goToRoute = (route: string) => {
      router.push(route);
    };

    return {
      goBack,
      goToRoute,
    };
  },
});
</script>
