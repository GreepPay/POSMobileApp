<template>
  <app-wrapper>
    <subpage-layout title="Choose Account">
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

              <app-normal-text class="!text-left capitalize">{{
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

        <div class="w-full flex flex-col">
          <div
            @click="goToAddAccount"
            class="w-full flex flex-row space-x-1 px-3 py-3 border-[1.5px] rounded-[12px] items-center border-[#0A141E]"
          >
            <app-icon name="black-plus" custom-class="h-[24px]" />

            <app-normal-text class="!text-left"> New Account </app-normal-text>
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
            :class="`!py-4 ${!selectedAccount ? 'opacity-50' : ''}`"
            @click="continueToNext"
            :loading="loadingState"
            >Next</app-button
          >
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  AppButton,
  AppIcon,
  AppNormalText,
  AppImageLoader,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive } from "vue";
import { ref } from "vue";
import { onMounted } from "vue";
import { onIonViewDidEnter } from "@ionic/vue";

export default defineComponent({
  name: "SavedAccountsPage",
  components: {
    AppButton,
    AppIcon,
    AppNormalText,
    AppImageLoader,
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
    const selectedAccount = ref<string>("");

    const ManySavedAccounts = ref(Logic.Wallet.ManySavedAccounts);

    const accountType = ref("bank_account");

    const loadingState = ref(false);

    const allAccounts = reactive<
      {
        title: string;
        key: string;
        logo: string;
      }[]
    >([]);

    const setAccounts = () => {
      allAccounts.length = 0;

      const accountTypeFromRoute =
        Logic.Common.route?.query.method?.toString() || "";

      if (accountTypeFromRoute) {
        accountType.value = accountTypeFromRoute;
      }

      if (accountType.value == "bank_account") {
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

      if (accountType.value == "mobile_money") {
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

      if (accountType.value == "crypto_currency") {
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

      if (allAccounts.length > 0) {
        selectedAccount.value = allAccounts[0].key;
      }
    };

    const goToAddAccount = () => {
      if (accountType.value == "bank_account") {
        Logic.Common.GoToRoute("/banks/add");
      } else if (accountType.value == "mobile_money") {
        Logic.Common.GoToRoute("/mobile-money/add");
      } else if (accountType.value == "crypto_currency") {
        Logic.Common.GoToRoute("/crypto-wallet/add");
      }
    };

    const continueToNext = async () => {
      if (selectedAccount.value) {
        const amountFromRoute =
          Logic.Common.route?.query?.amount?.toString() || "0";
        const currencyFromRoute =
          Logic.Common.route?.query?.currency?.toString() || "USD";

        Logic.Wallet.InitiateWithdrawalForm = {
          amount: parseFloat(amountFromRoute),
          saved_account_uuid: selectedAccount.value,
          withdrawal_currency: currencyFromRoute,
        };

        Logic.Common.GoToRoute("/withdraw/confirm");
      }
    };

    onIonViewDidEnter(() => {
      setAccounts();
    });

    onMounted(() => {
      Logic.Wallet.watchProperty("ManySavedAccounts", ManySavedAccounts);
      setAccounts();
    });

    return {
      allAccounts,
      Logic,
      selectedAccount,
      continueToNext,
      goToAddAccount,
      loadingState,
    };
  },
});
</script>
