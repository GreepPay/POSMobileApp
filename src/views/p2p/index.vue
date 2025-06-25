<template>
  <app-wrapper mobilePadding="!pt-0">
    <default-page-layout
      :title="'Exchange Ads'"
      :photoUrl="
        AuthUser?.profile?.business?.logo || '/images/profile-image.svg'
      "
    >
      <div
        class="w-full flex flex-col items-center h-[80%] justify-start !space-y-[20px]"
      >
        <template v-if="p2pAdverts.length == 0">
          <div class="h-full flex flex-col items-center justify-center">
            <app-empty-state
              icon="empty-ads"
              title="Create Exchange Ads For P2P"
              description="Sell currencies at your own exchange rates, set limits, and give customers the option to pick cash or transfer."
              class="!border-none"
              :buttonData="{
                label: 'Create Ad',
                action: () => {
                  Logic.Common.GoToRoute('/p2p/ads/add');
                },
              }"
            />
          </div>
        </template>
        <template v-else>
          <div class="flex flex-col w-full px-4 pt-2 !pb-[100px]">
            <div
              class="w-full px-4 flex flex-row space-x-1 items-center border-[1.5px] border-primary py-3 rounded-[12px]"
              @click="Logic.Common.GoToRoute('/p2p/ads/add')"
            >
              <app-icon name="add-green" custom-class="!h-[24px]" />
              <app-normal-text class="!text-primary !font-[500]">
                Create new Ad
              </app-normal-text>
            </div>

            <div class="w-full flex flex-col pt-4">
              <div
                class="w-full flex flex-col mb-1"
                v-for="(item, index) in p2pAdverts"
                :key="index"
              >
                <app-exchange-ad
                  :item="item"
                  @click="
                    Logic.Common.GoToRoute(`/p2p/ads/add?uuid=${item.uuid}`)
                  "
                >
                </app-exchange-ad>
              </div>
            </div>
          </div>
        </template>
      </div>
    </default-page-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import {
  DefaultPageLayout,
  AppEmptyState,
  AppIcon,
  AppNormalText,
  AppExchangeAd,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { User } from "@greep/logic/src/gql/graphql";
import { onMounted } from "vue";
import { onIonViewWillEnter } from "@ionic/vue";
import { withdrawalAvailableCurrencies } from "../../composable";

export default defineComponent({
  name: "P2pIndexPage",
  components: {
    DefaultPageLayout,
    AppIcon,
    AppNormalText,
    AppEmptyState,
    AppExchangeAd,
  },
  layout: "Dashboard",
  middlewares: {
    fetchRules: [
      {
        domain: "Wallet",
        property: "ManyExchangeAds",
        method: "GetExchangeAds",
        params: [1, 10],
        requireAuth: true,
        ignoreProperty: false,
        silentUpdate: false,
      },
    ],
  },
  setup() {
    const AuthUser = ref<User>(Logic.Auth.AuthUser);
    const ManyExchangeAds = ref(Logic.Wallet.ManyExchangeAds);

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
        trader?: {
          name: string;
          photo_url: string;
          success_rate: string;
          no_of_trades: string;
        };
      }[]
    >([]);

    const setExchangeAd = () => {
      p2pAdverts.length = 0;

      ManyExchangeAds.value?.data?.forEach((item) => {
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
          });
        }
      });
    };

    onIonViewWillEnter(() => {
      setExchangeAd();
    });

    onMounted(() => {
      Logic.Wallet.watchProperty("ManyExchangeAds", ManyExchangeAds);
      setExchangeAd();
    });

    return {
      Logic,
      AuthUser,
      p2pAdverts,
    };
  },
});
</script>
<style scoped></style>
