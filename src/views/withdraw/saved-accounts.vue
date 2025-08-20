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
        :style="`
          ${getBottomPadding}
        `"
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
import {
  getBottomPadding,
  withdrawalAvailableCurrencies,
} from "../../composable";

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

    const amount = ref("");
    const selectedCurrency = ref("");
    const channelId = ref("");

    const loadingState = ref(false);

    const allAccounts = reactive<
      {
        title: string;
        key: string;
        logo: string;
        data: any;
      }[]
    >([]);

    const setAccounts = () => {
      allAccounts.length = 0;

      selectedCurrency.value =
        Logic.Common.route?.query?.currency?.toString() || "";

      const accountTypeFromRoute =
        Logic.Common.route?.query.method?.toString() || "";

      channelId.value =
        Logic.Common.route?.query?.channel_id?.toString() || "0";

      if (accountTypeFromRoute) {
        accountType.value = accountTypeFromRoute;
      }

      const currencyCountryData = withdrawalAvailableCurrencies?.find(
        (currency) => currency.code === selectedCurrency.value
      );

      let focusCountry = "";

      if (currencyCountryData) {
        focusCountry = currencyCountryData.country_code || "";
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
              country: string;
            } = JSON.parse(savedAccount.meta_data || "");

            if (!focusCountry || focusCountry == metadata.country) {
              allAccounts.push({
                title: `${metadata.bank_name} (${metadata.account_number})`,
                key: savedAccount.uuid,
                logo: `/images/bank-account.svg`,
                data: metadata,
              });
            }
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

            let imageName = metadata.provider;

            if (imageName == "AirtelTigo") {
              imageName = "airtel";
            }

            if (imageName == "MTN Mobile Money") {
              imageName = "mtn";
            }

            allAccounts.push({
              title: `${metadata.provider} (${metadata.mobile_number})`,
              key: savedAccount.uuid,
              logo: `/images/mobile-money/${imageName}.png`,
              data: metadata,
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
              channel_id: string;
            } = JSON.parse(savedAccount.meta_data || "");

            if (metadata.channel_id == channelId.value) {
              const currency = metadata.channel_id.split("_")[0]?.toLowerCase();

              let extension = ".svg";

              if (currency == "eurc" || currency == "eth") {
                extension = ".png";
              }
              allAccounts.push({
                title: `${metadata.crypto.toUpperCase()} (${metadata.wallet_address.substring(
                  0,
                  4
                )}****${metadata.wallet_address.slice(-4)})`,
                key: savedAccount.uuid,
                logo: `/images/icons/flags/${currency}${extension}`,
                data: metadata,
              });
            }
          });
      }

      if (allAccounts.length > 0) {
        selectedAccount.value = allAccounts[0].key;
      }

      amount.value = Logic.Common.route?.query?.amount?.toString() || "0";
    };

    const goToAddAccount = () => {
      const currencyCountryCode = withdrawalAvailableCurrencies?.find(
        (currency) => currency.code === selectedCurrency.value
      )?.country_code;
      if (accountType.value == "bank_account") {
        Logic.Common.GoToRoute(
          `/banks/add?amount=${parseFloat(amount.value)}&currency=${
            selectedCurrency.value
          }&country_code=${currencyCountryCode}&channel_id=${channelId.value}`
        );
      } else if (accountType.value == "mobile_money") {
        Logic.Common.GoToRoute(
          `/mobile-money/add?amount=${parseFloat(amount.value)}&currency=${
            selectedCurrency.value
          }&country_code=${currencyCountryCode}&channel_id=${channelId.value}`
        );
      } else if (accountType.value == "crypto_currency") {
        Logic.Common.GoToRoute(
          `/crypto-wallet/add?amount=${parseFloat(amount.value)}&currency=${
            selectedCurrency.value
          }&country_code=${currencyCountryCode}&channel_id=${channelId.value}`
        );
      }
    };

    const continueToNext = async () => {
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

      if (selectedAccount.value) {
        const currencyFromRoute =
          Logic.Common.route?.query?.currency?.toString() || "USD";

        const amountFromRoute =
          Logic.Common.route?.query?.amount?.toString() || "0";

        if (yellowCardCurrencies.includes(currencyFromRoute)) {
          if (loadingState.value) {
            return;
          }

          Logic.Wallet.InitiateWithdrawalForm = {
            amount: parseFloat(amountFromRoute),
            saved_account_uuid: selectedAccount.value,
            withdrawal_currency: currencyFromRoute,
          };

          loadingState.value = true;

          try {
            Logic.Common.showLoader({ show: true, loading: true });
            await Logic.Wallet.InitiateWithdrawal();
            Logic.Common.hideLoader();
            const offramp = Logic.Wallet.CurrentOfframp;
            if (offramp) {
              Logic.Common.GoToRoute(
                `/withdraw/confirm?amount=${amountFromRoute}&currency=${currencyFromRoute}&channel_id=${channelId.value}&offramp_uuid=${offramp?.uuid}`
              );
            }
          } catch (error) {
            console.error("Error initiating withdrawal:", error);
          } finally {
            Logic.Common.hideLoader();
            loadingState.value = false;
          }
        } else if (bridgeCurrencies.includes(currencyFromRoute)) {
          const selectedSavedBank = allAccounts.find(
            (item) => item.key == selectedAccount.value
          );

          const selectedData = {
            account_type: accountType,
            saved_account_uuid: selectedAccount.value,
            ...selectedSavedBank?.data,
          };

          localStorage.setItem(
            "temp_payment_data",
            JSON.stringify(selectedData)
          );

          Logic.Common.GoToRoute(
            `/withdraw/confirm?amount=${amountFromRoute}&currency=${currencyFromRoute}&channel_id=${channelId.value}&offramp_uuid=`
          );
        }
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
      getBottomPadding,
    };
  },
});
</script>
