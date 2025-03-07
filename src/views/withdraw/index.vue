<template>
  <app-wrapper>
    <subpage-layout title="Withdraw Funds">
      <div
        class="w-full flex flex-col items-center justify-center px-4 space-y-7 h-full -mt-4"
      >
        <div class="w-full flex flex-col items-center justify-center space-y-4">
          <app-normal-text class="!text-gray-500 text-center">
            Enter Amount to withdraw
            <br />
          </app-normal-text>
          <app-normal-text class="!text-primary text-center">
            Current wallet balance:
            <span class="!font-semibold pl-1"
              >₺ {{ Logic.Common.convertToMoney(6074, false, "", false) }}</span
            >
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

        <div
          :class="`w-full flex flex-col items-center justify-center ${
            parseFloat(amount) > 6074 ? 'visible' : 'invisible'
          }`"
        >
          <app-normal-text class="!text-red-500">
            Maximum withdrawal amount is
            <span class="!font-semibold pl-1"
              >₺ {{ Logic.Common.convertToMoney(6074, false, "", false) }}</span
            >
          </app-normal-text>
        </div>
      </div>

      <!-- Bottom button -->
      <div
        class="w-full fixed bg-white dark:bg-black bottom-0 left-0 pt-4 px-4"
        style="padding-bottom: calc(env(safe-area-inset-bottom) + 16px) !important"
      >
        <div class="w-full flex flex-col">
          <app-button
            :class="`!bg-secondary !py-4 ${
              amountIsValid() ? 'opacity-100' : 'opacity-50'
            }`"
            @click="amountIsValid() ? continueToNext() : null"
            >Next</app-button
          >
        </div>
      </div>
    </subpage-layout>

    <app-modal
      v-if="modalIsOpen"
      title="Choose Withdrawal Method"
      canClose
      :close="
        () => {
          modalIsOpen = false;
        }
      "
    >
      <div class="w-full flex flex-col space-y-1 px-4 pb-4">
        <app-normal-text class="!text-left !text-gray-500">
          How do you want to receive your funds?
        </app-normal-text>
      </div>
    </app-modal>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  AppHeaderText,
  AppButton,
  AppKeyboard,
  AppNormalText,
  AppModal,
} from "@greep/ui-components";
import { ref } from "vue";
import { Logic } from "@greep/logic";

export default defineComponent({
  name: "WithdrawPage",
  components: {
    AppHeaderText,
    AppButton,
    AppKeyboard,
    AppNormalText,
    AppModal,
  },
  setup() {
    const amount = ref("0");

    const modalIsOpen = ref(false);

    const amountIsValid = () => {
      return parseFloat(amount.value) > 0 && parseFloat(amount.value) <= 6074;
    };

    const continueToNext = () => {
      //   modalIsOpen.value = true;
    };

    return {
      amount,
      Logic,
      modalIsOpen,
      continueToNext,
      amountIsValid,
    };
  },
});
</script>
