<template>
  <div
    class="w-full h-full flex flex-col pb-4 lg:text-sm mdlg:text-[12px] text-xs font-poppins"
    style="
      padding-top: calc(env(safe-area-inset-top) + 0px) !important;
      padding-bottom: calc(env(safe-area-inset-bottom) + 16px) !important;
    "
  >
    <div class="w-full flex flex-col relative h-full overflow-y-auto">
      <!-- Top section -->
      <div
        class="w-full flex flex-row items-center justify-between py-4 bg-white px-4 sticky top-0 z-10"
      >
        <app-header-text class="!text-left">
          {{ title }}
        </app-header-text>

        <div class="flex flex-row space-x-4 items-center">
          <app-icon name="bell" custom-class="h-[23px]" />

          <app-image-loader
            :photo-url="'/images/temps/profile-1.png'"
            custom-class="h-[31px] w-[31px] rounded-full"
          />
        </div>
      </div>

      <!-- Content -->
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { AppHeaderText, AppIcon, AppImageLoader } from "@greep/ui-components";
import { ref, defineComponent } from "vue";
import { useRouter } from "vue-router";

export default defineComponent({
  components: {
    AppHeaderText,
    AppIcon,
    AppImageLoader,
  },
  props: {
    title: {
      type: String,
      default: "",
    },
    useTopPadding: {
      type: Boolean,
      default: false,
    },
  },
  name: "DashboardLayout",
  setup() {
    const router = useRouter();

    const selectedTab = ref("");

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

    const goBack = () => {
      window.history.length > 1 ? router.go(-1) : router.push("/");
    };

    const goToRoute = (route: string) => {
      router.push(route);
    };

    return {
      tabIsActive,
      goBack,
      goToRoute,
    };
  },
});
</script>
