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
              :availableCurrencies="withdrawalAvailableCurrencies"
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
        <div
          class="w-full flex flex-col px-4 pb-4 !overflow-y-auto !max-h-[400px]"
        >
          <div class="w-full flex flex-col py-3 bg-white sticky top-0 left-0">
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

                <div
                  class="w-full flex flex-row justify-between items-center pt-1"
                >
                  <app-normal-text class="text-left !text-gray-600">
                    <span class="!text-grey-800 font-semibold">Min:</span>
                    {{ currencySymbol }}
                    {{
                      Logic.Common.convertToMoney(method.min_amount, false, "")
                    }}
                  </app-normal-text>
                  <app-normal-text class="text-left !text-gray-600">
                    <span class="!text-grey-800 font-semibold">Max:</span>
                    {{ currencySymbol }}
                    {{
                      Logic.Common.convertToMoney(method.max_amount, false, "")
                    }}
                  </app-normal-text>
                </div>
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
import { defineComponent } from "vue";
import {
  AppHeaderText,
  AppButton,
  AppKeyboard,
  AppNormalText,
  AppCurrencySwitch,
  AppImageLoader,
  AppModal,
} from "@greep/ui-components";
import { ref } from "vue";
import { Logic } from "@greep/logic";
import { User, WithdrawMethod } from "@greep/logic/src/gql/graphql";
import { onMounted } from "vue";
import { computed } from "vue";
import { withdrawalAvailableCurrencies } from "../../composable";
import { Browser } from "@capacitor/browser";

interface BridgeKYCInitiaionResponse {
  created_at: string;
  customer_id: string;
  email: string;
  full_name: string;
  id: string;
  kyc_link: string;
  kyc_status: string;
  persona_inquiry_type: string;
  provider: string;
  rejection_reasons: any[];
  tos_link: string;
  tos_status: string;
  type: string;
}

interface MyKoboInitiationResponse {
  success: boolean;
  message: string;
  data: {
    id: null;
    account: null;
    memo: null;
    type: null;
    status: string;
    fields: {
      first_name: {
        type: string;
        description: string;
      };
      last_name: {
        type: string;
        description: string;
      };
      email_address: {
        type: string;
        description: string;
      };
      mobile_number: {
        type: string;
        description: string;
      };
      bank_account_number: {
        type: string;
        description: string;
      };
      photo_id_front: {
        type: string;
        description: string;
      };
      photo_proof_residence: {
        type: string;
        description: string;
      };
      proof_of_liveness: {
        type: string;
        description: string;
      };
    };
    provided_fields: null;
    message: null;
  };
  errors: null;
  provider: string;
}

