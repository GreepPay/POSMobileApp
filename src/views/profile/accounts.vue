<template>
  <app-wrapper>
    <subpage-layout title="Default Currency">
      <div class="w-full flex flex-col space-y-5 justify-start h-full pt-1">
        <div class="w-full flex flex-col">
          <app-switch v-model="selectedValue" :items="switchItems" />
        </div>

        <div
          class="w-full flex flex-col items-center justify-start px-4 h-full pt-1"
        >
          <template v-for="(account, index) in allAccounts" :key="index">
            <div
              class="w-full flex flex-row items-center justify-between mb-5"
              @click="selectedAccount = account.key"
            >
              <div class="w-full flex flex-row space-x-2 items-center">
                <app-image-loader
                  :photo-url="account.logo"
                  class="!h-[40px] w-[40px] rounded-full"
                />

                <app-normal-text class="!text-left">{{
                  account.title
                }}</app-normal-text>
              </div>

              <div class="flex flex-row justify-end">
                <app-icon
                  :name="`${
                    selectedAccount == account.key ? 'selected' : 'not-selected'
                  }`"
                  class="h-[24px]"
                />
              </div>
            </div>
          </template>

          <div class="w-full flex flex-col pt-2">
            <div
              @click="Logic.Common.GoToRoute('/banks/add')"
              class="w-full flex flex-row space-x-1 px-3 py-3 border-[1.5px] rounded-[12px] items-center border-[#0A141E]"
            >
              <app-icon name="black-plus" custom-class="h-[24px]" />

              <app-normal-text class="!text-left">
                New Account
              </app-normal-text>
            </div>
          </div>
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  AppNormalText,
  AppIcon,
  AppImageLoader,
  AppSwitch,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive } from "vue";
import { ref } from "vue";

export default defineComponent({
  name: "ProfileAccountsSettingsPage",
  components: {
    AppNormalText,
    AppIcon,
    AppImageLoader,
    AppSwitch,
  },
  setup() {
    const FormValidations = Logic.Form;

    const formData = reactive<{
      preferred_currency: string;
    }>({
      preferred_currency: "TRY",
    });

    const selectedValue = ref("");

    const switchItems = reactive<
      {
        name: string;
        key: string;
      }[]
    >([
      {
        name: "Bank Account",
        key: "bank_account",
      },
      {
        name: "Mobile Money",
        key: "mobile_money",
      },
      {
        name: "Crypto Wallet",
        key: "crypto_wallet",
      },
    ]);

    const selectedAccount = ref<string>("gtbank");

    const allAccounts = reactive([
      {
        title: "GTBank (******4416)",
        key: "gtbank",
        logo: `/images/temps/gt_bank.png`,
      },
      {
        title: "Kuda (******1208)",
        key: "kuda",
        logo: `/images/temps/kuda_bank.png`,
      },
    ]);

    const continueToNext = () => {
      //   modalIsOpen.value = true;
    };

    return {
      Logic,
      continueToNext,
      FormValidations,
      formData,
      switchItems,
      selectedValue,
      selectedAccount,
      allAccounts,
    };
  },
});
</script>
