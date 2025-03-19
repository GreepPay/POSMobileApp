<template>
  <app-wrapper>
    <subpage-layout title="Collect Payment">
      <div
        class="w-full flex flex-col items-center justify-start px-4 space-y-3 h-full pt-3"
      >
        <app-image-loader
          class="w-full h-[40%] rounded-[35px] flex flex-col relative justify-center items-center space-y-5 px-4 py-5 xs:!py-4 bg-[linear-gradient(359.13deg,#10BB76_25.37%,#008651_99.25%)]"
          :photoUrl="''"
        >
          <!-- Image bg -->
          <img
            src="/images/greep-transparent-logo.svg"
            class="h-full absolute w-full top-0 left-0 rounded-[35px] z-[1]"
          />

          <div
            class="w-full flex flex-col !space-y-1 justify-center items-center z-[2] py-4"
          >
            <app-normal-text class="text-center !text-white">
              Enter Amount
            </app-normal-text>

            <app-header-text
              class="text-center !text-white !text-3xl !font-normal pt-1"
            >
              ₺
              {{
                !Number.isNaN(parseFloat(amount))
                  ? Logic.Common.convertToMoney(amount, false, "", false)
                  : "0"
              }}
            </app-header-text>
          </div>
        </app-image-loader>

        <div
          class="w-full flex flex-col h-full flex-grow justify-center items-center"
        >
          <app-keyboard v-model="amount" class="-mt-[16%]" />
        </div>
      </div>

      <!-- Bottom button -->
      <div
        class="w-full fixed bg-white dark:bg-black bottom-0 left-0 pt-4 px-4"
        style="
          padding-bottom: calc(env(safe-area-inset-bottom) + 16px) !important;
        "
      >
        <div class="w-full flex flex-col">
          <app-button
            variant="secondary"
            :class="`!py-4 `"
            @click="continueToNext"
            >Next</app-button
          >
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  AppHeaderText,
  AppButton,
  AppKeyboard,
  AppNormalText,
  AppImageLoader,
} from "@greep/ui-components";
import { ref } from "vue";
import { Logic } from "@greep/logic";

export default defineComponent({
  name: "RequestPage",
  components: {
    AppHeaderText,
    AppButton,
    AppKeyboard,
    AppNormalText,
    AppImageLoader,
  },
  setup() {
    const amount = ref("0");

    const continueToNext = () => {
      if (parseFloat(amount.value) > 0) {
        Logic.Common.GoToRoute(`/request/qr?amount=${amount.value}`);
      }
    };

    return {
      amount,
      Logic,
      continueToNext,
    };
  },
});
</script>
