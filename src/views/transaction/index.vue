<template>
  <app-wrapper>
    <subpage-layout title="Transaction History" :hasBottomButton="false">
      <div
        class="w-full flex flex-col !space-y-4 justify-start px-4 h-full pt-1"
      >
        <!-- Filter -->
        <div class="w-full flex flex-row items-center">
          <div class="w-1/2 flex flex-col">
            <app-text-field
              :has-title="false"
              type="date"
              placeholder="From"
              ref="from"
              name="from"
              v-model="filterSetup.from"
              custom-class="!border-[1.5px] border-[#E0E2E4] !rounded-r-[0px] px-4 py-4 !bg-transparent"
              :input-style="`!text-sm`"
            >
              <template #inner-suffix>
                <app-icon name="calendar" custom-class="h-[22px]" />
              </template>
            </app-text-field>
          </div>
          <div class="w-1/2 flex flex-col">
            <app-text-field
              :has-title="false"
              type="date"
              placeholder="To"
              ref="to"
              name="to"
              v-model="filterSetup.to"
              custom-class="!border-[1.5px] border-[#E0E2E4] !rounded-l-[0px] !border-l-[0px] px-4 py-4 !bg-transparent"
              :input-style="`!text-sm`"
            >
              <template #inner-suffix>
                <app-icon name="calendar" custom-class="h-[22px]" />
              </template>
            </app-text-field>
          </div>
        </div>

        <div
          class="w-full flex flex-col space-y-1 border-[#E0E2E4] border-[1.5px] px-4 py-4 rounded-[16px]"
        >
          <app-select
            v-model="filterSetup.period"
            :options="monthFilterOption"
            is-wrapper
            @OnOptionSelected="
              (option) => {
                currentOptionName = option.value;
              }
            "
          >
            <div
              class="flex flex-row space-x-[3px] items-center w-full justify-start"
            >
              <app-normal-text
                custom-class="!text-black !font-semibold !text-left !text-sm"
                >{{ currentOptionName }}</app-normal-text
              >
              <app-icon name="dropdown" custom-class="!h-[6px]" />
            </div>
          </app-select>

          <div class="w-full flex flex-row items-center space-x-3">
            <app-normal-text
              custom-class="!text-black !font-[500] !text-left !text-sm"
              >In | ₺30,000</app-normal-text
            >

            <app-normal-text
              custom-class="!text-black !font-[500] !text-left !text-sm"
              >Out | ₺30,000</app-normal-text
            >
          </div>
        </div>

        <!-- Transaction history -->
        <div class="w-full flex flex-col space-y-3">
          <div v-if="true" class="py-4 !pt-2">
            <app-empty-state
              title="No transactions"
              description="Collect Payments, Make Withdrawals, and Redeem the GRP Tokens you’ve earned."
            />
          </div>
          <template v-else>
            <app-transaction
              class="z-[10]"
              v-for="transaction in recentTransactions"
              :key="transaction.id"
              :data="transaction"
              @click="Logic.Common.GoToRoute('/transaction/' + transaction.id)"
            />
          </template>
        </div>

        <!-- Spacer -->
        <div class="py-[10px]"></div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  AppTextField,
  AppSelect,
  AppNormalText,
  AppIcon,
  AppTransaction,
  AppEmptyState,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive } from "vue";
import { SelectOption } from "@greep/logic/src/logic/types/common";
import { ref } from "vue";

enum TransactionType {
  Sent = "sent",
  Received = "received",
  Added = "added",
  Redeemed = "redeemed",
}

export default defineComponent({
  name: "TransactionsPage",
  components: {
    AppTextField,
    AppSelect,
    AppNormalText,
    AppIcon,
    AppTransaction,
    AppEmptyState,
  },
  setup() {
    const filterSetup = reactive({
      from: "",
      to: "",
      period: "",
    });

    const currentOptionName = ref("January, 2025");

    const monthFilterOption = reactive<SelectOption[]>([
      {
        value: "January, 2025",
        key: "january_2025",
      },
      {
        value: "February, 2025",
        key: "february_2025",
      },
      {
        value: "March, 2025",
        key: "march_2025",
      },
      {
        value: "April, 2025",
        key: "april_2025",
      },
      {
        value: "May, 2025",
        key: "may_2025",
      },
      {
        value: "June, 2025",
        key: "june_2025",
      },
      {
        value: "July, 2025",
        key: "july_2025",
      },
      {
        value: "August, 2025",
        key: "august_2025",
      },
      {
        value: "September, 2025",
        key: "september_2025",
      },
      {
        value: "October, 2025",
        key: "october_2025",
      },
      {
        value: "November, 2025",
        key: "november_2025",
      },
      {
        value: "December, 2025",
        key: "december_2025",
      },
    ]);

    const recentTransactions = reactive<
      {
        id: string | number;
        title: string;
        amount: number;
        type: TransactionType;
        transactionType: "credit" | "debit";
        date: string;
      }[]
    >([
      {
        id: 1,
        title: "Payment to John Doe",
        amount: 50.0,
        type: TransactionType.Sent,
        transactionType: "debit",
        date: "2024-01-26",
      },
      {
        id: 2,
        title: "Received from Jane Smith",
        amount: 100.0,
        type: TransactionType.Received,
        transactionType: "credit",
        date: "2024-01-25",
      },
      {
        id: 3,
        title: "Points Transfer",
        amount: 200.0,
        type: TransactionType.Sent,
        transactionType: "debit",
        date: "2024-01-24",
      },
      {
        id: 4,
        title: "Redeemed Points",
        amount: 25.0,
        type: TransactionType.Redeemed,
        transactionType: "credit",
        date: "2024-01-23",
      },
      {
        id: 5,
        title: "Payment to Alice Johnson",
        amount: 75.0,
        type: TransactionType.Sent,
        transactionType: "debit",
        date: "2024-01-22",
      },
      {
        id: 6,
        title: "Received from Bob Williams",
        amount: 150.0,
        type: TransactionType.Received,
        transactionType: "credit",
        date: "2024-01-21",
      },
      {
        id: 7,
        title: "Gift Card Purchase",
        amount: 300.0,
        type: TransactionType.Sent,
        transactionType: "debit",
        date: "2024-01-20",
      },
    ]);

    return {
      Logic,
      recentTransactions,
      filterSetup,
      monthFilterOption,
      currentOptionName,
    };
  },
});
</script>
