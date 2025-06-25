<template>
  <app-wrapper>
    <subpage-layout title="P2P Market">
      <div class="w-full flex flex-col items-center justify-start h-full pt-1">
        <!-- Filter -->
        <div
          class="w-full grid grid-cols-12 gap-3 px-4 pb-4 border-b-[1px] border-[#F0F3F6]"
        >
          <div class="flex flex-col col-span-6">
            <app-select
              :placeholder="'Method'"
              :hasTitle="false"
              :paddings="'py-4 !px-3'"
              :options="filterOptionForMethod"
              ref="method"
              v-model="selectedMethod"
            >
            </app-select>
          </div>
          <div class="flex flex-col col-span-6">
            <app-select
              :placeholder="'Method options'"
              :hasTitle="false"
              :paddings="'py-4 !px-3'"
              :options="filterPerMethod"
              ref="method"
              v-model="selectedFilterMethod"
            >
            </app-select>
          </div>
        </div>

        <!-- P2P ads -->
        <div class="w-full flex flex-col px-4">
          <template v-for="(item, index) in p2pAdverts" :key="index">
            <app-exchange-ad
              :item="item"
              @click="Logic.Common.GoToRoute('/chat/2')"
            >
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
import { defineComponent } from "vue";
import { AppSelect, AppExchangeAd } from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive } from "vue";
import { ref } from "vue";
import { SelectOption } from "@greep/ui-components/src/types";

export default defineComponent({
  name: "WithdrawP2PMarketPage",
  components: {
    AppSelect,
    AppExchangeAd,
  },
  setup() {
    const selectedMethod = ref<string>("cash");
    const selectedFilterMethod = ref("all");

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
      }[]
    >([
      {
        currency: {
          code: "TRY",
          symbol: "₺",
          name: "Lira (₺)",
        },
        rate_per_usd: 30.0,
        limit: {
          min: 100,
          max: 1000,
        },
        payout_options: ["Cash Delivery", "Cash Pick Up"],
        trader: {
          name: "Ali",
          photo_url: "https://i.pravatar.cc/150?img=1",
          success_rate: "95%",
          no_of_trades: "500",
        },
      },
      {
        currency: {
          code: "TRY",
          symbol: "₺",
          name: "Lira (₺)",
        },
        rate_per_usd: 30.5,
        limit: {
          min: 50,
          max: 500,
        },
        payout_options: ["Bank Transfer"],
        trader: {
          name: "Ayşe",
          photo_url: "https://i.pravatar.cc/150?img=2",
          success_rate: "98%",
          no_of_trades: "750",
        },
      },
      {
        currency: {
          code: "TRY",
          symbol: "₺",
          name: "Lira (₺)",
        },
        rate_per_usd: 29.8,
        limit: {
          min: 200,
          max: 2000,
        },
        payout_options: ["Cash Delivery"],
        trader: {
          name: "Mehmet",
          photo_url: "https://i.pravatar.cc/150?img=3",
          success_rate: "92%",
          no_of_trades: "300",
        },
      },
      {
        currency: {
          code: "TRY",
          symbol: "₺",
          name: "Lira (₺)",
        },
        rate_per_usd: 30.2,
        limit: {
          min: 75,
          max: 750,
        },
        payout_options: ["Cash Pick Up", "Bank Transfer"],
        trader: {
          name: "Fatma",
          photo_url: "https://i.pravatar.cc/150?img=4",
          success_rate: "99%",
          no_of_trades: "1000",
        },
      },
      {
        currency: {
          code: "TRY",
          symbol: "₺",
          name: "Lira (₺)",
        },
        rate_per_usd: 30.1,
        limit: {
          min: 150,
          max: 1500,
        },
        payout_options: ["Bank Transfer", "Cash Delivery"],
        trader: {
          name: "Mustafa",
          photo_url: "https://i.pravatar.cc/150?img=5",
          success_rate: "96%",
          no_of_trades: "600",
        },
      },
      {
        currency: {
          code: "TRY",
          symbol: "₺",
          name: "Lira (₺)",
        },
        rate_per_usd: 30.3,
        limit: {
          min: 125,
          max: 1250,
        },
        payout_options: ["Cash Pick Up"],
        trader: {
          name: "Zeynep",
          photo_url: "https://i.pravatar.cc/150?img=6",
          success_rate: "97%",
          no_of_trades: "800",
        },
      },
    ]);

    const continueToNext = () => {
      const amountFromRoute =
        Logic.Common.route?.query?.amount?.toString() || "0";
      const currencyFromRoute = Logic.Common.route?.query?.currency || "USD";

      Logic.Common.GoToRoute(
        "/withdraw/saved-accounts?method=" +
          selectedMethod.value +
          "&amount=" +
          amountFromRoute +
          "&currency=" +
          currencyFromRoute
      );
    };

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
