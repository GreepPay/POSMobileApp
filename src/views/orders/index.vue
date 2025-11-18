<template>
  <app-wrapper mobilePadding="!pt-0">
    <default-page-layout
      :title="pageTitle"
      :photoUrl="
        Logic.Auth.GetDefaultBusiness()?.logo || '/images/profile-image.svg'
      "
    >
      <template #extra-top-section v-if="pageTitle == 'Orders'">
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
        <!-- Loading State -->
        <div v-if="isLoading" class="w-full flex flex-col px-4 pt-4">
          <app-skeleton-loader
            type="order"
            :numberOfLoaders="5"
            customClass="mb-4"
          />
        </div>

        <!-- Orders List -->
        <div v-else class="w-full flex flex-col px-4">
          <div
            v-for="(order, index) in currentOrders"
            :key="order.uuid || index"
            class="w-full mb-4 cursor-pointer"
            @click="goToOrder(order.data)"
          >
            <app-commerce-order-card :order="order" />
          </div>

          <!-- Empty State -->
          <div
            v-if="currentOrders.length === 0"
            class="w-full flex flex-col items-center py-8"
          >
            <app-normal-text class="!text-center !text-gray-500">
              No {{ getEmptyStateText() }} found
            </app-normal-text>
          </div>
        </div>

        <!-- Spacer -->
        <div class="h-[100px] py-8"></div>
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
import { User, ExchangeOrder, Order } from "@greep/logic/src/gql/graphql";
import { computed } from "vue";
import { getOrderDetails, goToOrder } from "../../composable/commerce";

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
        silentUpdate: true,
      },
      {
        domain: "Wallet",
        property: "CurrentGlobalExchangeRate",
        method: "GetGlobalExchangeRate",
        params: [],
        requireAuth: true,
        ignoreProperty: false,
        silentUpdate: true,
      },
    ],
  },
  setup() {
    const AuthUser = ref<User>(Logic.Auth.AuthUser);
    const ManyOrders = ref(Logic.Commerce.ManyOrders);
    const CurrentGlobalExchangeRate = ref(
      Logic.Wallet.CurrentGlobalExchangeRate
    );
    const activeTab = ref("active");
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    const pageTitle = computed(() => {
      let title = "Orders";

      if (Logic.Auth.GetDefaultBusiness()?.business_type === "event_host") {
        title = "Sales";
      }
      return title;
    });

    const currentOrders = reactive<
      {
        uuid: string;
        title: string;
        label: string;
        status: string;
        icon: string;
        statusColor: string;
        price: string;
        itemCount: string;
        data: Order;
      }[]
    >([]);

    const iconName = (order: Order) => {};

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

    // Load vendor/commerce orders
    const loadOrders = async () => {
      try {
        isLoading.value = true;
        error.value = null;

        await Logic.Commerce.GetOrders(1, 30, "CREATED_AT", "DESC", "", false);

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

    // Get empty state text based on active tab
    const getEmptyStateText = () => {
      if (pageTitle.value === "Sales") {
        return activeTab.value === "active"
          ? "active sales"
          : "completed sales";
      }
      return activeTab.value === "active"
        ? "active orders"
        : "completed orders";
    };

    // Create a reactive trigger for forcing updates
    const updateTrigger = ref(0);

    // Computed for current vendor orders with immediate reactivity
    const setCurrentOrder = () => {
      currentOrders.length = 0;
      // Use the trigger to force re-computation
      updateTrigger.value;

      // Only commerce/vendor orders
      const orders = Logic.Commerce.ManyOrders?.data || [];

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

      let finalOrders: Order[] = [];

      // Filter based on tab
      if (activeTab.value === "active") {
        finalOrders = sortedOrders.filter((order: any) => {
          const status = order.status?.toLowerCase() || "";
          return ["pending", "processing", "confirmed", "accepted"].includes(
            status
          );
        });
      } else {
        finalOrders = sortedOrders.filter((order: any) => {
          const status = order.status?.toLowerCase() || "";
          return ["completed", "cancelled", "failed", "delivered"].includes(
            status
          );
        });
      }

      // Populate currentOrders reactive array
      finalOrders.forEach((order: Order) => {
        const details = getOrderDetails(order);
        currentOrders.push(details);
      });
    };

    // Load orders on mount and when tab changes
    onMounted(() => {
      Logic.Commerce.watchProperty("ManyOrders", ManyOrders);
      Logic.Wallet.watchProperty(
        "CurrentGlobalExchangeRate",
        CurrentGlobalExchangeRate
      );
      setCurrentOrder();
    });

    // Watch for tab changes
    watch(activeTab, () => {
      loadOrders();
    });

    // Watch for changes in commerce orders data to trigger re-computation
    watch(
      ManyOrders,
      () => {
        updateTrigger.value++; // Force reactive update
        setCurrentOrder();
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
      updateTrigger,
      pageTitle,
      loadOrders,
      goToOrder,
      getEmptyStateText,
    };
  },
});
</script>
<style scoped></style>
