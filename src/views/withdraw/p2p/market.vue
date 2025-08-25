<template>
  <app-wrapper>
    <subpage-layout title="P2P Market">
      <div class="w-full flex flex-col items-center justify-start h-full pt-1">
        <!-- Filter -->
        <div class="w-full grid grid-cols-12 gap-3 px-4 pb-4 border-b-[1px] border-[#F0F3F6]">
          <div class="flex flex-col col-span-6">
            <app-select :placeholder="'Method'" :hasTitle="false" :paddings="'py-4 !px-3'"
              :options="filterOptionForMethod" ref="method" v-model="selectedMethod">
            </app-select>
          </div>
          <div class="flex flex-col col-span-6">
            <app-select :placeholder="'Method options'" :hasTitle="false" :paddings="'py-4 !px-3'"
              :options="filterPerMethod" ref="method" v-model="selectedFilterMethod">
            </app-select>
          </div>
        </div>

        <!-- P2P ads -->
        <div class="w-full flex flex-col px-4 mt-4">
          <template v-for="(item, index) in p2pAdverts" :key="index">
            <app-exchange-ad :item="item" @click="continueToNext(item.data)">
            </app-exchange-ad>
          </template>
          <!-- Spacer -->
          <div class="!h-[50px] pt-5"></div>
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, watch } from "vue";
import { AppSelect, AppExchangeAd } from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive } from "vue";
import { ref } from "vue";
import { SelectOption } from "@greep/ui-components/src/types";
import { onMounted } from "vue";
import { withdrawalAvailableCurrencies } from "../../../composable";
import { onIonViewWillEnter } from "@ionic/vue";
import { ExchangeAd } from "@greep/logic/src/gql/graphql";

export default defineComponent({
  name: "WithdrawP2PMarketPage",
  components: {
    AppSelect,
    AppExchangeAd,
  },
  middlewares: {
    fetchRules: [
      {
        domain: "Wallet",
        property: "ManyRecommendedExchangeAds",
        method: "GetRecommendedExchangeAds",
        params: [1, 10],
        requireAuth: true,
        ignoreProperty: false,
        silentUpdate: true,
      },
    ],
  },
  setup() {
    // Auto-select method from query parameter
    const methodFromRoute = Logic.Common.route?.query?.method?.toString() || "cash";
    const selectedMethod = ref<string>(methodFromRoute);
    const selectedFilterMethod = ref("all");
    const ManyRecommendedExchangeAds = ref(
      Logic.Wallet.ManyRecommendedExchangeAds
    );

    const filterOptionForMethod = reactive<SelectOption[]>([
      {
        key: "all",
        value: "All",
        extraInfo: "",
      },
      {
        key: "cash",
        value: "Cash",
        extraInfo: "",
      },
      {
        key: "transfer",
        value: "Transfer",
        extraInfo: "",
      },
    ]);

    const filterPerMethod = reactive<SelectOption[]>([
      {
        key: "all",
        value: "All",
        extraInfo: "",
      },
      {
        key: "pickup",
        value: "Cash Pick Up",
        extraInfo: "",
      },
      {
        key: "delivery",
        value: "Cash Delivery",
        extraInfo: "",
      },
    ]);

    const p2pAdverts = reactive<
      {
        uuid: string;
        currency: {
          code: string;
          symbol: string;
          name: string;
        };
        rate_per_usd: number;
        limit: {
          min: number;
          max: number;
        };
        payout_options: string[];
        trader: {
          name: string;
          photo_url: string;
          success_rate: string;
          no_of_trades: string;
        };
        data: ExchangeAd
      }[]
    >([]);

    const setP2Pads = () => {
      p2pAdverts.length = 0;

      ManyRecommendedExchangeAds.value?.data?.forEach((item) => {
        if (item.business) {
          const currencyFrom = withdrawalAvailableCurrencies.find(
            (currency) => currency.code == item.from_currency
          );

          const payoutOptions = JSON.parse(item.payout_banks || "[]")[0];

          const payoutAllowed = [];

          if (payoutOptions.bank_transfer) {
            payoutAllowed.push("Bank Transfer");
          }

          if (payoutOptions.cash_delivery) {
            payoutAllowed.push("Cash Delivery");
          }

          if (payoutOptions.cash_pickup) {
            payoutAllowed.push("Cash Pickup");
          }

          if (currencyFrom) {
            p2pAdverts.push({
              uuid: item.uuid,
              currency: {
                code: currencyFrom.code,
                symbol: currencyFrom.symbol,
                name: currencyFrom.name,
              },
              rate_per_usd: item.rate,
              limit: {
                min: item.min_amount,
                max: item.max_amount,
              },
              payout_options: payoutAllowed,
              trader: {
                name: item.business?.business_name || "",
                no_of_trades: "0",
                photo_url: item.business?.logo || "",
                success_rate: "100%",
              },
              data: item,
            });
          }
        }

      });
    };

    const continueToNext = async (exchangeAd: ExchangeAd) => {
      const amountFromRoute =
        Logic.Common.route?.query?.amount?.toString() || "0";
      const currencyFromRoute = Logic.Common.route?.query?.currency || "USD";

      Logic.Messaging.InitiateConversationForm = {
        input: {
          entity_type: "p2p_withdrawal",
          entity_uuid: exchangeAd.uuid,
          name: "P2P Trade Chat",
          extras: JSON.stringify({
            amount: amountFromRoute,
            currency: currencyFromRoute,
            method: selectedMethod.value,
          }),
        },
      };

      try {
        Logic.Common.showLoader(
          { show: true, loading: true }
        );

        const conversation = await Logic.Messaging.InitiateConversation();

        if (conversation) {
          Logic.Common.showLoader({ show: false });
          Logic.Common.GoToRoute(
            "/chat/" + conversation.uuid + "?p2p=true&method=" + selectedMethod.value
          );
          return;
        }

      } catch (e) {
        //
      } finally {
        Logic.Common.showLoader({ show: false });
      }

    };

    onIonViewWillEnter(() => {
      setP2Pads();
    });

    watch(ManyRecommendedExchangeAds, () => {
      setP2Pads();
    });

    onMounted(() => {
      Logic.Wallet.watchProperty(
        "ManyRecommendedExchangeAds",
        ManyRecommendedExchangeAds
      );
    });

    return {
      Logic,
      selectedMethod,
      continueToNext,
      filterOptionForMethod,
      filterPerMethod,
      selectedFilterMethod,
      p2pAdverts,
    };
  },
});
</script>
