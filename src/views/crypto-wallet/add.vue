<template>
  <app-wrapper>
    <subpage-layout title="New Crypto Wallet">
      <div
        class="w-full flex flex-col space-y-5 justify-start px-4 h-full pt-4"
      >
        <div class="w-full grid grid-cols-1 gap-3">
          <app-select
            :placeholder="'Choose Crypto Coin'"
            :hasTitle="false"
            :paddings="'py-4 !px-3'"
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
            :class="`!py-4`"
            @click="continueToNext"
            >Save & Continue</app-button
          >
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { AppButton, AppTextField, AppSelect } from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive } from "vue";
import { SelectOption } from "@greep/ui-components/src/types";

export default defineComponent({
  name: "AddCryptoWalletPage",
  components: {
    AppButton,
    AppTextField,
    AppSelect,
  },
  setup() {
    const formDetails = reactive({
      crypto: "",
      wallet_address: "",
    });

    const FormValidations = Logic.Form;

    const cryptoOptions = reactive<SelectOption[]>([
      {
        key: "USDC",
        value: "USDC",
      },
      {
        key: "XLM",
        value: "XLM",
      },
    ]);

    const continueToNext = () => {
      //   modalIsOpen.value = true;
    };

    return {
      Logic,
      formDetails,
      continueToNext,
      FormValidations,
      cryptoOptions,
    };
  },
});
</script>