export default defineComponent({
  name: "WithdrawPage",
  components: {
    AppHeaderText,
    AppButton,
    AppKeyboard,
    AppNormalText,
    AppCurrencySwitch,
    AppImageLoader,
    AppModal,
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

    const CurrentWithdrawalInfo = ref(Logic.Wallet.CurrentWithdrawalInfo);

    const kycInitiaionResponse = ref();

    const showWithdrawlInfoModal = ref(false);

    const loadingWithdrawalInfo = ref(false);

    const showRedirectInfoModal = ref(false);

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
        getWithdrawalInfo();
        // Logic.Common.GoToRoute(
        //   `/withdraw/method?currency=${selectedCurrency.value}&amount=${amount.value}`
        // );
      }
    };

    const moveForwardWithMethod = async (method: WithdrawMethod) => {
      showWithdrawlInfoModal.value = false;

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

      if (method.unique_id == "try_p2p") {
        Logic.Common.GoToRoute(
          `/withdraw/p2p/method?amount=${parseFloat(amount.value)}&currency=${
            selectedCurrency.value
          }`
        );
        return;
      } else if (yellowCardCurrencies.includes(selectedCurrency.value)) {
        const bankTransferNames = [
          "Bank Transfer",
          "Electronic Funds Transfer",
        ];

        if (bankTransferNames.includes(method.name)) {
          Logic.Common.GoToRoute(
            `/withdraw/saved-accounts?method=bank_account&amount=${parseFloat(
              amount.value
            )}&currency=${selectedCurrency.value}&channel_id=${
              method.unique_id
            }`
          );
        } else {
          Logic.Common.GoToRoute(
            `/withdraw/saved-accounts?method=mobile_money&amount=${parseFloat(
              amount.value
            )}&currency=${selectedCurrency.value}&channel_id=${
              method.unique_id
            }`
          );
        }
        return;
      } else if (bridgeCurrencies.includes(selectedCurrency.value)) {
        Logic.Common.showLoader({
          show: true,
          loading: true,
        });

        const responseString = await Logic.Wallet.InitiateWalletKYC(
          selectedCurrency.value
        );

        if (responseString) {
          const responseData: any = JSON.parse(responseString);

          if (responseData.provider == "bridge") {
            const bridgeKYCLink: BridgeKYCInitiaionResponse = responseData;

            if (bridgeKYCLink.provider != "bridge") {
              return;
            }

            kycInitiaionResponse.value = bridgeKYCLink;

            const forceSkipVerification = true;

            if (
              bridgeKYCLink.tos_status != "approved" &&
              !forceSkipVerification
            ) {
              showRedirectInfoModal.value = true;
              partnerName.value = "Bridge";
              partnerLogoUrl.value =
                "https://dashboard.bridge.xyz/_next/static/media/bridge-mark-black.f6fbfce5.svg";
              modalContent.value = `To complete withdrawal for ${selectedCurrency.value}, Greep uses Bridge to securely connect accounts and move funds.

            Click on "Continue", to accept Bridge's <a href="https://www.bridge.xyz/legal" target="_blank">Terms of Service</a> and <a href="https://www.bridge.xyz/legal/row-user-terms/bridge-building-limited" target="_blank">Privacy Policy</a>`;

              modalRedirectButtonCopy.value = "Continue";

              return;
            }

            if (
              bridgeKYCLink.kyc_status != "approved" &&
              !forceSkipVerification
            ) {
              kycInitiaionResponse.value.tos_status = "approved";
              showRedirectInfoModal.value = true;
              partnerName.value = "Bridge";
              partnerLogoUrl.value =
                "https://dashboard.bridge.xyz/_next/static/media/bridge-mark-black.f6fbfce5.svg";
              modalContent.value = `To continue with withdrawal for ${selectedCurrency.value}, Please complete your account verification on Bridge.`;

              modalRedirectButtonCopy.value = "Complete Verification";

              return;
            }

            if (selectedCurrency.value == "USD") {
              Logic.Common.GoToRoute(
                `/withdraw/saved-accounts?method=bank_account&amount=${parseFloat(
                  amount.value
                )}&currency=${selectedCurrency.value}&channel_id=${
                  method.unique_id
                }`
              );
            } else {
              Logic.Common.GoToRoute(
                `/withdraw/saved-accounts?method=crypto_currency&amount=${parseFloat(
                  amount.value
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

        const responseString = await Logic.Wallet.InitiateWalletKYC(
          selectedCurrency.value
        );
        if (responseString) {
          const responseData: any = JSON.parse(responseString);

          if (responseData.provider == "mykobo") {
            const mykoboKYCLink: MyKoboInitiationResponse = responseData;

            if (mykoboKYCLink.data.status == "NEEDS_INFO") {
              localStorage.setItem(
                "mykobo_extra_info_needed",
                JSON.stringify(mykoboKYCLink.data.fields)
              );

              Logic.Common.GoToRoute(
                `/withdraw/saved-accounts?method=bank_account&amount=${parseFloat(
                  amount.value
                )}&currency=${selectedCurrency.value}&channel_id=${
                  method.unique_id
                }`
              );
            }
          }
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

      if (selectedCurrency.value == "EUR") {
        //
      } else if (bridgeCurrencies.includes(selectedCurrency.value)) {
        const responseData: BridgeKYCInitiaionResponse =
          kycInitiaionResponse.value;

        if (responseData.tos_status != "approved") {
          await Browser.open({ url: responseData.tos_link });
          Browser.addListener("browserFinished", () => {
            kycInitiaionResponse.value.tos_status = "approved";
            showRedirectInfoModal.value = true;
            partnerName.value = "Bridge";
            partnerLogoUrl.value =
              "https://dashboard.bridge.xyz/_next/static/media/bridge-mark-black.f6fbfce5.svg";
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
      if (!amountIsValid()) {
        return;
      }

      if (loadingWithdrawalInfo.value) {
        return;
      }

      try {
        loadingWithdrawalInfo.value = true;

        await Logic.Wallet.GetWithdrawInfo(
          parseFloat(amount.value),
          selectedCurrency.value
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
      selectedCurrency.value = defaultCurrency.value;
    };

    onMounted(() => {
      Logic.Auth.watchProperty("AuthUser", AuthUser);
      Logic.Wallet.watchProperty(
        "CurrentGlobalExchangeRate",
        CurrentGlobalExchangeRate
      );
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
      amountIsValid,
      defaultCurrency,
      selectedCurrency,
      currencySymbol,
      AuthUser,
      CurrentGlobalExchangeRate,
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
    };
  },
});
</script>
