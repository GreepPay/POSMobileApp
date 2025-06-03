<template>
  <app-wrapper>
    <subpage-layout title="Payment Type">
      <div
        class="w-full flex flex-col items-center justify-start px-4 h-full pt-1"
      >
        <template v-for="(method, index) in withdrawMethods" :key="index">
          <div
            :class="`w-full flex flex-col space-y-[3px] px-4 py-4 !border-[2px] mb-3 ${
              selectedMethod == method.key
                ? 'border-primary'
                : 'border-[#E0E2E4]'
            } rounded-[16px]`"
            @click="continueToNext(method.key)"
          >
            <div class="w-full flex flex-row justify-between items-center">
              <app-normal-text class="text-left !text-sm font-semibold">
                {{ method.title }}
              </app-normal-text>

              <div class="flex flex-row justify-end">
                <app-icon name="arrow-right-gray" class="h-[25px]" />
              </div>
            </div>

            <div class="w-full flex flex-row">
              <app-normal-text class="text-left !text-gray-500">
                {{ method.description }}
              </app-normal-text>
            </div>
          </div>
        </template>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { AppIcon, AppNormalText } from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive } from "vue";
import { ref } from "vue";

export default defineComponent({
  name: "WithdrawP2PMethodPage",
  components: {
    AppIcon,
    AppNormalText,
  },
  setup() {
    const selectedMethod = ref<string>("bank_account");

    const withdrawMethods = reactive([
      {
        title: "Cash",
        key: "cash",
        description: `Pick up cash or get it delivered.`,
      },
      {
        title: "Transfer",
        key: "transfer",
        description: `Have money sent to your bank account.`,
      },
    ]);

    const continueToNext = (method: string) => {
      const amountFromRoute =
        Logic.Common.route?.query?.amount?.toString() || "0";
      const currencyFromRoute = Logic.Common.route?.query?.currency || "USD";

      Logic.Common.GoToRoute(
        "/withdraw/p2p/market?method=" +
          method +
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
