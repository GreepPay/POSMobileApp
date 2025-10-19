<template>
  <div class="w-full flex flex-col items-center" v-if="modelCurrencyValue">
    <div class="w-full flex flex-col px-4">
      <!-- Amount section -->
      <div
        class="w-full flex flex-row items-center border-[1.5px] border-[#E0E2E4] rounded-[16px] mt-2"
      >
        <div
          class="w-[65%] flex flex-row items-center relative !border-r-[1.5px] !border-[#E0E2E4] px-4 py-4"
        >
          <!-- Label -->
          <app-normal-text
            class="!absolute !top-[-8px] !left-4 !bg-white !px-2 !font-semibold !text-gray-500"
          >
            Amount
          </app-normal-text>
          <app-header-text class="mr-2 !text-2xl">
            {{ currencySymbol }}
          </app-header-text>
          <app-text-field
            v-if="!showBackup"
            v-model="amount"
            placeholder="0.00"
            custom-class="w-full !text-2xl !font-[500] !p-0 !m-0 !border-0 !outline-0 !ring-0"
            type="tel"
            :is-formatted="true"
          />
          <app-text-field
            v-else
            v-model="amount"
            placeholder="0.00"
            custom-class="w-full !text-2xl !font-[500] !p-0 !m-0 !border-0 !outline-0 !ring-0"
            type="tel"
            :is-formatted="true"
          />
        </div>
        <div class="w-[35%] flex flex-row items-center justify-center">
          <app-currency-switch
            v-model="modelCurrencyValue"
            :default_currency="
              defaultCountryCode?.code ||
              Logic.Auth.GetDefaultBusiness()?.default_currency ||
              'USD'
            "
            :availableCurrencies="availableCurrencies"
            v-model:model-symbol="currencySymbol"
            label="Choose Currency"
            :information-text="currencySwitchLabel"
            v-model:model-country="selectedCountry"
          />
        </div>
      </div>
    </div>

    <!-- Suggested amounts -->
    <div
      class="w-full flex no-scrollbar flex-row space-x-3 flex-nowrap pb-2 pl-4 overflow-x-auto scrollbar-hide pt-2 min-h-[60px]"
    >
      <div class="flex flex-row py-2 pr-2">
        <div
          class="px-4 py-1 rounded-[99px] mr-2 last:mr-0 border-[1.5px] border-[#E0E2E4] flex items-center justify-center"
          v-for="(item, index) in suggestedAmounts"
          :key="index"
          @click="setSuggestion(item)"
        >
          <app-normal-text class="!text-[#050709] !text-sm !whitespace-nowrap">
            {{ currencySymbol }}
            {{ Logic.Common.convertToMoney(item, false, "") }}
          </app-normal-text>
        </div>
      </div>
    </div>

    <!-- Balance -->
    <div class="w-full flex flex-col items-start justify-start px-4">
      <div class="w-full flex flex-row justify-between items-center">
        <app-normal-text class="!text-[#616161] !whitespace-nowrap">
          Min:
          {{
            minimumAmount
              ? `${currencySymbol}${Logic.Common.convertToMoney(
                  minimumAmount,
                  false,
                  "",
                  false
                )}`
              : "0"
          }}
        </app-normal-text>

        <app-normal-text class="!text-[#616161] !whitespace-nowrap">
          Max:
          {{
            maximumAmountValue
              ? `${currencySymbol}${Logic.Common.convertToMoney(
                  maximumAmountValue,
                  false,
                  "",
                  false
                )}`
              : "0"
          }}
        </app-normal-text>
      </div>
      <app-normal-text class="!text-[#616161] !whitespace-nowrap pt-2">
        Balance:
        <span class="!font-semibold !text-green-700"
          >{{ currencySymbol
          }}{{
            Logic.Common.convertToMoney(
              (Logic.Auth.GetDefaultBusiness()?.wallet?.total_balance || 0) *
                (CurrentGlobalExchangeRate?.mid || 0),
              true,
              "",
              false
            )
          }}</span
        >
      </app-normal-text>
    </div>

    <!-- Narration -->
    <div
      class="w-full flex flex-col mt-5 pt-6 !border-t-[12px] !border-[#F0F3F6] px-4"
    >
      <div class="w-full flex flex-col !relative">
        <!-- Label -->
        <app-normal-text
          class="!absolute !top-[-8px] !left-4 !bg-white !px-2 !font-semibold !text-gray-500 z-50"
        >
          Note
        </app-normal-text>
        <app-text-field
          v-model="narration"
          placeholder="What is this payment for? (optional)"
          type="text"
        >
        </app-text-field>
      </div>
    </div>

    <div :style="`height: 60px;`"></div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, watch } from "vue";
