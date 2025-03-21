<template>
  <app-wrapper>
    <subpage-layout title="GRP Tokens" :hasBottomButton="false">
      <div
        class="w-full flex flex-col space-y-5 justify-start px-4 h-full pt-1"
      >
        <!-- Balance Information -->
        <amount-card is-wrapper>
          <div class="w-full flex flex-col space-y-4 justify-center z-1 pt-3">
            <div
              class="w-full flex flex-col justify-center items-center space-y-1"
            >
              <app-normal-text class="text-center !text-white">
                Total Balance
              </app-normal-text>
              <div class="flex flex-row space-x-1 items-center">
                <app-icon name="grp-logo-white" custom-class="!h-[28px]" />

                <app-normal-text class="!text-white font-[500] !text-[24px]"
                  >1000</app-normal-text
                >
              </div>
            </div>

            <!-- Redeem button -->
            <app-button
              variant="primary-white"
              :class="`!py-4  `"
              @click="Logic.Common.GoToRoute('/grp/converter')"
              >Redeem</app-button
            >
          </div>
        </amount-card>

        <!-- Transaction history -->
        <div class="flex flex-col space-y-3">
          <div class="w-full flex flex-row justify-between items-center">
            <app-normal-text class="font-semibold !text-gray-800 !text-sm"
              >History</app-normal-text
            >

            <app-normal-text class="text-primary">See all</app-normal-text>
          </div>

          <div class="w-full flex flex-col">
            <div
              v-for="(transaction, index) in transactionHistory"
              :key="index"
              class="w-full flex flex-row justify-between mb-3 pb-3 border-b-[1px] border-veryLightGray"
            >
              <div class="flex flex-row space-x-2 items-center">
                <app-icon name="grp-black" custom-class="!h-[45px]" />
                <div class="flex flex-col space-y-[2px]">
                  <app-normal-text class="font-[500] !text-left !text-sm">{{
                    transaction.title
                  }}</app-normal-text>
                  <app-normal-text
                    class="!text-left text-gray-two !font-light !text-[12px]"
                    >{{ transaction.date }}</app-normal-text
                  >
                </div>
              </div>

              <div class="flex flex-row space-x-2 justify-end">
                <app-normal-text class="font-[500] !text-right !text-sm">
                  {{ transaction.type == "debit" ? "-" : "+" }}
                  {{ transaction.amount }}</app-normal-text
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { AppButton, AppNormalText, AppIcon } from "@greep/ui-components";
import { Logic } from "@greep/logic";
import AmountCard from "../../components/Common/AmountCard.vue";
import { reactive } from "vue";

export default defineComponent({
  name: "GRPTokenPage",
  components: {
    AppButton,
    AmountCard,
    AppNormalText,
    AppIcon,
  },
  setup() {
    const transactionHistory = reactive([
      {
        title: "Earned",
        date: "Today",
        type: "credit",
        amount: 1000,
      },
      {
        title: "Redeemed",
        date: "Yesterday",
        type: "debit",
        amount: 500,
      },
      {
        title: "Earned",
        date: "2 days ago",
        type: "credit",
        amount: 2000,
      },
      {
        title: "Redeemed",
        date: "3 days ago",
        type: "debit",
        amount: 1000,
      },
      {
        title: "Earned",
        date: "4 days ago",
        type: "credit",
        amount: 1500,
      },
    ]);

    return {
      Logic,
      transactionHistory,
    };
  },
});
</script>
