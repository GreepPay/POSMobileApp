<template>
  <app-wrapper>
    <subpage-layout :title="pageTitle" :hideBackBtn="hideBackBtn">
      <div
        class="w-full flex flex-col items-center justify-start px-4 h-full pt-1"
      >
        <!-- Confirmation details starts -->
        <template v-if="currentPageContent == 'confirmation_info'">
          <app-image-loader
            class="w-full h-fit rounded-[16px] flex flex-col relative justify-start items-start space-y-5 px-4 py-5 xs:!py-4 bg-[linear-gradient(359.13deg,#10BB76_25.37%,#008651_99.25%)]"
            :photoUrl="''"
          >
            <!-- Image bg -->
            <img
              src="/images/greep-transparent-logo.svg"
              class="h-full absolute w-full top-0 left-0 rounded-[35px] z-[1]"
            />

            <div class="w-full flex flex-col justify-center items-start z-[2]">
              <app-normal-text class="text-center !text-white">
                Amount To Withdraw
              </app-normal-text>

              <app-header-text
                class="text-center !text-white !text-xl !font-normal pt-1"
              >
                {{ currencyData?.symbol }}
                {{ Logic.Common.convertToMoney(amount, false, "", false) }}
              </app-header-text>
            </div>
          </app-image-loader>

          <div class="w-full flex flex-col pt-4">
            <app-details :details="confirmationDetails" />

            <!-- Spacer -->
            <div class="!h-[100px]"></div>
          </div>
        </template>
        <!-- Confirmation details end -->

        <!-- Processing -->
        <template v-if="currentPageContent == 'processing'">
          <app-image-loader
            class="w-full h-fit rounded-[32px] flex flex-col relative justify-start items-start px-4 py-6 xs:!py-4 bg-[linear-gradient(359.13deg,#10BB76_25.37%,#008651_99.25%)]"
            :photoUrl="''"
          >
            <!-- Image bg -->
            <img
              src="/images/greep-transparent-logo.svg"
              class="h-full absolute w-full top-0 left-0 rounded-[35px] z-[1]"
            />

            <div
              class="w-full flex flex-col justify-center items-center z-[2] py-3"
            >
              <app-normal-text class="text-center !text-white">
                Amount
              </app-normal-text>

              <app-header-text
                class="text-center !text-white !text-3xl !font-normal pt-1"
              >
                {{ currencyData?.symbol }}
                {{ Logic.Common.convertToMoney(amount, false, "", false) }}
              </app-header-text>
            </div>
          </app-image-loader>

          <div
            class="w-full flex flex-col space-y-2 items-center justify-center pt-4"
          >
            <app-normal-text class="text-center">
              Your payment is on the way!
            </app-normal-text>

            <div
              class="px-2 py-2 rounded-full bg-primary flex flex-row items-center space-x-1 mb-2"
            >
              <app-icon name="white-check" custom-class="!h-[30px]" />

              <app-normal-text class="text-center !text-white !text-sm pr-2">
                Requested
              </app-normal-text>
            </div>

            <div class="h-[75px] w-[7px] rounded-[6px] bg-[#F0F3F6]"></div>

            <div
              class="px-2 py-2 rounded-full bg-transparent border-[1.5px] border-[#E0E2E4] flex flex-row items-center space-x-1 mb-2"
            >
              <app-icon name="pending-action" custom-class="!h-[30px]" />

              <app-normal-text
                class="text-center !text-veryLightGray !text-sm pr-2"
              >
                Sent
              </app-normal-text>
            </div>
          </div>
        </template>
      </div>

      <!-- Bottom button -->
      <div
        class="w-full fixed bg-white dark:bg-black bottom-0 left-0 pt-4 px-4 flex flex-col"
        :style="`
          ${getBottomPadding}
        `"
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
            {{ mainButtonLabel }}
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
  AppImageLoader,
  AppHeaderText,
  AppIcon,
  AppCountdownTimer,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive } from "vue";
import { ref } from "vue";
import { onMounted } from "vue";
import { onIonViewWillEnter } from "@ionic/vue";
import {
  getBottomPadding,
  withdrawalAvailableCurrencies,
} from "../../composable";
import { computed } from "vue";

export default defineComponent({
  name: "ConfirmWithdrawPage",
  components: {
    AppButton,
    AppNormalText,
    AppDetails,
    AppImageLoader,
    AppHeaderText,
    AppIcon,
    AppCountdownTimer,
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
        domain: "Wallet",
        property: "CurrentOfframp",
        method: "GetOfframp",
        params: [],
        requireAuth: true,
        useRouteQuery: true,
        queries: ["offramp_uuid"],
        ignoreProperty: false,
      },
    ],
  },
  setup() {
    const hideBackBtn = ref(false);

    const currentPageContent = ref("confirmation_info");
    const mainButtonLabel = ref("Confirm");
    const pageTitle = ref("Confirm Details");

    const buttonIsLoading = ref(false);

    const amount = ref("0");

    const CurrentGlobalExchangeRate = ref(
      Logic.Wallet.CurrentGlobalExchangeRate
    );

    const selectedCurrency = ref("");

    const CurrentOfframp = ref(Logic.Wallet.CurrentOfframp);

    const confirmationDetails = reactive<
      {
        title: string;
        content: string;
      }[]
    >([]);

    const continueToNext = async () => {
      if (currentPageContent.value === "confirmation_info") {
        if (buttonIsLoading.value) return;

        const amountFromRoute =
          Logic.Common.route?.query?.amount?.toString() || "0";
        try {
          buttonIsLoading.value = true;
          await Logic.Wallet.ConfirmWithdrawal(
            CurrentOfframp.value?.uuid || "pre_confirm",
            Logic.Common.route?.query?.currency?.toString() || "",
            parseFloat(amountFromRoute),
            localStorage.getItem("temp_payment_data") || ""
          );

          currentPageContent.value = "processing";
          pageTitle.value = "Processing";
          mainButtonLabel.value = "Home";
          hideBackBtn.value = true;

          Logic.Auth.GetAuthUser();
        } catch (error) {
          console.error("Error confirming withdrawal:", error);
        } finally {
          buttonIsLoading.value = false;
        }
      } else {
        Logic.Common.GoToRoute("/");
      }
    };

    const currencyData = computed(() => {
      return withdrawalAvailableCurrencies.find(
        (currency) =>
          currency.code === Logic.Common.route?.query?.currency?.toString()
      );
    });

    const setDefaults = () => {
      const yellowCardCurrencies = ["NGN", "GHS", "KES", "ZAR"];

      const bridgeCurrencies = [
        "USD",
        "USDC",
        "XLM",
        "EURC",
        "USDT",
        "BTC",
        "ETH",
      ];

      selectedCurrency.value =
        Logic.Common.route?.query?.currency?.toString() || "";

      const amountFromRoute =
        Logic.Common.route?.query?.amount?.toString() || "0";

      if (yellowCardCurrencies.includes(selectedCurrency.value)) {
        amount.value = amountFromRoute;
        confirmationDetails.length = 0;

        let fee_percentage = 0.01;

        let metadata = JSON.parse(CurrentOfframp.value?.extra_data || "{}");

        if (metadata.account) {
          metadata = metadata.account;
        }

        if (metadata?.mobile_number) {
          fee_percentage = 0.02;
        }

        if (metadata?.bank_name) {
          confirmationDetails.push({
            title: "Bank Name",
            content: metadata.bank_name,
          });
        }

        if (metadata?.provider) {
          confirmationDetails.push({
            title: "Provider",
            content: metadata.provider,
          });
        }

        if (metadata?.mobile_number) {
          confirmationDetails.push({
            title: "Mobile Number",
            content: metadata.mobile_number,
          });
        }

        if (metadata?.account_holder_name) {
          confirmationDetails.push({
            title: "Account Name",
            content: metadata.account_holder_name,
          });
        }

        if (metadata?.account_number) {
          confirmationDetails.push({
            title: "Account Number",
            content: metadata.account_number,
          });
        }

        confirmationDetails.push({
          title: "Amount",
          content: `${currencyData.value?.symbol}${Logic.Common.convertToMoney(
            amount.value,
            true,
            ""
          )}`,
        });

        confirmationDetails.push({
          title: "Rate per USD",
          content: `${currencyData.value?.symbol}${Logic.Common.convertToMoney(
            CurrentOfframp.value?.yellow_card_payment?.rate || 0,
            true,
            ""
          )}`,
        });

        confirmationDetails.push({
          title: "Fee",
          content: `${currencyData.value?.symbol}${Logic.Common.convertToMoney(
            parseFloat(amount.value) * fee_percentage,
            true,
            ""
          )}`,
        });
      } else if (bridgeCurrencies.includes(selectedCurrency.value)) {
        amount.value = amountFromRoute;
        confirmationDetails.length = 0;

        const fee_percentage = 0.005;

        const metadata = JSON.parse(
          localStorage.getItem("temp_payment_data") || "{}"
        );

        if (metadata?.crypto) {
          confirmationDetails.push({
            title: "Channel",
            content: metadata.crypto,
          });
        }

        if (metadata?.wallet_address) {
          confirmationDetails.push({
            title: "Wallet Address",
            content: metadata.wallet_address,
          });
        }

        if (metadata?.bank_name) {
          confirmationDetails.push({
            title: "Bank Name",
            content: metadata.bank_name,
          });
        }

        if (metadata?.account_holder_name) {
          confirmationDetails.push({
            title: "Account Name",
            content: metadata.account_holder_name,
          });
        }

        if (metadata?.account_number) {
          confirmationDetails.push({
            title: "Account Number",
            content: metadata.account_number,
          });
        }

        if (metadata?.routing_number) {
          confirmationDetails.push({
            title: "Routing Number",
            content: metadata.routing_number,
          });
        }

        if (metadata?.routing_number) {
          confirmationDetails.push({
            title: "Payment Channel",
            content: metadata.channel_id.replace("_", " ").toUpperCase(),
          });
        }

        confirmationDetails.push({
          title: "Amount",
          content: `${currencyData.value?.symbol}${Logic.Common.convertToMoney(
            amount.value,
            true,
            ""
          )}`,
        });

        confirmationDetails.push({
          title: "Rate per USD",
          content: `${currencyData.value?.symbol}${Logic.Common.convertToMoney(
            CurrentGlobalExchangeRate.value?.mid || 0,
            true,
            ""
          )}`,
        });

        confirmationDetails.push({
          title: "Fee",
          content: `${currencyData.value?.symbol}${Logic.Common.convertToMoney(
            parseFloat(amount.value) * fee_percentage,
            true,
            ""
          )}`,
        });
      }
    };

    onIonViewWillEnter(() => {
      setDefaults();
    });

    onMounted(() => {
      Logic.Wallet.watchProperty(
        "CurrentGlobalExchangeRate",
        CurrentGlobalExchangeRate
      );
      Logic.Wallet.watchProperty("CurrentOfframp", CurrentOfframp);
      setDefaults();
    });

    return {
      Logic,
      continueToNext,
      confirmationDetails,
      hideBackBtn,
      currentPageContent,
      mainButtonLabel,
      pageTitle,
      amount,
      buttonIsLoading,
      currencyData,
      getBottomPadding,
    };
  },
});
</script>
