<template>
  <app-wrapper>
    <subpage-layout title="Request From">
      <div class="w-full flex flex-col items-center justify-start px-4 pt-1">
        <template v-for="(method, index) in paymentMethods" :key="index">
          <div
            :class="`w-full flex flex-col space-y-1 px-4 py-4 !border-[2px] mb-3 border-[#F0F3F6] rounded-[16px]`"
            @click="
              selectedMethod = method.key;
              continueToNext();
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
          </div>
        </template>

        <!-- Spacer -->
        <div class="!h-[60px] py-6"></div>
      </div>

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
        <div
          class="w-full flex flex-col items-center pt-4"
          :style="`
          ${getBottomPadding}
        `"
        >
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

      <!-- Withdrawal Method Modal -->
      <app-modal
        v-if="showCryptoOptions"
        can-close
        :close="
          () => {
            showCryptoOptions = false;
          }
        "
        :innerClass="'!px-0 !pt-0 px-0'"
        :contentClass="`!px-0 !pt-0`"
      >
        <div class="w-full flex flex-col pb-4 !overflow-y-auto !max-h-[400px]">
          <div
            class="w-full flex flex-row py-4 bg-white sticky top-0 left-0 px-4 justify-between !rounded-t-[20px]"
          >
            <app-header-text class="text-left !text-lg">
              Choose Crypto
            </app-header-text>

            <app-icon
              name="close-circle"
              @click.stop="showCryptoOptions = false"
              custom-class="h-[24px]"
            />
          </div>

          <div
            class="w-full flex flex-col items-center justify-start pt-1 px-4"
          >
            <div
              class="w-full flex flex-row justify-between items-center py-2 mb-3"
              v-for="(currency, index) in availableCurrencies.filter(
                (item) => item.is_crypto && item.can_accept_deposit
              )"
              :key="index"
              @click="handleCryptoSelected(currency.code || '')"
            >
              <div class="flex flex-row space-x-3 items-center">
                <app-image-loader
                  :photo-url="`/images/icons/flags/${currency.code?.toLocaleLowerCase()}.${
                    currency.icon_extension || 'svg'
                  }`"
                  class="size-10 rounded-full border-[1px] border-gray-200 object-cover"
                />

                <app-normal-text custom-class="!text-left">
                  {{ currency.name }}
                </app-normal-text>
              </div>
            </div>

            <!-- Spacer -->
            <div class="h-[20px] pt-5"></div>
          </div>
        </div>
      </app-modal>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  AppIcon,
  AppNormalText,
  AppModal,
  AppImageLoader,
  AppHeaderText,
  AppButton
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive } from "vue";
import { ref } from "vue";
import { availableCurrencies, depositCryptoAndNetworkMap, getBottomPadding } from "../../composable";
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

export default defineComponent({
  name: "RequestMethodPage",
  components: {
    AppIcon,
    AppNormalText,
    AppModal,
    AppImageLoader,
    AppHeaderText,
    AppButton
  },
  setup() {
    const selectedMethod = ref<string>("greep_pay");
    const kycInitiaionResponse = ref();

    const selectedCurrency = ref("USDC");

    const showRedirectInfoModal = ref(false);

    const modalContent = ref("");

    const modalRedirectButtonCopy = ref("Continue");

    const partnerLogoUrl = ref("");

    const partnerName = ref("Bridge");

    const modalIsOpen = ref(false);

    const paymentMethods = reactive<
      {
        title: string;
        key: string;
        description: string;
        icon: string;
      }[]
    >([
      {
        title: "Greep Pay",
        key: "greep_pay",
        description: "Your customer pays with their GreepPay wallet.",
        icon: "greep-pay",
      },
      {
        title: "Crypto Wallet",
        key: "crypto_wallet",
        description: "Your customer pays with their crypto wallet.",
        icon: "crypto",
      },
    ]);

    const checkForUserKYCStatus = async () => {
      Logic.Common.showLoader({
        show: true,
        loading: true,
      });

      const responseString = await Logic.Wallet.InitiateWalletKYC("USDC");

      if (responseString) {
        const responseData: any = JSON.parse(responseString);

        if (responseData.provider == "bridge") {
          const bridgeKYCLink: BridgeKYCInitiaionResponse = responseData;

          if (bridgeKYCLink.provider != "bridge") {
            return;
          }

          kycInitiaionResponse.value = bridgeKYCLink;

          const forceSkipVerification = false;

          let kycStatus =  bridgeKYCLink.tos_status;

          if(import.meta.env.VITE_API_URL?.includes('dev')) {
            kycStatus = "approved";
          }

          if (
            kycStatus != "approved" &&
            !forceSkipVerification
          ) {
            showRedirectInfoModal.value = true;
            partnerName.value = "Bridge";
            partnerLogoUrl.value =
              "https://cdn.prod.website-files.com/66c78bffc753432b33c4f61a/676f68fb0dcc0518dabd8fdb_Co-branded-Bridge-Stripe-Vertical-Small-trans.svg";
            modalContent.value = `To accept crypto deposits, Greep uses Bridge to securely connect accounts and process your payments.

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
              "https://cdn.prod.website-files.com/66c78bffc753432b33c4f61a/676f68fb0dcc0518dabd8fdb_Co-branded-Bridge-Stripe-Vertical-Small-trans.svg";
            modalContent.value = `To continue with crypto deposits, Please complete your account verification on Bridge.`;

            modalRedirectButtonCopy.value = "Complete Verification";

            return;
          }

          showCryptoOptions.value = true;
        }
      }
    };

    const showCryptoOptions = ref<boolean>(false);

    const redirectButtonAction = async () => {
      showRedirectInfoModal.value = false;

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
    };

    const handleCryptoSelected = async (currencyCode: string) => {
       showCryptoOptions.value = false;
        const crypto = currencyCode;
        const network = depositCryptoAndNetworkMap[currencyCode as keyof typeof depositCryptoAndNetworkMap][0].key;

        Logic.Common.showLoader({
          show: true,
          loading: true,
        });

        const cryptoTransferResponse = await Logic.Wallet.CreateCrpytoTransfer(crypto, network);

        localStorage.setItem('currentCryptoTransfer', JSON.stringify(cryptoTransferResponse));
        Logic.Common.hideLoader();

        Logic.Common.GoToRoute(`/request/crypto?currency=${crypto}`);
    };

    const continueToNext = () => {
      if (selectedMethod.value == "greep_pay") {
        Logic.Common.GoToRoute(`/request`);
      } else if (selectedMethod.value == "crypto_wallet") {
        checkForUserKYCStatus();
      }
    };

    return {
      Logic,
      selectedMethod,
      continueToNext,
      getBottomPadding,
      paymentMethods,
      showCryptoOptions,
      availableCurrencies,
      modalIsOpen,
      modalRedirectButtonCopy,
      partnerLogoUrl,
      partnerName,
      modalContent,
      redirectButtonAction,
      showRedirectInfoModal,
      handleCryptoSelected
    };
  },
});
</script>
