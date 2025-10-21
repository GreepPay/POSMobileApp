<template>
  <app-wrapper>
    <subpage-layout title="Withdraw Funds">
      <div class="w-full flex flex-col items-center justify-start">
        <payment-with-suggestions
          ref="paymentWidgetComp"
          v-model:payment-data="paymentData"
        />
      </div>
      <!-- Bottom button -->
      <div
        class="w-full fixed bg-white dark:bg-black bottom-0 left-0 pt-4 px-4"
        :style="`
          ${getBottomPadding}
        `"
      >
        <div class="w-full flex flex-col">
          <app-button
            variant="secondary"
            :class="`!py-4 ${
              paymentData?.isValid ? 'opacity-100' : 'opacity-50'
            }`"
            @click="paymentData?.isValid ? continueToNext() : null"
            :loading="loadingWithdrawalInfo"
            >Next</app-button
          >
        </div>
      </div>

      <!-- Withdrawal Method Modal -->
      <app-modal
        v-if="showWithdrawlInfoModal"
        can-close
        :close="
          () => {
            showWithdrawlInfoModal = false;
          }
        "
        :innerClass="'!px-0 !pt-0'"
      >
        <div class="w-full flex flex-col pb-4 !overflow-y-auto !max-h-[400px]">
          <div class="w-full flex flex-col pb-3 bg-white sticky top-0 left-0">
            <app-header-text class="text-left !text-lg">
              Choose Method
            </app-header-text>
          </div>

          <div
            class="w-full flex flex-col items-center justify-start h-full pt-1"
            v-if="CurrentWithdrawalInfo?.methods"
          >
            <template
              v-for="(method, index) in CurrentWithdrawalInfo?.methods"
              :key="index"
            >
              <div
                :class="`w-full flex flex-col space-y-1 px-4 py-4 !border-[2px] mb-3 border-[#E0E2E4] rounded-[16px]`"
                @click="moveForwardWithMethod(method)"
              >
                <div class="w-full flex flex-row justify-between items-center">
                  <app-normal-text class="text-left !text-sm font-semibold">
                    {{ method.name }}
                  </app-normal-text>
                </div>

                <div class="w-full flex flex-row">
                  <app-normal-text class="text-left !text-gray-500">
                    {{ method.description }}
                  </app-normal-text>
                </div>

                <!-- <div
                  class="w-full flex flex-row justify-between items-center pt-1"
                >
                  <app-normal-text class="text-left !text-gray-600">
                    <span class="!text-grey-800 font-semibold">Min:</span>
                    {{ paymentData?.selectedCurrencyData?.symbol }}
                    {{
                      Logic.Common.convertToMoney(method.min_amount, false, "")
                    }}
                  </app-normal-text>
                  <app-normal-text class="text-left !text-gray-600">
                    <span class="!text-grey-800 font-semibold">Max:</span>
                    {{ paymentData?.selectedCurrencyData?.symbol }}
                    {{
                      Logic.Common.convertToMoney(method.max_amount, false, "")
                    }}
                  </app-normal-text>
                </div> -->
              </div>
            </template>

            <!-- Spacer -->
            <div class="h-[20px] pt-5"></div>
          </div>
        </div>
      </app-modal>

      <!-- KYC redirect modal -->
      <app-modal
        v-if="showRedirectInfoModal"
        :close="
          () => {
            showRedirectInfoModal = false;
          }
        "
        :contentClass="'!px-0'"
      >
        <div class="w-full flex flex-col items-center pt-4">
          <img :src="partnerLogoUrl" class="!h-[70px]" />

          <div
            class="w-full flex flex-col pt-4 pb-6 px-5 items-center justify-center"
          >
            <app-normal-text
              class="text-center w-full !text-lg !font-semibold pb-2"
            >
              Continue With {{ partnerName }}
            </app-normal-text>

            <app-normal-text
              is-html
              class="text-center !text-sm !text-gray-two w-full !prose !prose-sm"
              :html-content="modalContent"
            >
            </app-normal-text>
          </div>

          <app-button
            :custom-class="`!bg-secondary !w-full !py-4 !px-8 !text-sm`"
            variant="secondary"
            @click="redirectButtonAction"
          >
            {{ modalRedirectButtonCopy }}
          </app-button>
        </div>
      </app-modal>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from "vue";
import {
  AppHeaderText,
  AppButton,
  AppNormalText,
  AppModal,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import {
  InteractiveWithdrawalResponse,
  User,
  WithdrawMethod,
} from "@greep/logic/src/gql/graphql";
import {
  getBottomPadding,
  withdrawalAvailableCurrencies,
} from "../../composable";
import { Browser } from "@capacitor/browser";
import {
  BridgeKYCInitiaionResponse,
  MyKoboInitiationResponse,
} from "../../composable/types/wallet";
import { Currency } from "@greep/ui-components/src/types";
import PaymentWithSuggestions from "../../components/Core/PaymentWithSuggestions.vue";
import { onIonViewWillEnter } from "@ionic/vue";

type WithdrawalStatus =
  | "incomplete"
  | "pending_user_transfer_start"
  | "pending_user_transfer_complete"
  | "pending_external"
  | "pending_anchor"
  | "on_hold"
  | "pending_stellar"
  | "pending_trust"
  | "pending_user"
  | "completed"
  | "refunded"
  | "expired"
  | "error";

const withdrawalStatusMap: Record<WithdrawalStatus, string> = {
  incomplete: "There is not yet enough information to initiate this withdrawal",
  pending_user_transfer_start: "Awaiting user to initiate transfer",
  pending_user_transfer_complete:
    "Stellar payment received, funds ready for pickup",
  pending_external:
    "Withdrawal submitted to external network, awaiting confirmation",
  pending_anchor: "Withdrawal being processed by provider",
  on_hold: "Withdrawal under review",
  pending_stellar: "Operation submitted to Stellar network",
  pending_trust: "Awaiting trustline setup",
  pending_user: "Additional user action required",
  completed: "Withdrawal completed",
  refunded: "Withdrawal refunded",
  expired: "Withdrawal expired",
  error: "An error occurred",
};

export default defineComponent({
  name: "WithdrawPage",
  components: {
    AppHeaderText,
    AppButton,
    AppNormalText,
    AppModal,
    PaymentWithSuggestions,
  },
  middlewares: {
    fetchRules: [
      // {
      //   domain: "Wallet",
      //   property: "CurrentGlobalExchangeRate",
      //   method: "GetGlobalExchangeRate",
      //   params: [],
      //   requireAuth: true,
      //   ignoreProperty: false,
      // },
    ],
  },
  setup() {
    const amount = ref("0");

    const AuthUser = ref<User | undefined>(Logic.Auth.AuthUser);
    const paymentData = ref<{
      amount: number;
      currency: string;
      fee: number;
      totalAmount: number;
      narration: string;
      isValid: boolean;
      businessUUID: string | null;
      selectedCurrencyData: Currency;
    }>();
    const paymentWidgetComp = ref<any>(null);

    const interactiveAnchorResponse = ref<InteractiveWithdrawalResponse>();

    const CurrentWithdrawalInfo = ref(Logic.Wallet.CurrentWithdrawalInfo);
    const kycInitiaionResponse = ref();
    const showWithdrawlInfoModal = ref(false);
    const loadingWithdrawalInfo = ref(false);
    const showRedirectInfoModal = ref(false);
    const selectedCountry = ref("");

    const modalContent = ref("");
    const modalRedirectButtonCopy = ref("Continue");
    const partnerLogoUrl = ref("");
    const partnerName = ref("Bridge");
    const modalIsOpen = ref(false);

    const defaultCurrency = ref(Logic.Auth.AuthUser?.profile?.default_currency);
    const selectedCurrency = ref(
      Logic.Auth.AuthUser?.profile?.default_currency
    );
    const currencySymbol = ref(
      withdrawalAvailableCurrencies.find(
        (currency) => currency.code === selectedCurrency.value
      )?.symbol
    );

    const continueToNext = () => {
      if (paymentData.value?.isValid) {
        getWithdrawalInfo();
        // Logic.Common.GoToRoute(
        //   `/withdraw/method?currency=${selectedCurrency.value}&amount=${amount.value}`
        // );
      }
    };

    onIonViewWillEnter(() => {
      paymentWidgetComp.value?.runOnIonViewEnter();
    });

    const moveForwardWithMethod = async (method: WithdrawMethod) => {
      amount.value = paymentData.value?.amount.toString() || "0";
      showWithdrawlInfoModal.value = false;

      selectedCurrency.value = paymentData.value?.currency || "";
      selectedCountry.value =
        paymentData.value?.selectedCurrencyData?.country_code || "";

      const flutterwaveCountries = [
        "NG",
        "KE",
        "UG",
        "GH",
        "ZA",
        "RW",
        "CM",
        "CF",
        "TD",
        "CG",
        "GQ",
        "GA",
        "BJ",
        "BF",
        "GN",
        "CI",
        "ML",
        "MR",
        "NE",
        "SN",
        "TG",
        "TZ",
        "MW",
      ];
      const bridgeCurrencies = [
        "USD",
        "USDC",
        "XLM",
        "EURC",
        "USDT",
        "BTC",
        "ETH",
      ];

      if (method.unique_id == "try_p2p") {
        Logic.Common.GoToRoute(
          `/withdraw/p2p/method?amount=${parseFloat(
            amount.value.replace(/,/g, "")
          )}&currency=${selectedCurrency.value}`
        );
        return;
      } else if (flutterwaveCountries.includes(selectedCountry.value || "")) {
        const bankTransferNames = [
          "Bank Transfer",
          "Electronic Funds Transfer",
        ];

        if (bankTransferNames.includes(method.name)) {
          Logic.Common.GoToRoute(
            `/withdraw/saved-accounts?method=bank_account&amount=${parseFloat(
              amount.value.replace(/,/g, "")
            )}&currency=${selectedCurrency.value}&channel_id=${
              method.unique_id
            }`
          );
        } else {
          Logic.Common.GoToRoute(
            `/withdraw/saved-accounts?method=mobile_money&amount=${parseFloat(
              amount.value.replace(/,/g, "")
            )}&currency=${selectedCurrency.value}&channel_id=${
              method.unique_id
            }`
          );
        }
        return;
      } else if (bridgeCurrencies.includes(selectedCurrency.value || "")) {
        Logic.Common.showLoader({
          show: true,
          loading: true,
        });

        const responseString = await Logic.Wallet.InitiateWalletKYC(
          selectedCurrency.value || ""
        );

        if (responseString) {
          const responseData: any = JSON.parse(responseString);

          if (responseData.provider == "bridge") {
            const bridgeKYCLink: BridgeKYCInitiaionResponse = responseData;

            if (bridgeKYCLink.provider != "bridge") {
              return;
            }

            kycInitiaionResponse.value = bridgeKYCLink;

            const forceSkipVerification = false;

            let kycStatus = bridgeKYCLink.tos_status;

            if (import.meta.env.VITE_API_URL?.includes("dev")) {
              kycStatus = "approved";
            }

            if (kycStatus != "approved" && !forceSkipVerification) {
              showRedirectInfoModal.value = true;
              partnerName.value = "Bridge";
              partnerLogoUrl.value =
                "https://cdn.prod.website-files.com/66c78bffc753432b33c4f61a/676f68fb0dcc0518dabd8fdb_Co-branded-Bridge-Stripe-Vertical-Small-trans.svg";
              modalContent.value = `To complete withdrawal for ${selectedCurrency.value}, Greep uses Bridge to securely connect accounts and move funds.

            Click on "Continue", to accept Bridge's <a href="https://www.bridge.xyz/legal" target="_blank">Terms of Service</a> and <a href="https://www.bridge.xyz/legal/row-user-terms/bridge-building-limited" target="_blank">Privacy Policy</a>`;

              modalRedirectButtonCopy.value = "Continue";

              return;
            }

            let mainKycStatus = bridgeKYCLink.kyc_status;

            if (import.meta.env.VITE_API_URL?.includes("dev")) {
              mainKycStatus = "approved";
            }

            if (mainKycStatus != "approved" && !forceSkipVerification) {
              kycInitiaionResponse.value.tos_status = "approved";
              showRedirectInfoModal.value = true;
              partnerName.value = "Bridge";
              partnerLogoUrl.value =
                "https://cdn.prod.website-files.com/66c78bffc753432b33c4f61a/676f68fb0dcc0518dabd8fdb_Co-branded-Bridge-Stripe-Vertical-Small-trans.svg";
              modalContent.value = `To continue with withdrawal for ${selectedCurrency.value}, Please complete your account verification on Bridge.`;

              modalRedirectButtonCopy.value = "Complete Verification";

              return;
            }

            if (selectedCurrency.value == "USD") {
              Logic.Common.GoToRoute(
                `/withdraw/saved-accounts?method=bank_account&amount=${parseFloat(
                  amount.value.replace(/,/g, "")
                )}&currency=${selectedCurrency.value}&channel_id=${
                  method.unique_id
                }`
              );
            } else {
              Logic.Common.GoToRoute(
                `/withdraw/saved-accounts?method=crypto_currency&amount=${parseFloat(
                  amount.value.replace(/,/g, "")
                )}&currency=${selectedCurrency.value}&channel_id=${
                  method.unique_id
                }`
              );
            }
          }
        }
      } else if (selectedCurrency.value == "EUR") {
        Logic.Common.showLoader({
          show: true,
          loading: true,
        });

        Logic.Wallet.InitiateInteractiveWithdrawalForm = {
          amount: parseFloat(amount.value),
          withdrawal_currency: selectedCurrency.value,
        };

        interactiveAnchorResponse.value =
          await Logic.Wallet.InitiateInteractiveWithdrawal();
        Logic.Common.hideLoader();
        if (interactiveAnchorResponse.value) {
          showRedirectInfoModal.value = true;
          partnerName.value = "MyKobo";
          partnerLogoUrl.value =
            "https://miro.medium.com/v2/resize:fit:1400/format:webp/1*gwAPJbEiBG9OmyswTvuj6w.png";
          modalContent.value = `To complete withdrawal for ${selectedCurrency.value}, Greep uses MyKobo to securely connect accounts and move funds.

              Click on "Continue", to complete your withdrawal on MyKobo.`;

          modalRedirectButtonCopy.value = "Continue";
        }
      }
    };

    const redirectButtonAction = async () => {
      showRedirectInfoModal.value = false;

      const bridgeCurrencies = [
        "USD",
        "USDC",
        "XLM",
        "EURC",
        "USDT",
        "BTC",
        "ETH",
      ];

      selectedCurrency.value = paymentData.value?.currency || "";

      if (selectedCurrency.value == "EUR") {
        await Browser.open({ url: interactiveAnchorResponse.value?.url || "" });
        const handleResponse = async () => {
          Logic.Wallet.ExtractAnchorTransactionForm = {
            transaction_id: interactiveAnchorResponse.value?.id || "",
            withdrawal_currency: selectedCurrency.value,
          };
          Logic.Common.showLoader({
            show: true,
            loading: true,
          });
          const response = await Logic.Wallet.ExtractAnchorTransaction();

          const message =
            withdrawalStatusMap[
              (response?.status as WithdrawalStatus) || "error"
            ] || "Unknown status";

          if (response?.status == "completed") {
            Logic.Common.showAlert({
              show: true,
              type: "success",
              message: "Withdrawal completed successfully!",
            });
          } else {
            let type: "info" | "success" | "error" = "info";
            if (response?.status == "error" || response?.status == "expired") {
              type = "error";
            }
            Logic.Common.showAlert({
              show: true,
              type,
              message: message,
            });
          }

          Logic.Common.hideLoader();
          Logic.Auth.GetAuthUser();
          Logic.Common.GoToRoute("/");
        };
        Browser.addListener("browserFinished", async () => {
          await handleResponse();
        });

        return;
      } else if (bridgeCurrencies.includes(selectedCurrency.value || "")) {
        const responseData: BridgeKYCInitiaionResponse =
          kycInitiaionResponse.value;

        if (responseData.tos_status != "approved") {
          await Browser.open({ url: responseData.tos_link });
          Browser.addListener("browserFinished", () => {
            kycInitiaionResponse.value.tos_status = "approved";
            showRedirectInfoModal.value = true;
            partnerName.value = "Bridge";
            partnerLogoUrl.value =
              "https://cdn.prod.website-files.com/66c78bffc753432b33c4f61a/676f68fb0dcc0518dabd8fdb_Co-branded-Bridge-Stripe-Vertical-Small-trans.svg";
            modalContent.value = `To continue with withdrawal for ${selectedCurrency.value}, Please complete your account verification on Bridge.`;

            modalRedirectButtonCopy.value = "Complete Verification";
          });

          return;
        }

        await Browser.open({ url: responseData.kyc_link });
        Browser.addListener("browserFinished", () => {
          //
        });
      }
    };

    const currentCurrency = computed(() => {
      return withdrawalAvailableCurrencies.filter(
        (item) => item.code == selectedCurrency.value
      )[0]?.symbol;
    });

    const getWithdrawalInfo = async () => {
      if (!paymentData.value?.isValid) {
        return;
      }

      if (loadingWithdrawalInfo.value) {
        return;
      }

      selectedCurrency.value = paymentData.value?.currency || "";

      try {
        loadingWithdrawalInfo.value = true;

        await Logic.Wallet.GetWithdrawInfo(
          parseFloat(amount.value),
          selectedCurrency.value || "",
          paymentData.value?.selectedCurrencyData?.country_code || ""
        );

        showWithdrawlInfoModal.value = true;
      } catch (e: any) {
        Logic.Common.showAlert({
          show: true,
          type: "error",
          message: "Unable to get withdrawal information",
        });
      } finally {
        loadingWithdrawalInfo.value = false;
      }
    };

    const setPageDefaults = () => {
      defaultCurrency.value =
        Logic.Auth.AuthUser?.profile?.default_currency || "USD";
      selectedCurrency.value =
        paymentData?.value?.currency ?? defaultCurrency.value;
    };

    onMounted(() => {
      Logic.Auth.watchProperty("AuthUser", AuthUser);
      Logic.Wallet.watchProperty(
        "CurrentWithdrawalInfo",
        CurrentWithdrawalInfo
      );
      setPageDefaults();
    });

    return {
      amount,
      Logic,
      modalIsOpen,
      continueToNext,
      defaultCurrency,
      selectedCurrency,
      currencySymbol,
      AuthUser,
      currentCurrency,
      withdrawalAvailableCurrencies,
      showWithdrawlInfoModal,
      CurrentWithdrawalInfo,
      loadingWithdrawalInfo,
      getWithdrawalInfo,
      moveForwardWithMethod,
      showRedirectInfoModal,
      modalContent,
      partnerLogoUrl,
      partnerName,
      modalRedirectButtonCopy,
      redirectButtonAction,
      getBottomPadding,
      paymentWidgetComp,
      paymentData,
    };
  },
});
</script>
