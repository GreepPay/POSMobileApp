<template>
  <app-wrapper>
    <subpage-layout title="Transaction Details">
      <div class="w-full flex flex-col items-center justify-start px-4 h-full">
        <AmountCard :amount="4542" label="Amount Received" />

        <!-- GRP token -->
        <div
          class="w-full flex flex-row items-center justify-between px-3 py-3 border-[1.5px] rounded-[18px] border-light-gray-one mt-4"
        >
          <app-normal-text class="!text-gray-two !text-left">
            GRP Token Earned
          </app-normal-text>

          <div class="flex flex-row space-x-1 items-center justify-end">
            <app-normal-text
              class="!text-black !text-right font-semibold !text-sm"
            >
              40
            </app-normal-text>
            <app-icon name="grp-token" class="!h-[24px]" />
          </div>
        </div>

        <!-- Transaction details -->
        <div
          class="w-full flex flex-col space-y-2 px-4 border-[1px] border-light-gray-one rounded-[18px] py-4 mt-4"
        >
          <div
            :class="`w-full flex flex-row items-center justify-between pb-2 pt-2 ${
              index < transactionDetails.length - 1
                ? 'border-b-[1.5px] border-light-gray-one'
                : ''
            }  `"
            v-for="(item, index) in transactionDetails"
            :key="index"
          >
            <app-normal-text class="!text-gray-two !text-left">
              {{ item.title }}
            </app-normal-text>

            <app-normal-text
              class="!text-black !text-right !text-sm font-[500]"
            >
              {{ item.value }}
            </app-normal-text>
          </div>
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
          <app-button variant="secondary" outlined class="!py-4"
            >Share Receipt</app-button
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
import AmountCard from "@/components/Common/AmountCard.vue";

export default defineComponent({
  name: "PaymentIdPage",
  components: {
    AppButton,
    AppIcon,
    AppNormalText,
    AmountCard,
  },
  setup() {
    const transactionDetails = reactive<
      {
        title: string;
        value: string;
      }[]
    >([
      {
        title: "Sender",
        value: "Raymond Akinola",
      },
      {
        title: "Bank",
        value: "GTBank (201***6671)",
      },
      {
        title: "Type",
        value: "Transfer",
      },
      {
        title: "Amount",
        value: "₦33,000 ($22)",
      },
      {
        title: "Time",
        value: "13:55 - Feb 20, 2025",
      },
    ]);

    return {
      Logic,
      transactionDetails,
    };
  },
});
</script>
