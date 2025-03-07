<template>
  <app-wrapper>
    <subpage-layout title="Payment Details">
      <div
        class="w-full flex flex-col items-center justify-center px-4 space-y-4 h-full -mt-16"
      >
        <div class="w-full flex flex-col items-center justify-center space-y-4">
          <app-icon name="success-check" customClass="h-[70px]" />

          <div class="w-full flex flex-col items-center justify-center space-y-1">
            <app-header-text class="!text-lg !font-normal">
              Payment received
            </app-header-text>
            <app-normal-text class="!text-gray-500">
              The payment was successfully made
            </app-normal-text>
          </div>

          <app-header-text class="!text-3xl"> ₺ 300 </app-header-text>
        </div>

        <!-- Transaction details -->
        <div
          class="w-full flex flex-col space-y-3 px-4 border-[1px] border-gray-300 rounded-[8px] py-4"
        >
          <div
            class="w-full flex flex-row items-center justify-between"
            v-for="(item, index) in transactionDetails"
            :key="index"
          >
            <app-normal-text class="!text-gray-500 !text-left">
              {{ item.title }}
            </app-normal-text>

            <app-normal-text class="!text-black !text-right">
              {{ item.value }}
            </app-normal-text>
          </div>
        </div>
      </div>

      <!-- Bottom button -->
      <div
        class="w-full fixed bg-white dark:bg-black bottom-0 left-0 pt-4 px-4"
        style="padding-bottom: calc(env(safe-area-inset-bottom) + 16px) !important"
      >
        <div class="w-full flex flex-col">
          <app-button class="!bg-secondary !py-4" @click="Logic.Common.goBack()"
            >Done</app-button
          >
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { AppHeaderText, AppButton, AppIcon, AppNormalText } from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive } from "vue";

export default defineComponent({
  name: "PaymentIdPage",
  components: {
    AppHeaderText,
    AppButton,
    AppIcon,
    AppNormalText,
  },
  setup() {
    const transactionDetails = reactive<
      {
        title: string;
        value: string;
      }[]
    >([
      {
        title: "From",
        value: "John Roland",
      },
      {
        title: "Payment type",
        value: "QR-Code",
      },
      {
        title: "Transaction ID",
        value: "44567890",
      },
      {
        title: "Date",
        value: "Today, 10:05 am",
      },
    ]);

    return {
      Logic,
      transactionDetails,
    };
  },
});
</script>
