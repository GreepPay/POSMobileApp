<template>
  <app-wrapper mobilePadding="!pt-0">
    <dashboard-layout :title="AuthUser?.profile?.business?.business_name || ''">
      <div
        class="w-full flex flex-col items-center justify-start !space-y-[20px]"
      >
        <!-- Balance card section -->
        <div class="w-full flex flex-col space-y-2 pt-2">
          <div class="w-full flex flex-col px-4">
            <app-image-loader
              class="w-full h-fit rounded-[35px] flex flex-col justify-center items-center px-4 py-5 bg-[#0A141E]/30"
              :photoUrl="'/images/greep-transparent-logo.svg'"
            >
              <div class="w-full flex flex-row items-center justify-center">
                <app-currency-switch
                  :default_currency="defaultCurrency"
                  v-model="selectedCurrency"
                  v-model:model-symbol="currencySymbol"
                  :availableCurrencies="availableCurrencies"
                />
              </div>

              <div
                class="w-full flex flex-col space-y-[2px] justify-center items-center py-6"
              >
                <app-normal-text class="text-center !text-white">
                  Total Balance
                </app-normal-text>

                <app-header-text
                  class="text-center !text-white !text-3xl !font-normal"
                >
                  {{ currencySymbol }}
                  {{
                    Logic.Common.convertToMoney(
                      AuthUser.wallet?.total_balance *
                        (CurrentGlobalExchangeRate?.mid || 0),
                      true,
                      "",
                      false
                    )
                  }}
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
          class="w-full flex flex-col h-fit bg-white relative px-4 pt-5 space-y-[5px] min-h-[70vh]"
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

          <div v-if="!recentTransactions.length" class="py-4 !pt-2">
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
              @click="
                Logic.Common.GoToRoute(
                  '/transaction/' +
                    transaction.id +
                    `?group=${transaction.transaction_group}`
                )
              "
            />
          </template>

          <!-- Spacer -->
          <div class="h-[40px] py-4"></div>
        </div>
      </div>
    </dashboard-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, reactive, watch } from "vue";
import {
  AppImageLoader,
  AppNormalText,
  AppHeaderText,
  AppTransaction,
  AppCurrencySwitch,
  AppIcon,
  AppEmptyState,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { ref } from "vue";
import { onMounted } from "vue";
import { getPlatforms, onIonViewDidEnter } from "@ionic/vue";
import { User } from "@greep/logic/src/gql/graphql";
import { computed } from "vue";
import { availableCurrencies } from "../composable";
import {
  getTransaction,
  getPointTransaction,
  TransactionType,
} from "../composable/financials";

export default defineComponent({
  name: "IndexPage",
  components: {
    AppImageLoader,
    AppNormalText,
    AppHeaderText,
    AppTransaction,
    AppCurrencySwitch,
    AppEmptyState,
    AppIcon,
  },
  middlewares: {
    fetchRules: [
      {
        domain: "Wallet",
        property: "ManyTransactions",
        method: "GetTransactions",
        params: [1, 10],
        requireAuth: true,
        ignoreProperty: false,
        silentUpdate: true,
      },
      {
        domain: "Wallet",
        property: "ManyPointTransactions",
        method: "GetPointTransactions",
        params: [1, 10],
        requireAuth: true,
        ignoreProperty: false,
        silentUpdate: true,
      },
      {
        domain: "Wallet",
        property: "CurrentGlobalExchangeRate",
        method: "GetGlobalExchangeRate",
        params: [],
        requireAuth: true,
        ignoreProperty: false,
        silentUpdate: true,
      },
    ],
  },
  setup() {
    const defaultCurrency = ref(Logic.Auth.AuthUser?.profile?.default_currency);

    const selectedCurrency = ref(
      Logic.Auth.AuthUser?.profile?.default_currency
    );

    const currencySymbol = ref(
      availableCurrencies.find(
        (currency) => currency.code === selectedCurrency.value
      )?.symbol
    );

    const ManyTransactions = ref(Logic.Wallet.ManyTransactions);
    const ManyPointTransactions = ref(Logic.Wallet.ManyPointTransactions);
    const CurrentGlobalExchangeRate = ref(
      Logic.Wallet.CurrentGlobalExchangeRate
    );
    const AuthUser = ref<User>(Logic.Auth.AuthUser);

    const recentTransactions = reactive<
      {
        id: string | number;
        title: string;
        amount: number;
        type: TransactionType;
        transactionType: "credit" | "debit";
        date: string;
        currencySymbol: string;
        subAmount: string;
        transaction_group: string;
      }[]
    >([]);

    const setPageDefaults = () => {
      defaultCurrency.value =
        Logic.Auth.AuthUser?.profile?.default_currency || "USD";
      selectedCurrency.value = defaultCurrency.value;
    };

    const currentPlatform = computed(() => {
      return getPlatforms()[0];
    });

    const setTransactionData = () => {
      recentTransactions.length = 0;

      // Normal transactions
      ManyTransactions.value?.data?.forEach((data) => {
        const transaction = getTransaction(
          data,
          selectedCurrency.value,
          currencySymbol.value || ""
        );
        recentTransactions.push(transaction);
      });

      // Point transactions
      ManyPointTransactions.value?.data?.forEach((data) => {
        const pointTransaction = getPointTransaction(
          data,
          currencySymbol.value || ""
        );
        recentTransactions.push(pointTransaction);
      });

      // Sort transactions desc by date
      recentTransactions.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    };

    onIonViewDidEnter(() => {
      setPageDefaults();
      setTransactionData();
      Logic.Auth.GetAuthUser();
    });

    watch(
      [
        ManyPointTransactions,
        ManyTransactions,
        currencySymbol,
        CurrentGlobalExchangeRate,
      ],
      () => {
        setTransactionData();
      }
    );

    onMounted(() => {
      // Register reactive data
      Logic.Wallet.watchProperty("ManyTransactions", ManyTransactions);
      Logic.Wallet.watchProperty(
        "ManyPointTransactions",
        ManyPointTransactions
      );
      Logic.Wallet.watchProperty(
        "CurrentGlobalExchangeRate",
        CurrentGlobalExchangeRate
      );
      Logic.Auth.watchProperty("AuthUser", AuthUser);
      setPageDefaults();
      setTransactionData();
    });

    return {
      recentTransactions,
      Logic,
      defaultCurrency,
      selectedCurrency,
      currencySymbol,
      AuthUser,
      CurrentGlobalExchangeRate,
      currentPlatform,
      availableCurrencies,
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
