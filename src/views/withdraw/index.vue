<template>
  <app-wrapper>
    <subpage-layout title="Withdraw Funds">
      <div
        class="w-full flex flex-col items-center justify-start px-4 h-full pt-3"
      >
        <app-image-loader
          class="w-full rounded-[35px] flex flex-col relative justify-center items-center px-4 py-5 xs:!py-4 bg-[linear-gradient(359.13deg,#10BB76_25.37%,#008651_99.25%)]"
          :photoUrl="''"
        >
          <!-- Image bg -->
          <img
            src="/images/greep-transparent-logo.svg"
            class="h-full absolute w-full top-0 left-0 rounded-[35px] z-[1]"
          />

          <div
            class="w-full flex flex-row items-center justify-center z-[2] pt-6"
          >
            <app-currency-switch
              :default_currency="defaultCurrency"
              v-model="selectedCurrency"
              v-model:model-symbol="currencySymbol"
            />
          </div>

          <div
            class="w-full flex flex-col !space-y-1 justify-center items-center z-[2] pt-4"
          >
            <app-normal-text class="text-center !text-white">
              Enter Amount
            </app-normal-text>

            <app-header-text
              class="text-center !text-white !text-3xl !font-normal pb-5"
            >
              {{ currencySymbol }}
              {{
                Logic.Common.convertToMoney(
                  !Number.isNaN(parseFloat(amount)) ? parseFloat(amount) : 0,
                  true,
                  "",
                  false
                )
              }}
            </app-header-text>
          </div>
        </app-image-loader>

        <div
          class="w-full flex flex-col flex-grow justify-start space-y-2 items-center pt-6"
        >
          <app-keyboard v-model="amount" class="" />

          <div :class="`w-full flex flex-col items-center justify-center`">
            <template
              v-if="
                parseFloat(amount) >
                AuthUser.wallet?.total_balance *
                  (CurrentGlobalExchangeRate?.mid || 0)
              "
            >
              <app-normal-text class="!text-red-500">
                Maximum withdrawal amount is
                <span class="!font-semibold pl-1"
                  >{{ currentCurrency }}
                  {{
                    Logic.Common.convertToMoney(
                      AuthUser.wallet?.total_balance *
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
                  >{{ currentCurrency }}
                  {{
                    Logic.Common.convertToMoney(
                      AuthUser.wallet?.total_balance *
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
      </div>

      <!-- Bottom button -->
      <div
        class="w-full fixed bg-white dark:bg-black bottom-0 left-0 pt-4 px-4"
        style="
          padding-bottom: calc(env(safe-area-inset-bottom) + 16px) !important;
        "
      >
        <div class="w-full flex flex-col">
          <app-button
            variant="secondary"
            :class="`!py-4 ${amountIsValid() ? 'opacity-100' : 'opacity-50'}`"
            @click="amountIsValid() ? continueToNext() : null"
            >Next</app-button
          >
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  AppHeaderText,
  AppButton,
  AppKeyboard,
  AppNormalText,
  AppCurrencySwitch,
  AppImageLoader,
} from "@greep/ui-components";
import { ref } from "vue";
import { Logic } from "@greep/logic";
import { User } from "@greep/logic/src/gql/graphql";
import { onMounted } from "vue";
import { availableCurrencies } from "../../composable";
import { computed } from "vue";

export default defineComponent({
  name: "WithdrawPage",
  components: {
    AppHeaderText,
    AppButton,
    AppKeyboard,
    AppNormalText,
    AppCurrencySwitch,
    AppImageLoader,
  },
  middlewares: {
    fetchRules: [
      {
        domain: "Wallet",
        property: "CurrentGlobalExchangeRate",
        method: "GetGlobalExchangeRate",
        params: [],
        requireAuth: true,
        ignoreProperty: false,
      },
    ],
  },
  setup() {
    const amount = ref("0");

    const AuthUser = ref<User>(Logic.Auth.AuthUser);
    const CurrentGlobalExchangeRate = ref(
      Logic.Wallet.CurrentGlobalExchangeRate
    );

    const modalIsOpen = ref(false);

    const defaultCurrency = ref("USD");

    const selectedCurrency = ref("USD");

    const currencySymbol = ref("$");

    const amountIsValid = () => {
      return (
        parseFloat(amount.value) > 0 &&
        parseFloat(amount.value) <=
          AuthUser.value?.wallet?.total_balance *
            (CurrentGlobalExchangeRate.value?.mid || 0)
      );
    };

    const continueToNext = () => {
      if (amountIsValid()) {
        Logic.Common.GoToRoute(
          `/withdraw/method?currency=${selectedCurrency.value}&amount=${amount.value}`
        );
      }
    };

    const currentCurrency = computed(() => {
      return availableCurrencies.filter(
        (item) => item.code == selectedCurrency.value
      )[0]?.symbol;
    });

    const setPageDefaults = () => {
      defaultCurrency.value =
        Logic.Auth.AuthUser?.profile?.default_currency || "USD";
      selectedCurrency.value = defaultCurrency.value;
    };

    onMounted(() => {
      Logic.Auth.watchProperty("AuthUser", AuthUser);
      Logic.Wallet.watchProperty(
        "CurrentGlobalExchangeRate",
        CurrentGlobalExchangeRate
      );
      setPageDefaults();
    });

    return {
      amount,
      Logic,
      modalIsOpen,
      continueToNext,
      amountIsValid,
      defaultCurrency,
      selectedCurrency,
      currencySymbol,
      AuthUser,
      CurrentGlobalExchangeRate,
      currentCurrency,
    };
  },
});
</script>
