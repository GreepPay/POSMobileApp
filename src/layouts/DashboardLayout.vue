<template>
  <div
    class="w-full h-full flex flex-col lg:text-sm mdlg:text-[12px] text-xs font-poppins bg-[linear-gradient(359.13deg,#10BB76_25.37%,#008651_99.25%)]"
    style="padding-top: calc(env(safe-area-inset-top) + 0px) !important"
  >
    <div
      ref="scrollableContent"
      class="w-full flex flex-col relative h-full overflow-y-auto"
      @scroll="handleScroll"
    >
      <!-- Top section -->
      <div
        :class="`w-full flex flex-row items-center justify-between py-4 px-4 sticky top-0 z-10 ${
          isScrolled
            ? 'bg-[#008651] transition-colors duration-300'
            : 'bg-transparent transition-colors duration-300'
        } ${currentPlatform == 'android' ? '!pt-12' : ''}`"
      >
        <app-image-loader
          :photo-url="
            AuthUser?.profile?.profile_picture || '/images/profile-image.svg'
          "
          custom-class="h-[35px] w-[35px] rounded-full"
          @click="Logic.Common.GoToRoute('/profile')"
        />

        <app-header-text
          class="!text-center !text-white line-clamp-1 !text-base"
        >
          {{ title }}
        </app-header-text>

        <div
          class="flex flex-row space-x-4 items-center"
          @click="Logic.Common.GoToRoute('/notifications')"
        >
          <app-icon name="notify-bell" custom-class="!h-[35px]" />
        </div>
      </div>

      <!-- Content -->
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { Logic } from "@greep/logic";
import { User } from "@greep/logic/src/gql/graphql";
import { AppHeaderText, AppIcon, AppImageLoader } from "@greep/ui-components";
import { getPlatforms } from "@ionic/vue";
import { ref, defineComponent, onMounted, computed } from "vue";
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
    const scrollableContent = ref(null);
    const isScrolled = ref(false);

    const AuthUser = ref<User>(Logic.Auth.AuthUser);

    const selectedTab = ref("");

    const handleScroll = () => {
      if (scrollableContent.value) {
        // @ts-expect-error scrollableContent.value.scrollTop is not null
        isScrolled.value = scrollableContent.value.scrollTop > 20;
      }
    };

    const currentPlatform = computed(() => {
      return getPlatforms()[0];
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

    const goBack = () => {
      window.history.length > 1 ? router.go(-1) : router.push("/");
    };

    const goToRoute = (route: string) => {
      router.push(route);
    };

    onMounted(() => {
      if (scrollableContent.value) {
        // @ts-expect-error scrollableContent.value can be null
        scrollableContent.value?.addEventListener("scroll", handleScroll);
      }

      Logic.Auth.watchProperty("AuthUser", AuthUser);
    });

    return {
      tabIsActive,
      goBack,
      goToRoute,
      scrollableContent,
      isScrolled,
      handleScroll,
      Logic,
      AuthUser,
      currentPlatform,
    };
  },
});
</script>
