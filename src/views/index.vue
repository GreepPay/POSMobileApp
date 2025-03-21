<template>
  <app-wrapper>
    <dashboard-layout title="Timms Closet Ventures">
      <div class="w-full flex flex-col items-center justify-start space-y-4">
        <!-- Balance card section -->
        <div class="w-full flex flex-col space-y-2 pt-2">
          <div class="w-full flex flex-col px-4">
            <app-image-loader
              class="w-full h-fit rounded-[35px] flex flex-col justify-center items-center space-y-5 px-4 py-5 bg-[#0A141E]/30"
              :photoUrl="'/images/greep-transparent-logo.svg'"
            >
              <div class="w-full flex flex-row items-center justify-center">
                <app-currency-switch
                  :default_currency="defaultCurrency"
                  v-model="selectedCurrency"
                  v-model:model-symbol="currencySymbol"
                />
              </div>

              <div
                class="w-full flex flex-col space-y-[2px] justify-center items-center"
              >
                <app-normal-text class="text-center !text-white">
                  Total Balance
                </app-normal-text>

                <app-header-text
                  class="text-center !text-white !text-3xl !font-normal"
                >
                  {{ currencySymbol }} 900.00
                </app-header-text>
              </div>

              <!-- Action buttons -->
              <div class="w-full grid grid-cols-2 gap-3">
                <div
                  class="col-span-1 py-4 px-4 rounded-[999px] border-[1px] flex flex-row space-x-1 justify-center items-center"
                  @click="Logic.Common.GoToRoute('/withdraw')"
                >
                  <app-icon name="withdrawal" custom-class="!h-[20px]" />

                  <app-normal-text class="!text-white !text-sm">
                    Withdraw
                  </app-normal-text>
                </div>

                <div
                  class="col-span-1 py-4 px-4 rounded-[999px] border-[1px] flex flex-row space-x-1 justify-center items-center bg-white"
                  @click="Logic.Common.GoToRoute('/request')"
                >
                  <app-icon name="request" custom-class="!h-[20px]" />

                  <app-normal-text class="!text-[#1F8F69] !text-sm">
                    Request
                  </app-normal-text>
                </div>
              </div>
            </app-image-loader>
          </div>
        </div>

        <!-- Transactions -->
        <div
          class="w-full flex flex-col h-fit bg-white relative px-4 pt-5 space-y-[5px]"
          id="home_transactions"
        >
          <div
            class="w-full flex flex-row items-center justify-between z-[2] pb-1"
          >
            <app-normal-text class="font-semibold !text-gray-800 !text-sm"
              >Transactions</app-normal-text
            >

            <app-normal-text
              class="text-primary"
              @click="Logic.Common.GoToRoute('/transaction')"
              >See all</app-normal-text
            >
          </div>
          <app-transaction
            class="z-[10]"
            v-for="transaction in recentTransactions"
            :key="transaction.id"
            :data="transaction"
            @click="Logic.Common.GoToRoute('/transaction/' + transaction.id)"
          />

          <!-- Spacer -->
          <div class="h-[40px] py-4"></div>
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
  AppTransaction,
  AppCurrencySwitch,
  AppIcon,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { ref } from "vue";

enum TransactionType {
  Sent = "sent",
  Received = "received",
  Added = "added",
  Redeemed = "redeemed",
}

export default defineComponent({
  name: "IndexPage",
  components: {
    AppImageLoader,
    AppNormalText,
    AppHeaderText,
    AppTransaction,
    AppCurrencySwitch,
    AppIcon,
  },
  setup() {
    const defaultCurrency = ref("USD");

    const selectedCurrency = ref("USD");

    const currencySymbol = ref("$");

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
      recentTransactions,
      Logic,
      defaultCurrency,
      selectedCurrency,
      currencySymbol,
    };
  },
});
</script>
<style scoped>
#home_transactions:before {
  content: "";
  position: absolute;
  top: -40px;
  left: 0;
  height: 40px;
  width: 40px;
  border-bottom-left-radius: 50%;
  background-color: transparent;
  box-shadow: 0 20px 0 0 #ffffff;
  z-index: 1;
}

#home_transactions:after {
  content: "";
  position: absolute;
  top: -40px;
  right: 0;
  height: 40px;
  width: 40px;
  border-bottom-right-radius: 50%;
  background-color: transparent;
  box-shadow: 0 20px 0 0 #ffffff;
  z-index: 1;
}
</style>
