<template>
  <app-wrapper>
    <subpage-layout title="Order Details" :hasBottomButton="true">
      <!-- Loading State -->
      <div v-if="isLoading" class="w-full flex flex-col pt-4">
        <app-skeleton-loader type="order-details" />
      </div>

      <!-- Order Details -->
      <div v-else-if="order" class="w-full flex flex-col justify-start pt-1">
        <!-- Order Header -->

        <div class="w-full flex flex-col px-4">
          <app-image-loader
            class="w-full h-fit rounded-[12px] flex flex-col overflow-x-hidden overflow-y-hidden justify-center items-center px-4 py-5 !bg-[linear-gradient(to_bottom,#10BB76,#00683F)] relative"
            photo-url="">
            <img class="absolute top-0 left-0 w-full" src="/images/greep-transparent-logo.svg" />

            <div class="w-full flex flex-row items-center justify-between z-10 space-x-1">
              <app-normal-text class="!text-white !whitespace-nowrap">
                Order Number
              </app-normal-text>

              <app-normal-text class="!text-white !font-semibold !uppercase">
                #{{ String(order.orderNumber || order.id).padStart(6, '0') }}
              </app-normal-text>
            </div>
          </app-image-loader>
        </div>

        <!-- Market Delivery Chat Section -->
        <div
          class="w-full flex flex-row items-center mt-4 py-4 px-4 !border-t-[12px] !border-b-[12px] border-[#F0F3F6] cursor-pointer"
          @click="goToChat">
          <div class="w-[48px] mr-3">
            <div class="w-[48px]">
              <app-image-loader :photoUrl="getBusinessLogo(order)" class="h-[48px] w-[48px] rounded-full" />
            </div>
          </div>
          <div class="w-full flex flex-col">
            <div class="w-full flex flex-row justify-between item-center">
              <app-normal-text class="!text-left !text-black !font-[500] !text-sm mb-[1px]">
                Market Delivery Chat
              </app-normal-text>

              <app-normal-text class="!text-right !text-[#999999] mb-[1px]">
                {{ formatTime(order.createdAt) }}
              </app-normal-text>
            </div>

            <div class="w-full flex flex-row items-center justify-between">
              <app-normal-text class="!text-left !text-[#999999]">
                Market Chat
              </app-normal-text>

              <div class="h-[24px] w-[24px] rounded-full flex items-center justify-center"
                style="background-color: #10BB76 !important;">
                <app-normal-text class="!text-[#ffffff] !font-[500]">
                  1
                </app-normal-text>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs using AppTabs Component -->
        <div class="w-full flex flex-col px-4 mt-4">
          <app-tabs :tabs="orderTabs" v-model:activeTab="activeTab"
            tabsClass="!w-full flex border-[1.5px] !border-veryLightGray rounded-full"
            tabClass="!flex-1 text-center border-none !mr-0 py-3" customClass="!overflow-x-hidden" type="badge" />
        </div>

        <!-- Info Tab Content -->
        <div v-if="activeTab === 'info'" class="w-full flex flex-col px-4 mt-4 pb-48">
          <!-- Product Section - Grouped Card -->
          <div class="w-full bg-white border border-[#F0F0F0] rounded-[12px] mb-4 overflow-hidden">
            <!-- Product Header Row -->
            <div
              class="w-full flex flex-row items-center justify-between px-4 py-3 bg-[#F9F9F9] border-b border-[#F0F0F0]">
              <app-normal-text class="!text-[#999999] !text-sm !font-[400]">
                Product
              </app-normal-text>
              <div class="flex gap-12">
                <app-normal-text class="!text-[#999999] !text-sm !font-[400]">
                  Qty
                </app-normal-text>
                <app-normal-text class="!text-[#999999] !text-sm !font-[400]">
                  Total Price
                </app-normal-text>
              </div>
            </div>

            <!-- Product Items Loop -->
            <div v-for="(product, index) in getProducts(order)" :key="index"
              class="w-full flex flex-row items-center px-4 py-3 border-b border-[#F0F0F0]"
              :class="{ 'border-b-0': index === getProducts(order).length - 1 }">
              <!-- Product Image -->
              <div class="w-12 h-12 mr-3 flex-shrink-0 bg-gray-200 rounded-[8px] overflow-hidden">
                <app-image-loader :photoUrl="getProductImageByIndex(order, index)" class="w-full h-full object-cover" />
              </div>

              <!-- Product Name -->
              <div class="flex-1">
                <app-normal-text class="!text-black !font-[600] !text-base">
                  {{ getProductNameByIndex(order, index) }}
                </app-normal-text>
              </div>

              <!-- Qty and Price -->
              <div class="flex items-center gap-12">
                <app-normal-text class="!text-black !font-[600] !text-base">
                  x{{ getProductQtyByIndex(order, index) }}
                </app-normal-text>
                <app-normal-text class="!text-black !font-[600] !text-base">
                  {{ formatCurrency(getProductPriceByIndex(order, index), order.currency) }}
                </app-normal-text>
              </div>
            </div>
          </div>

          <!-- Time Ordered + Order Status - Grouped Card -->
          <div class="w-full bg-white border border-[#F0F0F0] rounded-[12px] mb-4 overflow-hidden">
            <!-- Time Ordered -->
            <div class="w-full flex flex-row justify-between items-center px-4 py-4 border-b border-[#F0F0F0]">
              <app-normal-text class="!text-[#999999] !text-base !font-[400]">
                Time Ordered
              </app-normal-text>
              <app-normal-text class="!text-black !font-[600] !text-base">
                {{ formatFullDate(order.createdAt) }}
              </app-normal-text>
            </div>

            <!-- Order Status -->
            <div class="w-full flex flex-row justify-between items-center px-4 py-4">
              <app-normal-text class="!text-[#999999] !text-base !font-[400]">
                Order Status
              </app-normal-text>
              <div class="flex items-center gap-2">
                <app-normal-text class="!text-base !font-[600]" :style="`color: ${getStatusColor(order.status)}`">
                  {{ getStatusLabel(order.status) }}
                </app-normal-text>
                <div class="w-3 h-3 rounded-full" :style="`background-color: ${getStatusColor(order.status)}`"></div>
              </div>
            </div>
          </div>

          <!-- Customer - Single Card -->
          <div
            class="w-full flex flex-row justify-between items-center px-4 py-4 bg-white border border-[#F0F0F0] rounded-[12px] mb-4">
            <app-normal-text class="!text-[#999999] !text-base !font-[400]">
              Customer
            </app-normal-text>
            <app-normal-text class="!text-black !font-[600] !text-base">
              {{ getCustomerName(order) }}
            </app-normal-text>
          </div>

          <!-- Delivery Rider + Rider Contact - Grouped Card -->
          <div class="w-full bg-white border border-[#F0F0F0] rounded-[12px] overflow-hidden">
            <!-- Delivery Rider -->
            <div class="w-full flex flex-row justify-between items-center px-4 py-4 border-b border-[#F0F0F0]">
              <app-normal-text class="!text-[#999999] !text-base !font-[400]">
                Delivery Rider
              </app-normal-text>
              <app-normal-text class="!text-black !font-[600] !text-base">
                Not Specified
              </app-normal-text>
            </div>

            <!-- Rider Contact -->
            <div class="w-full flex flex-row justify-between items-center px-4 py-4">
              <app-normal-text class="!text-[#999999] !text-base !font-[400]">
                Rider Contact
              </app-normal-text>
              <app-normal-text class="!text-black !font-[600] !text-base">
                Not Specified
              </app-normal-text>
            </div>
          </div>
        </div>

        <!-- Tracking Tab Content -->
        <div v-if="activeTab === 'tracking'" class="w-full flex flex-col px-4 mt-4 pb-48">
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
                <div class="w-full flex flex-row justify-between items-start mb-1">
                  <app-normal-text class="!text-[#10BB76] !font-[600] !text-base">
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
                <div class="w-full flex flex-row justify-between items-start mb-1">
                  <app-normal-text class="!text-[#999999] !font-[500] !text-base">
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
                <div class="w-full flex flex-row justify-between items-start mb-1">
                  <app-normal-text class="!text-[#999999] !font-[500] !text-base">
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
                <div class="w-full flex flex-row justify-between items-start mb-1">
                  <app-normal-text class="!text-[#999999] !font-[500] !text-base">
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
                <div class="w-full flex flex-row justify-between items-start mb-1">
                  <app-normal-text class="!text-[#999999] !font-[500] !text-base">
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
                <div class="w-full flex flex-row justify-between items-start mb-1">
                  <app-normal-text class="!text-[#999999] !font-[500] !text-base">
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
                <div class="w-full flex flex-row justify-between items-start mb-1">
                  <app-normal-text class="!text-[#999999] !font-[500] !text-base">
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

      <!-- Bottom Buttons -->
      <div v-if="order" class="w-full fixed bg-white dark:bg-black bottom-0 left-0 pt-4 px-4 flex flex-col"
        :style="`${getBottomPadding}`">
        <div class="w-full grid grid-cols-2 gap-4 pb-4">
          <app-button variant="primary-white" class="!py-4 !border-red-500 !text-red-500 !border-[1.5px]" outlined>
            Cancel
          </app-button>
          <app-button variant="secondary" class="!py-4">
            Accept
          </app-button>
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from "vue";
import {
  AppNormalText,
  AppImageLoader,
  AppButton,
  AppDetails,
  AppTabs,
  AppIcon,
  AppSkeletonLoader,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { useRoute } from "vue-router";

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
  },
  setup() {
    const route = useRoute();
    const order = ref<any>(null);
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    const activeTab = ref<"info" | "tracking">("info");

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
      // TODO: Implement navigation to chat conversation
      console.log("Navigate to chat for order:", order.value?.uuid);
      // Logic.Common.GoToRoute(`/chat/${conversationUuid}`);
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

    // Load order details
    const loadOrder = async () => {
      try {
        isLoading.value = true;
        error.value = null;

        const orderId = route.params.id as string;
        if (!orderId) {
          error.value = "Order ID not found";
          return;
        }

        const orderData = await Logic.Commerce.GetOrder(orderId);
        if (orderData) {
          order.value = orderData;
        } else {
          error.value = "Order not found";
        }
      } catch (err) {
        error.value = "Failed to load order details. Please try again.";
        console.error("Error loading order:", err);
      } finally {
        isLoading.value = false;
      }
    };

    // Get product from sales
    const getProduct = (order: any) => {
      try {
        if (order.sales && Array.isArray(order.sales) && order.sales.length > 0) {
          const sale = order.sales[0];
          if (sale.products && Array.isArray(sale.products) && sale.products.length > 0) {
            return sale.products[0];
          }
        }
      } catch (e) {
        console.error("Error getting product:", e);
      }
      return null;
    };

    // Get all products from sales
    const getProducts = (order: any) => {
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
    const getProductByIndex = (order: any, index: number) => {
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
    const getProductImageByIndex = (order: any, index: number) => {
      try {
        const product = getProductByIndex(order, index);
        if (product && product.images) {
          let images: any[] = [];
          if (typeof product.images === 'string') {
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
    const getProductQtyByIndex = (order: any, index: number) => {
      try {
        let productIndex = index;
        if (order.sales && Array.isArray(order.sales)) {
          // Loop through sales to find the right product and its quantity
          for (let saleIdx = 0; saleIdx < order.sales.length; saleIdx++) {
            const sale = order.sales[saleIdx];
            let items: any[] = [];
            const itemsData = sale.items;

            if (typeof itemsData === 'string') {
              items = JSON.parse(itemsData);
            } else if (Array.isArray(itemsData)) {
              items = itemsData;
            }

            // If this sale has products that cover our index
            if (sale.products && Array.isArray(sale.products)) {
              if (productIndex < sale.products.length) {
                // Found the right sale
                if (items.length > productIndex && items[productIndex].quantity) {
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
    const getProductPriceByIndex = (order: any, index: number) => {
      try {
        let productIndex = index;
        if (order.sales && Array.isArray(order.sales)) {
          // Loop through sales to find the right product and its price
          for (let saleIdx = 0; saleIdx < order.sales.length; saleIdx++) {
            const sale = order.sales[saleIdx];
            let items: any[] = [];
            const itemsData = sale.items;

            if (typeof itemsData === 'string') {
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
    const getOrderItems = (order: any) => {
      try {
        if (order.sales && Array.isArray(order.sales) && order.sales.length > 0) {
          let items: any[] = [];
          const sale = order.sales[0];
          if (sale.items && typeof sale.items === 'string') {
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
    const getProductName = (order: any) => {
      const product = getProduct(order);
      if (product) {
        return product.name || "Unknown Product";
      }
      return "Unknown Product";
    };

    // Get product image from images JSON array
    const getProductImage = (order: any) => {
      try {
        const product = getProduct(order);
        if (product && product.images) {
          let images: any[] = [];
          if (typeof product.images === 'string') {
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
    const getProductQty = (order: any) => {
      const items = getOrderItems(order);
      if (items.length > 0 && items[0].quantity) {
        return items[0].quantity;
      }
      return 1;
    };

    // Get product price
    const getProductPrice = (order: any) => {
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
    const getCustomerName = (order: any) => {
      if (order.user) {
        const firstName = order.user.first_name || "";
        const lastName = order.user.last_name || "";
        return `${firstName} ${lastName}`.trim() || order.user.email || "Unknown Customer";
      }
      return "Unknown Customer";
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

    // Format time HH:MM
    const formatTime = (dateString: string) => {
      if (!dateString) return "";
      try {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      } catch (e) {
        return "";
      }
    };

    // Format date as "Mar 12"
    const formatDate = (dateString: string) => {
      if (!dateString) return "";
      try {
        const date = new Date(dateString);
        const month = date.toLocaleString('default', { month: 'short' });
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
        const date = new Date(dateString);
        const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        const month = date.toLocaleString('default', { month: 'short' });
        const day = date.getDate();
        return `${time} • ${month} ${day}`;
      } catch (e) {
        return "";
      }
    };

    // Load order on mount
    onMounted(() => {
      loadOrder();
    });

    return {
      Logic,
      order,
      isLoading,
      error,
      activeTab,
      orderTabs,
      getBottomPadding: ref(""),
      getStatusColor,
      getStatusLabel,
      getBusinessLogo,
      goToChat,
      loadOrder,
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
