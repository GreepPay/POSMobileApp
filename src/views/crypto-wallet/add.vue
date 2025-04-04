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
            v-model="formDetails.crypto"
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
        style="
          padding-bottom: calc(env(safe-area-inset-bottom) + 16px) !important;
        "
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
import { defineComponent, ref } from "vue";
import {
  AppButton,
  AppTextField,
  AppSelect,
  AppFormWrapper,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive } from "vue";
import { SelectOption } from "@greep/ui-components/src/types";

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
    });

    const FormValidations = Logic.Form;

    const loadingState = ref(false);

    const formComponent = ref<any>();

    const cryptoOptions = reactive<SelectOption[]>([
      {
        key: "usdc",
        value: "USDC",
      },
      {
        key: "xlm",
        value: "XLM",
      },
    ]);

    const continueToNext = () => {
      const state = formComponent.value.validate();

      if (state) {
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

    return {
      Logic,
      formDetails,
      continueToNext,
      FormValidations,
      cryptoOptions,
      loadingState,
      formComponent,
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
