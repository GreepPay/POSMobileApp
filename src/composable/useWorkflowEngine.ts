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
  metadata?: {
    type: "text" | "options" | "info";
    options?: Array<{
      value: string;
      content: string;
      type?: string;
      message?: any;
    }>;
    extras?: {
      input_placeholder?: string;
      input_name?: string;
      info_icon?: string;
      [key: string]: any;
    };
  };
  actions?: Array<{
    label: string;
    value: string;
    type: "success" | "info" | "danger" | "warning" | "primary";
    message: string;
    disabled?: boolean;
    handler: () => void;
  }>;
  sender?: {
    uuid: string;
    name: string;
  };
  // Optional properties for ChatMessage component
  info_icon?: string;
  media?: {
    type: "image";
    url: string;
  };
  isOrderSummary?: boolean;
  orderSummary?: {
    youSell: string;
    youGet: string;
    fee: string;
    deliveryFee: string;
    youPay: string;
    paymentType: string;
    payoutOption: string;
    deliveryAddress: string;
  } | null;
}

// Configuration interfaces
export interface WorkflowEngineOptions {
  conversationId: number;
  workflowType: "p2p_withdrawal" | "deliveries";
  enableDirectMessaging?: boolean;
}

const detectBusinessUser = (conversationData?: any) => {};

export interface WorkflowEngineOptions {
  conversationId: number;
  workflowType: "p2p_withdrawal" | "deliveries";
  enableDirectMessaging?: boolean;
}

