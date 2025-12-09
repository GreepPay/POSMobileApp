<template>
  <app-wrapper>
    <subpage-layout title="Order Details" :hasBottomButton="true">
      <!-- Loading State -->
      <div v-if="isLoading" class="w-full flex flex-col pt-4">
        <app-skeleton-loader type="order-details" />
      </div>

      <!-- Order Details -->
      <div
        v-else-if="SingleOrder"
        class="w-full flex flex-col justify-start pt-1"
      >
        <!-- Order Header -->

        <div class="w-full flex flex-col px-4">
          <app-image-loader
            class="w-full h-fit rounded-[12px] flex flex-col overflow-x-hidden overflow-y-hidden justify-center items-center px-4 py-5 !bg-[linear-gradient(to_bottom,#10BB76,#00683F)] relative"
            photo-url=""
          >
            <img
              class="absolute top-0 left-0 w-full"
              src="/images/greep-transparent-logo.svg"
            />

            <div
              class="w-full flex flex-row items-center justify-between z-10 space-x-1"
            >
              <app-normal-text class="!text-white !whitespace-nowrap">
                Order Number
              </app-normal-text>

              <app-normal-text class="!text-white !font-semibold !uppercase">
                #{{
                  String(SingleOrder.orderNumber || SingleOrder.id).padStart(
                    6,
                    "0"
                  )
                }}
              </app-normal-text>
            </div>
          </app-image-loader>
        </div>

        <!-- Market Delivery Chat Section -->
        <div
          v-if="SingleOrder?.conversation"
          class="w-full flex flex-row items-center mt-4 py-4 px-4 !border-t-[12px] !border-b-[12px] border-[#F0F3F6] cursor-pointer"
          @click="goToChat"
        >
          <div class="w-[48px] mr-3">
            <div class="w-[48px]">
              <app-image-loader
                :photoUrl="'/images/chat-logo.png'"
                class="h-[48px] w-[48px] rounded-full"
              />
            </div>
          </div>
          <div class="w-full flex flex-col">
            <div class="flex flex-row justify-between items-start space-x-2">
              <app-normal-text
                class="!text-left !font-medium !line-clamp-1 !text-[12.5px]"
              >
                {{ SingleOrder?.conversation?.name || "Chat with Merchant" }}
              </app-normal-text>

              <app-normal-text
                class="!text-[10px] !text-gray-400 whitespace-nowrap"
              >
                {{
                  Logic.Common.fomartDate(
                    SingleOrder?.updatedAt || "",
                    "HH:mm A"
                  )
                }}
              </app-normal-text>
            </div>
            <div class="w-full flex flex-row items-center justify-between">
              <app-normal-text class="!text-left !text-gray-500 !line-clamp-1">
                {{
                  (SingleOrder?.conversation?.participants?.length || 0) > 2
                    ? "Greep AI, Customer, You"
                    : "Customer, You"
                }}
              </app-normal-text>

              <div
                class="h-[24px] w-[24px] rounded-full flex items-center justify-center"
                style="
                  background: linear-gradient(
                    269.64deg,
                    #0d965e 0.31%,
                    #00683f 89.75%
                  );
                "
              >
                <app-normal-text class="!text-white"> 1 </app-normal-text>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs using AppTabs Component -->
        <!-- <div class="w-full flex flex-col px-4 mt-4">
          <app-tabs
            :tabs="orderTabs"
            v-model:activeTab="activeTab"
            tabsClass="!w-full flex border-[1.5px] !border-veryLightGray rounded-full"
            tabClass="!flex-1 text-center border-none !mr-0 py-3"
            customClass="!overflow-x-hidden"
            type="badge"
          />
        </div> -->

        <!-- Info Tab Content -->
        <div
          v-if="activeTab === 'info'"
          class="w-full flex flex-col px-4 mt-4 pb-48"
        >
          <!-- Product Section - Grouped Card -->
          <div
            class="w-full bg-white border border-[#F0F0F0] rounded-[12px] mb-4 overflow-hidden"
          >
            <!-- Product Header Row -->
            <div
              class="w-full flex flex-row items-center justify-between px-4 py-3 bg-[#F9F9F9] border-b border-[#F0F0F0]"
            >
              <app-normal-text class="!text-[#999999] !font-[400]">
                Product
              </app-normal-text>
              <div class="flex gap-12">
                <app-normal-text class="!text-[#999999] !font-[400]">
                  Qty
                </app-normal-text>
                <app-normal-text class="!text-[#999999] !font-[400]">
                  Total Price
                </app-normal-text>
              </div>
            </div>

            <!-- Product Items Loop -->
            <div
              v-for="(product, index) in getProducts(SingleOrder)"
              :key="index"
              class="w-full flex flex-row items-center px-3 py-3 border-b border-[#F0F0F0]"
              :class="{
                'border-b-0': index === getProducts(SingleOrder).length - 1,
              }"
            >
              <!-- Product Image -->
              <div
                class="w-12 h-12 mr-3 flex-shrink-0 bg-gray-200 rounded-[8px] overflow-hidden"
              >
                <app-image-loader
                  :photoUrl="getProductImageByIndex(SingleOrder, index)"
                  class="w-full h-full"
                />
              </div>

              <!-- Product Name -->
              <div class="flex-1">
                <app-normal-text class="!text-black !font-[600] !text-[13px]">
                  {{ getProductNameByIndex(SingleOrder, index) }}
                </app-normal-text>
              </div>

              <!-- Qty and Price -->
              <div class="flex items-center gap-12">
                <app-normal-text class="!text-black !font-[600] !text-[12px]">
                  x{{ getProductQtyByIndex(SingleOrder, index) }}
                </app-normal-text>
                <app-normal-text class="!text-black !font-[600] !text-[13px]">
                  {{
                    formatCurrency(
                      getProductPriceByIndex(SingleOrder, index),
                      SingleOrder.currency
                    )
                  }}
                </app-normal-text>
              </div>
            </div>
          </div>

          <div
            class="w-full flex flex-col mb-4"
            v-if="
              SingleOrder?.deliverymethod == 'pick_up' &&
              SingleOrder?.deliveryAddress
            "
          >
            <div class="w-full flex flex-col items-start justify-start pb-2">
              <app-normal-text class="!text-[12.5px] !text-gray-600">
                Pickup Address
              </app-normal-text>
            </div>
            <div
              :class="`flex flex-row items-center px-3 py-3 border-[1.5px] border-[#F0F3F6] rounded-[12px]  `"
            >
              <div class="w-[50px] mr-2">
                <app-icon name="delivery-location" customClass="h-[48px]" />
              </div>

              <div class="w-full flex flex-col">
                <app-normal-text class="!font-semibold !text-left mb-1">
                  {{ SingleOrder?.deliveryAddress?.name }}
                </app-normal-text>
                <app-normal-text class="!text-gray-500 !text-left">
                  {{ SingleOrder?.deliveryAddress?.description }}.
                  <a
                    class="!underline"
                    target="_blank"
                    :href="SingleOrder?.deliveryAddress?.google_map_link || ''"
                    >See on map</a
                  >
                </app-normal-text>
              </div>
            </div>
          </div>

          <!-- Time Ordered + Order Status - Grouped Card -->
          <div
            class="w-full bg-white border border-[#F0F0F0] rounded-[12px] mb-4 overflow-hidden"
          >
            <!-- Time Ordered -->
            <div
              class="w-full flex flex-row justify-between items-center px-4 py-4 border-b border-[#F0F0F0]"
            >
              <app-normal-text class="!text-[#999999] !font-[400]">
                Time Ordered
              </app-normal-text>
              <app-normal-text class="!text-black !font-[500]">
                {{ formatFullDate(SingleOrder.createdAt) }}
              </app-normal-text>
            </div>

            <!-- Order Status -->
            <div
              class="w-full flex flex-row justify-between items-center px-4 py-4"
            >
              <app-normal-text class="!text-[#999999] !font-[400]">
                Order Status
              </app-normal-text>
              <div class="flex items-center gap-2">
                <app-normal-text
                  class="!font-[500]"
                  :style="`color: ${getStatusColor(SingleOrder.status)}`"
                >
                  {{ getStatusLabel(SingleOrder.status) }}
                </app-normal-text>
                <div
                  class="!w-[8px] !h-[8px] rounded-full"
                  :style="`background-color: ${getStatusColor(
                    SingleOrder.status
                  )}`"
                ></div>
              </div>
            </div>
          </div>

          <!-- Customer - Single Card -->
          <div
            class="w-full flex flex-row justify-between items-center px-4 py-4 bg-white border border-[#F0F0F0] rounded-[12px] mb-4"
          >
            <app-normal-text class="!text-[#999999] !font-[400]">
              Customer
            </app-normal-text>
            <app-normal-text class="!text-black !font-[400]">
              {{ getCustomerName(SingleOrder) }}
            </app-normal-text>
          </div>

          <!-- Delivery Rider + Rider Contact - Grouped Card -->
          <div
            class="w-full bg-white border border-[#F0F0F0] rounded-[12px] overflow-hidden"
          >
            <!-- Delivery Rider -->
            <div
              class="w-full flex flex-row justify-between items-center px-4 py-4 border-b border-[#F0F0F0]"
            >
              <app-normal-text class="!text-[#999999] !font-[400]">
                Delivery Rider
              </app-normal-text>
              <app-normal-text class="!text-black !font-[500]">
                Not Specified
              </app-normal-text>
            </div>

            <!-- Rider Contact -->
            <div
              class="w-full flex flex-row justify-between items-center px-4 py-4"
            >
              <app-normal-text class="!text-[#999999] !font-[400]">
                Rider Contact
              </app-normal-text>
              <app-normal-text class="!text-black !font-[500]">
                Not Specified
              </app-normal-text>
            </div>
          </div>
        </div>

        <!-- Tracking Tab Content -->
        <div
          v-if="activeTab === 'tracking'"
          class="w-full flex flex-col px-4 mt-4 pb-48"
        >
          <!-- Timeline Container -->
          <div class="w-full flex flex-col">
            <!-- Order Received - Active -->
            <div class="w-full flex flex-row mb-6">
              <!-- Timeline Circle and Line -->
              <div class="flex-shrink-0 mr-4">
                <app-icon name="tracking-success" customClass="w-8 h-8" />
              </div>

              <!-- Content -->
              <div class="flex-1">
                <div
                  class="w-full flex flex-row justify-between items-start mb-1"
                >
                  <app-normal-text
                    class="!text-[#10BB76] !font-[600] !text-base"
                  >
                    Order Received
                  </app-normal-text>
                  <app-normal-text class="!text-[#999999] !text-sm">
                    Mar 12, 13:55
                  </app-normal-text>
                </div>
                <app-normal-text class="!text-[#999999] !text-sm">
                  Awaiting your confirmation
                </app-normal-text>
              </div>
            </div>

            <!-- Order Confirmed - Inactive -->
            <div class="w-full flex flex-row mb-6 relative">
              <!-- Timeline Circle and Line -->
              <div class="flex-shrink-0 mr-4 relative z-10">
                <app-icon name="tracking-pending" customClass="w-8 h-8" />
              </div>

              <!-- Content -->
              <div class="flex-1">
                <div
                  class="w-full flex flex-row justify-between items-start mb-1"
                >
                  <app-normal-text
                    class="!text-[#999999] !font-[500] !text-base"
                  >
                    Order Confirmed
                  </app-normal-text>
                </div>
                <app-normal-text class="!text-[#999999] !text-sm">
                  You accepted this order
                </app-normal-text>
              </div>
            </div>

            <!-- Rider Accepted Order - Inactive -->
            <div class="w-full flex flex-row mb-6 relative">
              <!-- Timeline Circle and Line -->
              <div class="flex-shrink-0 mr-4 relative z-10">
                <app-icon name="tracking-pending" customClass="w-8 h-8" />
              </div>

              <!-- Content -->
              <div class="flex-1">
                <div
                  class="w-full flex flex-row justify-between items-start mb-1"
                >
                  <app-normal-text
                    class="!text-[#999999] !font-[500] !text-base"
                  >
                    Rider Accepted Order
                  </app-normal-text>
                </div>
                <app-normal-text class="!text-[#999999] !text-sm">
                  Rider is coming for pickup
                </app-normal-text>
              </div>
            </div>

            <!-- Rider Has Arrived - Inactive -->
            <div class="w-full flex flex-row mb-6 relative">
              <!-- Timeline Circle and Line -->
              <div class="flex-shrink-0 mr-4 relative z-10">
                <app-icon name="tracking-pending" customClass="w-8 h-8" />
              </div>

              <!-- Content -->
              <div class="flex-1">
                <div
                  class="w-full flex flex-row justify-between items-start mb-1"
                >
                  <app-normal-text
                    class="!text-[#999999] !font-[500] !text-base"
                  >
                    Rider Has Arrived
                  </app-normal-text>
                </div>
                <app-normal-text class="!text-[#999999] !text-sm">
                  Rider is waiting for pickup
                </app-normal-text>
              </div>
            </div>

            <!-- Order Shipped - Inactive -->
            <div class="w-full flex flex-row mb-6 relative">
              <!-- Timeline Circle and Line -->
              <div class="flex-shrink-0 mr-4 relative z-10">
                <app-icon name="tracking-pending" customClass="w-8 h-8" />
              </div>

              <!-- Content -->
              <div class="flex-1">
                <div
                  class="w-full flex flex-row justify-between items-start mb-1"
                >
                  <app-normal-text
                    class="!text-[#999999] !font-[500] !text-base"
                  >
                    Order Shipped
                  </app-normal-text>
                </div>
                <app-normal-text class="!text-[#999999] !text-sm">
                  Rider takes item to deliver
                </app-normal-text>
              </div>
            </div>

            <!-- Order Arrived - Inactive -->
            <div class="w-full flex flex-row mb-6 relative">
              <div class="flex-shrink-0 mr-4 relative z-10">
                <app-icon name="tracking-pending" customClass="w-8 h-8" />
              </div>

              <!-- Content -->
              <div class="flex-1">
                <div
                  class="w-full flex flex-row justify-between items-start mb-1"
                >
                  <app-normal-text
                    class="!text-[#999999] !font-[500] !text-base"
                  >
                    Order Arrived
                  </app-normal-text>
                </div>
                <app-normal-text class="!text-[#999999] !text-sm">
                  Rider reaches delivery spot
                </app-normal-text>
              </div>
            </div>

            <!-- Order Delivered - Inactive (Last, no line) -->
            <div class="w-full flex flex-row relative">
              <div class="flex-shrink-0 mr-4 relative z-10">
                <app-icon name="tracking-pending" customClass="w-8 h-8" />
              </div>

              <!-- Content -->
              <div class="flex-1">
                <div
                  class="w-full flex flex-row justify-between items-start mb-1"
                >
                  <app-normal-text
                    class="!text-[#999999] !font-[500] !text-base"
                  >
                    Order Delivered
                  </app-normal-text>
                </div>
                <app-normal-text class="!text-[#999999] !text-sm">
                  Delivery reaches customer
                </app-normal-text>
              </div>
            </div>
          </div>
        </div>

        <div class="pb-24"></div>
      </div>

      <!-- Bottom button -->
      <div
        v-if="SingleOrder && canUpdateStatus"
        class="w-full fixed bg-white dark:bg-black bottom-0 left-0 pt-4 px-4 flex flex-col"
        :style="`${getBottomPadding}`"
      >
        <div class="w-full grid grid-cols-12 gap-4">
          <div class="col-span-6 flex flex-col">
            <app-button
              variant="primary-white"
              :class="`!py-4 !border-red !text-red !border-[1.5px]`"
              outlined
              @click="
                isCancle = true;
                showUpdateStatusModal = true;
              "
            >
              Cancel
            </app-button>
          </div>
          <div class="col-span-6 flex flex-col">
            <app-button
              variant="secondary"
              :class="`!py-4`"
              @click="
                isCancle = false;
                showUpdateStatusModal = true;
              "
            >
              {{ nextStatus?.value || "Accept delivery" }}
            </app-button>
          </div>
        </div>
      </div>
    </subpage-layout>

    <!-- Update Status Modal -->
    <app-modal
      v-if="showUpdateStatusModal"
      :close="
        () => {
          showUpdateStatusModal = false;
        }
      "
      :contentClass="'!px-0'"
    >
      <div class="w-full flex flex-col items-center pt-4 px-4">
        <app-icon
          :name="iconByStatus(nextStatus?.key || '')"
          customClass="!h-[70px]"
        />
        <div
          class="w-full flex flex-col pt-4 pb-6 px-5 items-center justify-center"
        >
          <app-normal-text
            class="text-center w-full !text-lg !font-semibold pb-2"
          >
            {{ nextStatus?.value || "Update delivery Status" }}
          </app-normal-text>

          <app-normal-text
            class="text-center !text-sm !text-gray-two w-full !prose !prose-sm"
          >
            Are you sure you want to
            {{ nextStatus?.value || "update the delivery status" }}? This action
            cannot be undone.
          </app-normal-text>
        </div>

        <div
          class="w-full grid grid-cols-2 gap-3 items-center justify-center !text-xs pt-3"
        >
          <div class="col-span-1 flex items-center justify-center">
            <app-button
              variant="secondary"
              :customClass="`!py-4 !w-full`"
              @click="updateOrderStatus"
              :loading="statusIsUpdating"
              >Yes</app-button
            >
          </div>
          <div class="col-span-1 flex items-center justify-center">
            <app-button
              variant="secondary"
              :customClass="`!py-4 !w-full`"
              outlined
              @click="showUpdateStatusModal = false"
            >
              No
            </app-button>
          </div>
        </div>
      </div>
    </app-modal>
  </app-wrapper>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  onMounted,
  computed,
  reactive,
  watch,
} from "vue";
import {
  AppNormalText,
  AppImageLoader,
  AppButton,
  AppDetails,
  AppTabs,
  AppIcon,
  AppSkeletonLoader,
  AppModal,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { useRoute } from "vue-router";
import { Order } from "@greep/logic/src/gql/graphql";
import { getBottomPadding } from "../../composable";
import { onIonViewWillEnter } from "@ionic/vue";

export default defineComponent({
  name: "CommerceOrderDetailsPage",
  components: {
    AppNormalText,
    AppImageLoader,
    AppButton,
    AppDetails,
    AppTabs,
    AppIcon,
    AppSkeletonLoader,
    AppModal,
  },
  middlewares: {
    fetchRules: [
      {
        domain: "Commerce",
        property: "SingleOrder",
        method: "GetOrder",
        params: [],
        requireAuth: true,
        ignoreProperty: true,
        useRouteId: true,
      },
    ],
  },
  setup() {
    const isLoading = ref(false);
    const SingleOrder = ref(Logic.Commerce.SingleOrder);
    const activeTab = ref<"info" | "tracking">("info");
    const showUpdateStatusModal = ref(false);
    const isCancle = ref(false);
    const statusIsUpdating = ref(false);
    const cancelIsLoading = ref(false);

    const marketOrderAllowedStatusProgression = reactive({
      pending: ["confirmed", "cancelled"],
      confirmed: ["delivered"],
      delivered: [],
      cancelled: [],
    });

    const canUpdateStatus = computed(() => {
      if (!SingleOrder.value) return false;
      const currentStatus = SingleOrder.value.status?.toLowerCase();
      return (
        currentStatus in marketOrderAllowedStatusProgression &&
        // @ts-ignore
        marketOrderAllowedStatusProgression[currentStatus].length > 0
      );
    });

    const statusCopy = (status: string) => {
      switch (status.toLowerCase()) {
        case "pending":
          return "Pending";
        case "confirmed":
          return "Confirm Order";
        case "processing":
          return "Mark order as Processing";
        case "delivered":
          return "Mark order as Picked Up";
        case "cancelled":
          return "Cancel Order";
        case "ongoing":
          return "Mark as Ongoing";
        default:
          return status;
      }
    };

    const iconByStatus = (status: string) => {
      switch (status.toLowerCase()) {
        case "pending":
          return "market-pending";
        case "confirmed":
          return "market-success";
        case "processing":
          return "market-processing";
        case "delivered":
          return "market-success";
        case "cancelled":
          return "market-failed";
        case "ongoing":
          return "market-failed";
        default:
          return "market-processing";
      }
    };

    const nextStatus = computed(() => {
      if (!SingleOrder.value) return null;

      if (isCancle.value) {
        return {
          key: "cancelled",
          value: statusCopy("cancelled"),
        };
      }

      const currentStatus = SingleOrder.value.status?.toLowerCase();
      if (
        currentStatus in marketOrderAllowedStatusProgression &&
        // @ts-ignore
        marketOrderAllowedStatusProgression[currentStatus].length > 0
      ) {
        // @ts-ignore
        return {
          // @ts-ignore
          key: marketOrderAllowedStatusProgression[currentStatus][0] as string,
          value: statusCopy(
            // @ts-ignore
            marketOrderAllowedStatusProgression[currentStatus][0]
          ),
        };
      }
      return null;
    });

    // Order tabs using AppTabs component
    const orderTabs = computed(() => {
      return [
        {
          key: "info",
          label: "Info",
        },
        {
          key: "tracking",
          label: "Tracking",
        },
      ];
    });

    // Get status color for UI
    const getStatusColor = (status: string) => {
      switch (status?.toLowerCase()) {
        case "completed":
        case "delivered":
          return "#10BB76";
        case "cancelled":
        case "failed":
          return "#FA1919";
        case "pending":
        case "processing":
        case "confirmed":
          return "#10BB76";
        case "accepted":
        default:
          return "#FF7B3B";
      }
    };

    // Get business logo
    const getBusinessLogo = (order: any) => {
      return "/images/icons/logo-chat.png";
    };

    // Navigate to chat
    const goToChat = () => {
      Logic.Common.GoToRoute(`/chat/${SingleOrder.value?.conversation?.uuid}`);
    };

    // Get status label
    const getStatusLabel = (status: string) => {
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

    // Get product from sales
    const getProduct = (order: Order) => {
      try {
        if (
          order.sales &&
          Array.isArray(order.sales) &&
          order.sales.length > 0
        ) {
          const sale = order.sales[0];
          if (
            sale.products &&
            Array.isArray(sale.products) &&
            sale.products.length > 0
          ) {
            return sale.products[0];
          }
        }
      } catch (e) {
        console.error("Error getting product:", e);
      }
      return null;
    };

    // Get all products from sales
    const getProducts = (order: Order) => {
      try {
        let allProducts: any[] = [];
        if (order.sales && Array.isArray(order.sales)) {
          // Loop through all sales entries
          order.sales.forEach((sale: any) => {
            if (sale.products && Array.isArray(sale.products)) {
              allProducts.push(...sale.products);
            }
          });
        }
        return allProducts;
      } catch (e) {
        console.error("Error getting products:", e);
      }
      return [];
    };

    // Get product by index
    const getProductByIndex = (order: Order, index: number) => {
      const products = getProducts(order);
      return products[index] || null;
    };

    // Get product name by index
    const getProductNameByIndex = (order: any, index: number) => {
      const product = getProductByIndex(order, index);
      if (product) {
        return product.name || "Unknown Product";
      }
      return "Unknown Product";
    };

    // Get product image by index
    const getProductImageByIndex = (order: Order, index: number) => {
      try {
        const product = getProductByIndex(order, index);
        if (product && product.images) {
          let images: any[] = [];
          if (typeof product.images === "string") {
            images = JSON.parse(product.images);
          } else if (Array.isArray(product.images)) {
            images = product.images;
          }

          if (images.length > 0) {
            // Find primary image or use first image
            const primaryImage = images.find((img: any) => img.isPrimary);
            if (primaryImage && primaryImage.url) {
              return primaryImage.url;
            }
            if (images[0] && images[0].url) {
              return images[0].url;
            }
          }
        }
      } catch (e) {
        console.error("Error parsing product images:", e);
      }
      return "/images/placeholder-product.png";
    };

    // Get product quantity by index
    const getProductQtyByIndex = (order: Order, index: number) => {
      try {
        let productIndex = index;
        if (order.sales && Array.isArray(order.sales)) {
          // Loop through sales to find the right product and its quantity
          for (let saleIdx = 0; saleIdx < order.sales.length; saleIdx++) {
            const sale = order.sales[saleIdx];
            let items: any[] = [];
            const itemsData = sale.items;

            if (typeof itemsData === "string") {
              items = JSON.parse(itemsData);
            } else if (Array.isArray(itemsData)) {
              items = itemsData;
            }

            // If this sale has products that cover our index
            if (sale.products && Array.isArray(sale.products)) {
              if (productIndex < sale.products.length) {
                // Found the right sale
                if (
                  items.length > productIndex &&
                  items[productIndex].quantity
                ) {
                  return items[productIndex].quantity;
                }
              }
              // Subtract the number of products in this sale from our index
              productIndex -= sale.products.length;
            }
          }
        }
      } catch (e) {
        console.error("Error getting product quantity:", e);
      }
      return 1;
    };

    // Get product price by index
    const getProductPriceByIndex = (order: Order, index: number) => {
      try {
        let productIndex = index;
        if (order.sales && Array.isArray(order.sales)) {
          // Loop through sales to find the right product and its price
          for (let saleIdx = 0; saleIdx < order.sales.length; saleIdx++) {
            const sale = order.sales[saleIdx];
            let items: any[] = [];
            const itemsData = sale.items;

            if (typeof itemsData === "string") {
              items = JSON.parse(itemsData);
            } else if (Array.isArray(itemsData)) {
              items = itemsData;
            }

            // If this sale has products that cover our index
            if (sale.products && Array.isArray(sale.products)) {
              if (productIndex < sale.products.length) {
                // Found the right sale
                if (items.length > productIndex) {
                  if (items[productIndex].total) {
                    return items[productIndex].total;
                  }
                  if (items[productIndex].price) {
                    return items[productIndex].price;
                  }
                }
              }
              // Subtract the number of products in this sale from our index
              productIndex -= sale.products.length;
            }
          }
        }
      } catch (e) {
        console.error("Error getting product price:", e);
      }
      return order.totalAmount || 0;
    };

    // Get order items (from sales items JSON)
    const getOrderItems = (order: Order) => {
      try {
        if (
          order.sales &&
          Array.isArray(order.sales) &&
          order.sales.length > 0
        ) {
          let items: any[] = [];
          const sale = order.sales[0];
          if (sale.items && typeof sale.items === "string") {
            items = JSON.parse(sale.items);
          } else if (Array.isArray(sale.items)) {
            items = sale.items;
          }
          return items;
        }
        return [];
      } catch (e) {
        return [];
      }
    };

    // Get first product name
    const getProductName = (order: Order) => {
      const product = getProduct(order);
      if (product) {
        return product.name || "Unknown Product";
      }
      return "Unknown Product";
    };

    // Get product image from images JSON array
    const getProductImage = (order: Order) => {
      try {
        const product = getProduct(order);
        if (product && product.images) {
          let images: any[] = [];
          if (typeof product.images === "string") {
            images = JSON.parse(product.images);
          } else if (Array.isArray(product.images)) {
            images = product.images;
          }

          if (images.length > 0) {
            // Find primary image or use first image
            const primaryImage = images.find((img: any) => img.isPrimary);
            if (primaryImage && primaryImage.url) {
              return primaryImage.url;
            }
            if (images[0] && images[0].url) {
              return images[0].url;
            }
          }
        }
      } catch (e) {
        console.error("Error parsing product images:", e);
      }
      return "/images/placeholder-product.png";
    };

    // Get product quantity
    const getProductQty = (order: Order) => {
      const items = getOrderItems(order);
      if (items.length > 0 && items[0].quantity) {
        return items[0].quantity;
      }
      return 1;
    };

    // Get product price
    const getProductPrice = (order: Order) => {
      const items = getOrderItems(order);
      if (items.length > 0 && items[0].total) {
        return items[0].total;
      }
      if (items.length > 0 && items[0].price) {
        return items[0].price;
      }
      return order.totalAmount || 0;
    };

    // Get customer name
    const getCustomerName = (order: Order) => {
      if (order.user) {
        const firstName = order.user.first_name || "";
        const lastName = order.user.last_name || "";
        return (
          `${firstName} ${lastName}`.trim() ||
          order.user.email ||
          "Unknown Customer"
        );
      }
      return "Unknown Customer";
    };

    // Format currency
    const formatCurrency = (amount: number, currency: string) => {
      const currencySymbols: { [key: string]: string } = {
        USD: "$",
        EUR: "€",
        GBP: "£",
        NGN: "₦",
        KES: "KSh",
        ZAR: "R",
      };
      const symbol = currencySymbols[currency] || currency;
      return `${symbol}${amount.toFixed(2)}`;
    };

    // Format time HH:MM
    const formatTime = (dateString: string) => {
      if (!dateString) return "";
      try {
        const date = new Date(dateString);
        return date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      } catch (e) {
        return "";
      }
    };

    // Format date as "Mar 12"
    const formatDate = (dateString: string) => {
      if (!dateString) return "";
      try {
        const date = new Date(dateString);
        const month = date.toLocaleString("default", { month: "short" });
        const day = date.getDate();
        return `${month} ${day}`;
      } catch (e) {
        return "";
      }
    };

    // Format full date as "HH:MM • Mar 12"
    const formatFullDate = (dateString: string) => {
      if (!dateString) return "";
      try {
        return `${Logic.Common.fomartDate(
          dateString,
          "hh:mm a"
        )} • ${Logic.Common.fomartDate(dateString, "MMM D")}`;
      } catch (e) {
        return "";
      }
    };

    const loadSingleOrder = async () => {
      await Logic.Commerce.GetOrder(SingleOrder.value?.uuid || "");
    };

    const cancelOrder = async () => {
      if (statusIsUpdating.value) return;

      statusIsUpdating.value = true;
      Logic.Common.showLoader({
        show: true,
        loading: true,
      });

      Logic.Commerce.UpdateOrderStatusForm = {
        input: {
          entity_uuid: SingleOrder.value?.uuid || "",
          new_status: "cancelled",
          order_type: "market",
          conversation_uuid: SingleOrder.value?.conversation?.uuid || "",
        },
      };

      await Logic.Commerce.UpdateOrderStatus()
        .then(async () => {
          // Reload delivery data
          await loadSingleOrder();

          Logic.Common.showAlert({
            show: true,
            message: "Order cancelled successfully!",
            type: "success",
          });
        })
        .catch((err) => {
          console.error("Error cancelling order:", err);
          Logic.Common.showAlert({
            show: true,
            message:
              err instanceof Error
                ? err.message
                : "Failed to cancel order. Please try again.",
            type: "error",
          });
        })
        .finally(() => {
          statusIsUpdating.value = false;
          Logic.Common.hideLoader();
        });
    };

    const updateOrderStatus = async () => {
      if (isCancle.value) {
        await cancelOrder();
        showUpdateStatusModal.value = false;
        return;
      }

      if (statusIsUpdating.value) return;

      statusIsUpdating.value = true;

      Logic.Commerce.UpdateOrderStatusForm = {
        input: {
          entity_uuid: SingleOrder.value?.uuid || "",
          new_status: nextStatus?.value?.key || "",
          order_type: "market",
          conversation_uuid: SingleOrder.value?.conversation?.uuid || "",
        },
      };

      await Logic.Commerce.UpdateOrderStatus()
        .then(async () => {
          // Reload delivery data
          await loadSingleOrder();

          Logic.Common.showAlert({
            show: true,
            message: "Order status updated successfully!",
            type: "success",
          });

          showUpdateStatusModal.value = false;
        })
        .catch((err) => {
          console.error("Error updating order status:", err);
          Logic.Common.showAlert({
            show: true,
            message:
              err instanceof Error
                ? err.message
                : "Failed to update order status. Please try again.",
            type: "error",
          });
        })
        .finally(() => {
          statusIsUpdating.value = false;
        });
    };

    watch(SingleOrder, () => {
      if (SingleOrder.value?.deliverymethod != "pick_up") {
        marketOrderAllowedStatusProgression.confirmed = [];
      }
    });

    onIonViewWillEnter(() => {
      isCancle.value = false;
    });

    // Load order on mount
    onMounted(() => {
      Logic.Commerce.watchProperty("SingleOrder", SingleOrder);

      if (SingleOrder.value?.deliverymethod != "pick_up") {
        marketOrderAllowedStatusProgression.confirmed = [];
      }
    });

    return {
      Logic,
      isLoading,
      activeTab,
      orderTabs,
      SingleOrder,
      getBottomPadding,
      showUpdateStatusModal,
      statusIsUpdating,
      canUpdateStatus,
      nextStatus,
      cancelIsLoading,
      isCancle,
      cancelOrder,
      iconByStatus,
      updateOrderStatus,
      getStatusColor,
      getStatusLabel,
      getBusinessLogo,
      goToChat,
      formatTime,
      formatDate,
      formatFullDate,
      getProduct,
      getProducts,
      getProductByIndex,
      getProductNameByIndex,
      getProductImageByIndex,
      getProductQtyByIndex,
      getProductPriceByIndex,
      getOrderItems,
      getProductName,
      getProductImage,
      getProductQty,
      getProductPrice,
      getCustomerName,
      formatCurrency,
    };
  },
});
</script>
