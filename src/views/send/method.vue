<template>
  <app-wrapper>
    <subpage-layout title="Pay To">
      <div
        class="w-full flex flex-col items-center justify-start px-4 h-full pt-1"
      >
        <template v-for="(method, index) in paymentMethods" :key="index">
          <div
            :class="`w-full flex flex-col space-y-1 px-4 py-4 !border-[2px] mb-3 border-[#F0F3F6] rounded-[16px]`"
            @click="
              selectedMethod = method.key;
              moveForwardWithMethod(method);
            "
          >
            <div
              class="w-full flex flex-row justify-between items-center h-full"
            >
              <div class="flex flex-row h-full items-center justify-center">
                <div
                  class="w-[48px] h-full items-center justify-center flex mr-3"
                >
                  <app-icon
                    :name="method.icon"
                    custom-class="h-[48px] w-[48px] "
                  />
                </div>

                <div class="w-full flex flex-col">
                  <app-normal-text class="text-left !text-sm !font-semibold">
                    {{ method.title }}
                  </app-normal-text>
                  <app-normal-text
                    class="text-left !text-[#616161] !pt-1 !leading-relaxed"
                  >
                    {{ method.description }}
                  </app-normal-text>
                </div>
              </div>

              <div class="flex flex-row justify-end w-[30px]">
                <app-icon :name="'arrow-right'" class="h-[24px]" />
              </div>
            </div>

            <!-- <div class="w-full flex flex-row">
              <app-normal-text class="text-left">
                Fee: {{ method.fee }}
              </app-normal-text>
            </div> -->
          </div>
        </template>
      </div>
      <div class="h-[60px] py-5"></div>

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
import { computed, defineComponent, reactive } from "vue";
import {
  AppNormalText,
  AppIcon,
  AppModal,
  AppButton,
} from "@greep/ui-components";
import { ref } from "vue";
import { Logic } from "@greep/logic";
import { onMounted } from "vue";
import { availableCurrencies } from "../../composable";
import { onIonViewWillEnter } from "@ionic/vue";
import { watch } from "vue";
import {
  BridgeKYCInitiaionResponse,
  MyKoboInitiationResponse,
} from "../../composable/types/wallet";
import { Browser } from "@capacitor/browser";
import { WithdrawMethod } from "@greep/logic/src/gql/graphql";

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

interface WithdrawMethodLocal {
  title: string;
  key: string;
  fee: string;
  active: boolean;
  type: "bank_transfer" | "mobile_money" | "greep_pay";
  description: string;
  icon: string;
  channel_id: string;
  data: WithdrawMethod;
}

