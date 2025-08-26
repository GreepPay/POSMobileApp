<template>
  <app-wrapper>
    <subpage-layout title="Order Details" :hasBottomButton="true">
      <!-- Loading State -->
      <div v-if="isLoading" class="w-full flex flex-col items-center py-8">
        <app-normal-text class="!text-center !text-gray-500">
          Loading order details...
        </app-normal-text>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="w-full flex flex-col items-center py-8">
        <app-normal-text class="!text-center !text-red-500">
          {{ error }}
        </app-normal-text>
        <button 
          @click="loadOrder" 
          class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Retry
        </button>
      </div>

      <!-- Order Details -->
      <div v-else-if="order" class="w-full flex flex-col justify-start pt-1">
        <!-- Order ID -->
        <div class="w-full flex flex-col px-4">
          <app-image-loader
            class="w-full h-fit rounded-[12px] flex flex-col overflow-x-hidden overflow-y-hidden justify-center items-center px-4 py-5 !bg-[linear-gradient(to_bottom,#10BB76,#00683F)] relative"
            photo-url=""
          >
            <img
              class="absolute top-0 left-0 w-full"
              src="/images/greep-transparent-logo.svg"
            />

            <div class="w-full flex flex-row items-center justify-between z-10">
              <app-normal-text class="!text-white">
                Order Number
              </app-normal-text>

              <app-normal-text class="!text-white !font-semibold !text-sm">
                {{ order.uuid }}
              </app-normal-text>
            </div>
          </app-image-loader>
        </div>

        <!-- P2P Chat -->
        <div
          class="w-full flex flex-row items-center mt-4 py-4 px-4 !border-t-[12px] !border-b-[12px] border-[#F0F3F6] cursor-pointer"
          @click="goToChat"
        >
          <div class="w-[48px] mr-3">
            <div class="w-[48px]">
              <app-image-loader
                :photoUrl="getBusinessLogo(order)"
                class="h-[48px] w-[48px] rounded-full"
              />
            </div>
          </div>
          <div class="w-full flex flex-col">
            <div class="w-full flex flex-row justify-between item-center">
              <app-normal-text
                class="!text-left !text-black !font-[500] !text-sm mb-[1px]"
              >
                {{ getBusinessName(order) }}
              </app-normal-text>

              <app-normal-text class="!text-right !text-[#999999] mb-[1px]">
                {{ formatTime(order.created_at) }}
              </app-normal-text>
            </div>

            <div class="w-full flex flex-row items-center justify-between">
              <app-normal-text class="!text-left !text-[#999999]">
                P2P Trade Chat
              </app-normal-text>

              <div
                class="h-[24px] w-[24px] rounded-full flex items-center justify-center"
                :style="`background-color: ${colorByStatus(
                  getOrderStatus(order.status)
                )} !important;`"
              >
                <app-normal-text class="!text-[#ffffff] !font-[500]">
                  1
                </app-normal-text>
              </div>
            </div>
          </div>
        </div>

        <!-- Customer -->
        <div class="w-full flex flex-row items-center py-4 px-4">
          <div
            class="w-full flex flex-row items-center px-4 py-4 border-[1.5px] border-[#F0F3F6] rounded-[12px]"
          >
            <div class="w-[48px] mr-3">
              <div class="w-[48px]">
                <app-image-loader
                  :photoUrl="getUserAvatar(order)"
                  class="h-[48px] w-[48px] rounded-full"
                />
              </div>
            </div>
            <div class="w-full flex flex-col">
              <div class="w-full flex flex-row justify-between item-center">
                <app-normal-text
                  class="!text-left !text-black !font-[500] !text-sm mb-[1px]"
                >
                  {{ getUserName(order) }}
                </app-normal-text>
              </div>

              <div class="w-full flex flex-row items-center justify-between">
                <app-normal-text class="!text-left !text-[#999999]">
                  Customer
                </app-normal-text>
              </div>
            </div>
          </div>
        </div>

        <!-- Details -->
        <template v-for="(details, index) in getOrderDetails(order)" :key="index">
          <div class="w-full flex flex-col px-4 mb-4">
            <app-details :details="details" :isVertical="false" />
          </div>
        </template>

        <div class="pb-[200px]"></div>
      </div>

      <!-- Bottom button -->
      <div
        v-if="order && order.status?.toLowerCase() !== 'completed'"
        class="w-full fixed bg-white dark:bg-black bottom-0 left-0 pt-4 px-4 flex flex-col"
        :style="`
          ${getBottomPadding}
        `"
      >
        <div
          class="w-full flex flex-col pb-4"
          v-if="currentPageContent === 'waiting' && isPendingOrder(order)"
        >
          <app-countdown-timer
            :customText="`You must accept in`"
            custom-class="!py-5"
            :duration="600"
          />
        </div>
        <div class="w-full grid grid-cols-12 gap-4">
          <div class="col-span-6 flex flex-col">
            <app-button
              variant="primary-white"
              :class="`!py-4 !border-red !text-red !border-[1.5px]`"
              outlined
              @click="declineOrder"
            >
              Decline
            </app-button>
          </div>
          <div class="col-span-6 flex flex-col">
            <app-button 
              variant="secondary" 
              :class="`!py-4`"
              @click="acceptOrder"
              :disabled="!isPendingOrder(order)"
            >
              {{ mainButtonLabel }}
            </app-button>
          </div>
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import {
  AppNormalText,
  AppImageLoader,
  AppButton,
  AppDetails,
  AppCountdownTimer,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { ExchangeOrder } from "@greep/logic/src/gql/graphql";
import { getBottomPadding } from "../../composable";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "OrderDetailsPage",
  components: {
    AppNormalText,
    AppImageLoader,
    AppButton,
    AppDetails,
    AppCountdownTimer,
  },
  setup() {
    const route = useRoute();
    const order = ref<ExchangeOrder | null>(null);
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    const currentPageContent = ref("waiting");
    const mainButtonLabel = ref("Accept");

    const colorByStatus = (status: "success" | "failed" | "pending") => {
      if (status === "success") {
        return "#10BB76";
      } else if (status === "failed") {
        return "#FA1919";
      } else {
        return "#FFAA1F";
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
        
        const orderData = await Logic.Wallet.GetP2pOrder(orderId);
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

    // Format time
    const formatTime = (dateString: string | null) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    };

    // Get business logo
    const getBusinessLogo = (order: ExchangeOrder) => {
      return order.ad?.business?.logo || "/images/icons/logo-chat.png";
    };

    // Get business name
    const getBusinessName = (order: ExchangeOrder) => {
      return order.ad?.business?.business_name || "Business";
    };

    // Get user avatar
    const getUserAvatar = (order: ExchangeOrder) => {
      return order.user?.profile?.profile_picture || "/images/temps/customer.png";
    };

    // Get user name
    const getUserName = (order: ExchangeOrder) => {
      const user = order.user;
      if (!user) return "Unknown User";
      
      const firstName = user.first_name || "";
      const lastName = user.last_name || "";
      return `${firstName} ${lastName}`.trim() || user.email || "Unknown User";
    };

    // Get order status for UI
    const getOrderStatus = (status: string | null) => {
      switch (status?.toLowerCase()) {
        case "completed":
          return "success";
        case "cancelled":
        case "failed":
          return "failed";
        case "pending":
        case "processing":
        default:
          return "pending";
      }
    };

    // Check if order is pending
    const isPendingOrder = (order: ExchangeOrder) => {
      return order.status?.toLowerCase() === "pending";
    };

    // Get order details for display
    const getOrderDetails = (order: ExchangeOrder) => {
      const details = [];

      // Order summary
      details.push([
        {
          title: "Order",
          content: formatOrderTitle(order),
        },
      ]);

      // Time and status
      details.push([
        {
          title: "Time Ordered",
          content: `<span class="flex flex-row items-center">
           <span> ${formatTime(order.created_at)} </span>
            <span class="h-[4px] w-[4px] rounded-full !bg-black mx-[5px]"> </span>
           <span> ${formatDate(order.created_at)} </span>
          </span>`,
        },
        {
          title: "Order Status",
          content: `<span class="flex flex-row items-center">
           <span style="color:${colorByStatus(
             getOrderStatus(order.status)
           )};" class="mr-1"> ${getOrderStatusLabel(order.status)} </span>
           <span class="h-[12px] w-[12px] rounded-full" style="background-color:${colorByStatus(
             getOrderStatus(order.status)
           )};"></span>
          </span>`,
        },
      ]);

      // Order details
      details.push([
        {
          title: "You buy",
          content: `${order.amount} ${order.ad?.from_currency || "USD"}`,
        },
        {
          title: "You give",
          content: `${order.expected_amount} ${order.ad?.to_currency || "TRY"}`,
        },
        {
          title: "Payment Type",
          content: order.payment_type || "Cash",
        },
        {
          title: "Payout Option",
          content: order.payout_option || "In-Person Pickup",
        },
      ]);

      return details;
    };

    // Format order title
    const formatOrderTitle = (order: ExchangeOrder) => {
      if (!order.ad) return "Unknown Order";
      
      const fromCurrency = order.ad.from_currency;
      const toCurrency = order.ad.to_currency;
      const amount = order.amount;
      const expectedAmount = order.expected_amount;
      
      return `${amount} ${fromCurrency} to ${expectedAmount} ${toCurrency}`;
    };

    // Format date
    const formatDate = (dateString: string | null) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    };

    // Get order status label
    const getOrderStatusLabel = (status: string | null) => {
      switch (status?.toLowerCase()) {
        case "completed":
          return "Completed";
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

    // Navigate to chat
    const goToChat = () => {
      if (order.value?.uuid) {
        Logic.Common.GoToRoute(
          `/chat/${order.value.uuid}?p2p=true&method=${order.value.payment_type || 'cash'}`
        );
      }
    };

    // Accept order
    const acceptOrder = async () => {
      if (!order.value) return;
      
      try {
        // Send structured response to trigger business acceptance
        const structuredResponse = {
          selected_option: "business_accept",
          order_uuid: order.value.uuid,
          business_id: order.value.ad?.business?.uuid,
          user_id: Logic.Auth.AuthUser?.id
        };

        // This would trigger the handleBusinessOrderAcceptance flow
        Logic.Common.showAlert({
          show: true,
          message: "Order accepted successfully! Redirecting to chat...",
          type: "success"
        });
        
                // ✅ NEW: Get existing conversation and add business as participant
        try {
          console.log("🔧 Looking for existing conversation for order:", order.value.uuid);
          
          // ✅ FIX: Use conversation_uuid from the order
          const conversationUuid = order.value.conversation_uuid;
          
          if (!conversationUuid) {
            throw new Error("No conversation UUID found for this order");
          }
          
          console.log("🔧 Using conversation UUID from order:", conversationUuid);
          
          let existingConversation = null;
          
          try {
            // Get the existing conversation using its UUID
            existingConversation = await Logic.Messaging.GetSingleConversation(conversationUuid);
            console.log("✅ Found existing conversation:", existingConversation?.uuid);
          } catch (error) {
            console.log("❌ No conversation found with UUID:", conversationUuid);
            console.log("❌ Error:", error);
            throw new Error(`No conversation found with UUID: ${conversationUuid}`);
          }
          
          if (existingConversation) {
            console.log("✅ Using existing conversation:", existingConversation.uuid);
            
            // ✅ NEW: Add business as participant to the existing conversation
            try {
              // ✅ FIX: Get business user ID from the business UUID
              const businessUuid = order.value.ad?.business?.uuid;
              console.log("🔧 Adding business as participant:", {
                conversationId: existingConversation.id,
                businessUuid: businessUuid,
                businessId: order.value.ad?.business?.id,
                businessName: order.value.ad?.business?.business_name
              });
              
              if (businessUuid) {
                // ✅ FIX: Get the business user ID from the business object
                const businessUserId = parseInt(order.value.ad?.business?.user?.id?.toString() || "0");
                
                console.log("🔧 Business user details:", {
                  businessUserId: businessUserId,
                  businessUserObject: order.value.ad?.business?.user,
                  businessId: order.value.ad?.business?.id,
                  businessUuid: businessUuid,
                  authUserId: Logic.Auth.AuthUser?.id
                });
                
                if (businessUserId > 0) {
                  await Logic.Messaging.AddParticipant(
                    existingConversation.id,
                    businessUserId, // user_id: the business user ID
                    0 // added_by: 0 (bot adding)
                  );
                  console.log("✅ Business added as participant to existing conversation");
                } else {
                  console.error("❌ Invalid business user ID:", businessUserId);
                  console.log("🔧 Trying with AuthUser ID instead...");
                  
                  // Fallback: Use the current authenticated user ID
                  const authUserId = Logic.Auth.AuthUser?.id;
                  if (authUserId && authUserId > 0) {
                    await Logic.Messaging.AddParticipant(
                      existingConversation.id,
                      authUserId, // user_id: the authenticated user ID
                      0 // added_by: 0 (bot adding)
                    );
                    console.log("✅ Business added as participant using AuthUser ID");
                  } else {
                    console.error("❌ No valid user ID found");
                  }
                }
              } else {
                console.error("❌ No business UUID found");
              }
            } catch (participantError) {
              console.error("❌ Error adding business as participant:", participantError);
              // Continue anyway - the conversation exists
            }

            // Navigate to existing chat
            setTimeout(() => {
              Logic.Common.GoToRoute(
                `/chat/${existingConversation.uuid}?p2p=true&method=${order.value?.payment_type || 'cash'}`
              );
            }, 1500);
          } else {
            console.log("❌ No existing conversation found, cannot proceed");
            throw new Error("No existing conversation found for this order");
          }
        } catch (conversationError: any) {
          console.error("Error handling conversation:", conversationError);
          Logic.Common.showAlert({
            show: true,
            message: conversationError?.message || "Failed to find the conversation for this order. Please contact support.",
            type: "error"
          });
        }
        
      } catch (err) {
        Logic.Common.showAlert({
          show: true,
          message: "Failed to accept order. Please try again.",
          type: "error"
        });
        console.error("Error accepting order:", err);
      }
    };

    // Decline order
    const declineOrder = async () => {
      if (!order.value) return;
      
      try {
        // Send structured response to trigger order decline
        const structuredResponse = {
          selected_option: "decline",
          order_uuid: order.value.uuid,
          business_id: order.value.ad?.business?.uuid,
          user_id: Logic.Auth.AuthUser?.id
        };

        // This would trigger the order decline flow
        Logic.Common.showAlert({
          show: true,
          message: "Order declined successfully!",
          type: "success"
        });
        
        // Reload order to get updated status
        await loadOrder();
      } catch (err) {
        Logic.Common.showAlert({
          show: true,
          message: "Failed to decline order. Please try again.",
          type: "error"
        });
        console.error("Error declining order:", err);
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
      getBottomPadding,
      colorByStatus,
      currentPageContent,
      mainButtonLabel,
      loadOrder,
      goToChat,
      getBusinessLogo,
      getBusinessName,
      getUserAvatar,
      getUserName,
      getOrderStatus,
      isPendingOrder,
      getOrderDetails,
      formatTime,
      formatDate,
      getOrderStatusLabel,
      acceptOrder,
      declineOrder,
    };
  },
  data() {
    return {
      parentRefs: [],
    };
  },
  mounted() {
    const parentRefs: any = this.$refs;
    this.parentRefs = parentRefs;
  },
});
</script>
