<template>
  <app-wrapper>
    <dashboard-layout title="Timms Closet Ventures">
      <div
        class="w-full flex flex-col items-center justify-start px-4 space-y-4"
      >
        <!-- Balance card section -->
        <div class="w-full flex flex-col space-y-2 pt-2">
          <app-image-loader
            class="w-full h-[250px] rounded-[35px] flex flex-col justify-between px-3 py-3 bg-[#0A141E]/30"
            :photoUrl="'/images/greep-transparent-logo.svg'"
          >
          </app-image-loader>
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