export default defineComponent({
  name: "SendMoneyPaymentMethod",
  components: {
    AppNormalText,
    AppButton,
    AppIcon,
    AppModal,
  },
  middlewares: {
    fetchRules: [
      // {
      //   domain: "Wallet",
      //   property: "CurrentWithdrawalInfo",
      //   method: "GetWithdrawInfo",
      //   params: [0],
      //   useRouteQuery: true,
      //   queries: ["currency", "country"],
      //   requireAuth: true,
      //   query_concatenation_type: "append",
      //   ignoreProperty: true,
      // },
    ],
  },
  setup() {
    const selectedMethod = ref<string>("bank_transfer");

    const CurrentWithdrawalInfo = ref(Logic.Wallet.CurrentWithdrawalInfo);
    const AuthUser = ref(Logic.Auth.AuthUser);
    const showRedirectInfoModal = ref(false);
    const kycInitiaionResponse = ref();
    const partnerLogoUrl = ref("");
    const partnerName = ref("");
    const modalContent = ref("");
    const modalRedirectButtonCopy = ref("");
    const interactiveAnchorResponse = ref<MyKoboInitiationResponse>();
    const amount = ref("0");
    const selectedCurrency = ref("");
    const selectedCountry = ref("");

    const paymentMethods = reactive<WithdrawMethodLocal[]>([]);

    const defaultCountryCode = computed(() => {
      return availableCurrencies.filter(
        (item) =>
          item.code == AuthUser.value?.profile?.default_currency ||
          localStorage.getItem("default_currency") == item.code
      )[0];
    });

    const moveForwardWithMethod = async (method: WithdrawMethodLocal) => {
      if (method.type == "greep_pay") {
        const currentFullPath = Logic.Common.route?.fullPath || "";
        const currentQuery = currentFullPath.split("?")[1] || "";
        Logic.Common.GoToRoute(
          "/send" + (currentQuery ? "?" + currentQuery : "")
        );
        return;
      }

      if (method.key == "try_p2p") {
        Logic.Common.GoToRoute("/p2p?method=sell");
        return;
      }

      amount.value = Logic.Common.route?.query.amount?.toString() || "0";

      selectedCurrency.value =
        Logic.Common.route?.query.currency?.toString() || "";
      selectedCountry.value =
        Logic.Common.route?.query?.country?.toString() || "";

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

      if (method.data.unique_id == "try_p2p") {
        Logic.Common.GoToRoute(`/p2p?method=sell`);
        return;
      } else if (flutterwaveCountries.includes(selectedCountry.value || "")) {
        const bankTransferNames = [
          "Bank Transfer",
          "Electronic Funds Transfer",
        ];

        if (bankTransferNames.includes(method.data.name)) {
          Logic.Common.GoToRoute(
            `/withdraw/saved-accounts?method=bank_account&amount=${parseFloat(
              amount.value.replace(/,/g, "")
            )}&currency=${selectedCurrency.value}&channel_id=${
              method.data.unique_id
            }`
          );
        } else {
          Logic.Common.GoToRoute(
            `/withdraw/saved-accounts?method=mobile_money&amount=${parseFloat(
              amount.value.replace(/,/g, "")
            )}&currency=${selectedCurrency.value}&channel_id=${
              method.data.unique_id
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
                  method.data.unique_id
                }`
              );
            } else {
              Logic.Common.GoToRoute(
                `/withdraw/saved-accounts?method=crypto_currency&amount=${parseFloat(
                  amount.value.replace(/,/g, "")
                )}&currency=${selectedCurrency.value}&channel_id=${
                  method.data.unique_id
                }`
              );
            }
          }
        }
      } else if (selectedCurrency.value == "EUR") {
        // Logic.Common.showLoader({
        //   show: true,
        //   loading: true,
        // });

        Logic.Common.showAlert({
          show: true,
          type: "info",
          message:
            "EUR withdrawals are currently under maintenance. Please try again later.",
        });

        // Logic.Wallet.InitiateInteractiveWithdrawalForm = {
        //   amount: parseFloat(amount.value),
        //   withdrawal_currency: selectedCurrency.value,
        // };

        // interactiveAnchorResponse.value =
        //   await Logic.Wallet.InitiateInteractiveWithdrawal();
        // Logic.Common.hideLoader();
        // if (interactiveAnchorResponse.value) {
        //   showRedirectInfoModal.value = true;
        //   partnerName.value = "MyKobo";
        //   partnerLogoUrl.value =
        //     "https://miro.medium.com/v2/resize:fit:1400/format:webp/1*gwAPJbEiBG9OmyswTvuj6w.png";
        //   modalContent.value = `To complete withdrawal for ${selectedCurrency.value}, Greep uses MyKobo to securely connect accounts and move funds.

        //       Click on "Continue", to complete your withdrawal on MyKobo.`;

        //   modalRedirectButtonCopy.value = "Continue";
        // }
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

      selectedCurrency.value =
        Logic.Common.route?.query.currency?.toString() || "";

      if (selectedCurrency.value == "EUR") {
        // await Browser.open({ url: interactiveAnchorResponse.value?.url || "" });
        // const handleResponse = async () => {
        //   Logic.Wallet.ExtractAnchorTransactionForm = {
        //     transaction_id: interactiveAnchorResponse.value?.id || "",
        //     withdrawal_currency: selectedCurrency.value,
        //   };
        //   Logic.Common.showLoader({
        //     show: true,
        //     loading: true,
        //   });
        //   const response = await Logic.Wallet.ExtractAnchorTransaction();

        //   const message =
        //     withdrawalStatusMap[
        //       (response?.status as WithdrawalStatus) || "error"
        //     ] || "Unknown status";

        //   if (response?.status == "completed") {
        //     Logic.Common.showAlert({
        //       show: true,
        //       type: "success",
        //       message: "Withdrawal completed successfully!",
        //     });
        //   } else {
        //     let type: "info" | "success" | "error" = "info";
        //     if (response?.status == "error" || response?.status == "expired") {
        //       type = "error";
        //     }
        //     Logic.Common.showAlert({
        //       show: true,
        //       type,
        //       message: message,
        //     });
        //   }

        //   Logic.Common.hideLoader();
        //   Logic.Auth.GetAuthUser();
        //   Logic.Common.GoToRoute("/");
        // };
        // Browser.addListener("browserFinished", async () => {
        //   await handleResponse();
        // });

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

    const getChannelType = (name: string) => {
      if (name.toLowerCase().includes("bank")) {
        return "bank_transfer";
      }

      if (name.toLowerCase().includes("p2p")) {
        return "bank_transfer";
      }

      if (name.toLowerCase().includes("sepa")) {
        return "bank_transfer";
      }

      if (name.toLowerCase().includes("transfer")) {
        return "bank_transfer";
      }

      if (name.toLowerCase().includes("mobile")) {
        return "mobile_money";
      }

      if (name.toLowerCase().includes("m-pesa")) {
        return "mobile_money";
      }
    };

    const setAvailableOptions = () => {
      if (CurrentWithdrawalInfo.value) {
        paymentMethods.length = 0;

        paymentMethods.push({
          title: "GreepPay",
          key: "greep_pay",
          fee: "0%",
          active: true,
          type: "greep_pay",
          description: "Instant money transfer to a GreepPay user or business ",
          icon: "greep-pay",
          channel_id: "greep_pay",
          data: {} as WithdrawMethod,
        });

        // const payInFees = defaultCountryCode.value.payin_fees;

        // CurrentWithdrawalInfo.value.methods.forEach((channel) => {
        //   // if(channel.unique_id == 'try_p2p') {
        //   //   return; // Skip P2P for now
        //   // }

        //   let feeInfo = ``;

        //   if (payInFees) {
        //     if (channel.name == "Bank Transfer") {
        //       const bankTranferFee = payInFees.find(
        //         (fee) => fee.method == "bank_transfer"
        //       );

        //       if (bankTranferFee) {
        //         if (bankTranferFee.type === "percentage") {
        //           feeInfo = `${bankTranferFee.value}%, min of ${defaultCountryCode.value?.symbol}${bankTranferFee.min}`;
        //         } else {
        //           feeInfo = `${defaultCountryCode.value?.symbol}${bankTranferFee.value}`;
        //         }
        //       }
        //     } else {
        //       const momoFee = payInFees.find((fee) => fee.method == "momo");
        //       if (momoFee) {
        //         if (momoFee.type === "percentage") {
        //           feeInfo = `${momoFee.value}%, min of ${defaultCountryCode.value?.symbol}${momoFee.min}`;
        //         } else {
        //           feeInfo = `${defaultCountryCode.value?.symbol}${momoFee.value}`;
        //         }
        //       }
        //     }
        //   }

        //   const cryptoIcon = `flags/${channel.unique_id
        //     ?.replaceAll("usdc_", "")
        //     ?.replaceAll("eurc_", "")
        //     .replaceAll("usdt_", "")}`;

        //   paymentMethods.push({
        //     title: channel.name || "Unknown",
        //     key: channel.unique_id || "",
        //     fee: feeInfo,
        //     active: true,
        //     type: getChannelType(channel.name) || "bank_transfer",
        //     description: channel.description || "",
        //     icon: getChannelType(channel.name)
        //       ? getChannelType(channel.name) || ""
        //       : cryptoIcon,
        //     channel_id: channel.unique_id || "",
        //     data: channel,
        //   });
        // });

        if (paymentMethods.length > 0) {
          selectedMethod.value = paymentMethods[0].key;
        }
      }
    };

    onIonViewWillEnter(() => {
      setAvailableOptions();
    });

    watch([CurrentWithdrawalInfo], () => {
      setAvailableOptions();
    });

    onMounted(() => {
      Logic.Wallet.watchProperty(
        "CurrentWithdrawalInfo",
        CurrentWithdrawalInfo
      );
      Logic.Auth.watchProperty("AuthUser", AuthUser);
      setAvailableOptions();
    });

    return {
      paymentMethods,
      Logic,
      selectedMethod,
      showRedirectInfoModal,
      partnerLogoUrl,
      partnerName,
      modalContent,
      redirectButtonAction,
      modalRedirectButtonCopy,
      moveForwardWithMethod,
    };
  },
});
</script>
