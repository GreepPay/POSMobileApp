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
              v-model="filterFrom"
              custom-class="!border-[1.5px] border-[#E0E2E4] !rounded-r-[0px] px-4 py-4 !bg-transparent"
              :input-style="`!text-sm`"
              :updateValue="filterFrom"
              :watchUpdates="true"
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
              v-model="filterTo"
              custom-class="!border-[1.5px] border-[#E0E2E4] !rounded-l-[0px] !border-l-[0px] px-4 py-4 !bg-transparent"
              :input-style="`!text-sm`"
              :updateValue="filterTo"
              :watchUpdates="true"
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
          <div class="w-full flex flex-row items-center justify-between">
            <app-select
              v-model="filterSetup.period"
              :options="monthFilterOption"
              is-wrapper
              @OnOptionSelected="
                (option) => {
                  currentOptionName = option.value;
                  if (option.extraInfo) {
                    filterFrom = option.extraInfo[0];
                    filterTo = option.extraInfo[1];
                  } else {
                    filterFrom = '';
                    filterTo = '';
                  }
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

            <div>
              <app-loading class="!text-green" v-if="filterIsLoading" />
            </div>
          </div>

          <div class="w-full flex flex-row items-center space-x-3">
            <app-normal-text
              custom-class="!text-black !font-[500] !text-left !text-sm"
              >In | {{ currencySymbol }}
              {{
                Logic.Common.convertToMoney(
                  (NormalFinancialSummary?.credit || 0) *
                    (CurrentGlobalExchangeRate?.mid || 0),
                  true,
                  "",
                  false
                )
              }}</app-normal-text
            >

            <app-normal-text
              custom-class="!text-black !font-[500] !text-left !text-sm"
              >Out | {{ currencySymbol }}
              {{
                Logic.Common.convertToMoney(
                  (NormalFinancialSummary?.debit || 0) *
                    (CurrentGlobalExchangeRate?.mid || 0),
                  true,
                  "",
                  false
                )
              }}</app-normal-text
            >
          </div>
        </div>

        <!-- Transaction history -->
        <div class="w-full flex flex-col">
          <div v-if="recentTransactions.length === 0" class="py-4 !pt-2">
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
                  '/transactions/' +
                    transaction.id +
                    `?group=${transaction.transaction_group}`
                )
              "
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
  AppLoading,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive } from "vue";
import { SelectOption } from "@greep/logic/src/logic/types/common";
import { ref } from "vue";
import { onMounted } from "vue";
import {
  getPointTransaction,
  getTransaction,
} from "../../composable/financials";
import { availableCurrencies } from "../../composable";
import { onIonViewDidEnter } from "@ionic/vue";
import { watch } from "vue";

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
    AppLoading,
  },
  middlewares: {
    fetchRules: [
      {
        domain: "Wallet",
        property: "ManyTransactions",
        method: "GetTransactions",
        params: [1, 10],
        requireAuth: true,
        ignoreProperty: true,
        silentUpdate: false,
      },
      {
        domain: "Wallet",
        property: "ManyPointTransactions",
        method: "GetPointTransactions",
        params: [1, 10],
        requireAuth: true,
        ignoreProperty: true,
        silentUpdate: false,
      },
      {
        domain: "Wallet",
        property: "NormalFinancialSummary",
        method: "GetNormalFinancialSummary",
        params: [],
        requireAuth: true,
        ignoreProperty: true,
        silentUpdate: true,
      },
    ],
  },
  setup() {
    const filterSetup = reactive({
      from: "",
      to: "",
      period: "",
    });

    const filterFrom = ref(filterSetup.from);
    const filterTo = ref(filterSetup.to);

    const filterIsLoading = ref(false);

    const selectedCurrency = ref(
      Logic.Auth.AuthUser?.businesses[0]?.default_currency
    );

    const currencySymbol = ref(
      availableCurrencies.find(
        (currency) => currency.code === selectedCurrency.value
      )?.symbol
    );

    const currentOptionName = ref("All Time");

    const monthFilterOption = reactive<SelectOption[]>([]);

    const ManyTransactions = ref(Logic.Wallet.ManyTransactions);
    const ManyPointTransactions = ref(Logic.Wallet.ManyPointTransactions);
    const NormalFinancialSummary = ref(Logic.Wallet.NormalFinancialSummary);
    const CurrentGlobalExchangeRate = ref(
      Logic.Wallet.CurrentGlobalExchangeRate
    );

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

    const setDefaultMonthOptions = () => {
      monthFilterOption.length = 0;
      monthFilterOption.push({
        value: "All Time",
        key: "all_time",
      });

      const currentDate = new Date();

      for (let i = 0; i < 10; i++) {
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        const monthName = currentDate.toLocaleString("default", {
          month: "long",
        });
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        const formattedFirstDay = firstDayOfMonth.toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

        const formattedLastDay = lastDayOfMonth.toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

        monthFilterOption.push({
          value: `${monthName}, ${year}`,
          key: `${monthName.toLowerCase()}_${year}`,
          extraInfo: [formattedFirstDay, formattedLastDay],
        });

        currentDate.setMonth(month - 1);
      }
    };

    const applyFilters = () => {
      const allPromiseActions: any[] = [];

      if (!filterFrom.value || !filterTo.value) {
        filterIsLoading.value = false;
        return;
      }

      if (filterIsLoading.value) {
        return;
      }

      // For transaction
      allPromiseActions.push(
        Logic.Wallet.GetTransactions(
          1,
          10,
          "CREATED_AT",
          "DESC",
          `{
          column: CREATED_AT
          operator: BETWEEN
          value: ["${filterFrom.value}", "${filterTo.value}"]
        }`,
          true
        ).then((transactions) => {
          ManyTransactions.value = transactions;
        })
      );
      // For point transaction
      allPromiseActions.push(
        Logic.Wallet.GetPointTransactions(
          1,
          10,
          "CREATED_AT",
          "DESC",
          `{
          column: CREATED_AT
          operator: BETWEEN
          value: ["${filterFrom.value}", "${filterTo.value}"]
        }`,
          true
        ).then((pointTransactions) => {
          ManyPointTransactions.value = pointTransactions;
        })
      );
      // For financial summary
      allPromiseActions.push(
        Logic.Wallet.GetNormalFinancialSummary(filterFrom.value, filterTo.value)
      );

      filterIsLoading.value = true;

      Promise.all(allPromiseActions)
        .then(() => {
          filterIsLoading.value = false;
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          filterIsLoading.value = false;
        });
    };

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

    watch([ManyTransactions, ManyPointTransactions], () => {
      setTransactionData();
    });

    watch([filterFrom, filterTo], () => {
      Logic.Common.debounce(() => {
        applyFilters();
      }, 400);
    });

    onIonViewDidEnter(() => {
      setTransactionData();
      setDefaultMonthOptions();
    });

    onMounted(() => {
      // Register reactive data
      Logic.Wallet.watchProperty(
        "CurrentGlobalExchangeRate",
        CurrentGlobalExchangeRate
      );
      Logic.Wallet.watchProperty(
        "NormalFinancialSummary",
        NormalFinancialSummary
      );
      setTransactionData();
      setDefaultMonthOptions();
    });

    return {
      Logic,
      recentTransactions,
      filterSetup,
      monthFilterOption,
      currentOptionName,
      NormalFinancialSummary,
      currencySymbol,
      CurrentGlobalExchangeRate,
      filterIsLoading,
      filterFrom,
      filterTo,
    };
  },
});
</script>
