<template>
  <app-wrapper>
    <subpage-layout title="Default Currency">
      <div class="w-full flex flex-col justify-start h-full pt-1">
        <div class="w-full flex flex-col">
          <app-switch v-model="selectedValue" :items="switchItems" />
        </div>

        <div
          class="w-full flex flex-col items-center justify-start px-4 h-full pt-4"
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

              <!-- <div class="flex flex-row justify-end">
                <app-icon
                  :name="`${
                    selectedAccount == account.key ? 'selected' : 'not-selected'
                  }`"
                  class="h-[24px]"
                />
              </div> -->
            </div>
          </template>

          <div class="w-full flex flex-col pt-2">
            <div
              @click="goToAddAccount"
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
import { onIonViewDidEnter } from "@ionic/vue";
import { onMounted } from "vue";
import { watch } from "vue";

export default defineComponent({
  name: "ProfileAccountsSettingsPage",
  components: {
    AppNormalText,
    AppIcon,
    AppImageLoader,
    AppSwitch,
  },
  middlewares: {
    fetchRules: [
      {
        domain: "Wallet",
        property: "ManySavedAccounts",
        method: "GetSavedAccounts",
        params: [30, 1],
        requireAuth: true,
        ignoreProperty: false,
        silentUpdate: true,
      },
    ],
  },
  setup() {
    const FormValidations = Logic.Form;

    const formData = reactive<{
      preferred_currency: string;
    }>({
      preferred_currency: "TRY",
    });

    const selectedValue = ref("");

    const ManySavedAccounts = ref(Logic.Wallet.ManySavedAccounts);

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
        key: "crypto_currency",
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

    const setAccounts = () => {
      allAccounts.length = 0;

      if (selectedValue.value == "bank_account") {
        ManySavedAccounts.value?.data
          ?.filter((item) => item.bank_code == "bank_account")
          .forEach((savedAccount) => {
            const metadata: {
              bank_name: string;
              account_holder_name: string;
              account_number: string;
              routing_number: string;
              swift_code: string;
            } = JSON.parse(savedAccount.meta_data || "");
            allAccounts.push({
              title: `${metadata.bank_name} (${metadata.account_number})`,
              key: savedAccount.uuid,
              logo: `/images/bank-account.svg`,
            });
          });
      }

      if (selectedValue.value == "mobile_money") {
        ManySavedAccounts.value?.data
          ?.filter((item) => item.bank_code == "mobile_money")
          .forEach((savedAccount) => {
            const metadata: {
              first_name: string;
              last_name: string;
              mobile_number: string;
              provider: string;
            } = JSON.parse(savedAccount.meta_data || "");
            allAccounts.push({
              title: `${metadata.provider} (${metadata.mobile_number})`,
              key: savedAccount.uuid,
              logo: `/images/mobile-money/${metadata.provider}.png`,
            });
          });
      }

      if (selectedValue.value == "crypto_currency") {
        ManySavedAccounts.value?.data
          ?.filter((item) => item.bank_code == "crypto_currency")
          .forEach((savedAccount) => {
            const metadata: {
              crypto: string;
              wallet_address: string;
            } = JSON.parse(savedAccount.meta_data || "");
            allAccounts.push({
              title: `${metadata.crypto.toUpperCase()} (${metadata.wallet_address.substring(
                0,
                4
              )}****${metadata.wallet_address.slice(-4)})`,
              key: savedAccount.uuid,
              logo: `/images/crypto/${metadata.crypto}.png`,
            });
          });
      }
    };

    const goToAddAccount = () => {
      if (selectedValue.value == "bank_account") {
        Logic.Common.GoToRoute("/banks/add");
      } else if (selectedValue.value == "mobile_money") {
        Logic.Common.GoToRoute("/mobile-money/add");
      } else if (selectedValue.value == "crypto_currency") {
        Logic.Common.GoToRoute("/crypto-wallet/add");
      }
    };

    watch(selectedValue, () => {
      setAccounts();
    });

    onIonViewDidEnter(() => {
      setAccounts();
    });

    onMounted(() => {
      Logic.Wallet.watchProperty("ManySavedAccounts", ManySavedAccounts);
      setAccounts();
    });

    return {
      Logic,
      FormValidations,
      formData,
      switchItems,
      selectedValue,
      selectedAccount,
      allAccounts,
      goToAddAccount,
    };
  },
});
</script>
