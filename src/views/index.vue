<template>
  <app-wrapper>
    <dashboard-layout title="Wallet">
      <div class="w-full flex flex-col items-center justify-start px-4 space-y-4">
        <!-- Balance card section -->
        <div class="w-full flex flex-col space-y-2 pt-2">
          <app-image-loader
            class="w-full h-[130px] rounded-[15px] flex flex-col justify-between px-3 py-3"
            :photoUrl="'/images/wallet-bg.svg'"
          >
            <div class="w-full flex flex-row items-center justify-between">
              <app-normal-text class="text-left font-semibold !text-white !text-sm">
                James Roland
              </app-normal-text>

              <app-normal-text class="text-right !text-white font-normal">
                @ziggy_bugger
              </app-normal-text>
            </div>

            <div class="w-full flex flex-col space-y-0.5">
              <app-normal-text class="!font-extralight !text-white">
                Total Balance
              </app-normal-text>
              <app-header-text class="!text-left !text-white !text-3xl">
                ₺ 6,740
              </app-header-text>
            </div>
          </app-image-loader>
        </div>

        <!-- Action buttons -->
        <div class="w-full grid grid-cols-2 gap-3">
          <div class="col-span-1 flex flex-col">
            <app-button
              class="w-full !bg-secondary !text-white py-3"
              @click="Logic.Common.GoToRoute('/request')"
            >
              Request
            </app-button>
          </div>
          <div class="col-span-1 flex flex-col">
            <app-button
              class="w-full !border-secondary !bg-white border-[1px] !text-secondary py-3"
              @click="Logic.Common.GoToRoute('/withdraw')"
            >
              Withdraw
            </app-button>
          </div>
        </div>

        <!-- Recent transactions -->
        <div class="w-full flex flex-col space-y-4 pt-2">
          <div class="w-full flex flex-row justify-between items-center">
            <app-normal-text class="!text-left font-semibold !text-sm">
              Recent history
            </app-normal-text>

            <app-normal-text class="text-primary text-right"> View all </app-normal-text>
          </div>

          <div class="w-full flex flex-col space-y-3">
            <app-transaction
              :data="item"
              v-for="(item, index) in recentTransactions"
              :key="index"
              @click="Logic.Common.GoToRoute(`/payment/${index}`)"
            />
          </div>
        </div>
      </div>
    </dashboard-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import {
  AppImageLoader,
  AppNormalText,
  AppHeaderText,
  AppButton,
  AppTransaction,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";

export default defineComponent({
  name: "IndexPage",
  components: {
    AppImageLoader,
    AppNormalText,
    AppHeaderText,
    AppButton,
    AppTransaction,
  },
  setup() {
    const recentTransactions = reactive<
      {
        type: "credit" | "debit";
        description: string;
        icon: string;
        amount: number;
        day: string;
        time: string;
      }[]
    >([
      {
        type: "credit",
        description: "Payment from QR-Code | Josh",
        icon: "scan-type",
        amount: 70,
        day: "Today",
        time: "10:54 AM",
      },
      {
        type: "credit",
        description: "Payment from QR-Code | Lizzy",
        icon: "scan-type",
        amount: 95,
        day: "Today",
        time: "09:54 AM",
      },
      {
        type: "debit",
        description: "Withdrawal from Wallet",
        icon: "send-type",
        amount: 230,
        day: "Today",
        time: "07:54 AM",
      },
      {
        type: "credit",
        description: "Payment from Transfer | Josh",
        icon: "tag-type",
        amount: 89,
        day: "Today",
        time: "06:54 AM",
      },
      {
        type: "credit",
        description: "Payment from QR-Code | Mica",
        icon: "scan-type",
        amount: 70,
        day: "Today",
        time: "05:54 AM",
      },
      {
        type: "credit",
        description: "Payment from Transfer | Lola",
        icon: "tag-type",
        amount: 100,
        day: "Today",
        time: "04:54 AM",
      },
      {
        type: "credit",
        description: "Payment from QR-Code | Josh",
        icon: "scan-type",
        amount: 70,
        day: "Today",
        time: "03:54 AM",
      },
    ]);

    return {
      recentTransactions,
      Logic,
    };
  },
});
</script>