export const useWorkflowEngine = (options: WorkflowEngineOptions) => {
  // State
  const messages = reactive<WorkflowMessage[]>([]);
  const isProcessing = ref(false);
  const currentStage = ref("");
  const isConnected = ref(false);
  const conversationId = ref(options.conversationId);
  const currentWorkflow = ref<any>(null);
  const isBusinessUser = ref(false);
  const businessJoined = ref(false);
  const businessUserInfo = ref<any>(null);
  const directMessagingEnabled = ref(options.enableDirectMessaging || false);
  const manualModalOverride = ref<string | null>(null);

  const countdownType = ref<string | null>(null);
  const countdownTime = ref(0);
  const countdownInterval = ref<NodeJS.Timeout | null>(null);
  const orderCreated = ref(false);

  const startCountdown = (type: string, seconds: number) => {
    console.log(`🕐 Starting ${type} countdown for ${seconds} seconds`);
    countdownType.value = type;
    countdownTime.value = seconds;

    if (countdownInterval.value) {
      clearInterval(countdownInterval.value);
    }

    countdownInterval.value = setInterval(() => {
      countdownTime.value--;

      if (countdownTime.value <= 0) {
        stopCountdown();
        handleCountdownExpired();
      }
    }, 1000);
  };

  const stopCountdown = () => {
    console.log("⏹️ Stopping countdown");
    if (countdownInterval.value) {
      clearInterval(countdownInterval.value);
      countdownInterval.value = null;
    }
    countdownType.value = null;
    countdownTime.value = 0;
  };

  const handleCountdownExpired = () => {
    const type = countdownType.value;

    if (type === "waiting_business") {
      const timeoutMessage: WorkflowMessage = {
        id: `timeout_${Date.now()}`,
        content:
          "⏰ Time's up! The business didn't respond within 10 minutes. Your order has been cancelled.",
        text_content:
          "⏰ Time's up! The business didn't respond within 10 minutes. Your order has been cancelled.",
        user_uuid: "greep_ai",
        user_name: "GreepPay AI",
        type: "text",
        isUser: false,
        timestamp: new Date(),
        sender: { uuid: "greep_ai", name: "GreepPay AI" },
      };
      addMessage(timeoutMessage);
    }
  };

  const buildStructuredResponse = (
    content: string,
    lastAIMessage?: WorkflowMessage,
    metadata?: any
  ) => {
    const aiExtras = lastAIMessage?.metadata?.extras || {};
    const inputType = aiExtras.input_type;
    const inputName = aiExtras.input_name;

    // Check if content is a number (withdrawal amount)
    const amount = parseFloat(content.replace(/,/g, ""));
    if (!isNaN(amount) && amount > 0) {
      const conversationData = Logic.Messaging.SingleConversation;
      const exchangeAd = conversationData?.exchangeAd;
      const exchangeRate = exchangeAd?.rate || 10;
      const sellAmount = amount * exchangeRate;

      const structuredResponse = {
        currency: "USDC",
        amount: amount,
        currency_symbol: "₺",
        business_name: exchangeAd?.business?.business_name || "GreepPay",
        sell_amount: sellAmount.toFixed(2),
        sell_rate: exchangeRate.toFixed(2),
      };

      return structuredResponse;
    }

    // Handle based on what the AI message expects
    switch (inputType) {
      case "numeric":
        return {
          [inputName || "amount"]: parseFloat(content),
          selected_option: "string", // MessageBroadcaster expects this key
        };

      case "text":
        return {
          [inputName || "item_description"]: content,
          selected_option: "string", // MessageBroadcaster expects this key
        };

      case "address":
        return {
          [inputName || "address"]: content,
          selected_option: "string", // MessageBroadcaster expects this key
        };

      case "bank_account":
        return {
          [inputName || "bank_account"]: content,
          selected_option: "string", // MessageBroadcaster expects this key
        };

      case "pickup_location":
        return {
          [inputName || "pickup_location"]: content,
          selected_option: "string", // MessageBroadcaster expects this key
        };

      case "datetime":
        return {
          [inputName || "delivery_datetime"]: content,
          selected_option: "string", // MessageBroadcaster expects this key
        };

      default:
        // Handle options/buttons - prioritize metadata if available
        if (lastAIMessage?.metadata?.type === "options") {
          return {
            selected_option: metadata?.selected_option || content,
          };
        }

        // If metadata has selected_option, use it (for action button clicks)
        if (metadata?.selected_option) {
          return {
            selected_option: metadata.selected_option,
          };
        }

        return {
          message: content,
        };
    }
  };

  // Get the last AI message to determine expected input
  const getLastAIMessage = () => {
    return messages.filter((msg) => !msg.isUser).pop();
  };

  // Convert backend message to display format
  const convertToDisplayMessage = (backendMessage: any): WorkflowMessage => {
    const metadata = backendMessage.metadata
      ? typeof backendMessage.metadata === "string"
        ? JSON.parse(backendMessage.metadata)
        : backendMessage.metadata
      : {};

    const actions =
      metadata.options?.map((option: any) => ({
        label: option.content,
        value: option.value,
        type: option.type || "primary",
        message: option.message || option.content,
        disabled:
          isProcessing.value ||
          (option.value === "confirm" && orderCreated.value),
        handler: () => {
          // Skip if disabled or processing
          if (
            isProcessing.value ||
            (option.value === "confirm" && orderCreated.value)
          ) {
            console.log(
              "⏭️ Button click ignored - disabled or order already created"
            );
            return;
          }

          // Use the actual action handler with debouncing
          handleActionClick({
            label: option.content,
            value: option.value,
            type: option.type || "primary",
          });
        },
      })) || [];

    // ✅ FIXED: Better AI message detection like backup
    const messageMetadata =
      typeof backendMessage.metadata === "string"
        ? JSON.parse(backendMessage.metadata)
        : backendMessage.metadata || {};

    // Determine if this is an AI message or user message - use backup logic
    const isAIMessage =
      backendMessage.user_id === 0 ||
      backendMessage.sender?.uuid === "greep_ai" ||
      backendMessage.user_uuid === "greep_ai" ||
      messageMetadata.sender_type === "system" ||
      messageMetadata.is_system_message ||
      (!backendMessage.sender && backendMessage.user_id === 0); // Only if both conditions are true

    // ✅ ENHANCED: Better sender detection using WebSocket message data first
    let userName = "User";
    let userUuid = "user";
    let isUserMessage = false; // Whether this message is from the current user

    if (isAIMessage) {
      userName = "GreepPay AI";
      userUuid = "greep_ai";
      isUserMessage = false;
    } else {
      // For real user messages, prioritize WebSocket message data over auth user
      const currentUserId = parseInt(Logic.Auth.AuthUser?.id || "0");
      const messageUserId = backendMessage.user_id;

      // First, try to get user info directly from the WebSocket message
      if (backendMessage.sender) {
        userName =
          backendMessage.sender.name ||
          `${backendMessage.sender.first_name || ""} ${
            backendMessage.sender.last_name || ""
          }`.trim();
        userUuid =
          backendMessage.sender.uuid || backendMessage.user_uuid || "user";

        if (!userName || userName.trim() === "") {
          userName = backendMessage.user_name || "User";
        }
      } else if (
        backendMessage.user_name &&
        backendMessage.user_name !== "GreepPay AI"
      ) {
        userName = backendMessage.user_name;
        userUuid = backendMessage.user_uuid || "user";
      }

      // ✅ PRIORITY: Check metadata for sender info first (most reliable for WebSocket messages)
      if (metadata.sender_name && metadata.sender_name !== "GreepPay AI") {
        userName = metadata.sender_name;
        userUuid = metadata.sender_uuid || userUuid;
      }

      // ✅ CRITICAL: Determine if this is current user's message
      if (messageUserId === currentUserId) {
        // This is current user's message
        isUserMessage = true;
        if (!userName || userName === "User") {
          userName = Logic.Auth.AuthUser?.first_name || "You";
          userUuid = Logic.Auth.AuthUser?.uuid || "user";
        }
      } else if (messageUserId && messageUserId !== 0) {
        // This is from another user (business partner)
        isUserMessage = false;
        if (!userName || userName === "User") {
          const conversation = Logic.Messaging?.SingleConversation;
          if (conversation?.participants) {
            const sender = conversation.participants.find(
              (p: any) => p.user_id === messageUserId
            );
            if (sender) {
              userName =
                (sender as any).name ||
                `${(sender as any).first_name || ""} ${
                  (sender as any).last_name || ""
                }`.trim() ||
                "Other User";
              userUuid = (sender as any).uuid || "other_user";
            } else {
              // Check business user info from recent joins
              const joinedBusinessUser = businessUserInfo.value;
              if (
                joinedBusinessUser &&
                (joinedBusinessUser.id === messageUserId ||
                  joinedBusinessUser.user_id === messageUserId)
              ) {
                userName =
                  joinedBusinessUser.first_name && joinedBusinessUser.last_name
                    ? `${joinedBusinessUser.first_name} ${joinedBusinessUser.last_name}`
                    : joinedBusinessUser.name ||
                      joinedBusinessUser.user_name ||
                      "Business User";
                userUuid = joinedBusinessUser.uuid || "business_user";
              }
            }
          }
        }
      } else {
        // No user_id or user_id is 0 - likely a template message, treat as not current user
        isUserMessage = false;
      }
    }

    console.log("🔧 Message sender detection:", {
      messageUserId: backendMessage.user_id,
      currentUserId: Logic.Auth.AuthUser?.id,
      isAIMessage,
      isUserMessage,
      resolvedUserName: userName,
      senderData: backendMessage.sender,
    });

    // Determine message type - ChatMessage component only supports "text" and "info"
    // Backend might send "options" type, but we should use "text" for messages with actions
    let messageType = metadata?.type || "text";

    // Convert backend message types to component-compatible types
    if (
      messageType === "chat_message" ||
      messageType === "structured_response"
    ) {
      messageType = "text"; // Regular chat messages should be rendered as text
    }
    if (messageType === "options" || actions.length > 0) {
      messageType = "text"; // ChatMessage component handles actions within text messages
    }

    // ✅ Process templates in content
    let processedContent =
      backendMessage.content || backendMessage.text_content || "";
    let isOrderSummary = false;
    let orderSummaryData = null;

    // Handle {order_summary_text} template - create order summary object
    if (processedContent.includes("{order_summary_text}")) {
      isOrderSummary = true;
      orderSummaryData = null; // Will be populated by the UI component when needed

      // Set a simple placeholder content since the ChatMessage will render the order summary UI
      processedContent = "Order Summary";
    }

    return {
      id:
        backendMessage.uuid ||
        backendMessage.id ||
        `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: processedContent,
      // Add properties that ChatMessage component expects
      text_content: processedContent,
      user_uuid: userUuid,
      user_name: userName,
      type: messageType,
      info_icon: metadata?.extras?.info_icon || metadata?.info_icon || "",
      isUser: isUserMessage, // ✅ Use the correctly calculated isUserMessage
      timestamp: new Date(backendMessage.createdAt || Date.now()),
      metadata,
      actions,
      isOrderSummary,
      orderSummary: orderSummaryData,
      sender: {
        uuid: userUuid,
        name: userName,
      },
    };
  };

  // Add message to display
  const addMessage = (message: WorkflowMessage | any) => {
    let displayMessage: WorkflowMessage;

    if ("isUser" in message) {
      displayMessage = message as WorkflowMessage;
    } else {
      displayMessage = convertToDisplayMessage(message);
    }

    // Prevent duplicates
    const existingIndex = messages.findIndex((m) => m.id === displayMessage.id);
    if (existingIndex >= 0) {
      console.log("🔄 Updating existing message:", displayMessage.id);
      messages[existingIndex] = displayMessage;
    } else {
      console.log("➕ Adding new message:", {
        id: displayMessage.id,
        content: displayMessage.content,
        isUser: displayMessage.isUser,
        user_name: displayMessage.user_name,
      });
      messages.push(displayMessage);
    }

    console.log("📊 Total messages after add:", messages.length);
  };

  // Business user detection and management
  const detectBusinessUser = (conversationData?: any) => {
    if (!conversationData?.participants || !Logic.Auth.AuthUser?.id) {
      return false;
    }

    const currentUserId = parseInt(Logic.Auth.AuthUser.id);
    const participants = conversationData.participants;

    if (participants.length <= 1) {
      return false;
    }

    // Check if current user is a participant
    const isParticipant = participants.some(
      (p: any) => p.user_id === currentUserId
    );

    // Check if current user is the owner (conversation creator)
    let isOwner = false;

    // Method 1: Check if owner_id matches current user
    if (conversationData.owner_id) {
      isOwner = conversationData.owner_id === currentUserId;
    }
    // Method 2: If owner_id is undefined, check if this is the first participant (likely the creator)
    else if (participants.length > 0) {
      // Sort participants by ID to get the first one (likely the creator)
      const sortedParticipants = [...participants].sort(
        (a: any, b: any) => a.id - b.id
      );
      isOwner = sortedParticipants[0].user_id === currentUserId;
    }

    // Business user is a participant who is not the owner AND there are multiple participants
    const isBusiness = isParticipant && !isOwner && participants.length > 1;

    return isBusiness;
  };

  // Handle business user joining conversation
  const handleBusinessJoined = async (businessUserData: any) => {
    console.log("🎉 BUSINESS JOINED EVENT:", businessUserData);

    // ✅ NEW: Store business user data for later use in message sender resolution
    businessUserInfo.value = businessUserData;

    // ✅ CRITICAL: Stop countdown timer first
    stopCountdown();

    businessJoined.value = true;
    directMessagingEnabled.value = true;

    const businessName =
      businessUserData.first_name && businessUserData.last_name
        ? `${businessUserData.first_name} ${businessUserData.last_name}`
        : businessUserData.name || businessUserData.user_name || "Seller";

    // ✅ FIXED: Create message with same structure as backup
    const businessJoinedMessage: WorkflowMessage = {
      id: `business_joined_${Date.now()}`,
      content: `✅ ${businessName} has joined the conversation!`,
      text_content: `✅ ${businessName} has joined the conversation!`,
      user_uuid: "greep_ai",
      user_name: "GreepPay AI",
      type: "info" as const,
      info_icon: "business-info", // ✅ FIX: Use existing business-info icon for business joining
      isUser: false,
      timestamp: new Date(),
      sender: {
        uuid: "greep_ai",
        name: "GreepPay AI",
      },
      metadata: {
        type: "info",
        extras: {
          info_icon: "business-info",
          business_joined: true,
        },
      },
    };

    console.log("🔧 Adding business joined message:", businessJoinedMessage);

    // ✅ FIXED: Add message directly to array like backup instead of using addMessage()
    messages.push(businessJoinedMessage);
    console.log(
      "🔧 Messages array after adding business joined message:",
      messages.length
    );

    // ✅ ENHANCED: Add order summary message for business user to see the order details
    try {
      // Try to get order data from conversation metadata first
      const conversationData = Logic.Messaging.SingleConversation;
      const conversationMetadata = conversationData?.metadata
        ? typeof conversationData.metadata === "string"
          ? JSON.parse(conversationData.metadata)
          : conversationData.metadata
        : {};

      console.log(
        "🔍 Looking for order data in conversation metadata:",
        conversationMetadata
      );

      // Check if we have order data directly in the metadata
      if (conversationMetadata.amount && conversationData?.exchangeAd) {
        const amount = conversationMetadata.amount;
        const exchangeAd = conversationData.exchangeAd;
        const method =
          conversationMetadata.method === "cash"
            ? "cash_pickup"
            : conversationMetadata.method;

        console.log("📋 Found order data in metadata:", {
          amount,
          method,
          businessName: exchangeAd.business?.business_name,
          rate: exchangeAd.rate,
        });

        // Try to get the pickup address from URL parameters (passed from order acceptance)
        let pickupAddress = "Pickup location to be confirmed";
        try {
          const urlParams = new URLSearchParams(window.location.search);
          const pickupParam = urlParams.get("pickup_address");
          if (pickupParam) {
            pickupAddress = decodeURIComponent(pickupParam);
            console.log(
              "📍 Found pickup address from URL params:",
              pickupAddress
            );
          } else {
            // Fallback: try to get from conversation metadata
            if (conversationMetadata.pickup_location_address) {
              pickupAddress = conversationMetadata.pickup_location_address;
              console.log(
                "📍 Found pickup address from metadata:",
                pickupAddress
              );
            } else if (conversationMetadata.pickup_location_name) {
              pickupAddress = conversationMetadata.pickup_location_name;
              console.log("📍 Found pickup name from metadata:", pickupAddress);
            }
          }
        } catch (error) {
          console.log("⚠️ Could not get pickup address:", error);
        }

        // Create order summary with metadata data
        const deliveryFee = method === "cash_delivery" ? 3 : 0;
        const totalAmount = amount + deliveryFee;
        const sellAmount = amount * (exchangeAd.rate || 10);

        const orderSummary = {
          youSell: `${amount} USDC`,
          youGet: `₺${sellAmount.toFixed(2)}`,
          fee: "0 USDC",
          deliveryFee: `${deliveryFee} USDC`,
          youPay: `${totalAmount} USDC`,
          paymentType: "USDC",
          payoutOption:
            method === "cash_pickup"
              ? "Pickup"
              : method === "cash_delivery"
              ? "Delivery"
              : "Cash",
          deliveryAddress:
            method === "cash_pickup"
              ? pickupAddress
              : "Delivery address to be confirmed",
        };

        console.log(
          "📋 Creating business order summary message with metadata data and pickup address"
        );
        const businessSummaryMessage: WorkflowMessage = {
          id: `business_order_summary_${Date.now()}`,
          content: "Order Summary",
          text_content: "Order Summary",
          user_uuid: "greep_ai",
          user_name: "GreepPay AI",
          type: "text" as const,
          isUser: false,
          timestamp: new Date(),
          sender: {
            uuid: "greep_ai",
            name: "GreepPay AI",
          },
          isOrderSummary: true,
          orderSummary: orderSummary,
          metadata: {
            type: "text",
            extras: {
              order_summary: orderSummary,
              is_business_summary: true,
            },
          },
        };

        messages.push(businessSummaryMessage);
        console.log(
          "✅ Business order summary message added with metadata data and pickup address"
        );
      } else {
        console.log("⚠️ No order data found in conversation metadata");
      }
    } catch (error) {
      console.log("❌ Error creating business order summary:", error);
    }

    // ✅ Business user joined - enable direct messaging without clearing chat
    if (isBusinessUser.value) {
      console.log(
        "🎯 Business user joined - enabling direct messaging, keeping chat history"
      );

      // ✅ Enable direct messaging instead of clearing messages
      directMessagingEnabled.value = true;

      // Add business joined notification
      addMessage(businessJoinedMessage);

      // Create order summary message for business user context
      const orderSummary = await extractOrderSummary();
      if (orderSummary) {
        const businessSummaryMessage: WorkflowMessage = {
          id: `business_summary_${Date.now()}`,
          content:
            "📋 **Order Summary**\n\n" + formatOrderSummary(orderSummary),
          text_content:
            "📋 **Order Summary**\n\n" + formatOrderSummary(orderSummary),
          user_uuid: "greep_ai",
          user_name: "GreepPay AI",
          type: "text" as const,
          isUser: false,
          timestamp: new Date(),
          sender: {
            uuid: "greep_ai",
            name: "GreepPay AI",
          },
          metadata: {
            type: "text",
            extras: {
              order_summary: orderSummary,
              is_business_summary: true,
            },
          },
          orderSummary: orderSummary,
          isOrderSummary: true,
        };

        messages.push(businessSummaryMessage);
        console.log(
          "📋 Business summary message added:",
          businessSummaryMessage
        );
      }
    } else {
      // ✅ BACKUP LOGIC: For regular users, refresh conversation data to update participant names
      console.log(
        "� Regular user - refreshing conversation data to update participant names"
      );
      // This will be handled by the WorkflowChat component when it detects business joined
    }
  };

  // Send direct message (bypassing workflow for business users)
  const sendDirectMessage = async (content: string): Promise<boolean> => {
    if (!content.trim() || isProcessing.value) return false;

    try {
      isProcessing.value = true;

      // Add user message to display immediately
      const userMessage: WorkflowMessage = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content,
        text_content: content,
        user_uuid: Logic.Auth.AuthUser?.uuid || "user",
        user_name: Logic.Auth.AuthUser?.first_name || "You",
        type: "text" as const,
        isUser: false,
        timestamp: new Date(),
        sender: {
          uuid: Logic.Auth.AuthUser?.uuid || "user",
          name: Logic.Auth.AuthUser?.first_name || "You",
        },
      };
      addMessage(userMessage);

      // Send as regular message without structured response
      Logic.Messaging.CreateMessageForm = {
        input: {
          conversation_id: conversationId.value,
          content: content,
          type: "text",
          sender_id: parseInt(Logic.Auth.AuthUser?.id?.toString() || "0"),
          metadata: JSON.stringify({
            sender_type: isBusinessUser.value ? "business" : "user",
            is_direct_message: true,
            conversation_type: options.workflowType,
          }),
        },
      };

      await Logic.Messaging.CreateMessage();
      return true;
    } catch (error) {
      console.error("❌ Error sending direct message:", error);
      return false;
    } finally {
      isProcessing.value = false;
    }
  };

  // Send regular chat message (bypassing workflow with chat_message metadata)
  const sendRegularChatMessage = async (content: string): Promise<boolean> => {
    if (!content.trim() || isProcessing.value) return false;

    try {
      isProcessing.value = true;

      // Add user message to display immediately with temporary ID
      const tempId = `temp_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // ✅ Create user message that will be replaced by WebSocket message
      // Use minimal user data since WebSocket will provide the real message
      const userMessage: WorkflowMessage = {
        id: tempId,
        content,
        text_content: content,
        user_uuid: Logic.Auth.AuthUser?.uuid || "user",
        user_name: Logic.Auth.AuthUser?.first_name || "You",
        type: "text" as const,
        isUser: true,
        timestamp: new Date(),
        sender: {
          uuid: Logic.Auth.AuthUser?.uuid || "user",
          name: Logic.Auth.AuthUser?.first_name || "You",
        },
      };

      addMessage(userMessage);

      // Send as regular chat message with chat_message metadata type
      Logic.Messaging.CreateMessageForm = {
        input: {
          conversation_id: conversationId.value,
          content: content,
          type: "text",
          sender_id: parseInt(Logic.Auth.AuthUser?.id?.toString() || "0"),
          metadata: JSON.stringify({
            type: "chat_message",
            sender_type: isBusinessUser.value ? "business" : "user",
            sender_name: Logic.Auth.AuthUser?.first_name || "User",
            sender_uuid: Logic.Auth.AuthUser?.uuid,
            is_regular_chat: true,
            conversation_type: options.workflowType,
          }),
        },
      };

      await Logic.Messaging.CreateMessage();
      return true;
    } catch (error) {
      console.error("❌ Error sending regular chat message:", error);
      return false;
    } finally {
      isProcessing.value = false;
    }
  };

  // Extract order summary from conversation context
  const extractOrderSummary = async () => {
    const conversationData = Logic.Messaging.SingleConversation;
    const conversationMetadata = conversationData?.metadata
      ? typeof conversationData.metadata === "string"
        ? JSON.parse(conversationData.metadata)
        : conversationData.metadata
      : {};

    // If we have order_uuid, fetch the actual order
    if (conversationMetadata.order_uuid) {
      const orderData = await Logic.Wallet.GetP2pOrder(
        conversationMetadata.order_uuid
      );
      if (orderData) {
        const deliveryFee = orderData.payment_type === "cash_delivery" ? 3 : 0;
        const totalAmount = orderData.amount + deliveryFee;
        const sellAmount = orderData.amount * (orderData.ad?.rate || 10);

        const orderSummary = {
          youSell: `${orderData.amount} USDC`,
          youGet: `₺${sellAmount.toFixed(2)}`,
          fee: "0 USDC",
          deliveryFee: `${deliveryFee} USDC`,
          youPay: `${totalAmount} USDC`,
          paymentType: "USDC",
          payoutOption:
            orderData.payment_type === "cash_pickup"
              ? "Pickup"
              : orderData.payment_type === "cash_delivery"
              ? "Delivery"
              : "Bank Transfer",
          deliveryAddress:
            orderData.pickup_location_address_line || "Address to be confirmed",
        };

        return orderSummary;
      }
    }

    return null;
  };

  // Format order summary for display
  const formatOrderSummary = (summary: any): string => {
    let formatted = "";

    // Amount section
    if (summary.amount) {
      formatted += `💰 **You Sell:** ${summary.amount} ${
        summary.currency || "USDC"
      }\n`;

      if (summary.sell_amount) {
        formatted += `💵 **You Get:** ${summary.currency_symbol}${summary.sell_amount}\n`;
      }

      if (summary.sell_rate) {
        formatted += `📊 **Rate:** ${summary.currency_symbol}${
          summary.sell_rate
        } per 1 ${summary.currency || "USDC"}\n`;
      }

      formatted += "\n";
    }

    // Method section
    if (summary.method) {
      const methodName = summary.method
        .replace("_", " ")
        .replace(/\b\w/g, (l: string) => l.toUpperCase());
      formatted += `🏦 **Payment Method:** ${methodName}\n`;
    }

    // Location/Address section
    if (summary.method === "cash_pickup" && summary.pickup_location) {
      formatted += `📍 **Pickup Location:** ${summary.pickup_location}\n`;
    } else if (summary.method === "cash_delivery" && summary.address) {
      formatted += `📍 **Delivery Address:** ${summary.address}\n`;
    }

    // Business info
    if (summary.business_name) {
      formatted += `🏢 **Merchant:** ${summary.business_name}\n`;
    }

    // Fees (if any)
    formatted += `💸 **Fee:** ₺0.00\n`;

    formatted += "\n*Please review your order details before confirming.*";

    return formatted;
  };

  // Enhanced send message that supports both workflow and direct messaging
  const sendMessage = async (
    content: string,
    metadata?: any,
    forceDirect = false
  ): Promise<boolean> => {
    if (!content.trim() || isProcessing.value) return false;

    // ✅ NEW: If business has joined, use regular chat messaging
    if (businessJoined.value || directMessagingEnabled.value || forceDirect) {
      console.log("🔧 Using sendRegularChatMessage");
      return sendRegularChatMessage(content);
    }

    // ✅ DEFAULT: Use workflow message for regular flow
    console.log("🔧 Using sendWorkflowMessage");
    return sendWorkflowMessage(content, metadata);
  };

  const sendWorkflowMessage = async (
    content: string,
    metadata?: any
  ): Promise<boolean> => {
    if (!content.trim() || isProcessing.value) return false;

    try {
      isProcessing.value = true;

      // Build structured response based on last AI message requirements
      const lastAI = getLastAIMessage();
      const structuredResponse = buildStructuredResponse(
        content,
        lastAI,
        metadata
      );

      // Add user message to display immediately
      const userMessage: WorkflowMessage = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content,
        text_content: content,
        user_uuid: Logic.Auth.AuthUser?.uuid || "user",
        user_name: Logic.Auth.AuthUser?.first_name || "You",
        type: "text" as const,
        isUser: true,
        timestamp: new Date(),
        sender: {
          uuid: Logic.Auth.AuthUser?.uuid || "user",
          name: Logic.Auth.AuthUser?.first_name || "You",
        },
      };
      addMessage(userMessage);

      // ✅ DEBUG: Log the complete metadata being sent to backend (like backup)
      const fullMetadata = {
        is_bot: false,
        type: "structured_response",
        sender_type: "user",
        sender_name: Logic.Auth.AuthUser?.first_name || "User",
        sender_uuid: Logic.Auth.AuthUser?.uuid,
        // ✅ CRITICAL: Spread structured response directly into metadata (like backup)
        ...structuredResponse,
        // ✅ CRITICAL: Also include as nested field for backward compatibility
        structured_response: structuredResponse,
        workflow_data: metadata,
        // ✅ CRITICAL: Include exchange ad directly (like backup)
        exchangeAd: Logic.Messaging.SingleConversation?.exchangeAd || null,
        // ✅ CRITICAL: Include customer information (like backup)
        customer_name:
          `${Logic.Auth.AuthUser?.first_name} ${Logic.Auth.AuthUser?.last_name}`.trim(),
        user_name:
          `${Logic.Auth.AuthUser?.first_name} ${Logic.Auth.AuthUser?.last_name}`.trim(),
        sender: {
          first_name: Logic.Auth.AuthUser?.first_name,
          last_name: Logic.Auth.AuthUser?.last_name,
          uuid: Logic.Auth.AuthUser?.uuid,
        },
      };

      // Send to backend - same API as current system
      Logic.Messaging.CreateMessageForm = {
        input: {
          conversation_id: conversationId.value,
          content: content,
          type: "text",
          sender_id: parseInt(Logic.Auth.AuthUser?.id || "0"),
          metadata: JSON.stringify(fullMetadata),
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

  // Handle incoming messages from WebSocket
  const handleIncomingMessage = (messageData: any) => {
    console.log("📨 Workflow engine received message:", messageData);

    // ✅ DEBUG: Log the metadata to understand what type of message this is
    const metadata =
      typeof messageData.metadata === "string"
        ? JSON.parse(messageData.metadata)
        : messageData.metadata || {};

    console.log("🔧 DEBUG: Message metadata:", metadata);
    console.log("🔧 DEBUG: Message type from metadata:", metadata.type);
    console.log("🔧 DEBUG: Is regular chat:", metadata.is_regular_chat);

    // ✅ IMPROVED: Better duplicate detection using multiple methods
    const messageId = messageData.uuid || messageData.id;
    const messageContent = messageData.content || messageData.text_content;
    const messageTimestamp = messageData.createdAt || messageData.created_at;

    // Check for exact UUID match first
    if (messageId) {
      const existingMessageById = messages.find(
        (m) => m.id === messageId?.toString()
      );
      if (existingMessageById) {
        console.log(
          "⏭️ Message with UUID already exists, skipping:",
          messageId
        );
        return;
      }
    }

    // ✅ NEW: Check for content + sender duplicates (for temp message replacement)
    if (messageContent && messageData.user_id) {
      const currentUserId = parseInt(Logic.Auth.AuthUser?.id || "0");
      const recentTimeWindow = 5000; // 5 seconds

      // For messages from current user, replace any recent temp messages with same content
      if (messageData.user_id === currentUserId) {
        const tempMessageIndex = messages.findIndex(
          (m) =>
            m.content === messageContent &&
            m.id.startsWith("temp_") &&
            Date.now() - m.timestamp.getTime() < recentTimeWindow
        );

        if (tempMessageIndex >= 0) {
          console.log(
            "🔄 Replacing temp message with WebSocket message:",
            messageContent
          );
          // Remove the temp message
          messages.splice(tempMessageIndex, 1);
        }
      }
    }

    // ✅ BACKUP LOGIC: Skip system/trigger messages
    if (metadata.trigger_conversation || metadata.is_system_message) {
      console.log("⏭️ Skipping system message");
      return;
    }

    // ✅ NEW: Skip order cancellation messages if order was already created successfully
    if (
      orderCreated.value &&
      messageData.content?.toLowerCase().includes("order canceled")
    ) {
      console.log("⏭️ Skipping order cancellation - order already created");
      return;
    }

    // Handle business user joining events
    if (
      messageData.type === "user_joined" ||
      messageData.event === "business_joined" ||
      messageData.event === "user.joined"
    ) {
      const userData = messageData.user || messageData.data || messageData;
      if (userData && !isBusinessUser.value) {
        console.log("🎉 Business user joined - enabling direct messaging");
        handleBusinessJoined(userData);
      }
      return;
    }

    // ✅ NEW: Handle conversation participant changes
    if (
      messageData.type === "conversation_updated" ||
      messageData.event === "conversation.participant.added"
    ) {
      const conversationData = Logic.Messaging.SingleConversation;
      if (
        conversationData?.participants &&
        conversationData.participants.length > 1
      ) {
        console.log("🔧 New participant detected - checking for business user");

        // Find the new participant (not current user)
        const currentUserId = parseInt(Logic.Auth.AuthUser?.id || "0");
        const newParticipant = conversationData.participants.find(
          (p: any) => p.user_id !== currentUserId
        );

        if (newParticipant && !businessJoined.value) {
          console.log("🎉 New business participant detected:", newParticipant);
          handleBusinessJoined(newParticipant);
        }
      }
      return;
    }

    // Handle regular messages
    if (messageData.text_content || messageData.content) {
      try {
        console.log("🔧 Processing regular message:", {
          content: messageData.content,
          user_id: messageData.user_id,
          uuid: messageData.uuid,
        });

        const displayMessage = convertToDisplayMessage(messageData);
        console.log("🔧 Converted message:", {
          id: displayMessage.id,
          content: displayMessage.content,
          isUser: displayMessage.isUser,
          user_name: displayMessage.user_name,
        });

        // Check if this is from a business user
        const isFromBusiness =
          metadata.sender_type === "business" ||
          messageData.sender_type === "business" ||
          (messageData.sender &&
            messageData.sender.uuid !== Logic.Auth.AuthUser?.uuid &&
            messageData.sender.uuid !== "greep_ai");

        if (isFromBusiness) {
          // Mark as business message and enable direct messaging
          displayMessage.metadata = {
            type: displayMessage.metadata?.type || "text",
            ...displayMessage.metadata,
            extras: {
              ...displayMessage.metadata?.extras,
              from_business: true,
            },
          };

          if (!businessJoined.value) {
            console.log(
              "🎉 Business message detected - enabling direct messaging"
            );
            businessJoined.value = true;
            directMessagingEnabled.value = true;
          }
        }

        console.log("🔧 Adding message to array...");
        addMessage(displayMessage);
        console.log("🔧 Messages array length after adding:", messages.length);

        // Modal triggers (keeping existing logic)
        if (!displayMessage.isUser && displayMessage.content) {
          const content = displayMessage.content.toLowerCase();

          if (
            content.includes("pickup location") &&
            content.includes("branches")
          ) {
            console.log("🔧 PICKUP-LOCATION: Manually triggering pickup modal");
            setTimeout(() => {
              manualModalOverride.value = "cash_pickup";
            }, 500);
          } else if (
            content.includes("address") &&
            content.includes("delivery")
          ) {
            setTimeout(() => {
              manualModalOverride.value = "address";
            }, 500);
          } else if (content.includes("bank") && content.includes("account")) {
            setTimeout(() => {
              manualModalOverride.value = "bank_transfer";
            }, 500);
          }
        }
      } catch (error) {
        console.error("❌ Error handling incoming message:", error);
      }
    } else {
      console.log("⏭️ No content in message, skipping:", messageData);
    }
  };

  // Initialize with existing conversation messages
  const initializeFromConversation = async (conversation: any) => {
    if (!conversation) return;

    isBusinessUser.value = detectBusinessUser(conversation);

    // ✅ FIX: Only enable business mode when there are actually 2+ participants
    // Don't automatically assume business joined just because of participant count
    const participantCount = conversation?.participants?.length || 0;

    if (participantCount > 1 && isBusinessUser.value) {
      businessJoined.value = true;
      directMessagingEnabled.value = true;
    } else {
      businessJoined.value = false;
      directMessagingEnabled.value = false;
    }

    // Clear existing messages array first
    messages.splice(0, messages.length);

    // ✅ For business users, show only order summary (using database data)
    if (isBusinessUser.value) {
      console.log(
        "🔧 Business user - clearing all messages and showing only summary"
      );

      // Force enable business mode for existing conversations
      businessJoined.value = true;
      directMessagingEnabled.value = true;

      // ✅ Use extractOrderSummary to get fresh data from database
      try {
        const orderSummary = await extractOrderSummary();

        if (orderSummary) {
          // Create order summary message with database data
          const summaryMessage: WorkflowMessage = {
            id: `order_summary_${Date.now()}`,
            content: "Order Summary",
            text_content: "Order Summary",
            user_uuid: "greep_ai",
            user_name: "GreepPay AI",
            type: "text" as const,
            isUser: false,
            timestamp: new Date(),
            sender: {
              uuid: "greep_ai",
              name: "GreepPay AI",
            },
            isOrderSummary: true,
            orderSummary: orderSummary,
          };
          addMessage(summaryMessage);
          console.log(
            "✅ Added order summary for business user with database data"
          );
        } else {
          console.log("⚠️ No order data found in database");
        }
      } catch (error) {
        console.log("❌ Error fetching order data from database:", error);
      }
      return; // Skip normal message loading for business users
    } else {
      // ✅ For regular users, load existing messages
      console.log("🔧 Regular user - loading existing messages");

      if (conversation.messages) {
        conversation.messages.forEach((msg: any) => {
          const displayMessage = convertToDisplayMessage(msg);
          addMessage(displayMessage);
        });
      }
    }

    // Set current stage
    currentStage.value = conversation.stage || "";

    // Auto-initialize workflow if needed
    if (!directMessagingEnabled.value && messages.length === 0) {
      console.log("🎯 Auto-starting workflow...");

      // Check if conversation has amount in metadata for auto-send
      const conversationMetadata = conversation.metadata
        ? typeof conversation.metadata === "string"
          ? JSON.parse(conversation.metadata)
          : conversation.metadata
        : {};

      setTimeout(() => {
        initializeWorkflow(conversationMetadata);
      }, 100); // Small delay to ensure everything is ready
    }
  };

  // Initialize workflow conversation if needed
  const initializeWorkflow = async (conversationMetadata?: any) => {
    // Only initialize if we're in workflow mode and have no messages
    if (directMessagingEnabled.value || messages.length > 0) {
      return;
    }

    try {
      const welcomeMessage = {
        id: `msg-${Date.now()}`,
        conversation_id: conversationId,
        content:
          "Hi! 👋 I'm here to help you with your transaction. Let me guide you through the process.",
        user_id: 0,
        sender: { uuid: "greep_ai", name: "Greep AI" },
        metadata: {
          type: "text",
          stage: "welcome",
          timestamp: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addMessage(welcomeMessage);

      setTimeout(async () => {
        try {
          // Get wallet balance like the backup did
          const balance = Logic.Auth.AuthUser?.wallet?.total_balance || "0";

          // Set up message form
          Logic.Messaging.CreateMessageForm = {
            input: {
              conversation_id: conversationId.value,
              content: "Hi", // Use "Hi" like the backup, not "Starting conversation flow..."
              type: "text",
              sender_id: parseInt(Logic.Auth.AuthUser?.id?.toString() || "0"),
              metadata: JSON.stringify({
                is_bot: false,
                type: "text",
                wallet_balance: Logic.Common.convertToMoney(
                  balance,
                  true,
                  "",
                  false
                ),
                stage: "withdrawal_amount",
                trigger_conversation: true,
                structured_response: {},
                conversation_metadata: conversationMetadata || {},
                exchangeAd:
                  Logic.Messaging.SingleConversation?.exchangeAd || null,
                customer_name:
                  `${Logic.Auth.AuthUser?.first_name} ${Logic.Auth.AuthUser?.last_name}`.trim(),
                user_name:
                  `${Logic.Auth.AuthUser?.first_name} ${Logic.Auth.AuthUser?.last_name}`.trim(),
                sender: {
                  first_name: Logic.Auth.AuthUser?.first_name,
                  last_name: Logic.Auth.AuthUser?.last_name,
                  uuid: Logic.Auth.AuthUser?.uuid,
                },
              }),
            },
          };

          const response = await Logic.Messaging.CreateMessage();
        } catch (error) {
          console.error("❌ Failed to trigger backend conversation:", error);
        }
      }, 1500); // Match the original delay from backup
    } catch (error) {
      console.error("❌ Failed to initialize workflow:", error);
    }
  };

  // Current input requirements based on last AI message
  const expectedInput = computed(() => {
    const lastAI = getLastAIMessage();
    return lastAI?.metadata?.extras || {};
  });

  // Check if we need a specific modal
  const activeModal = computed(() => {
    const extras = expectedInput.value;

    if (extras.input_type === "address") return "address";
    if (extras.input_type === "bank_account") return "bank_transfer";
    if (extras.input_type === "pickup_location") return "cash_pickup";
    if (extras.input_type === "datetime") return "datetime";
    if (extras.input_type === "proof_upload") return "proof_upload";

    return null;
  });

  // Handle action button clicks
  const handleActionClick = async (action: any) => {
    try {
      // Prevent multiple clicks during processing
      if (isProcessing.value) {
        return false;
      }

      // Create P2P Order when confirm is clicked
      if (action.value === "confirm") {
        await createP2POrder();
        return true;
      }

      await sendWorkflowMessage(action.value, {
        selected_option: action.value,
      });
      return true;
    } catch (error) {
      console.error("❌ Error handling action click:", error);
      return false;
    }
  };

  // Create P2P Order function
  const createP2POrder = async () => {
    try {
      if (isProcessing.value || orderCreated.value) {
        return null;
      }
      isProcessing.value = true;

      // Get required data from conversation
      const conversationData = Logic.Messaging.SingleConversation;
      const conversationUuid = conversationData?.uuid;
      const exchangeAd = conversationData?.exchangeAd;

      const conversationMetadata = conversationData?.metadata
        ? typeof conversationData.metadata === "string"
          ? JSON.parse(conversationData.metadata)
          : conversationData.metadata
        : {};

      // ✅ Extract pickup location data from conversation metadata
      const isCashPickupOrder = conversationMetadata.pickup_location
        ? true
        : false;
      const pickupLocation = conversationMetadata.pickup_location;
      const pickupLocationName = conversationMetadata.pickup_location_name;
      const pickupLocationAddress =
        conversationMetadata.pickup_location_address;
      const pickupLocationCity = conversationMetadata.pickup_location_city;
      const pickupLocationCountry =
        conversationMetadata.pickup_location_country;

      const orderSummary = await extractOrderSummary();
      if (!orderSummary) {
        throw new Error(
          "Could not extract order summary for P2P order creation"
        );
      }

      // ✅ Determine correct payment type and payout option
      let paymentType = "cash";
      let payoutOption = "cash_delivery";
      let deliveryAddress = "";
      let city = "Lagos";
      let country = "Nigeria";

      const userMessages = messages.filter((m) => m.isUser);
      const hasBankTransfer = userMessages.some((m) =>
        m.content.toLowerCase().includes("bank:")
      );

      if (isCashPickupOrder) {
        // ✅ Cash pickup order
        paymentType = "cash_pickup";
        payoutOption = "pickup";
        deliveryAddress =
          pickupLocation ||
          `Pickup: ${pickupLocationName} - ${pickupLocationAddress}, ${pickupLocationCity}, ${pickupLocationCountry}`;
        city = pickupLocationCity || "Lagos";
        country = pickupLocationCountry || "Nigeria";
      } else if (
        hasBankTransfer ||
        conversationMetadata.method === "transfer"
      ) {
        // ✅ Bank transfer method
        paymentType = "transfer";
        payoutOption = "bank_transfer";

        // Extract bank account details from messages
        const bankMessage = userMessages.find((m) =>
          m.content.toLowerCase().includes("bank:")
        );
        if (bankMessage) {
          deliveryAddress = bankMessage.content.replace(/bank:\s*/i, "");
        }
        city = "Lagos"; // Default for delivery
        country = "Nigeria"; // Default for delivery
      } else {
        // ✅ Cash delivery method - extract address and location
        const addressMessage = userMessages.find(
          (m) =>
            m.content.length > 20 &&
            !m.content.toLowerCase().includes("usdc") &&
            (m.content.includes(",") ||
              m.content.toLowerCase().includes("street"))
        );

        if (addressMessage) {
          deliveryAddress = addressMessage.content;
          // Try to extract city/country from address
          const addressParts = deliveryAddress.split(",").map((p) => p.trim());
          if (addressParts.length >= 2) {
            city = addressParts[addressParts.length - 2] || city;
            country = addressParts[addressParts.length - 1] || country;
          }
        }
      }

      // Extract amount from order summary
      const amount =
        parseFloat(orderSummary.youSell.replace(/[^\d.]/g, "")) || 0;

      if (amount <= 0) {
        throw new Error("Invalid amount for P2P order creation");
      }

      // ✅ Prepare order data
      const orderData = {
        exchange_ad_uuid: exchangeAd?.uuid || "", // Ensure it's never undefined
        amount: amount,
        delivery_address: deliveryAddress,
        city: city,
        country: country,
        payment_type: paymentType,
        payout_option: payoutOption,
        conversation_uuid: conversationUuid || "", // Ensure it's never undefined
        metadata: JSON.stringify({
          conversation_id: conversationData?.id,
          user_id: Logic.Auth.AuthUser?.id,
          user_uuid: Logic.Auth.AuthUser?.uuid,
          business_name: exchangeAd?.business?.business_name,
          business_uuid: exchangeAd?.business?.uuid,
          created_at: new Date().toISOString(),
          location_context: {
            city: city,
            country: country,
          },
          // ✅ Include pickup location details for pickup orders
          ...(isCashPickupOrder && {
            pickup_location: pickupLocation,
            pickup_location_name: pickupLocationName,
            pickup_location_address: pickupLocationAddress,
            pickup_location_city: pickupLocationCity,
            pickup_location_country: pickupLocationCountry,
          }),
        }),
      };

      console.log("🔧 Creating P2P order with data:", orderData);

      try {
        const createdOrder = await Logic.Wallet.CreateP2pOrder(orderData);

        if (createdOrder) {
          // ✅ Save order_uuid to conversation metadata
          if (createdOrder.uuid) {
            try {
              const conversationData = Logic.Messaging.SingleConversation;
              if (conversationData) {
                const currentMetadata = conversationData.metadata
                  ? JSON.parse(conversationData.metadata)
                  : {};
                currentMetadata.order_uuid = createdOrder.uuid;
                currentMetadata.order_data = orderData;
                conversationData.metadata = JSON.stringify(currentMetadata);
              }
            } catch (error) {
              console.error("❌ Error storing order UUID in metadata:", error);
            }
          }

          console.log("✅ P2P Order created successfully:", createdOrder);

          // ✅ Set order created flag
          orderCreated.value = true;

          // ✅ Enable direct messaging for everyone
          directMessagingEnabled.value = true;

          console.log("🔧 DEBUG: About to clear messages and show summary");
          console.log(
            "🔧 DEBUG: Messages length before clearing:",
            messages.length
          );

          // ✅ CLEAR ALL MESSAGES and show only order summary (like before)
          messages.length = 0; // Clear all existing messages

          console.log(
            "🔧 DEBUG: Messages length after clearing:",
            messages.length
          );

          // Create order summary message only
          const orderSummaryMessage: WorkflowMessage = {
            id: `order_summary_${Date.now()}`,
            content: "Order Summary",
            text_content: "Order Summary",
            user_uuid: "greep_ai",
            user_name: "GreepPay AI",
            type: "text" as const,
            isUser: false,
            timestamp: new Date(),
            sender: { uuid: "greep_ai", name: "GreepPay AI" },
            isOrderSummary: true,
            orderSummary: orderSummary,
          };

          addMessage(orderSummaryMessage);

          console.log(
            "🔧 DEBUG: Messages length after adding summary:",
            messages.length
          );

          // ✅ Start countdown timer
          setTimeout(() => {
            startCountdown("waiting_business", 600); // 10 minutes

            // Add countdown message
            const countdownMessage: WorkflowMessage = {
              id: `countdown_${Date.now()}`,
              content: "⏰ Order created! Waiting for business to accept...",
              text_content:
                "⏰ Order created! Waiting for business to accept...",
              user_uuid: "greep_ai",
              user_name: "GreepPay AI",
              type: "text" as const,
              isUser: false,
              timestamp: new Date(),
              sender: { uuid: "greep_ai", name: "GreepPay AI" },
            };
            addMessage(countdownMessage);
          }, 1000);

          return createdOrder;
        }
      } catch (graphqlError: any) {
        console.error("❌ GraphQL Error details:", {
          message: graphqlError.message,
          graphQLErrors: graphqlError.graphQLErrors,
          networkError: graphqlError.networkError,
        });
        directMessagingEnabled.value = true;

        // Add informational message about order creation failure but chat enabled
        // const fallbackMessage: WorkflowMessage = {
        //   id: `order_fallback_${Date.now()}`,
        //   content: `⚠️ Order processing encountered an issue, but you can now chat directly with the business partner to complete your transaction.\n\nAmount: ${orderSummary.youSell}\nMethod: ${orderSummary.payoutOption}`,
        //   text_content: `⚠️ Order processing encountered an issue, but you can now chat directly with the business partner to complete your transaction.\n\nAmount: ${orderSummary.youSell}\nMethod: ${orderSummary.payoutOption}`,
        //   user_uuid: "greep_ai",
        //   user_name: "GreepPay AI",
        //   type: "text" as const,
        //   isUser: false,
        //   timestamp: new Date(),
        //   sender: {
        //     uuid: "greep_ai",
        //     name: "GreepPay AI",
        //   },
        // };

        // addMessage(fallbackMessage);
        return null;
      }
    } catch (error) {
      console.error("❌ Error creating P2P order:", error);

      directMessagingEnabled.value = true;
      return null;
    } finally {
      isProcessing.value = false;
    }
  };
  return {
    // State
    messages,
    isProcessing,
    currentStage,
    isConnected,
    isBusinessUser,
    businessJoined,
    directMessagingEnabled,

    // Computed
    expectedInput,
    activeModal,
    manualModalOverride,

    // Methods
    sendMessage,
    sendDirectMessage,
    sendRegularChatMessage,
    sendWorkflowMessage,
    addMessage,
    handleIncomingMessage,
    initializeFromConversation,
    initializeWorkflow,
    getLastAIMessage,
    buildStructuredResponse,
    handleBusinessJoined,
    detectBusinessUser,
    extractOrderSummary,
    formatOrderSummary,
    handleActionClick,
    createP2POrder,
    startCountdown,
    stopCountdown,
    countdownType,
    countdownTime,
    orderCreated,
  };
};
