<template>
  <app-wrapper>
    <subpage-layout :title="pageTitle" :hideBackBtn="hideBackBtn">
      <div class="w-full flex flex-col items-center justify-start px-5 h-full">
        <!-- Receiver info -->
        <div
          class="flex w-full items-center py-3 px-3 mb-4 bg-gray-100 cursor-pointer rounded-[20px] border-black border-y-[1.5px] border-b-0 border-x-[3px]"
        >
          <app-avatar
            :src="`${
              CurrentPaymentDetail?.profile_image_url ||
              `/images/profile-image.svg`
            }`"
            alt="name"
            :size="52"
          />

          <div class="flex flex-col py-1 pl-3">
            <app-header-text customClass="!text-sm leading-6 !text-gray-two">
              {{ CurrentPaymentDetail?.user_name }}
            </app-header-text>
            <app-normal-text customClass="!text-gray-two">
              {{ getUserType(CurrentPaymentDetail?.user_type || "") }}
            </app-normal-text>
          </div>
        </div>

        <!-- Confirmation details starts -->
        <template v-if="currentPageContent == 'confirmation_info'">
          <app-title-card-container custom-class="!rounded-2xl">
            <div class="w-full flex flex-col">
              <app-normal-text class="!text-white !font-normal">
                Amount to be sent
              </app-normal-text>
              <app-header-text class="!text-white !text-xl pt-1 !font-normal">
                {{ selectedCurrencyData?.symbol }}
                {{
                  Logic.Common.convertToMoney(amountFromQuery, true, "", false)
                }}
              </app-header-text>
            </div>
          </app-title-card-container>

          <!-- Balance info -->
          <template v-if="AuthUser">
            <div class="w-full flex flex-row items-center justify-between pt-3">
              <div class="pl-[2px]">
                <app-normal-text class="!text-gray-500">
                  Your Wallet Balance
                </app-normal-text>
              </div>

              <div class="">
                <app-normal-text class="!text-gray-900 !font-semibold !text-sm">
                  {{ currencySymbol }}
                  {{
                    Logic.Common.convertToMoney(
                      (Logic.Auth.GetDefaultBusiness()?.wallet?.total_balance ||
                        0) * (CurrentGlobalExchangeRate?.mid || 0),
                      true,
                      "",
                      false
                    )
                  }}
                </app-normal-text>
              </div>
            </div>

            <app-info-box v-if="insufficentBalance" class="mt-3 !bg-red-100">
              <span class="font-semibold pb-1"
                >Insufficient Wallet Balance</span
              >
              Please fund your Greep Wallet to complete this payment
            </app-info-box>
          </template>

          <div class="w-full flex flex-col pt-4">
            <app-details :isVertical="false" :details="confirmationDetails" />
          </div>
        </template>
        <!-- Confirmation details end -->

        <!-- Processing -->
        <template v-if="currentPageContent == 'processing'">
          <app-title-card-container custom-class="!rounded-2xl">
            <div class="w-full flex flex-col">
              <app-normal-text class="!text-white !font-normal">
                Amount
              </app-normal-text>
              <app-header-text class="!text-white !text-xl pt-1 !font-normal">
                {{ selectedCurrencyData?.symbol }}
                {{
                  Logic.Common.convertToMoney(amountFromQuery, false, "", false)
                }}
              </app-header-text>
            </div>
          </app-title-card-container>

          <div
            class="w-full flex flex-col space-y-2 items-center justify-center pt-3"
          >
            <app-normal-text class="text-center !font-[500] pt-2">
              Your payment is on the way!
            </app-normal-text>

            <div
              class="px-2 py-2 rounded-full bg-primary flex flex-row items-center space-x-1 mb-2"
            >
              <app-icon name="bold-tick-white-circle" custom-class="size-7" />

              <app-normal-text class="text-center !text-white !text-sm pr-2">
                Sent
              </app-normal-text>
            </div>

            <div class="h-[75px] w-[7px] rounded-[6px] bg-[#F0F3F6]"></div>

            <div
              class="px-2 py-2 rounded-full bg-transparent border-[1.5px] border-[#E0E2E4] flex flex-row items-center space-x-1 mb-2"
            >
              <app-icon name="linear-more-circle" custom-class="size-7" />
              <app-normal-text
                class="text-center !text-veryLightGray !text-sm pr-2"
              >
                Deposited
              </app-normal-text>
            </div>
          </div>
        </template>
      </div>

      <!-- Bottom button -->
      <div
        class="w-full fixed bg-white dark:bg-black bottom-0 left-0 pt-4 px-4 flex flex-col"
        style="
          padding-bottom: calc(env(safe-area-inset-bottom) + 16px) !important;
        "
      >
        <div
          class="w-full flex flex-col pb-4"
          v-if="currentPageContent === 'processing'"
        >
          <app-countdown-timer custom-class="!py-5" :duration="300" />
        </div>
        <div class="w-full flex flex-col">
          <app-button
            variant="secondary"
            :class="`!py-4`"
            @click="continueToNext"
            :loading="buttonIsLoading"
          >
            {{ insufficentBalance ? "Fund Wallet" : mainButtonLabel }}
          </app-button>
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  AppButton,
  AppNormalText,
  AppDetails,
  AppHeaderText,
  AppIcon,
  AppTitleCardContainer,
  AppCountdownTimer,
  AppAvatar,
  AppInfoBox,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive } from "vue";
import { ref } from "vue";
import { availableCurrencies } from "../../composable";
import { onMounted } from "vue";
import { onIonViewWillEnter } from "@ionic/vue";
import { computed } from "vue";

export default defineComponent({
  name: "ConfirmSendMoneyPage",
  components: {
    AppButton,
    AppNormalText,
    AppDetails,
    AppHeaderText,
    AppIcon,
    AppTitleCardContainer,
    AppCountdownTimer,
    AppAvatar,
    AppInfoBox,
  },
  middlewares: {
    fetchRules: [
      {
        domain: "Wallet",
        property: "CurrentGlobalExchangeRate",
        method: "GetGlobalExchangeRate",
        params: ["USD"],
        requireAuth: false,
        useRouteQuery: true,
        queries: ["currency"],
        query_concatenation_type: "append",
        ignoreProperty: true,
      },
      {
        domain: "Wallet",
        property: "CurrentPaymentDetail",
        method: "GetPaymentDetails",
        params: [],
        useRouteQuery: true,
        queries: ["payment_uuid"],
        requireAuth: false,
        ignoreProperty: true,
      },
    ],
  },
  setup() {
    const hideBackBtn = ref(false);

    const CurrentGlobalExchangeRate = ref(
      Logic.Wallet.CurrentGlobalExchangeRate
    );

    const amount = ref("0");
    const businessUUIDFromQuery = ref("");
    const countryCodeFromQuery = ref("");
    const CurrentPaymentDetail = ref(Logic.Wallet.CurrentPaymentDetail);
    const amountFromQuery = ref("");
    const defaultCurrency = ref("USD");
    const currentPageContent = ref("confirmation_info");
    const mainButtonLabel = ref("Confirm");
    const pageTitle = ref("Complete Payment");
    const buttonIsLoading = ref(false);
    const feePercentage = 0.005;
    const AuthUser = ref(Logic.Auth.AuthUser);

    const insufficentBalance = computed(() => {
      if (!AuthUser.value) {
        return false;
      }

      return (
        amountToPay.value >
        (Logic.Auth.GetDefaultBusiness()?.wallet?.total_balance || 0) *
          (CurrentGlobalExchangeRate.value?.mid || 0)
      );
    });

    const defaultCountryCode = computed(() => {
      return availableCurrencies.filter(
        (item) => item.code == Logic.Common.route?.query?.currency?.toString()
      )[0];
    });

    const modelCurrencyValue = ref(defaultCountryCode.value?.code);
    const currencySymbol = ref(defaultCountryCode.value?.symbol);

    const confirmationDetails = reactive<
      {
        title: string;
        content: string;
      }[]
    >([]);

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

    const getUserType = (user_type: string) => {
      let greepUserType = "Greep";

      if (user_type == "Customer") {
        greepUserType = "Greep User";
      } else if (user_type == "Business") {
        greepUserType = "Greep Merchant";
      } else if (user_type == "Rider") {
        greepUserType = "Greep Rider";
      }

      return greepUserType;
    };

    const selectedCurrencyData = computed(() => {
      return allowedAvailableCurrencies.value.filter(
        (item) => item.code == defaultCurrency.value
      )[0];
    });

    const amountToPay = computed(() => {
      // Can change this to your fee percentage
      const amount = parseFloat(amountFromQuery.value || "0");
      return amount + amount * feePercentage;
    });

    const setPageDefault = () => {
      const currencyFromQuery =
        Logic.Common.route?.query?.currency?.toString() ||
        defaultCurrency.value;

      businessUUIDFromQuery.value =
        Logic.Common.route?.query?.business?.toString() || "";

      countryCodeFromQuery.value =
        Logic.Common.route?.query?.country_code?.toString() || "";

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

      confirmationDetails.length = 0;
      if (CurrentPaymentDetail.value?.user_name) {
        confirmationDetails.push({
          title: "Beneficiary",
          content: CurrentPaymentDetail.value.user_name || "",
        });

        const feeAmount = feePercentage * parseFloat(amountFromQuery.value);

        confirmationDetails.push({
          title: "Payment Amount",
          content: `${
            selectedCurrencyData?.symbol
          } ${Logic.Common.convertToMoney(amountFromQuery.value, true, "")}`,
        });

        if (AuthUser.value) {
          confirmationDetails.push({
            title: "Fees",
            content: `${
              selectedCurrencyData?.symbol
            } ${Logic.Common.convertToMoney(feeAmount, true, "")}`,
          });

          confirmationDetails.push({
            title: "Total Amount",
            content: `${
              selectedCurrencyData?.symbol
            } ${Logic.Common.convertToMoney(amountToPay.value, true, "")}`,
          });
        }
      }
    };

    const continueToNext = async () => {
      if (!AuthUser.value) {
        Logic.Common.GoToRoute(
          `/add/method?payment_uuid=${
            CurrentPaymentDetail.value?.wallet_uuid
          }&amount=${amountFromQuery.value}&currency=${
            defaultCurrency.value || "USD"
          }&country_code=${countryCodeFromQuery.value}`
        );
        return;
      }

      if (insufficentBalance.value) {
        Logic.Common.GoToRoute("/add/method");
        return;
      }

      if (buttonIsLoading.value) return;

      if (currentPageContent.value === "confirmation_info") {
        Logic.Wallet.MakePaymentForm = {
          amount: parseFloat(amountFromQuery.value || "0"),
          currency: selectedCurrencyData.value?.code || "USD",
          receiver_uuid: CurrentPaymentDetail.value?.user_uuid || "",
          business_uuid: CurrentPaymentDetail.value?.wallet_uuid || "",
        };

        buttonIsLoading.value = true;

        currentPageContent.value = "processing";
        pageTitle.value = "Processing";
        mainButtonLabel.value = "Home";
        hideBackBtn.value = true;

        try {
          await Logic.Wallet.MakePayment();

          Logic.Common.showAlert({
            show: true,
            type: "success",
            message: "Payment successful!",
          });
          resetState();
          Logic.Common.GoToRoute("/");
        } catch (error) {
          console.error(error);
        } finally {
          buttonIsLoading.value = false;
        }
      } else {
        resetState();
      }
    };

    const resetState = () => {
      hideBackBtn.value = false;
      amount.value = "0";
      businessUUIDFromQuery.value = "";
      countryCodeFromQuery.value = "";
      amountFromQuery.value = "";
      defaultCurrency.value = "USD";
      currentPageContent.value = "confirmation_info";
      mainButtonLabel.value = "Confirm";
      pageTitle.value = "Complete Payment";
      buttonIsLoading.value = false;
      confirmationDetails.length = 0;
    };

    onIonViewWillEnter(() => {
      setPageDefault();
    });

    onMounted(() => {
      Logic.Wallet.watchProperty("CurrentPaymentDetail", CurrentPaymentDetail);
      Logic.Wallet.watchProperty(
        "CurrentGlobalExchangeRate",
        CurrentGlobalExchangeRate
      );
      Logic.Auth.watchProperty("AuthUser", AuthUser);
      setPageDefault();
    });

    return {
      Logic,
      continueToNext,
      confirmationDetails,
      hideBackBtn,
      currentPageContent,
      mainButtonLabel,
      pageTitle,
      selectedCurrencyData,
      CurrentPaymentDetail,
      buttonIsLoading,
      amountToPay,
      amountFromQuery,
      getUserType,
      AuthUser,
      currencySymbol,
      CurrentGlobalExchangeRate,
      insufficentBalance,
    };
  },
});
</script>
