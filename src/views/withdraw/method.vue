<template>
  <app-wrapper>
    <subpage-layout title="Pick Method">
      <div
        class="w-full flex flex-col items-center justify-start px-4 h-full pt-1"
      >
        <template v-for="(method, index) in withdrawMethods" :key="index">
          <div
            :class="`w-full flex flex-col space-y-1 px-4 py-4 !border-[2px] mb-3 ${
              selectedMethod == method.key
                ? 'border-primary'
                : 'border-[#E0E2E4]'
            } rounded-[16px]`"
            @click="selectedMethod = method.key"
          >
            <div class="w-full flex flex-row justify-between items-center">
              <app-normal-text class="text-left !text-sm font-semibold">
                {{ method.title }}
              </app-normal-text>

              <div class="flex flex-row justify-end">
                <app-icon
                  :name="`${
                    selectedMethod == method.key ? 'selected' : 'not-selected'
                  }`"
                  class="h-[24px]"
                />
              </div>
            </div>

            <div class="w-full flex flex-row">
              <app-normal-text class="text-left">
                Fee: {{ method.fee }}
              </app-normal-text>
            </div>
          </div>
        </template>
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
            :class="`!py-4`"
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
import { AppButton, AppIcon, AppNormalText } from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive } from "vue";
import { ref } from "vue";

export default defineComponent({
  name: "WithdrawMethodPage",
  components: {
    AppButton,
    AppIcon,
    AppNormalText,
  },
  setup() {
    const selectedMethod = ref<string>("bank_account");

    const withdrawMethods = reactive([
      {
        title: "Bank Transfer",
        key: "bank_account",
        fee: `$1`,
      },
      {
        title: "Mobile Money",
        key: "mobile_money",
        fee: `$1`,
      },
      {
        title: "Crypto Currency",
        key: "crypto_currency",
        fee: `$1`,
      },
    ]);

    const continueToNext = () => {
      const amountFromRoute =
        Logic.Common.route?.query?.amount?.toString() || "0";
      const currencyFromRoute = Logic.Common.route?.query?.currency || "USD";

      Logic.Common.GoToRoute(
        "/withdraw/saved-accounts?method=" +
          selectedMethod.value +
          "&amount=" +
          amountFromRoute +
          "&currency=" +
          currencyFromRoute
      );
    };

    return {
      withdrawMethods,
      Logic,
      selectedMethod,
      continueToNext,
    };
  },
});
</script>
