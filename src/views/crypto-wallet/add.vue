<template>
  <app-wrapper>
    <subpage-layout title="New Crypto Wallet">
      <app-form-wrapper
        ref="formComponent"
        :parent-refs="parentRefs"
        class="w-full flex flex-col justify-start px-4 h-full pt-4"
      >
        <div class="w-full flex flex-col pb-5">
          <app-select
            :placeholder="'Choose Crypto Coin'"
            :hasTitle="false"
            :paddings="'py-4 !px-4'"
            :options="cryptoOptions"
            ref="crypto"
            use-floating-label
            v-if="showCryptoOptions"
            @OnOptionSelected="
              (data) => {
                formDetails.crypto = data.value;
              }
            "
            v-model="formDetails.channel_id"
          >
          </app-select>
        </div>

        <app-text-field
          :has-title="false"
          type="text"
          placeholder="Wallet Address"
          ref="walletAddress"
          name="Wallet Address"
          use-floating-label
          v-model="formDetails.wallet_address"
          :rules="[FormValidations.RequiredRule]"
        >
        </app-text-field>
      </app-form-wrapper>

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
            :class="`!py-4`"
            @click="continueToNext"
            :loading="loadingState"
            >Save & Continue</app-button
          >
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import {
  AppButton,
  AppTextField,
  AppSelect,
  AppFormWrapper,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive } from "vue";
import { SelectOption } from "@greep/ui-components/src/types";
import { onIonViewWillEnter } from "@ionic/vue";
import { getBottomPadding } from "../../composable";

export default defineComponent({
  name: "AddCryptoWalletPage",
  components: {
    AppButton,
    AppTextField,
    AppSelect,
    AppFormWrapper,
  },
  setup() {
    const formDetails = reactive({
      crypto: "",
      wallet_address: "",
      country: "",
      network_id: "",
      channel_id: "",
    });

    const amount = ref("");
    const selectedCurrency = ref("");
    const channelId = ref("");
    const countryCode = ref("");
    const showCryptoOptions = ref(false);

    const FormValidations = Logic.Form;

    const loadingState = ref(false);

    const formComponent = ref<any>();

    const cryptoOptions = reactive<SelectOption[]>([
      {
        key: "usdc_stellar",
        value: "USDC (Stellar)",
        extraInfo: "",
      },
      {
        key: "usdc_ethereum",
        value: "USDC (Ethereum network)",
        extraInfo: "",
      },
      {
        key: "usdc_polygon",
        value: "USDC (Polygon network)",
        extraInfo: "",
      },
      {
        key: "usdc_base",
        value: "USDC (Base network)",
        extraInfo: "",
      },
      {
        key: "usdc_arbitrum",
        value: "USDC (Arbitrum network)",
        extraInfo: "",
      },
      {
        key: "usdc_avalanche_c_chain",
        value: "USDC (Avalanche network)",
        extraInfo: "",
      },
      {
        key: "usdc_optimism",
        value: "USDC (Optimism network)",
        extraInfo: "",
      },
      {
        key: "usdc_solana",
        value: "USDC (Solana network)",
        extraInfo: "",
      },
      {
        key: "usdt_ethereum",
        value: "USDT (Ethereum network)",
        extraInfo: "",
      },
      {
        key: "usdt_tron",
        value: "USDT (Tron network)",
        extraInfo: "",
      },
      {
        key: "eurc_solana",
        value: "EURC (Solana network)",
        extraInfo: "",
      },
    ]);

    const continueToNext = () => {
      const state = formComponent.value.validate();

      if (state) {
        formDetails.country = countryCode.value;

        Logic.Wallet.CreateSavedAccountForm = {
          unique_id: formDetails.wallet_address,
          type: "crypto_currency",
          metadata: JSON.stringify(formDetails),
        };

        loadingState.value = true;

        Logic.Wallet.CreateSavedAccount()?.then(async (response) => {
          if (response) {
            await Logic.Wallet.GetSavedAccounts(30, 1);
            loadingState.value = false;
            Logic.Common.showAlert({
              show: true,
              type: "success",
              message: "Crypto account has been saved",
            });
            Logic.Common.goBack();
          } else {
            loadingState.value = false;
          }
        });
      }
    };

    const setDefaults = () => {
      amount.value = Logic.Common.route?.query?.amount?.toString() || "0";
      selectedCurrency.value =
        Logic.Common.route?.query?.currency?.toString() || "USD";

      channelId.value =
        Logic.Common.route?.query?.channel_id?.toString() || "0";

      countryCode.value =
        Logic.Common.route?.query?.country_code?.toString() || "0";

      formDetails.channel_id = channelId.value;
    };

    onMounted(() => {
      setDefaults();
      setTimeout(() => {
        showCryptoOptions.value = true;
      }, 300);
    });

    onIonViewWillEnter(() => {
      setDefaults();
      showCryptoOptions.value = false;
      setTimeout(() => {
        showCryptoOptions.value = true;
      }, 300);
    });

    return {
      Logic,
      formDetails,
      continueToNext,
      FormValidations,
      cryptoOptions,
      loadingState,
      formComponent,
      getBottomPadding,
      showCryptoOptions,
    };
  },
  data() {
    return {
      parentRefs: [],
    };
  },
  mounted() {
    const parentRefs: any = this.$refs;
    this.parentRefs = parentRefs;
  },
});
</script>
