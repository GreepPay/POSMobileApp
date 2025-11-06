<template>
  <app-wrapper>
    <subpage-layout title="Transfer">
      <div class="w-full flex flex-col items-center px-4">
        <div class="w-full flex flex-col" v-if="modelCurrencyValue">
          <div
            class="flex items-center py-3 px-3 mb-4 bg-gray-100 cursor-pointer rounded-[20px] border-black border-y-[1.5px] border-b-0 border-x-[3px]"
          >
            <app-avatar
              :src="
                SingleUser?.profile?.user_type == 'Customer'
                  ? `${
                      SingleUser?.profile?.profile_picture ||
                      `/images/profile-image.svg`
                    }`
                  : `${currentBusiness?.logo || `/images/profile-image.svg`}`
              "
              alt="name"
              :size="52"
            />

            <div class="flex flex-col py-1 pl-3">
              <app-header-text customClass="!text-sm leading-6 !text-gray-two">
                {{
                  SingleUser?.profile?.user_type == "Customer"
                    ? `${SingleUser?.first_name} ${SingleUser?.last_name}`
                    : currentBusiness?.business_name
                }}
              </app-header-text>
              <app-normal-text customClass="!text-gray-two">
                {{ getUserType }}
              </app-normal-text>
            </div>
          </div>

          <app-title-card-container customClass="">
            <div class="flex flex-col justify-center items-center w-full">
              <app-currency-switch
                v-model="modelCurrencyValue"
                :default_currency="modelCurrencyValue"
                :availableCurrencies="allowedAvailableCurrencies"
                v-model:model-symbol="currencySymbol"
                :is-switchable="isSwitchable"
              />

              <div
                class="w-full flex flex-col items-center justify-center pt-3"
              >
                <app-normal-text
                  custom-class="!text-white !font-normal !font-sm pb-1  text-center"
                >
                  Amount
                </app-normal-text>

                <app-header-text class="!text-2xl text-white !font-normal">
                  {{ currencySymbol }}
                  {{
                    !Number.isNaN(parseFloat(amount))
                      ? Logic.Common.convertToMoney(amount, false, "", false)
                      : "0"
                  }}
                </app-header-text>
              </div>
            </div>
          </app-title-card-container>
        </div>

        <!-- keyboard -->
        <div class="w-full flex flex-col pt-2">
          <div class="w-full flex flex-col items-center justify-center">
            <app-normal-text class="!text-gray-500 !text-xs !text-center">
              Fees:
              {{
                feeAmount
                  ? `${currencySymbol}${Logic.Common.convertToMoney(
                      feeAmount,
                      true,
                      "",
                      false
                    )}`
                  : "0"
              }}
            </app-normal-text>
          </div>

          <app-keyboard v-model="amount" :update-value="amountFromQuery" />

          <div :class="`w-full flex flex-col items-center justify-center pt-3`">
            <template
              v-if="
                feePlusAmount >
                (AuthUser?.wallet?.total_balance || 0) *
                  (CurrentGlobalExchangeRate?.mid || 0)
              "
            >
              <app-normal-text class="!text-red-500 pt-2">
                Maximum amount you can send is
                <span class="!font-semibold pl-[2px]"
                  >{{ modelCurrencyValue }}
                  {{
                    Logic.Common.convertToMoney(
                      (AuthUser?.wallet?.total_balance || 0) *
                        (CurrentGlobalExchangeRate?.mid || 0),
                      true,
                      "",
                      false
                    )
                  }}</span
                >
              </app-normal-text>
            </template>
            <template v-else>
              <app-normal-text class="!text-gray-700">
                Wallet balance is
                <span class="!font-semibold pl-1"
                  >{{ modelCurrencyValue }}
                  {{
                    Logic.Common.convertToMoney(
                      (AuthUser?.wallet?.total_balance || 0) *
                        (CurrentGlobalExchangeRate?.mid || 0),
                      true,
                      "",
                      false
                    )
                  }}</span
                >
              </app-normal-text>
            </template>
          </div>
        </div>

        <div
          :style="`height: calc(env(safe-area-inset-bottom) + 140px);`"
        ></div>

        <!-- Bottom button -->
        <div
          class="w-full fixed bg-white dark:bg-black bottom-0 left-0 pt-4 px-4"
          style="
            padding-bottom: calc(env(safe-area-inset-bottom) + 16px) !important;
          "
        >
          <div class="w-full flex flex-col">
            <app-button
              @click="continueToNext"
              :custom-class="`!py-4 ${
                amountIsValid() ? 'opacity-100' : 'opacity-50'
              }`"
              variant="secondary"
            >
              Next
            </app-button>
          </div>
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import {
  AppHeaderText,
  AppButton,
  AppKeyboard,
  AppNormalText,
  AppTitleCardContainer,
  AppCurrencySwitch,
  AppAvatar,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { availableCurrencies } from "../../composable";
import { computed } from "vue";
import { reactive } from "vue";
import { onMounted } from "vue";
import { onIonViewWillEnter } from "@ionic/vue";

export default defineComponent({
  name: "SendMoneyEnterAmountPage",
  components: {
    AppHeaderText,
    AppNormalText,
    AppButton,
    AppKeyboard,
    AppTitleCardContainer,
    AppCurrencySwitch,
    AppAvatar,
  },
  middlewares: {
    fetchRules: [
      {
        domain: "Wallet",
        property: "CurrentGlobalExchangeRate",
        method: "GetGlobalExchangeRate",
        params: ["USD"],
        requireAuth: true,
        useRouteQuery: true,
        queries: ["currency"],
        query_concatenation_type: "append",
        ignoreProperty: true,
      },
      {
        domain: "User",
        property: "SingleUser",
        method: "GetSingleUser",
        params: [],
        useRouteQuery: true,
        queries: ["beneficiary"],
        requireAuth: false,
        ignoreProperty: true,
      },
    ],
  },
  setup() {
    const AuthUser = ref(Logic.Auth.AuthUser);
    const SingleUser = ref(Logic.User.SingleUser);
    const amountFromQuery = ref("");
    const businessUUIDFromQuery = ref("");
    const CurrentGlobalExchangeRate = ref(
      Logic.Wallet.CurrentGlobalExchangeRate
    );
    const feePercentage = 0.005;

    const isSwitchable = ref(true);

    const defaultCurrency = ref("USD");

    const amount = ref("0");
    const maximumAmount = 10000;

    const defaultCountryCode = computed(() => {
      return availableCurrencies.filter(
        (item) => item.code == Logic.Common.route?.query?.currency?.toString()
      )[0];
    });

    const modelCurrencyValue = ref(defaultCountryCode.value?.code);
    const currencySymbol = ref(defaultCountryCode.value?.symbol);

    const getUserType = computed(() => {
      let greepUserType = "Greep";

      if (SingleUser.value?.profile?.user_type == "Customer") {
        greepUserType = "Greep User";
      } else if (SingleUser.value?.profile?.user_type == "Business") {
        greepUserType = "Greep Merchant";
      } else if (SingleUser.value?.profile?.user_type == "Rider") {
        greepUserType = "Greep Rider";
      }

      return greepUserType;
    });

    const feePlusAmount = computed(() => {
      return (
        feePercentage * parseFloat(amount.value) + parseFloat(amount.value)
      );
    });

    const feeAmount = computed(() => {
      return feePercentage * parseFloat(amount.value);
    });

    const allowedAvailableCurrencies = computed(() => {
      const newAvailableCurrencies = availableCurrencies.filter(() => {
        return true;
      });

      newAvailableCurrencies.unshift(
        {
          code: "TRY",
          name: "Turkish Lira",
          symbol: "₺",
          country_code: "TR",
          loading: false,
        },
        {
          code: "USD",
          name: "United States Dollar",
          symbol: "$",
          country_code: "US",
          loading: false,
        },
        {
          code: "EUR",
          name: "Euro",
          symbol: "€",
          country_code: "EU",
          loading: false,
        }
      );

      newAvailableCurrencies.push(
        {
          code: "XLM",
          name: "Stellar Lumen",
          symbol: "XLM",
          country_code: "XLM",
          loading: false,
        },
        {
          code: "USDC",
          name: "USD Coin",
          symbol: "$",
          country_code: "US",
          loading: false,
        }
      );

      return reactive(newAvailableCurrencies);
    });

    const amountIsValid = () => {
      return (
        parseFloat(amount.value) > 0 &&
        parseFloat(amount.value) <=
          (AuthUser.value?.wallet?.total_balance || 0) *
            (CurrentGlobalExchangeRate.value?.mid || 0)
      );
    };

    const currentBusiness = computed(() => {
      let business = Logic.User.SingleUser?.businesses?.find(
        (item) => item.uuid === businessUUIDFromQuery.value
      );

      if (!business) {
        business = Logic.User.SingleUser?.businesses?.[0] || undefined;
      }

      return business;
    });

    const continueToNext = () => {
      const paymentData = {
        beneficiary_name: currentBusiness.value
          ? currentBusiness.value.business_name
          : SingleUser.value?.first_name + " " + SingleUser.value?.last_name,
        beneficiary_uuid: SingleUser.value?.uuid || "",
        business_uuid: currentBusiness.value?.uuid || "",
        amount: amount.value,
        currency: modelCurrencyValue.value,
      };

      localStorage.setItem("CurrentPaymentData", JSON.stringify(paymentData));

      Logic.Common.GoToRoute(`/send/confirm`);
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

      amount.value = amountFromMainQuery;
      amountFromQuery.value = amountFromMainQuery;

      const selectedCurrencyData = allowedAvailableCurrencies.value.filter(
        (item) => item.code == currencyFromQuery
      )[0];

      if (selectedCurrencyData) {
        defaultCurrency.value =
          selectedCurrencyData?.code || defaultCurrency.value;
        modelCurrencyValue.value = defaultCurrency.value;
        currencySymbol.value = selectedCurrencyData?.symbol || "";
      }
    };

    onIonViewWillEnter(() => {
      setPageDefaults();
    });

    onMounted(() => {
      Logic.Auth.watchProperty("AuthUser", AuthUser);
      Logic.User.watchProperty("SingleUser", SingleUser);
      Logic.Wallet.watchProperty(
        "CurrentGlobalExchangeRate",
        CurrentGlobalExchangeRate
      );
      setPageDefaults();
    });

    return {
      amount,
      Logic,
      maximumAmount,
      continueToNext,
      amountIsValid,
      modelCurrencyValue,
      defaultCountryCode,
      allowedAvailableCurrencies,
      currencySymbol,
      AuthUser,
      CurrentGlobalExchangeRate,
      SingleUser,
      getUserType,
      amountFromQuery,
      isSwitchable,
      currentBusiness,
      feePlusAmount,
      feeAmount,
    };
  },
});
</script>
