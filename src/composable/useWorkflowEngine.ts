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
  const businessUserInfo = ref<any>(null); // ✅ NEW: Store business user data for message sender resolution
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
      // Get exchange ad data for proper currency and rate handling
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

    // Get user info for the message
    const userUuid = isAIMessage
      ? "greep_ai"
      : backendMessage.sender?.uuid ||
        backendMessage.user_uuid ||
        // ✅ NEW: Try to get UUID from business user info if this matches their user_id
        (businessUserInfo.value &&
        (businessUserInfo.value.id === backendMessage.user_id ||
          businessUserInfo.value.user_id === backendMessage.user_id)
          ? businessUserInfo.value.uuid
          : null) ||
        Logic.Auth.AuthUser?.uuid ||
        "user";

    // ✅ FIXED: Better sender name detection
    let userName = "User";

    if (isAIMessage) {
      userName = "GreepPay AI";
    } else {
      // For real user messages, try to get the actual sender name
      const currentUserId = parseInt(Logic.Auth.AuthUser?.id || "0");
      const messageUserId = backendMessage.user_id;

      if (messageUserId === currentUserId) {
        // This is current user's message
        userName = Logic.Auth.AuthUser?.first_name || "You";
      } else if (messageUserId && messageUserId !== 0) {
        // This is from another user - try to find their name from participants
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
          } else {
            // ✅ NEW: Try to get name from WebSocket user data (business users who recently joined)
            // Check if this matches a business user that recently joined
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
            } else {
              // Fallback: try to get name from message sender data
              if (backendMessage.sender?.name) {
                userName = backendMessage.sender.name;
              } else if (
                backendMessage.sender?.first_name ||
                backendMessage.sender?.last_name
              ) {
                userName = `${backendMessage.sender.first_name || ""} ${
                  backendMessage.sender.last_name || ""
                }`.trim();
              } else if (
                backendMessage.user_name &&
                backendMessage.user_name !== "GreepPay AI"
              ) {
                userName = backendMessage.user_name;
              } else {
                userName = "Other User";
              }
            }
          }
        } else {
          // No participants data available, try message sender info
          if (backendMessage.sender?.name) {
            userName = backendMessage.sender.name;
          } else if (
            backendMessage.sender?.first_name ||
            backendMessage.sender?.last_name
          ) {
            userName = `${backendMessage.sender.first_name || ""} ${
              backendMessage.sender.last_name || ""
            }`.trim();
          } else if (
            backendMessage.user_name &&
            backendMessage.user_name !== "GreepPay AI"
          ) {
            userName = backendMessage.user_name;
          } else {
            userName = "Other User";
          }
        }
      }
    }

    console.log("🔧 Message sender detection:", {
      messageUserId: backendMessage.user_id,
      currentUserId: Logic.Auth.AuthUser?.id,
      isAIMessage,
      resolvedUserName: userName,
      senderData: backendMessage.sender,
    });

    // Determine message type - ChatMessage component only supports "text" and "info"
    // Backend might send "options" type, but we should use "text" for messages with actions
    let messageType = metadata?.type || "text";
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
      orderSummaryData = extractOrderSummary();

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
      isUser: !isAIMessage,
      timestamp: new Date(backendMessage.createdAt || Date.now()),
      metadata,
      actions,
      isOrderSummary,
      orderSummary: orderSummaryData,
      sender:
        backendMessage.sender ||
        (isAIMessage
          ? { uuid: "greep_ai", name: "GreepPay AI" }
          : { uuid: userUuid, name: userName }),
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
      messages[existingIndex] = displayMessage;
    } else {
      messages.push(displayMessage);
    }
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
  const handleBusinessJoined = (businessUserData: any) => {
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

    // ✅ NEW: If current user is business, show only summary instead of all messages (like backup)
    if (isBusinessUser.value) {
      console.log(
        "🎯 Business user joined - showing summary instead of all messages"
      );

      // Clear any existing messages (except the business joined message we just added)
      const businessJoinedMessageId = businessJoinedMessage.id;
      messages.length = 0;

      // Re-add the business joined message
      messages.push(businessJoinedMessage);

      // Create order summary message for business user (like backup)
      const orderSummary = extractOrderSummary();
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
  const extractOrderSummary = () => {
    // Get exchange ad data for order details
    const conversationData = Logic.Messaging.SingleConversation;
    const exchangeAd = conversationData?.exchangeAd;

    const summary: any = {
      amount: null,
      currency: "USDC",
      currency_symbol: "₺",
      method: null,
      address: null,
      pickup_location: null,
      business_name: exchangeAd?.business?.business_name || "GreepPay",
      sell_rate: exchangeAd?.rate || 10,
      status: "pending",
    };

    // ✅ BETTER: Look for amount in conversation metadata first
    let incomingAmount = null;
    try {
      // Check if amount is in conversation metadata or URL params
      const urlParams = new URLSearchParams(window.location.search);
      const amountParam = urlParams.get("amount");
      if (amountParam) {
        incomingAmount = parseFloat(amountParam);
      }
    } catch (e) {
      // Ignore URL parsing errors
    }

    if (incomingAmount && incomingAmount > 0) {
      summary.amount = incomingAmount;
    } else {
      // ✅ FALLBACK: Only look for simple numeric user messages (avoiding metadata numbers)
      const userMessages = messages.filter((m) => m.isUser);
      for (const msg of userMessages) {
        // Only consider short numeric messages (likely amount inputs)
        if (
          msg.content.length <= 10 &&
          /^\d+(\.\d+)?$/.test(msg.content.trim())
        ) {
          const amount = parseFloat(msg.content.trim());
          if (amount > 0 && amount < 10000) {
            // Reasonable amount range
            summary.amount = amount;
            console.log("🔍 Found amount from user message:", amount);
            break;
          }
        }
      }
    }

    // Calculate sell amount
    if (summary.amount) {
      summary.sell_amount = (summary.amount * summary.sell_rate).toFixed(2);
    }

    // ✅ BETTER: Extract method from the last method selection
    const userMessages = messages.filter((m) => m.isUser);
    userMessages.reverse(); // Check latest messages first

    userMessages.forEach((msg) => {
      const content = msg.content.toLowerCase();
      if (content.includes("pickup") || content === "cash") {
        summary.method = "cash_pickup";
      } else if (content.includes("delivery")) {
        summary.method = "cash_delivery";
      } else if (content.includes("bank")) {
        summary.method = "bank_transfer";
      }
    });

    // Extract address for delivery
    userMessages.forEach((msg) => {
      if (
        msg.content.length > 20 &&
        (msg.content.includes(",") ||
          msg.content.toLowerCase().includes("street"))
      ) {
        summary.address = msg.content;
      }
    });

    // Extract pickup location
    userMessages.forEach((msg) => {
      if (msg.content.toLowerCase().includes("pickup:")) {
        summary.pickup_location = msg.content.replace(/pickup:\s*/i, "");
      }
    });

    // ✅ Extract bank account details
    userMessages.forEach((msg) => {
      if (msg.content.toLowerCase().includes("bank:")) {
        summary.bank_account = msg.content.replace(/bank:\s*/i, "");
      }
    });

    // ✅ Return the exact format ChatMessage component expects
    if (summary.amount && summary.method) {
      // ✅ FIX: Calculate delivery fee based on method
      const deliveryFee = summary.method === "cash_delivery" ? 3 : 0;
      const totalAmount = summary.amount + deliveryFee;

      return {
        youSell: `${summary.amount} USDC`,
        youGet: `${summary.currency_symbol}${summary.sell_amount}`,
        fee: "0 USDC",
        deliveryFee: `${deliveryFee} USDC`,
        youPay: `${totalAmount} USDC`,
        paymentType: "USDC",
        payoutOption:
          summary.method === "cash_pickup"
            ? "Pickup"
            : summary.method === "cash_delivery"
            ? "Delivery"
            : "Bank Transfer",
        deliveryAddress:
          summary.method === "cash_pickup"
            ? summary.pickup_location
            : summary.method === "cash_delivery"
            ? summary.address
            : summary.bank_account || "Bank account details",
      };
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

    console.log("🔧 sendMessage called with:", {
      content,
      directMessagingEnabled: directMessagingEnabled.value,
      businessJoined: businessJoined.value,
      forceDirect,
    });

    // ✅ NEW: If business has joined, use regular chat messaging
    if (businessJoined.value || directMessagingEnabled.value || forceDirect) {
      console.log("🔧 Using sendRegularChatMessage");
      return sendRegularChatMessage(content);
    }

    // ✅ DEFAULT: Use workflow message for regular flow
    console.log("🔧 Using sendWorkflowMessage");
    return sendWorkflowMessage(content, metadata);
  };

  // Original workflow message sending (renamed)
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
          sender_id: parseInt(
            Logic.Auth.AuthUser?.id ||
              Logic.Auth.AuthUser?.business_user_id ||
              "0"
          ),
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

    // ✅ BACKUP LOGIC: Duplicate detection like backup
    const messageId = messageData.id || messageData.uuid;
    const existingMessageById = messages.find(
      (m) => m.id === messageId?.toString()
    );
    if (existingMessageById) {
      console.log("⏭️ Message with same ID already exists, skipping");
      return;
    }

    // ✅ BACKUP LOGIC: Skip system/trigger messages
    const metadata =
      typeof messageData.metadata === "string"
        ? JSON.parse(messageData.metadata)
        : messageData.metadata || {};

    if (metadata.trigger_conversation || metadata.is_system_message) {
      console.log("⏭️ Skipping system message");
      return;
    }

    // ✅ NEW: Skip order cancellation messages if order was already created successfully
    if (
      orderCreated.value &&
      messageData.content?.toLowerCase().includes("order canceled")
    ) {
      console.log(
        "⏭️ Skipping order cancellation message - order already created"
      );
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

    // ✅ NEW: Handle conversation participant changes (from backup)
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
        const displayMessage = convertToDisplayMessage(messageData);

        // Check if this is from a business user
        const metadata =
          typeof messageData.metadata === "string"
            ? JSON.parse(messageData.metadata)
            : messageData.metadata || {};

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

        addMessage(displayMessage);

        // ✅ NEW: Check for different modal types based on message content
        if (!displayMessage.isUser && displayMessage.content) {
          const content = displayMessage.content.toLowerCase();

          // Pickup location modal (Cash)
          if (
            content.includes("pickup location") &&
            content.includes("branches")
          ) {
            console.log("🔧 PICKUP-LOCATION: Manually triggering pickup modal");
            setTimeout(() => {
              manualModalOverride.value = "cash_pickup";
            }, 500);
          }

          // Address input modal (Cash Delivery)
          else if (
            content.includes("address") &&
            content.includes("delivery")
          ) {
            setTimeout(() => {
              manualModalOverride.value = "address";
            }, 500);
          }

          // Bank transfer modal (Bank Transfer)
          else if (content.includes("bank") && content.includes("account")) {
            setTimeout(() => {
              manualModalOverride.value = "bank_transfer";
            }, 500);
          }
        }

        // ✅ NEW: Check for auto-amount sending after adding the message
        // Only check for AI messages asking for amount
        if (!displayMessage.isUser && displayMessage.content) {
          const content = displayMessage.content.toLowerCase();
          if (content.includes("how much") && content.includes("usdc")) {
            const conversationData = Logic.Messaging.SingleConversation;
            const conversationMetadata = conversationData?.metadata
              ? typeof conversationData.metadata === "string"
                ? JSON.parse(conversationData.metadata)
                : conversationData.metadata
              : {};

            const amountToSend =
              getAmountFromConversation(conversationMetadata);

            if (amountToSend) {
              const balance = parseFloat(
                Logic.Auth.AuthUser?.wallet?.total_balance || "0"
              );
              if (amountToSend <= balance) {
                setTimeout(() => {
                  sendWorkflowMessage(amountToSend.toString());
                }, 1000);
              } else {
                console.log(
                  "🔧 AUTO-AMOUNT: Insufficient balance for auto-send from incoming message"
                );
              }
            }
          }
        }
      } catch (error) {
        console.error("❌ Error handling incoming message:", error);
      }
    }
  };

  // Initialize with existing conversation messages
  const initializeFromConversation = (conversation: any) => {
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
    messages.splice(0, messages.length);

    // Add existing messages if available
    if (conversation.messages) {
      conversation.messages.forEach((msg: any) => {
        const displayMessage = convertToDisplayMessage(msg);
        addMessage(displayMessage);
      });
    }

    // If business user AND there are existing messages, show summary instead of full workflow
    if (isBusinessUser.value && businessJoined.value && messages.length > 0) {
      const orderSummary = extractOrderSummary();
      if (orderSummary) {
        messages.splice(0, messages.length);

        const summaryMessage: WorkflowMessage = {
          id: `order_summary_${Date.now()}`,
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
            name: "Greep AI",
          },
          metadata: {
            type: "text", // ✅ FIX: Change to "text" since this displays content, not an info icon
            extras: {
              order_summary: orderSummary,
              is_business_summary: true,
            },
          },
        };
        addMessage(summaryMessage);
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

  const getAmountFromConversation = (conversationMetadata?: any) => {
    if (conversationMetadata?.amount) {
      const amount = parseFloat(conversationMetadata.amount);
      if (!isNaN(amount) && amount > 0 && amount < 10000) {
        return amount;
      }
    }

    // Second priority: Check Logic.Messaging.SingleConversation metadata
    const singleConversation = Logic.Messaging.SingleConversation;
    if (singleConversation?.metadata) {
      try {
        const metadata =
          typeof singleConversation.metadata === "string"
            ? JSON.parse(singleConversation.metadata)
            : singleConversation.metadata;

        if (metadata?.amount) {
          const amount = parseFloat(metadata.amount);
          if (!isNaN(amount) && amount > 0 && amount < 10000) {
            return amount;
          }
        }
      } catch (error) {
        console.error("❌ Error parsing SingleConversation metadata:", error);
      }
    }

    const exchangeAd = singleConversation?.exchangeAd;
    if (exchangeAd?.min_amount) {
      return exchangeAd.min_amount;
    }
    return null;
  };

  // Setup auto-amount sending functionality (from backup)
  const setupAutoAmountSending = (conversationMetadata?: any) => {
    const amountToSend = getAmountFromConversation(conversationMetadata);

    if (!amountToSend) {
      return;
    }

    // Monitor for AI messages asking for amount
    const checkForAmountQuestion = () => {
      const lastAIMessage = messages.filter((msg) => !msg.isUser).pop();

      if (lastAIMessage?.content) {
        const content = lastAIMessage.content.toLowerCase();

        if (content.includes("how much") && content.includes("usdc")) {
          const balance = parseFloat(
            Logic.Auth.AuthUser?.wallet?.total_balance || "0"
          );
          if (amountToSend <= balance) {
            setTimeout(() => {
              sendWorkflowMessage(amountToSend.toString());
            }, 1000);
            return true;
          } else {
            console.log("🔧 AUTO-AMOUNT: Insufficient balance for auto-send");
          }
        }
      }

      return false; // Continue monitoring
    };

    // Check immediately for existing messages
    if (checkForAmountQuestion()) {
      return;
    }
    let messageCount = messages.length;
    let checkCount = 0;
    const maxChecks = 60; // Check for 30 seconds (60 * 500ms)

    const messageWatcher = setInterval(() => {
      checkCount++;

      if (messages.length > messageCount) {
        messageCount = messages.length;

        if (checkForAmountQuestion()) {
          clearInterval(messageWatcher);
          return;
        }
      }

      // Stop monitoring after max checks to prevent memory leaks
      if (checkCount >= maxChecks) {
        clearInterval(messageWatcher);
      }
    }, 500);
  };

  // Initialize workflow conversation if needed
  const initializeWorkflow = async (conversationMetadata?: any) => {
    // Only initialize if we're in workflow mode and have no messages
    if (directMessagingEnabled.value || messages.length > 0) {
      return;
    }

    console.log("🚀 Starting workflow initialization...", {
      conversationMetadata,
      hasAmount: !!conversationMetadata?.amount,
    });

    try {
      // Add welcome message
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

      // Setup auto-amount sending if amount is available
      if (conversationMetadata?.amount) {
        setupAutoAmountSending(conversationMetadata);
      }

      // Trigger backend conversation start after short delay
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
                // ✅ CRITICAL: Include exchange ad directly (like backup)
                exchangeAd:
                  Logic.Messaging.SingleConversation?.exchangeAd || null,
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
        console.log("⏭️ Action click ignored - already processing");
        return false;
      }

      // Create P2P Order when confirm is clicked
      if (action.value === "confirm") {
        await createP2POrder();
        // Don't send additional message after order creation
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
      // Prevent duplicate order creation
      if (isProcessing.value || orderCreated.value) {
        console.log(
          "⏭️ Order creation skipped - already processing or created"
        );
        return null;
      }

      isProcessing.value = true;
      console.log("🚀 Creating P2P Order via GraphQL...");

      // Get required data from conversation
      const conversationData = Logic.Messaging.SingleConversation;
      const exchangeAd = conversationData?.exchangeAd;
      const conversationUuid = conversationData?.uuid;

      if (!exchangeAd?.uuid || !conversationUuid) {
        throw new Error("Missing required data for P2P order creation");
      }

      // ✅ Get conversation metadata properly (like backup)
      const conversationMetadata = conversationData?.metadata
        ? typeof conversationData.metadata === "string"
          ? JSON.parse(conversationData.metadata)
          : conversationData.metadata
        : {};

      // ✅ Extract pickup location data from conversation metadata (like backup)
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

      // Extract order details from messages
      const orderSummary = extractOrderSummary();
      if (!orderSummary) {
        throw new Error(
          "Could not extract order summary for P2P order creation"
        );
      }

      // ✅ Determine correct payment type and payout option (like backup)
      let paymentType = "cash";
      let payoutOption = "cash_delivery";
      let deliveryAddress = "";
      let city = exchangeAd.business?.city || "Lagos";
      let country = exchangeAd.business?.country || "Nigeria";

      const userMessages = messages.filter((m) => m.isUser);
      const hasBankTransfer = userMessages.some((m) =>
        m.content.toLowerCase().includes("bank:")
      );

      if (isCashPickupOrder) {
        // ✅ Cash pickup order (like backup)
        paymentType = "cash_pickup";
        payoutOption = "pickup";
        deliveryAddress =
          pickupLocation ||
          `Pickup: ${pickupLocationName} - ${pickupLocationAddress}, ${pickupLocationCity}, ${pickupLocationCountry}`;
        city = pickupLocationCity || exchangeAd.business?.city || "Lagos";
        country =
          pickupLocationCountry || exchangeAd.business?.country || "Nigeria";
      } else if (
        hasBankTransfer ||
        conversationMetadata.method === "transfer"
      ) {
        // ✅ Bank transfer method (like backup)
        paymentType = "transfer";
        payoutOption = "bank_transfer";

        // Extract bank account details from messages
        const bankMessage = userMessages.find((m) =>
          m.content.toLowerCase().includes("bank:")
        );
        if (bankMessage) {
          deliveryAddress = bankMessage.content.replace(/bank:\s*/i, "");
        }
        // Keep business location for bank transfers
        city = exchangeAd.business?.city || "Lagos";
        country = exchangeAd.business?.country || "Nigeria";
      } else {
        // ✅ Cash delivery method - extract address and location (like backup)
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

      // ✅ Prepare order data like backup
      const orderData = {
        exchange_ad_uuid: exchangeAd.uuid,
        amount: amount,
        delivery_address: deliveryAddress,
        city: city,
        country: country,
        payment_type: paymentType,
        payout_option: payoutOption,
        conversation_uuid: conversationUuid,
        metadata: JSON.stringify({
          conversation_id: conversationData?.id,
          user_id: Logic.Auth.AuthUser?.id,
          user_uuid: Logic.Auth.AuthUser?.uuid,
          business_name: exchangeAd.business?.business_name,
          business_uuid: exchangeAd.business?.uuid,
          created_at: new Date().toISOString(),
          // Add location context if available
          location_context: {
            city: city,
            country: country,
          },
          // ✅ Include pickup location details for pickup orders (like backup)
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
        // Call the GraphQL mutation with error handling
        const createdOrder = await Logic.Wallet.CreateP2pOrder(orderData);

        if (createdOrder) {
          console.log("✅ P2P Order created successfully:", createdOrder);

          // ✅ Save order_uuid to conversation metadata (like backup)
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
                console.log(
                  "✅ Stored order UUID in conversation metadata:",
                  createdOrder.uuid
                );
              }
            } catch (error) {
              console.error("❌ Error storing order UUID in metadata:", error);
            }
          }

          // ✅ Set order created flag
          orderCreated.value = true;

          // ✅ Clear chat and show order summary for customer (like backup)
          if (!isBusinessUser.value) {
            console.log(
              "🎯 Customer confirmed order - clearing chat and showing summary"
            );

            // Clear all existing messages
            messages.length = 0;

            // Create order summary message for customer
            const userSummaryMessage: WorkflowMessage = {
              id: `user_summary_${Date.now()}`,
              content:
                "✅ Order confirmed! Your P2P trade has been created successfully.",
              text_content:
                "✅ Order confirmed! Your P2P trade has been created successfully.",
              user_uuid: "greep_ai",
              user_name: "GreepPay AI",
              type: "text" as const,
              isUser: false,
              timestamp: new Date(),
              sender: { uuid: "greep_ai", name: "GreepPay AI" },
              isOrderSummary: true,
              orderSummary: orderSummary,
            };

            addMessage(userSummaryMessage);

            // ✅ Start countdown timer (like backup)
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
          }

          return createdOrder;
        }
      } catch (graphqlError: any) {
        console.error("❌ GraphQL Error details:", {
          message: graphqlError.message,
          graphQLErrors: graphqlError.graphQLErrors,
          networkError: graphqlError.networkError,
        });

        // ✅ FALLBACK: If GraphQL fails, still enable direct messaging
        console.log(
          "🔧 GraphQL failed, but enabling direct messaging anyway..."
        );
        directMessagingEnabled.value = true;

        // Add informational message about order creation failure but chat enabled
        const fallbackMessage: WorkflowMessage = {
          id: `order_fallback_${Date.now()}`,
          content: `⚠️ Order processing encountered an issue, but you can now chat directly with the business partner to complete your transaction.\n\nAmount: ${orderSummary.youSell}\nMethod: ${orderSummary.payoutOption}`,
          text_content: `⚠️ Order processing encountered an issue, but you can now chat directly with the business partner to complete your transaction.\n\nAmount: ${orderSummary.youSell}\nMethod: ${orderSummary.payoutOption}`,
          user_uuid: "greep_ai",
          user_name: "GreepPay AI",
          type: "text" as const,
          isUser: false,
          timestamp: new Date(),
          sender: {
            uuid: "greep_ai",
            name: "GreepPay AI",
          },
        };

        addMessage(fallbackMessage);

        // Don't throw the error, allow the workflow to continue
        return null;
      }
    } catch (error) {
      console.error("❌ Error creating P2P order:", error);

      // ✅ FALLBACK: Even if order creation fails, enable direct messaging
      directMessagingEnabled.value = true;

      // Add error message but still allow chat
      const errorMessage: WorkflowMessage = {
        id: `order_error_${Date.now()}`,
        content:
          "⚠️ Unable to process order automatically, but you can now chat directly with the business partner to complete your transaction manually.",
        text_content:
          "⚠️ Unable to process order automatically, but you can now chat directly with the business partner to complete your transaction manually.",
        user_uuid: "greep_ai",
        user_name: "GreepPay AI",
        type: "text" as const,
        isUser: false,
        timestamp: new Date(),
        sender: {
          uuid: "greep_ai",
          name: "GreepPay AI",
        },
      };

      addMessage(errorMessage);

      // Don't throw the error to prevent breaking the workflow
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
    getAmountFromConversation,
    setupAutoAmountSending,
    handleActionClick,
    createP2POrder,
    startCountdown,
    stopCountdown,
    countdownType,
    countdownTime,
    orderCreated,
  };
};
