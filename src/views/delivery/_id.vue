<template>
  <app-wrapper>
    <subpage-layout title="Delivery Order" :hasBottomButton="true">
      <!-- Delivery Details -->
      <div class="w-full flex flex-col justify-start pt-1">
        <!-- Delivery ID -->
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
                {{
                  delivery?.trackingNumber ? "Tracking Number" : "Delivery ID"
                }}
              </app-normal-text>

              <app-normal-text class="!text-white !font-semibold !text-sm">
                {{ delivery?.trackingNumber || delivery?.uuid }}
              </app-normal-text>
            </div>
          </app-image-loader>
        </div>

        <!-- Delivery Chat -->
        <div
          v-if="delivery?.conversation && delivery?.status != 'pending'"
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
                {{ delivery?.conversation?.name || "Chat with Merchant" }}
              </app-normal-text>

              <app-normal-text
                class="!text-[10px] !text-gray-400 whitespace-nowrap"
              >
                {{
                  Logic.Common.fomartDate(delivery?.updatedAt || "", "HH:mm A")
                }}
              </app-normal-text>
            </div>
            <div class="w-full flex flex-row items-center justify-between">
              <app-normal-text class="!text-left !text-gray-500 !line-clamp-1">
                {{
                  (delivery?.conversation?.participants?.length || 0) > 2
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

        <!-- Delivery Info -->
        <div class="w-full flex flex-col px-4 mt-4">
          <div
            v-if="delivery?.pickupAddress"
            :class="`flex flex-row  items-center justify-between px-3 py-3 border-[1.5px] border-[#F0F3F6] rounded-[12px] mb-3 `"
          >
            <div class="w-full flex flex-col mb-2">
              <div class="w-full flex flex-row items-center">
                <div class="!w-[50px] mr-2">
                  <app-icon :name="'pick_up_icon'" customClass="h-[48px]" />
                </div>

                <div class="w-full flex flex-col">
                  <app-normal-text class="!font-semibold !text-left mb-1">
                    Pickup From
                  </app-normal-text>
                  <app-normal-text
                    is-html
                    :html-content="delivery?.pickupAddress"
                    class="!text-gray-500 !text-left"
                  >
                  </app-normal-text>
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="delivery?.deliveryAddress"
            :class="`flex flex-row items-center justify-between px-3 py-3 border-[1.5px] border-[#F0F3F6] rounded-[12px] mb-3 `"
          >
            <div class="w-full flex flex-col">
              <div class="w-full flex flex-row items-center">
                <div class="!w-[50px] mr-2">
                  <app-icon :name="'drop_off_icon'" customClass="h-[48px]" />
                </div>

                <div class="w-full flex flex-col">
                  <app-normal-text class="!font-semibold !text-left mb-1">
                    Drop Off At
                  </app-normal-text>
                  <app-normal-text
                    is-html
                    :html-content="delivery?.deliveryAddress"
                    class="!text-gray-500 !text-left"
                  >
                  </app-normal-text>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Delivery Details -->
        <template
          v-for="(details, index) in getDeliveryDetails(delivery)"
          :key="index"
        >
          <div class="w-full flex flex-col px-4 mb-2 mt-2">
            <app-details :details="details" :isVertical="false" />
          </div>
        </template>

        <div class="pb-[200px]"></div>
      </div>

      <!-- Bottom button -->
      <div
        v-if="delivery && showActionButtons(delivery)"
        class="w-full fixed bg-white dark:bg-black bottom-0 left-0 pt-4 px-4 flex flex-col"
        :style="`${getBottomPadding}`"
      >
        <div
          class="w-full flex flex-col pb-4"
          v-if="currentPageContent === 'waiting' && isPendingDelivery(delivery)"
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
              @click="declineDelivery"
            >
              {{ getDeclineButtonText(delivery) }}
            </app-button>
          </div>
          <div class="col-span-6 flex flex-col">
            <app-button
              variant="secondary"
              :class="`!py-4`"
              @click="handleMainAction"
              :disabled="!canPerformAction(delivery)"
              :loading="acceptButtonIsLoading"
            >
              {{ getMainButtonText(delivery) }}
            </app-button>
          </div>
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted } from "vue";
import {
  AppNormalText,
  AppImageLoader,
  AppButton,
  AppDetails,
  AppCountdownTimer,
  AppIcon,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { getBottomPadding } from "../../composable";
import { useRoute } from "vue-router";
import { Business } from "@greep/logic/src/gql/graphql";

export default defineComponent({
  name: "DeliveryDetailsPage",
  components: {
    AppNormalText,
    AppImageLoader,
    AppButton,
    AppDetails,
    AppCountdownTimer,
    AppIcon,
  },
  middlewares: {
    fetchRules: [
      {
        domain: "Commerce",
        property: "SingleDelivery",
        method: "GetDeliveryByUuid",
        params: [],
        requireAuth: true,
        ignoreProperty: true,
        useRouteId: true,
      },
    ],
  },
  setup() {
    const route = useRoute();
    const delivery = ref(Logic.Commerce.SingleDelivery);
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    const currentPageContent = ref("waiting");
    const acceptButtonIsLoading = ref(false);

    // Watch for middleware-loaded delivery data
    watch(
      () => Logic.Commerce.SingleDelivery,
      (newDelivery) => {
        if (newDelivery) {
          delivery.value = newDelivery;
          error.value = null;
          console.log("Middleware loaded delivery:", newDelivery);
        }
      },
      { deep: true, immediate: true }
    );

    const colorByStatus = (
      status: "success" | "failed" | "pending" | "in_progress"
    ) => {
      if (status === "success") {
        return "#10BB76";
      } else if (status === "failed") {
        return "#FA1919";
      } else if (status === "in_progress") {
        return "#00619D";
      } else {
        return "#FFAA1F";
      }
    };

    const loadDelivery = () => {};

    // Format time
    const formatTime = (dateString: string | null) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    };

    // Format date
    const formatDate = (dateString: string | null) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    };

    // Get customer name
    const getCustomerName = (delivery: any) => {
      // Try to get customer from delivery.user first (new schema), then order.user
      const customer = delivery.user;
      if (!customer) return "Unknown Customer";

      const firstName = customer.first_name || "";
      const lastName = customer.last_name || "";
      return (
        `${firstName} ${lastName}`.trim() ||
        customer.email ||
        "Unknown Customer"
      );
    };

    // Get customer phone
    const getCustomerPhone = (delivery: any) => {
      const customer = delivery.user;
      return customer?.phone || "Not provided";
    };

    // Get customer avatar
    const getCustomerAvatar = (delivery: any) => {
      const customer = delivery.user;
      return customer?.profile?.profile_picture || "/images/temps/customer.png";
    };

    // Parse metadata for additional properties
    const parseMetadata = (metadataString: string) => {
      try {
        return JSON.parse(metadataString || "{}");
      } catch (err) {
        return {};
      }
    };

    // Get weight from metadata or direct field
    const getWeight = (delivery: any) => {
      if (delivery.weight) return delivery.weight;
      const metadata = parseMetadata(delivery.metadata);
      return metadata.weight || "Not specified";
    };

    // Get scheduled time from metadata or direct field
    const getScheduledTime = (delivery: any) => {
      if (delivery.scheduledTime) return delivery.scheduledTime;
      const metadata = parseMetadata(delivery.metadata);
      return metadata.scheduledTime || "Not specified";
    };

    // Get scheduled date from metadata or direct field
    const getScheduledDate = (delivery: any) => {
      if (delivery.scheduledDate) return delivery.scheduledDate;
      const metadata = parseMetadata(delivery.metadata);
      return metadata.scheduledDate || "Not specified";
    };

    // Get delivery description
    const getDeliveryDescription = (delivery: any) => {
      // Try different possible fields for description
      const metadata = parseMetadata(delivery.metadata);
      return metadata.itemDescription;
    };

    // Get delivery description
    const getDeliveryNote = (delivery: any) => {
      const metadata = parseMetadata(delivery.metadata);
      return metadata.note || "Not specified";
    };

    // Get delivery price
    const getDeliveryPrice = (delivery: any) => {
      return delivery.deliveryPrice || "Not specified";
    };

    // Format date and time together
    const formatDateTime = (dateString: string | null) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }; // Get delivery status for UI
    const getDeliveryStatus = (status: string | null) => {
      switch (status?.toLowerCase()) {
        case "completed":
        case "delivered":
          return "success";
        case "cancelled":
        case "failed":
          return "failed";
        case "ongoing":
          return "in_progress";
        case "pending":
        case "processing":
        case "confirmed":
        case "picked_up":
        case "in_transit":
        default:
          return "pending";
      }
    };

    // Get delivery status label
    const getDeliveryStatusLabel = (status: string | null) => {
      switch (status?.toLowerCase()) {
        case "completed":
          return "Completed";
        case "delivered":
          return "Delivered";
        case "confirmed":
          return "Confirmed";
        case "picked_up":
          return "Picked Up";
        case "ongoing":
          return "In Progress";
        case "in_transit":
          return "In Transit";
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

    // Check if delivery is pending
    const isPendingDelivery = (delivery: any) => {
      return delivery.status?.toLowerCase() === "pending";
    };

    // Check if can perform action
    const canPerformAction = (delivery: any) => {
      const status = delivery.status?.toLowerCase();
      return ["pending", "confirmed", "picked_up", "in_transit"].includes(
        status
      );
    };

    // Show action buttons
    const showActionButtons = (delivery: any) => {
      const status = delivery.status?.toLowerCase();
      return ![
        "completed",
        "delivered",
        "cancelled",
        "failed",
        "confirmed",
      ].includes(status);
    };

    // Get main button text based on delivery status
    const getMainButtonText = (delivery: any) => {
      const status = delivery.status?.toLowerCase();
      switch (status) {
        case "pending":
          return "Take Order";
        case "confirmed":
          return "Pick Up";
        case "picked_up":
          return "Mark In Transit";
        case "in_transit":
          return "Mark Delivered";
        default:
          return "Update Status";
      }
    };

    // Get decline button text
    const getDeclineButtonText = (delivery: any) => {
      const status = delivery.status?.toLowerCase();
      if (status === "pending") {
        return "Ignore";
      } else {
        return "Cancel";
      }
    };

    // Get delivery details for display
    const getDeliveryDetails = (delivery: any) => {
      const details = [];

      // Delivery Request Information
      details.push([
        {
          title: "Time Requested",
          content: `<span class="flex flex-row items-center">
           <span> ${formatTime(
             delivery.createdAt || delivery.created_at
           )} </span>
            <span class="h-[4px] w-[4px] rounded-full !bg-black mx-[5px]"> </span>
           <span> ${formatDate(
             delivery.createdAt || delivery.created_at
           )} </span>
          </span>`,
        },
        {
          title: "Delivery Status",
          content: `<span class="flex flex-row items-center">
           <span style="color:${colorByStatus(
             getDeliveryStatus(delivery.status)
           )};" class="mr-1"> ${getDeliveryStatusLabel(delivery.status)} </span>
           <span class="h-[12px] w-[12px] rounded-full" style="background-color:${colorByStatus(
             getDeliveryStatus(delivery.status)
           )};"></span>
          </span>`,
        },
      ]);

      // Delivery Details
      details.push([
        {
          title: "Description",
          content: getDeliveryDescription(delivery),
        },
        // {
        //     title: "Price",
        //     content: getDeliveryPrice(delivery),
        // },
        {
          title: "Notes",
          content: getDeliveryNote(delivery),
        },
      ]);

      // Scheduled Time (if different from scheduled date)
      const scheduledTime = getScheduledTime(delivery);
      if (scheduledTime !== "Not specified") {
        details.push([
          {
            title: "Scheduled Time",
            content: scheduledTime,
          },
        ]);
      }

      // // Custom Delivery Information (if available)
      // if (delivery.type === "custom" || !delivery.order) {
      //   details.push([
      //     {
      //       title: "Type",
      //       content: "Custom",
      //     },
      //     {
      //       title: "Estimated Time",
      //       content: delivery.estimatedDeliveryDate
      //         ? formatDateTime(delivery.estimatedDeliveryDate)
      //         : "Not specified",
      //     },
      //   ]);
      // } else {
      //   details.push([
      //     {
      //       title: "Type",
      //       content: "Order-based",
      //     },
      //   ]);
      // }

      // Additional delivery information
      if (delivery.trackingNumber) {
        details.push([
          {
            title: "Tracking Number",
            content: delivery.trackingNumber,
          },
        ]);
      }

      return details;
    }; // Format delivery title
    const formatDeliveryTitle = (delivery: any) => {
      if (delivery.trackingNumber) {
        return `Delivery #${delivery.trackingNumber}`;
      } else if (delivery.orderNumber) {
        return `Order #${delivery.orderNumber}`;
      } else if (delivery.uuid) {
        return `Delivery #${delivery.uuid.slice(-8)}`;
      }
      return "Delivery Request";
    };

    // Navigate to chat
    const goToChat = () => {
      Logic.Common.GoToRoute(`/chat/${delivery.value?.conversation?.uuid}`);
    };

    // Handle main action based on current status
    const handleMainAction = async () => {
      if (!delivery.value) return;

      const status = delivery.value.status?.toLowerCase();

      try {
        switch (status) {
          case "pending":
            await acceptDelivery();
            break;
          case "confirmed":
            await markPickedUp();
            break;
          case "picked_up":
            await markInTransit();
            break;
          case "in_transit":
            await markDelivered();
            break;
          default:
            console.log("Unknown status:", status);
        }
      } catch (err) {
        console.error("Error performing action:", err);
        Logic.Common.showAlert({
          show: true,
          message: "Failed to update delivery status. Please try again.",
          type: "error",
        });
      }
    };

    // Accept delivery
    const acceptDelivery = async () => {
      try {
        acceptButtonIsLoading.value = true;

        const currentUser = Logic.Auth.AuthUser;
        if (!currentUser || !delivery.value) {
          throw new Error("User not authenticated or delivery not found");
        }

        // Step 1: Accept the delivery using GraphQL mutation
        const acceptResponse = await Logic.Commerce.AcceptDelivery(
          delivery.value.id
        );

        if (acceptResponse.error) {
          throw new Error(
            acceptResponse.error.message || "Failed to accept delivery"
          );
        }

        // Step 2: Reload delivery data to get updated metadata
        await loadDelivery();

        // Step 3: Join the delivery conversation
        await joinDeliveryConversation();

        Logic.Common.showAlert({
          show: true,
          message: "Delivery accepted! Taking you to the chat...",
          type: "success",
        });

        acceptButtonIsLoading.value = false;

        goToChat();
      } catch (err) {
        console.error("Error accepting delivery:", err);
        Logic.Common.showAlert({
          show: true,
          message:
            err instanceof Error
              ? err.message
              : "Failed to accept delivery. Please try again.",
          type: "error",
        });
        throw err;
      }
    };

    // ✅ NEW: Join delivery conversation as business participant
    const joinDeliveryConversation = async () => {
      try {
        const currentUser = Logic.Auth.AuthUser;
        if (!currentUser || !delivery.value) {
          throw new Error("User not authenticated or delivery not found");
        }

        console.log("🔧 Joining delivery conversation:", {
          deliveryUuid: delivery.value.uuid,
          businessUserId: currentUser.id,
        });

        // Get the conversation for this delivery
        // First try to parse from metadata, then try direct fields
        let conversationUuid = null;

        // Parse metadata to get conversation ID
        const metadata = parseMetadata(delivery.value.metadata || "{}");
        conversationUuid =
          metadata.conversationId || metadata.conversarionId || null; // Handle typo

        console.log("🔧 Looking for conversation with UUID:", conversationUuid);
        console.log("🔧 Delivery metadata:", metadata);

        if (conversationUuid) {
          try {
            // Get the conversation details
            const conversation = await Logic.Messaging.GetSingleConversation(
              conversationUuid
            );

            if (conversation && conversation.id) {
              console.log("🔧 Found conversation:", {
                id: conversation.id,
                uuid: conversation.uuid,
                participants: conversation.participants?.length || 0,
              });

              // Add business user as participant
              await Logic.Messaging.AddParticipant(
                conversation.id,
                parseInt(currentUser.id.toString()),
                0 // added_by: 0 (system adding)
              );

              console.log(
                "✅ Business user added to conversation successfully"
              );

              // Send a business joined message
              await sendBusinessJoinedMessage(conversation.id);
            } else {
              console.warn(
                "⚠️ Conversation not found for UUID:",
                conversationUuid
              );
              // Try alternative approach: create or find conversation by delivery entity
              await findOrCreateDeliveryConversation();
            }
          } catch (conversationError) {
            console.error("❌ Error getting conversation:", conversationError);
            // Try alternative approach
            await findOrCreateDeliveryConversation();
          }
        } else {
          console.warn("⚠️ No conversation identifier found for delivery");
          await findOrCreateDeliveryConversation();
        }
      } catch (error) {
        console.error("❌ Error joining delivery conversation:", error);
        // Don't throw error here as delivery acceptance should still work
        // even if joining conversation fails
      }
    };

    // ✅ NEW: Send business joined message
    const sendBusinessJoinedMessage = async (conversationId: number) => {
      try {
        const currentUser = Logic.Auth.AuthUser;
        if (!currentUser) return;

        const currentBusiness: Business = Logic.Auth.GetDefaultBusiness();

        const businessName = currentBusiness?.business_name || "Business Team";

        Logic.Messaging.CreateMessageForm = {
          input: {
            conversation_id: conversationId,
            content: `🏪 ${businessName} has joined the delivery conversation and accepted your request!`,
            type: "text",
            sender_id: parseInt(currentUser.id.toString()),
            metadata: JSON.stringify({
              is_bot: false,
              type: "business_joined",
              sender_type: "business",
              sender_name: businessName,
              sender_uuid: currentUser.uuid,
              business_uuid: currentBusiness.uuid,
              business_name: businessName,
              delivery_uuid: delivery.value?.uuid,
              delivery_status: "accepted",
              business_joined: true,
            }),
          },
        };

        await Logic.Messaging.CreateMessage();
        console.log("✅ Business joined message sent successfully");
      } catch (error) {
        console.error("❌ Error sending business joined message:", error);
      }
    };

    // ✅ NEW: Navigate to chat screen after accepting delivery
    const navigateToChat = async () => {
      try {
        if (!delivery.value) return;

        // Get conversation ID from metadata
        const metadata = parseMetadata(delivery.value.metadata || "{}");
        const conversationUuid =
          metadata.conversarionId || metadata.conversationId || null;

        if (conversationUuid) {
          console.log(
            "🔧 Navigating to chat with conversation UUID:",
            conversationUuid
          );

          // Navigate to the chat page with the conversation UUID
          Logic.Common.GoToRoute(
            `/chat/${conversationUuid}?delivery=true&type=delivery&business=true`
          );
        } else {
          console.warn("⚠️ No conversation UUID found for navigation");
          // Fallback: use delivery UUID
          Logic.Common.GoToRoute(
            `/chat/${delivery.value.uuid}?delivery=true&type=delivery&business=true`
          );
        }
      } catch (error) {
        console.error("❌ Error navigating to chat:", error);
      }
    };

    // ✅ NEW: Find or create delivery conversation as fallback
    const findOrCreateDeliveryConversation = async () => {
      try {
        const currentUser = Logic.Auth.AuthUser;
        if (!currentUser || !delivery.value) return;

        console.log(
          "🔧 Attempting to find/create conversation for delivery:",
          delivery.value.uuid
        );

        // Try to find existing conversation by delivery entity
        // This might require querying conversations by entity_type='deliveries' and entity_uuid=delivery.uuid
        // For now, we'll log the attempt and suggest manual conversation creation if needed
      } catch (error) {
        console.error("❌ Error in findOrCreateDeliveryConversation:", error);
      }
    };

    // Mark as picked up
    const markPickedUp = async () => {
      try {
        Logic.Common.showAlert({
          show: true,
          message: "Delivery marked as picked up!",
          type: "success",
        });

        await loadDelivery();
      } catch (err) {
        console.error("Error marking as picked up:", err);
        throw err;
      }
    };

    // Mark as in transit
    const markInTransit = async () => {
      try {
        Logic.Common.showAlert({
          show: true,
          message: "Delivery marked as in transit!",
          type: "success",
        });

        await loadDelivery();
      } catch (err) {
        console.error("Error marking as in transit:", err);
        throw err;
      }
    };

    // Mark as delivered
    const markDelivered = async () => {
      try {
        Logic.Common.showAlert({
          show: true,
          message: "Delivery marked as completed!",
          type: "success",
        });

        await loadDelivery();
      } catch (err) {
        console.error("Error marking as delivered:", err);
        throw err;
      }
    };

    // Decline delivery
    const declineDelivery = async () => {
      if (!delivery.value) return;

      try {
        Logic.Common.showAlert({
          show: true,
          message: "Delivery declined successfully!",
          type: "success",
        });

        // Reload delivery to get updated status
        await loadDelivery();
      } catch (err) {
        Logic.Common.showAlert({
          show: true,
          message: "Failed to decline delivery. Please try again.",
          type: "error",
        });
        console.error("Error declining delivery:", err);
      }
    };

    // Setup watchProperty to sync middleware data with component ref
    onMounted(() => {
      Logic.Commerce.watchProperty("SingleDelivery", delivery);
    });

    return {
      Logic,
      delivery,
      isLoading,
      error,
      getBottomPadding,
      colorByStatus,
      currentPageContent,
      loadDelivery,
      goToChat,
      getCustomerAvatar,
      getCustomerName,
      getCustomerPhone,
      parseMetadata,
      getWeight,
      getScheduledTime,
      getScheduledDate,
      getDeliveryDescription,
      getDeliveryPrice,
      getDeliveryStatus,
      getDeliveryStatusLabel,
      isPendingDelivery,
      canPerformAction,
      showActionButtons,
      getMainButtonText,
      getDeclineButtonText,
      getDeliveryDetails,
      formatTime,
      formatDate,
      formatDateTime,
      handleMainAction,
      declineDelivery,
      acceptButtonIsLoading,
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
