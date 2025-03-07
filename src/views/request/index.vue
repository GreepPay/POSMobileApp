<template>
  <app-wrapper>
    <subpage-layout title="Request a Payment">
      <div
        class="w-full flex flex-col items-center justify-center px-4 space-y-7 h-full -mt-10"
      >
        <div class="w-full flex flex-col items-center justify-center space-y-4">
          <app-normal-text class="!text-gray-500 text-center">
            Enter Amount
          </app-normal-text>
          <app-header-text class="!text-3xl">
            ₺
            {{
              !Number.isNaN(parseFloat(amount))
                ? Logic.Common.convertToMoney(amount, false, "", false)
                : "0"
            }}
          </app-header-text>
        </div>
        <app-keyboard v-model="amount" />
      </div>

      <!-- Bottom button -->
      <div
        class="w-full fixed bg-white dark:bg-black bottom-0 left-0 pt-4 px-4"
        style="padding-bottom: calc(env(safe-area-inset-bottom) + 16px) !important"
      >
        <div class="w-full flex flex-col">
          <app-button class="!bg-secondary !py-4" @click="continueToNext"
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