import {
  AppNormalText,
  AppHeaderText,
  AppTextField,
  AppCurrencySwitch,
} from "@greep/ui-components";
import { ref } from "vue";
import { Logic } from "@greep/logic";
import {
  availableCurrencies,
  roundToNearestSignificant,
} from "../../composable";

export default defineComponent({
  name: "WalletAddMoneyPage",
  props: {
    currencySwitchLabel: {
      type: String,
      default: "Select currency to send out",
    },
  },
  components: {
    AppNormalText,
    AppHeaderText,
    AppTextField,
    AppCurrencySwitch,
  },
  emits: ["update:paymentData"],
  setup(props, context) {
    const AuthUser = ref(Logic.Auth.AuthUser);
    const amountFromQuery = ref("");
    const businessUUIDFromQuery = ref("");
    const selectedCountry = ref("");

    const CurrentWithdrawalInfo = ref(Logic.Wallet.CurrentWithdrawalInfo);
    const CurrentGlobalExchangeRate = ref(
      Logic.Wallet.CurrentGlobalExchangeRate
    );
    const feePercentage = 0.005;
    const showBackup = ref(false);
    const suggestedAmounts = ref<number[]>([50, 1000, 5000, 10000]);
    const narration = ref("");

    const isSwitchable = ref(true);

    const defaultCurrency = ref(
      Logic.Auth.GetDefaultBusiness()?.default_currency || "USD"
    );

    const amount = ref("0");
    const maximumAmount = 10000;
    const pauseForMounting = ref(true);

    const defaultCountryCode = computed(() => {
      return availableCurrencies.filter(
        (item) =>
          item.code == Logic.Auth.GetDefaultBusiness()?.default_currency ||
          "USD"
      )[0];
    });

    const currentSelectedCurrencyData = computed(() => {
      return availableCurrencies.filter(
        (item) => item.code == modelCurrencyValue.value
      )[0];
    });

    const modelCurrencyValue = ref<string>("");
    const currencySymbol = ref(defaultCountryCode.value?.symbol);

    const feePlusAmount = computed(() => {
      return (
        feePercentage * parseFloat(amount.value) + parseFloat(amount.value)
      );
    });

    const feeAmount = computed(() => {
      return feePercentage * parseFloat(amount.value);
    });

    const minimumAmount = computed(() => {
      return CurrentWithdrawalInfo.value?.methods?.[0]?.min_amount || 0;
    });

    const maximumAmountValue = computed(() => {
      return CurrentWithdrawalInfo.value?.methods?.[0]?.max_amount || 10000;
    });

    const amountIsValid = computed(() => {
      return (
        parseFloat(amount.value.replace(",", "")) > 0 &&
        parseFloat(amount.value.replace(",", "")) <=
          (Logic.Auth.GetDefaultBusiness()?.wallet?.total_balance || 0) *
            (CurrentGlobalExchangeRate.value?.mid || 0) &&
        parseFloat(amount.value.replace(",", "")) >= minimumAmount.value &&
        parseFloat(amount.value.replace(",", "")) <= maximumAmountValue.value
      );
    });

    const setSuggestedAmounts = () => {
      if (
        CurrentWithdrawalInfo.value &&
        CurrentWithdrawalInfo.value?.methods.length > 0
      ) {
        const currentMethod = CurrentWithdrawalInfo.value?.methods[0];
        let minAmount = currentMethod?.min_amount || 0;
        const maxAmount = currentMethod.max_amount || 10000;

        // Min amount must be more than $0.5 equivalent
        if (CurrentGlobalExchangeRate.value) {
          const minAmountInLocal =
            minAmount / CurrentGlobalExchangeRate.value.mid;
          if (minAmountInLocal < 0.5) {
            minAmount = 0.5 * CurrentGlobalExchangeRate.value.mid;
          }
        }
        // Create a range between min and max amount, about 10 items
        const suggestions: number[] = [];
        const step = (maxAmount - minAmount) / 9;

        for (let i = 0; i < 10; i++) {
          const raw = minAmount + step * i;
          const rounded = roundToNearestSignificant(raw);
          // Avoid duplicates
          if (!suggestions.includes(rounded)) {
            suggestions.push(rounded);
          }
        }
        suggestedAmounts.value = suggestions;
      }
    };

    const setPageDefaults = () => {
      const currencyFromQuery =
        Logic.Common.route?.query?.currency?.toString() ||
        defaultCurrency.value;

      businessUUIDFromQuery.value =
        Logic.Common.route?.query?.business?.toString() || "";

      if (currencyFromQuery) {
        isSwitchable.value = false;
      }

      defaultCurrency.value = currencyFromQuery;
      modelCurrencyValue.value = defaultCurrency.value;

      const amountFromMainQuery =
        Logic.Common.route?.query?.amount?.toString() || "0";

      if (!amount.value || amount.value === "0") {
        amount.value = amountFromMainQuery;
      }
      amountFromQuery.value = amountFromMainQuery;

      const selectedCurrencyData = availableCurrencies.filter(
        (item) => item.code == currencyFromQuery
      )[0];

      if (selectedCurrencyData) {
        defaultCurrency.value =
          selectedCurrencyData?.code || defaultCurrency.value;
        modelCurrencyValue.value = defaultCurrency.value;
        currencySymbol.value = selectedCurrencyData?.symbol || "";
      }
    };

    const getCurrentWithdrawalInfo = async () => {
      return Logic.Wallet.GetWithdrawInfo(
        0,
        currentSelectedCurrencyData.value?.code,
        currentSelectedCurrencyData.value?.country_code ||
          localStorage.getItem("default_country_code") ||
          ""
      ).then(() => {
        //
      });
    };

    const setSuggestion = (amountNum: number) => {
      showBackup.value = false;
      amount.value = amountNum.toString();
      setTimeout(() => {
        showBackup.value = true;
      }, 200);
    };

    const emitPaymentData = () => {
      const paymentData = {
        amount: parseFloat(amount.value.replace(",", "")),
        currency: modelCurrencyValue.value,
        fee: feeAmount.value,
        totalAmount: feePlusAmount.value,
        narration: narration.value,
        isValid: amountIsValid.value,
        businessUUID: null,
        selectedCurrencyData: currentSelectedCurrencyData.value,
        countryCode: selectedCountry.value,
      };

      context.emit("update:paymentData", paymentData);
    };

    const runOnIonViewEnter = () => {
      setPageDefaults();
      getNeededInfos();
      setTimeout(() => {
        pauseForMounting.value = false;
      }, 500);
    };

    watch(amount, () => {
      emitPaymentData();
    });

    const getNeededInfos = () => {
      getCurrentWithdrawalInfo();
    };

    watch(CurrentWithdrawalInfo, () => {
      setSuggestedAmounts();
    });

    watch([modelCurrencyValue, narration], () => {
      getNeededInfos();
      emitPaymentData();
    });

    onMounted(() => {
      Logic.Auth.watchProperty("AuthUser", AuthUser);
      Logic.Wallet.watchProperty(
        "CurrentWithdrawalInfo",
        CurrentWithdrawalInfo
      );
      Logic.Wallet.watchProperty(
        "CurrentGlobalExchangeRate",
        CurrentGlobalExchangeRate
      );
      setPageDefaults();
      getNeededInfos();
      setTimeout(() => {
        pauseForMounting.value = false;
      }, 500);
    });

    return {
      amount,
      Logic,
      maximumAmount,
      amountIsValid,
      modelCurrencyValue,
      defaultCountryCode,
      availableCurrencies,
      currencySymbol,
      AuthUser,
      CurrentGlobalExchangeRate,
      amountFromQuery,
      isSwitchable,
      feePlusAmount,
      feeAmount,
      minimumAmount,
      maximumAmountValue,
      showBackup,
      suggestedAmounts,
      localStorage,
      setSuggestion,
      narration,
      runOnIonViewEnter,
      selectedCountry,
    };
  },
});
</script>
