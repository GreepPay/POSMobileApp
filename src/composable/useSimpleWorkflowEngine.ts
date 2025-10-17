import { reactive, ref, computed } from "vue";
import { Logic } from "@greep/logic";

export interface WorkflowMessage {
  id: string;
  content: string;
  text_content: string;
  user_uuid: string;
  user_name: string;
  type: "text" | "info";
  isUser: boolean;
  timestamp: Date;
  info_icon?: string;
  isOrderSummary?: boolean;
  orderSummary?: {
    // P2P order fields
    youSell?: string;
    youGet?: string;
    fee?: string;
    deliveryFee?: string;
    youPay?: string;
    paymentType?: string;
    payoutOption?: string;
    deliveryAddress?: string;

    // Delivery-specific fields (matches ChatMessage component)
    itemDescription?: string;
    weight?: string;
    trackingNumber?: string;
    orderId?: string;
    status?: string;
    payment_method?: string;
  } | null;
  sender?: {
    uuid: string;
    name: string;
  };
}

export interface SimpleWorkflowOptions {
  conversationId: number;
  workflowType: "p2p_withdrawal" | "deliveries";
}

export const useSimpleWorkflowEngine = (options: SimpleWorkflowOptions) => {
  // Simple state management
  const messages = reactive<WorkflowMessage[]>([]);
  const isProcessing = ref(false);
  const businessJoined = ref(false);
  const showProofUpload = ref(false);
  const orderSummary = ref<any>(null);
  const businessUserInfo = ref<any>(null); // Store business user info

  // Step 1: Initialize - Get conversation → Get order data → Show order summary
  const initialize = async (conversation: any) => {
    if (!conversation) return;

    // Clear messages first
    messages.splice(0, messages.length);

    try {
      // Get order data from database
      const conversationData = Logic.Messaging.SingleConversation;

      const conversationMetadata = conversationData?.metadata
        ? typeof conversationData.metadata === "string"
          ? JSON.parse(conversationData.metadata)
          : conversationData.metadata
        : {};

      // Auto-detect workflow type from conversation data if needed
      let actualWorkflowType = options.workflowType;
      if (
        conversationData?.entity_type === "deliveries" ||
        conversationMetadata?.workflow_type === "deliveries"
      ) {
        actualWorkflowType = "deliveries";
      }

      // Try to get order_uuid from multiple sources
      let orderUuid = conversationMetadata.order_uuid;

      // If not in metadata, try URL parameters
      if (!orderUuid) {
        const urlParams = new URLSearchParams(window.location.search);
        orderUuid = urlParams.get("order_uuid");
      }

      // If still no order_uuid, try from conversation data directly
      if (!orderUuid && (conversationData as any)?.order_uuid) {
        orderUuid = (conversationData as any).order_uuid;
      }

      // For deliveries, try to get delivery UUID from URL or conversation metadata
      if (!orderUuid && actualWorkflowType === "deliveries") {
        // Try delivery_uuid from URL params
        const urlParams = new URLSearchParams(window.location.search);
        orderUuid = urlParams.get("delivery_uuid");

        // Try from conversation metadata (delivery conversations store delivery_uuid)
        if (!orderUuid && conversationMetadata.delivery_uuid) {
          orderUuid = conversationMetadata.delivery_uuid;
        }

        // Try different ways to access the delivery_uuid
        if (!orderUuid) {
          // Try bracket notation
          orderUuid = conversationMetadata["delivery_uuid"];
        }

        // Also try deliveryId as fallback
        if (!orderUuid && conversationMetadata.deliveryId) {
          orderUuid = conversationMetadata.deliveryId;
        }
      }

      // Fetch fresh order data if we have order_uuid
      if (orderUuid) {
        let orderData;

        // Get order data based on workflow type
        if (actualWorkflowType === "deliveries") {
          // For delivery orders, use Logic.Commerce.GetDeliveryByUuid
          try {
            orderData = await Logic.Commerce.GetDeliveryByUuid(orderUuid);
            // If not found, use conversation metadata as fallback
            if (!orderData && conversationMetadata.orderData) {
              orderData = conversationMetadata.orderData;
            }
          } catch (error) {
            console.log("Using conversation metadata for delivery order data");
            orderData = conversationMetadata.orderData;
          }
        } else {
          // For P2P orders, get P2P order data
          orderData = await Logic.Wallet.GetP2pOrder(orderUuid);
        }

        if (orderData) {
          // Create order summary based on workflow type
          if (actualWorkflowType === "deliveries") {
            // Delivery order summary - matches ChatMessage delivery template
            const metadata = orderData.metadata
              ? typeof orderData.metadata === "string"
                ? JSON.parse(orderData.metadata)
                : orderData.metadata
              : {};

            const deliveryFee =
              orderData.delivery_fee ||
              orderData.deliveryFee ||
              metadata.deliveryFee ||
              5;
            const itemCost =
              orderData.total_amount ||
              orderData.amount ||
              orderData.subtotal ||
              metadata.amount ||
              0;

            // Create delivery-specific order summary
            orderSummary.value = {
              // Delivery-specific fields that trigger delivery template in ChatMessage
              itemDescription:
                metadata.itemDescription ||
                orderData.description ||
                orderData.item_description ||
                "Delivery Item",
              weight: metadata.weight || orderData.weight || "Not specified",
              deliveryFee: `${deliveryFee} USDC`,
              paymentType:
                orderData.payment_method ||
                orderData.payment_type ||
                metadata.paymentMethod ||
                "Cash on Delivery",
              trackingNumber:
                orderData.tracking_number ||
                orderData.trackingNumber ||
                orderData.uuid?.slice(-8),
              orderId: orderData.id || orderData.uuid,
              status: orderData.status || "Pending",
              deliveryAddress:
                orderData.delivery_address ||
                orderData.deliveryAddress ||
                orderData.shippingAddress ||
                metadata.deliveryAddress ||
                "Delivery address to be confirmed",
            };
          } else {
            // P2P order summary (existing logic)
            const deliveryFee =
              orderData.payment_type === "cash_delivery" ? 3 : 0;
            const totalAmount = orderData.amount + deliveryFee;
            const sellAmount = orderData.amount * (orderData.ad?.rate || 10);

            // Map payment types correctly
            let paymentType = "Cash";
            let payoutOption = "Pickup";

            if (orderData.payment_type === "cash_pickup") {
              paymentType = "Cash";
              payoutOption = "Pickup";
            } else if (orderData.payment_type === "cash_delivery") {
              paymentType = "Cash";
              payoutOption = "Delivery";
            } else if (orderData.payment_type === "bank_transfer") {
              paymentType = "Bank Transfer";
              payoutOption = "Bank Transfer";
            }

            orderSummary.value = {
              youSell: `${orderData.amount} USDC`,
              youGet: `₺${sellAmount.toFixed(2)}`,
              fee: "0 USDC",
              deliveryFee: `${deliveryFee} USDC`,
              youPay: `${totalAmount} USDC`,
              paymentType: paymentType,
              payoutOption: payoutOption,
              deliveryAddress:
                orderData.pickup_location_address_line ||
                "Address to be confirmed",
            };
          }

          // Add order summary message
          addOrderSummaryMessage();
        }
      } else {
        // Create a fallback delivery order summary for testing
        if (actualWorkflowType === "deliveries") {
          orderSummary.value = {
            itemDescription: "Test Delivery Item",
            weight: "1kg",
            deliveryFee: "5 USDC",
            paymentType: "Cash on Delivery",
            trackingNumber: "TEST123",
            orderId: "test-order-123",
            status: "Pending",
            deliveryAddress: "Test delivery address",
          };

          addOrderSummaryMessage();
        }
      }

      // Check if business already joined and get their info
      const participantCount = conversation?.participants?.length || 0;
      if (participantCount > 1) {
        businessJoined.value = true;

        // Try to find business participant info
        const currentUserId = parseInt(Logic.Auth.AuthUser?.id || "0");
        const businessParticipant = conversation.participants?.find(
          (p: any) => p.user_id !== currentUserId && p.user_id !== 0
        );

        if (businessParticipant) {
          // Extract user info from participant structure
          const userData = businessParticipant.user || businessParticipant;
          businessUserInfo.value = {
            uuid: userData.uuid,
            user_id: businessParticipant.user_id,
            first_name: userData.first_name,
            last_name: userData.last_name,
          };
        }
      }
    } catch (error) {
      console.error("❌ Error initializing workflow:", error);
    }
  };

  // Step 2: Business joins conversation - Enable regular chat
  const handleBusinessJoined = (businessUserData: any) => {
    // Store business user info for later use
    businessUserInfo.value = businessUserData;
    businessJoined.value = true;

    const businessName =
      businessUserData.first_name && businessUserData.last_name
        ? `${businessUserData.first_name} ${businessUserData.last_name}`
        : "Seller";

    // Add business joined message
    const joinMessage: WorkflowMessage = {
      id: `business_joined_${Date.now()}`,
      content: `✅ ${businessName} has joined the conversation!`,
      text_content: `✅ ${businessName} has joined the conversation!`,
      user_uuid: "greep_ai",
      user_name: "GreepPay AI",
      type: "info",
      info_icon: "business-info",
      isUser: false,
      timestamp: new Date(),
      isOrderSummary: false,
      orderSummary: null,
      sender: {
        uuid: "greep_ai",
        name: "GreepPay AI",
      },
    };

    messages.push(joinMessage);
  };

  // Step 4: Delivery completion (for business users)
  const handleDeliveryComplete = async () => {
    if (!businessJoined.value) {
      console.error("❌ Cannot complete delivery - business not joined");
      return false;
    }

    try {
      isProcessing.value = true;

      // Add delivery completion message
      const completionMessage: WorkflowMessage = {
        id: `delivery_completed_${Date.now()}`,
        content: `🚚 **DELIVERY COMPLETED** - Item has been successfully delivered to the customer.`,
        text_content: `🚚 **DELIVERY COMPLETED** - Item has been successfully delivered to the customer.`,
        user_uuid: businessUserInfo.value?.uuid || "business",
        user_name: businessUserInfo.value
          ? `${businessUserInfo.value.first_name} ${businessUserInfo.value.last_name}`
          : "Business Partner",
        type: "info",
        info_icon: "delivery-complete",
        isUser: false,
        timestamp: new Date(),
        isOrderSummary: false,
        orderSummary: null,
        sender: {
          uuid: businessUserInfo.value?.uuid || "business",
          name: businessUserInfo.value
            ? `${businessUserInfo.value.first_name} ${businessUserInfo.value.last_name}`
            : "Business Partner",
        },
      };

      messages.push(completionMessage);

      // Send completion message via backend
      const messageContent =
        "🚚 **DELIVERY COMPLETED** - Item has been successfully delivered to the customer.";

      Logic.Messaging.CreateMessageForm = {
        input: {
          conversation_id: options.conversationId,
          content: messageContent,
          type: "text",
          sender_id: parseInt(Logic.Auth.AuthUser?.id?.toString() || "0"),
          metadata: JSON.stringify({
            type: "delivery_completion",
            sender_type: "business",
            status: "completed",
          }),
        },
      };

      await Logic.Messaging.CreateMessage();

      // TODO: Update order status in backend if needed
      // await Logic.Order.UpdateDeliveryStatus(orderUuid, 'completed');

      console.log("✅ Delivery marked as completed successfully");
      return true;
    } catch (error) {
      console.error("❌ Error marking delivery as complete:", error);
      return false;
    } finally {
      isProcessing.value = false;
    }
  };

  // Step 3: Proof upload - Only workflow step needed
  const handleProofUpload = () => {
    showProofUpload.value = true;
  };

  const handleProofUploadComplete = async (files: File[]) => {
    showProofUpload.value = false;

    try {
      // Add proof uploaded message
      const proofMessage: WorkflowMessage = {
        id: `proof_uploaded_${Date.now()}`,
        content: `Payment proof uploaded successfully! Business partner`,
        text_content: `Payment proof uploaded successfully! Business partner`,
        user_uuid: "greep_ai",
        user_name: "GreepPay AI",
        type: "info",
        info_icon: "upload-success",
        isUser: false,
        timestamp: new Date(),
        isOrderSummary: false,
        orderSummary: null,
        sender: {
          uuid: "greep_ai",
          name: "GreepPay AI",
        },
      };

      messages.push(proofMessage);
    } catch (error) {
      console.error("❌ Error processing proof upload:", error);
    }
  };

  // Helper: Add order summary message
  const addOrderSummaryMessage = () => {
    if (!orderSummary.value) return;

    const summaryMessage: WorkflowMessage = {
      id: `order_summary_${Date.now()}`,
      content: "Order Summary",
      text_content: "Order Summary",
      user_uuid: "greep_ai",
      user_name: "GreepPay AI",
      type: "text",
      isUser: false,
      timestamp: new Date(),
      isOrderSummary: true,
      orderSummary: orderSummary.value,
      sender: {
        uuid: "greep_ai",
        name: "GreepPay AI",
      },
    };

    messages.push(summaryMessage);
  };

  // Simple message sending
  const sendMessage = async (content: string): Promise<boolean> => {
    if (!content.trim() || isProcessing.value) return false;

    isProcessing.value = true;

    try {
      // Create user message
      const userMessage: WorkflowMessage = {
        id: `user_${Date.now()}`,
        content: content,
        text_content: content,
        user_uuid: Logic.Auth.AuthUser?.uuid || "user",
        user_name: Logic.Auth.AuthUser?.first_name || "You",
        type: "text",
        isUser: true,
        timestamp: new Date(),
        isOrderSummary: false,
        orderSummary: null,
        sender: {
          uuid: Logic.Auth.AuthUser?.uuid || "user",
          name: Logic.Auth.AuthUser?.first_name || "You",
        },
      };

      messages.push(userMessage);

      // Send to backend
      Logic.Messaging.CreateMessageForm = {
        input: {
          conversation_id: options.conversationId,
          content: content,
          type: "text",
          sender_id: parseInt(Logic.Auth.AuthUser?.id?.toString() || "0"),
          metadata: JSON.stringify({
            type: "chat_message",
            sender_type: "user",
          }),
        },
      };

      await Logic.Messaging.CreateMessage();
      return true;
    } catch (error) {
      console.error("❌ Error sending message:", error);
      return false;
    } finally {
      isProcessing.value = false;
    }
  };

  // Handle incoming WebSocket messages
  const handleIncomingMessage = (messageData: any) => {
    // Check if this is our own message - if so, ignore it
    const currentUserId = parseInt(Logic.Auth.AuthUser?.id || "0");
    if (messageData.user_id === currentUserId) {
      return;
    }

    // Resolve sender name using stored business info
    let senderName = "Business Partner";
    let senderUuid = "business";

    // Check if this message is from the business user (by user_id)
    if (
      businessUserInfo.value &&
      messageData.user_id === businessUserInfo.value.user_id
    ) {
      // Use exact values from stored business info
      if (
        businessUserInfo.value.first_name &&
        businessUserInfo.value.last_name
      ) {
        senderName = `${businessUserInfo.value.first_name} ${businessUserInfo.value.last_name}`;
      }
      senderUuid = businessUserInfo.value.uuid;
    }

    const incomingMessage: WorkflowMessage = {
      id: messageData.uuid || `incoming_${Date.now()}`,
      content: messageData.content || messageData.text_content || "",
      text_content: messageData.content || messageData.text_content || "",
      user_uuid: senderUuid,
      user_name: senderName,
      type: "text",
      isUser: false,
      timestamp: new Date(messageData.createdAt || Date.now()),
      isOrderSummary: false,
      orderSummary: null,
      sender: {
        uuid: senderUuid,
        name: senderName,
      },
    };

    messages.push(incomingMessage);
  };

  // Simple utilities
  const addMessage = (message: WorkflowMessage) => {
    // Prevent duplicates
    const existingIndex = messages.findIndex((m) => m.id === message.id);
    if (existingIndex >= 0) {
      messages[existingIndex] = message;
    } else {
      messages.push(message);
    }
  };

  const getLastAIMessage = () => {
    return messages.filter((msg) => !msg.isUser).pop();
  };

  return {
    // State
    messages,
    isProcessing,
    businessJoined,
    showProofUpload,
    orderSummary,

    // Core workflow functions (5 steps)
    initialize,
    handleBusinessJoined,
    handleDeliveryComplete,
    handleProofUpload,
    handleProofUploadComplete,

    // Communication
    sendMessage,
    handleIncomingMessage,
    addMessage,
    getLastAIMessage,

    // Computed
    isBusinessUser: computed(() => false),
    directMessagingEnabled: computed(() => businessJoined.value),
    activeModal: computed(() => null),
    manualModalOverride: ref(null),
  };
};
