<template>
  <app-wrapper>
    <div
      :class="`w-full flex flex-col items-center justify-between px-6 py-6 text-center bg-white text-sm font-inter`"
      :style="`min-height: ${mobileFullHeight?.height || '100vh'};`"
    >
      <!-- Main Content -->
      <div
        class="flex flex-col items-center  mt-6"
        style="padding-top: calc(env(safe-area-inset-top))"
      >
        <img src="/images/install.svg" alt="Install Icon" class="!h-[100px]" />

        <app-header-text class="!text-xl font-semibold pt-4 pb-2">
          Install Greep Merchant
        </app-header-text>

        <app-normal-text
          class="text-gray-600 leading-relaxed"
          is-html
          html-content="
            For a better experience, install Greep Merchant by adding it to your home screen.
            <br><br>
            It's quick and easy. Just follow the step below."
        />

        <!-- Visual Step Guide -->
        <img
          src="/images/installer.gif"
          alt="How to Add"
          class="rounded-xl w-full max-w-xs border border-gray-200 shadow-sm mt-6"
        />
      </div>

      <!-- Actions -->
      <div
        class="w-full flex flex-col space-y-3 mt-6"
        style="padding-bottom: calc(env(safe-area-inset-bottom))"
      >
        <app-button outlined variant="primary" class="!py-4 !w-full !text-xs" @click="Logic.Common.GoToRoute('/start')">
          Skip and continue on web
        </app-button>
      </div>
    </div>
  </app-wrapper>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import { AppNormalText, AppHeaderText, AppButton } from "@greep/ui-components";
import AppWrapper from "@/components/AppWrapper.vue";
import { Logic } from "@greep/logic";
import { safeAreaInsetBottom, safeAreaInsetTop } from "../../composable";

export default defineComponent({
  components: {
    AppWrapper,
    AppNormalText,
    AppHeaderText,
    AppButton,
  },
  name: "InstallPWA",
  layout: "Onboarding",
  middlewares: {},
  setup() {
    const innerHeight = ref(window.innerHeight);

    const mobileFullHeight = computed(() => {
      return { height: `${innerHeight.value}px` };
    });
    return {
      Logic,
      safeAreaInsetTop,
      safeAreaInsetBottom,
      mobileFullHeight,
    };
  },
});
</script>
