<template>
  <app-wrapper mobilePadding="!pt-0">
    <default-page-layout
      :title="'Orders'"
      :photoUrl="
        AuthUser?.profile?.business?.logo || '/images/profile-image.svg'
      "
    >
      <template #extra-top-section>
        <div class="w-full flex flex-col pt-4">
          <app-tabs
            :tabs="orderTab"
            v-model:activeTab="activeTab"
            tabsClass="!w-full flex border-[1.5px] !border-veryLightGray rounded-full"
            tabClass="!flex-1 text-center border-none !mr-0 py-3"
            customClass="!overflow-x-hidden"
            type="badge"
          />
        </div>
      </template>

      <div
        class="w-full flex flex-col items-center justify-start !space-y-[20px]"
      >
        <div class="w-full flex flex-col px-4">
          <div
            v-for="(item, index) in currentOrders"
            :key="index"
            class="w-full flex flex-row items-center pt-4 pb-4 !border-b-[1.5px] !border-[#F0F3F6]"
            @click="Logic.Common.GoToRoute('/orders/1')"
          >
            <div class="w-[48px] mr-3">
              <div class="w-[48px]">
                <app-icon
                  :name="`order-${item.status}`"
                  custom-class="!h-[48px]"
                />
              </div>
            </div>

            <div class="w-full flex flex-col">
              <app-normal-text
                class="!text-left !text-black !font-[500] !text-sm mb-[3px]"
              >
                {{ item.name }}
              </app-normal-text>

              <div class="w-full flex flex-row items-center">
                <app-normal-text class="!text-left !text-[#616161]">
                  {{ item.type_label }}
                </app-normal-text>

                <div
                  class="h-[4px] w-[4px] rounded-full mx-[6px]"
                  :style="`background-color: ${colorByStatus(
                    item.status
                  )} !important;`"
                ></div>
                <app-normal-text
                  class="!text-left"
                  :style="`color: ${colorByStatus(item.status)} !important;`"
                >
                  {{ item.type_status }}
                </app-normal-text>
              </div>
            </div>
          </div>
        </div>
      </div>
    </default-page-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import {
  DefaultPageLayout,
  AppTabs,
  AppIcon,
  AppNormalText,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { User } from "@greep/logic/src/gql/graphql";
import { computed } from "vue";

export default defineComponent({
  name: "OrderIndexPage",
  components: {
    DefaultPageLayout,
    AppTabs,
    AppIcon,
    AppNormalText,
  },
  layout: "Dashboard",
  middlewares: {
    fetchRules: [],
  },
  setup() {
    const AuthUser = ref<User>(Logic.Auth.AuthUser);

    const activeTab = ref("active");

    const orderTab = reactive([
      {
        key: "active",
        label: "Active",
      },
      {
        key: "history",
        label: "History",
      },
    ]);

    const orders = reactive<
      {
        name: string;
        type_label: string;
        type_status: string;
        status: "success" | "failed" | "pending";
      }[]
    >([
      {
        name: "80 USDC to ₺3240",
        status: "success",
        type_label: "Trade",
        type_status: "Completed",
      },
      {
        name: "100 USDC to ₺3000",
        status: "pending",
        type_label: "Withdrawal",
        type_status: "Pending",
      },
      {
        name: "50 USDC to Wallet",
        status: "success",
        type_label: "Transfer",
        type_status: "Completed",
      },
      {
        name: "₺1500 Deposit",
        status: "success",
        type_label: "Deposit",
        type_status: "Completed",
      },
      {
        name: "200 USDC to ₺600",
        status: "failed",
        type_label: "Trade",
        type_status: "Failed",
      },
      {
        name: "₺500 Withdrawal",
        status: "pending",
        type_label: "Withdrawal",
        type_status: "Pending",
      },
      {
        name: "1 USDC to Cold Storage",
        status: "success",
        type_label: "Transfer",
        type_status: "Completed",
      },
      {
        name: "₺2000 Deposit",
        status: "success",
        type_label: "Deposit",
        type_status: "Completed",
      },
      {
        name: "100 USDC to ₺300",
        status: "success",
        type_label: "Trade",
        type_status: "Completed",
      },
    ]);

    const colorByStatus = (status: "success" | "failed" | "pending") => {
      if (status === "success") {
        return "#10BB76";
      } else if (status === "failed") {
        return "#FA1919";
      } else {
        return "#FFAA1F";
      }
    };

    const currentOrders = computed(() => {
      if (activeTab.value == "active") {
        return orders.filter((item) => item.status == "pending");
      } else {
        return orders.filter((item) => item.status != "pending");
      }
    });

    return {
      Logic,
      AuthUser,
      orderTab,
      activeTab,
      orders,
      currentOrders,
      colorByStatus,
    };
  },
});
</script>
<style scoped></style>
