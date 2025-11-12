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
        <div v-if="isLoading" class="w-full flex flex-col px-4 pt-4">
          <app-skeleton-loader type="order" :numberOfLoaders="5" customClass="mb-4" />
        </div>

        <!-- Orders List -->
        <div v-else class="w-full flex flex-col px-4">
          <div v-for="(order, index) in currentOrders" :key="order.uuid || index" class="w-full mb-4 cursor-pointer"
            @click="goToOrder(order.uuid)">
            <app-commerce-order-card :order="{
              title: formatOrderTitle(order),
              label: formatOrderDate(order.createdAt),
              status: getOrderStatusLabel(order.status),
              icon: `commerce-order-${getOrderStatus(order.status)}`,
              statusColor: colorByStatus(getOrderStatus(order.status)),
              price: formatCurrency(order.totalAmount, order.currency),
              itemCount: getItemCount(order)
            }" />
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
import {
  defineComponent,
  reactive,
  ref,
  onMounted,
  watch,
  nextTick,
} from "vue";
import {
  DefaultPageLayout,
  AppTabs,
  AppIcon,
  AppNormalText,
  AppCommerceOrderCard,
  AppSkeletonLoader,
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
    AppCommerceOrderCard,
    AppSkeletonLoader,
  },
  layout: "Dashboard",
  middlewares: {
    fetchRules: [
      {
        domain: "Commerce",
        property: "ManyOrders",
        method: "GetOrders",
        params: [1, 50],
        requireAuth: true,
        ignoreProperty: false,
      },
    ],
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
        return "#FF7B3B";
      }
    };

    // Load vendor/commerce orders
    const loadOrders = async () => {
      try {
        isLoading.value = true;
        error.value = null;

        // Load commerce orders
        console.log("Loading commerce orders...");

        await Logic.Commerce.GetOrders(1, 50);

        console.log("Commerce orders loaded:", Logic.Commerce.ManyOrders?.data?.length);

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

    // Format order title - get product name from first sale's items
    const formatOrderTitle = (order: any) => {
      try {
        // Try to get product name from sales array
        if (order.sales && Array.isArray(order.sales) && order.sales.length > 0) {
          const firstSale = order.sales[0];

          if (firstSale.items) {
            let saleItems: any[] = [];

            // Parse items if it's a string
            if (typeof firstSale.items === 'string') {
              saleItems = JSON.parse(firstSale.items);
            } else if (Array.isArray(firstSale.items)) {
              saleItems = firstSale.items;
            }

            // Get first item's product name
            if (saleItems.length > 0) {
              const firstItem = saleItems[0];
              if (firstItem.name) {
                return firstItem.name;
              } else if (firstItem.product_name) {
                return firstItem.product_name;
              } else if (firstItem.productName) {
                return firstItem.productName;
              }
            }
          }
        }
      } catch (e) {
        console.error("Error in formatOrderTitle:", e);
      }

      // Fallback to order number
      if (order.orderNumber) {
        return `Order #${order.orderNumber}`;
      } else if (order.uuid) {
        return `Order #${order.uuid.slice(-8)}`;
      }
      return "Unknown Order";
    };

    // Get order type label
    const getOrderTypeLabel = (order: any) => {
      return "Vendor Order";
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
        case "accepted":
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
        case "accepted":
          return "Accepted";
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
      return activeTab.value === "active"
        ? "active orders"
        : "completed orders";
    };

    // Format order date
    const formatOrderDate = (dateString: string) => {
      if (!dateString) return "";
      try {
        const date = new Date(dateString);
        const month = date.toLocaleString('default', { month: 'short' });
        const day = date.getDate();
        const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        return `${month} ${day}, ${time}`;
      } catch (e) {
        return "";
      }
    };

    // Format currency
    const formatCurrency = (amount: number, currency: string) => {
      const currencySymbols: { [key: string]: string } = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'NGN': '₦',
        'KES': 'KSh',
        'ZAR': 'R',
      };
      const symbol = currencySymbols[currency] || currency;
      return `${symbol}${amount.toFixed(2)}`;
    };

    // Get item count from order
    const getItemCount = (order: any) => {
      try {
        let items: any[] = [];
        if (order.items && typeof order.items === 'string') {
          items = JSON.parse(order.items);
        } else if (Array.isArray(order.items)) {
          items = order.items;
        }
        const count = items.length;
        return count === 1 ? '1 item' : `${count} items`;
      } catch (e) {
        return 'Unknown';
      }
    };

    // Get background color by status
    const colorByStatusBg = (status: "success" | "failed" | "pending") => {
      if (status === "success") {
        return "#10BB76";
      } else if (status === "failed") {
        return "#FA1919";
      } else {
        return "#FFAA1F";
      }
    };

    // Navigate to order details
    const goToOrder = (uuid: string) => {
      console.log("Navigating to order:", uuid);
      if (uuid) {
        // Always navigate to P2P order details
        Logic.Common.GoToRoute(`/orders/${uuid}`);
      }
    };

    // Create a reactive trigger for forcing updates
    const updateTrigger = ref(0);

    // Computed for current vendor orders with immediate reactivity
    const currentOrders = computed(() => {
      // Use the trigger to force re-computation
      updateTrigger.value;

      // Only commerce/vendor orders
      const orders = Logic.Commerce.ManyOrders?.data || [];
      console.log("Commerce orders data updated:", orders.length, "orders");

      // Sort orders by created_at descending (recent first)
      const sortedOrders = [...orders].sort((a: any, b: any) => {
        const dateA = new Date(
          b.createdAt || b.created_at || b.updatedAt || b.updated_at
        );
        const dateB = new Date(
          a.createdAt || a.created_at || a.updatedAt || a.updated_at
        );
        return dateA.getTime() - dateB.getTime();
      });

      // Filter based on tab
      if (activeTab.value === "active") {
        const activeOrders = sortedOrders.filter((order: any) => {
          const status = order.status?.toLowerCase() || "";
          return ["pending", "processing", "confirmed", "accepted"].includes(
            status
          );
        });
        console.log("Active orders:", activeOrders.length);
        return activeOrders;
      } else {
        const historyOrders = sortedOrders.filter((order: any) => {
          const status = order.status?.toLowerCase() || "";
          return ["completed", "cancelled", "failed", "delivered"].includes(
            status
          );
        });
        console.log("History orders:", historyOrders.length);
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

    // Watch for changes in commerce orders data to trigger re-computation
    watch(
      () => Logic.Commerce.ManyOrders,
      () => {
        updateTrigger.value++; // Force reactive update
      },
      { deep: true, immediate: true }
    );

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
      formatOrderDate,
      formatCurrency,
      getItemCount,
      updateTrigger,
    };
  },
});
</script>
<style scoped></style>
