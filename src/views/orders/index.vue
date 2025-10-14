<template>
  <app-wrapper mobilePadding="!pt-0">
    <default-page-layout :title="'Orders'" :photoUrl="Logic.Auth.GetDefaultBusiness()?.logo || '/images/profile-image.svg'
      ">
      <template #extra-top-section>
        <div class="w-full flex flex-col pt-4">
          <app-tabs :tabs="orderTab" v-model:activeTab="activeTab"
            tabsClass="!w-full flex border-[1.5px] !border-veryLightGray rounded-full"
            tabClass="!flex-1 text-center border-none !mr-0 py-3" customClass="!overflow-x-hidden" type="badge" />
        </div>
      </template>

      <div class="w-full flex flex-col items-center justify-start !space-y-[20px]">
        <!-- Loading State -->
        <div v-if="isLoading" class="w-full flex flex-col items-center py-8">
          <app-normal-text class="!text-center !text-gray-500">
            Loading orders...
          </app-normal-text>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="w-full flex flex-col items-center py-8">
          <app-normal-text class="!text-center !text-red-500">
            {{ error }}
          </app-normal-text>
          <button @click="loadOrders" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg">
            Retry
          </button>
        </div>

        <!-- Orders List -->
        <div v-else class="w-full flex flex-col px-4">
          <div v-for="(order, index) in currentOrders" :key="order.uuid || index"
            class="w-full flex flex-row items-center pt-4 pb-4 !border-b-[1.5px] !border-[#F0F3F6] cursor-pointer"
            @click="goToOrder(order.uuid)">
            <div class="w-[48px] mr-3">
              <div class="w-[48px]">
                <app-icon :name="`order-${getOrderStatus(order.status)}`" custom-class="!h-[48px]" />
              </div>
            </div>

            <div class="w-full flex flex-col">
              <app-normal-text class="!text-left !text-black !font-[500] !text-sm mb-[3px]">
                {{ formatOrderTitle(order) }}
              </app-normal-text>

              <div class="w-full flex flex-row items-center">
                <app-normal-text class="!text-left !text-[#616161]">
                  {{ getOrderTypeLabel(order) }}
                </app-normal-text>

                <div class="h-[4px] w-[4px] rounded-full mx-[6px]" :style="`background-color: ${colorByStatus(
                  getOrderStatus(order.status)
                )} !important;`"></div>
                <app-normal-text class="!text-left"
                  :style="`color: ${colorByStatus(getOrderStatus(order.status))} !important;`">
                  {{ getOrderStatusLabel(order.status) }}
                </app-normal-text>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="currentOrders.length === 0" class="w-full flex flex-col items-center py-8">
            <app-normal-text class="!text-center !text-gray-500">
              No {{ getEmptyStateText() }} found
            </app-normal-text>
          </div>
        </div>
      </div>
    </default-page-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted, watch, nextTick } from "vue";
import {
  DefaultPageLayout,
  AppTabs,
  AppIcon,
  AppNormalText,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { User, ExchangeOrder } from "@greep/logic/src/gql/graphql";
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
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    // Only P2P order tabs
    const orderTab = computed(() => {
      return [
        {
          key: "active",
          label: "Active",
        },
        {
          key: "history",
          label: "History",
        },
      ];
    });

    const colorByStatus = (status: "success" | "failed" | "pending") => {
      if (status === "success") {
        return "#10BB76";
      } else if (status === "failed") {
        return "#FA1919";
      } else {
        return "#FFAA1F";
      }
    };

    // Load P2P orders from GraphQL
    const loadOrders = async () => {
      try {
        isLoading.value = true;
        error.value = null;

        // Load P2P orders for all business types
        await Logic.Wallet.GetP2pOrders(1, 50);

        // Force a reactive update by triggering the computed property
        await nextTick();

        // Force a manual trigger to ensure UI updates
        updateTrigger.value++;

      } catch (err) {
        error.value = "Failed to load orders. Please try again.";
        console.error("Error loading orders:", err);
      } finally {
        isLoading.value = false;
      }
    };

    // Check for expired orders and update status
    // const checkExpiredOrders = () => {
    //   const orders = Logic.Wallet.ManyP2pOrders?.data || [];
    //   const now = new Date();

    //   orders.forEach((order) => {
    //     if (order.status?.toLowerCase() === 'pending' && order.expired_at) {
    //       const expiredAt = new Date(order.expired_at);
    //       if (now > expiredAt) {
    //         // Order has expired - should be marked as failed/cancelled
    //         console.log(`Order ${order.uuid} has expired and should be marked as failed`);
    //         // This would typically trigger a backend call to update the order status
    //         // For now, we'll just log it
    //       }
    //     }
    //   });
    // };

    // Format order title
    const formatOrderTitle = (order: any) => {
      // P2P order logic
      if (!order.ad) return "Unknown Order";

      const fromCurrency = order.ad.from_currency;
      const toCurrency = order.ad.to_currency;
      const amount = order.amount;
      const expectedAmount = order.expected_amount;

      return `${amount} ${fromCurrency} to ${expectedAmount} ${toCurrency}`;
    };

    // Get order type label
    const getOrderTypeLabel = (order: any) => {
      return "P2P Trade";
    };

    // Get order status for UI
    const getOrderStatus = (status: string) => {
      switch (status?.toLowerCase()) {
        case "completed":
        case "delivered":
          return "success";
        case "cancelled":
        case "failed":
          return "failed";
        case "pending":
        case "processing":
        case "confirmed":
        default:
          return "pending";
      }
    };

    // Get order status label
    const getOrderStatusLabel = (status: string) => {
      switch (status?.toLowerCase()) {
        case "completed":
          return "Completed";
        case "delivered":
          return "Delivered";
        case "confirmed":
          return "Confirmed";
        case "cancelled":
          return "Cancelled";
        case "failed":
          return "Failed";
        case "processing":
          return "Processing";
        case "pending":
        default:
          return "Pending";
      }
    };

    // Get empty state text based on active tab
    const getEmptyStateText = () => {
      return activeTab.value === "active" ? "active orders" : "completed orders";
    };

    // Navigate to order details
    const goToOrder = (uuid: string) => {
      if (uuid) {
        // Always navigate to P2P order details
        Logic.Common.GoToRoute(`/orders/${uuid}`);
      }
    };

    // Create a reactive trigger for forcing updates
    const updateTrigger = ref(0);

    // Computed for current orders with immediate reactivity
    const currentOrders = computed(() => {
      // Use the trigger to force re-computation
      updateTrigger.value;

      // Only P2P orders
      const orders = Logic.Wallet.ManyP2pOrders?.data || [];
      console.log('P2P orders data updated:', orders.length, 'orders');

      // Sort orders by created_at descending (recent first)
      const sortedOrders = [...orders].sort((a: any, b: any) => {
        const dateA = new Date(b.createdAt || b.created_at || b.updatedAt || b.updated_at);
        const dateB = new Date(a.createdAt || a.created_at || a.updatedAt || a.updated_at);
        return dateA.getTime() - dateB.getTime();
      });

      // Filter based on tab
      if (activeTab.value === "active") {
        const activeOrders = sortedOrders.filter((order: any) => {
          const status = order.status?.toLowerCase() || "";
          return ["pending", "processing", "confirmed"].includes(status);
        });
        console.log('Active orders:', activeOrders.length);
        return activeOrders;
      } else {
        const historyOrders = sortedOrders.filter((order: any) => {
          const status = order.status?.toLowerCase() || "";
          return ["completed", "cancelled", "failed", "delivered"].includes(status);
        });
        console.log('History orders:', historyOrders.length);
        return historyOrders;
      }
    });

    // Load orders on mount and when tab changes
    onMounted(() => {
      loadOrders();
      // Check for expired orders every minute
      // setInterval(checkExpiredOrders, 60000);
    });

    // Watch for tab changes
    watch(activeTab, () => {
      loadOrders();
    });

    // Watch for changes in the P2P orders data to trigger re-computation
    watch(() => Logic.Wallet.ManyP2pOrders, () => {
      updateTrigger.value++; // Force reactive update
    }, { deep: true, immediate: true });

    return {
      Logic,
      AuthUser,
      orderTab,
      activeTab,
      isLoading,
      error,
      currentOrders,
      colorByStatus,
      loadOrders,
      goToOrder,
      formatOrderTitle,
      getOrderTypeLabel,
      getOrderStatus,
      getOrderStatusLabel,
      getEmptyStateText,
      updateTrigger,
    };
  },
});
</script>
<style scoped></style>
