import { MessageInfo } from '../composable';

export interface MessageCreationContext {
  AuthUser?: any;
  SingleConversation?: any;
  sendMessage?: (content: string, extraValue?: string) => Promise<boolean>;
  currentConversationState?: any;
}

export interface RawMessage {
  id: string | number;
  content?: string;
  text_content?: string;
  user_uuid?: string;
  user_name?: string;
  sender?: {
    uuid?: string;
    first_name?: string;
    last_name?: string;
  };
  metadata?: string;
}

/**
 * Create a display message from raw message data
 */
export function createDisplayMessage(
  message: RawMessage,
  context?: MessageCreationContext
): MessageInfo {
  try {
    const metadata = message.metadata ? JSON.parse(message.metadata) : {};
    const options = metadata?.options || [];
    const orderData = metadata?.order_data || {};

    // Create action handlers for message buttons
    const actions = options.map((option: any) => {
      const handler = () => {
        console.log("🔧 Button clicked:", option.value, "Content:", option.message?.content || option.content);
        
        if (context?.sendMessage) {
          let actualValue = option.value;
          // Handle special cases
          if (context.currentConversationState?.stage === "order_summary" && option.value === "confirm") {
            actualValue = "success";
          }
          // Call sendMessage with the action
          context.sendMessage(actualValue, actualValue);
        }
      };

      return {
        label: option.content,
        message: option.message?.content || option.content,
        type: option.type || "primary",
        value: option.value,
        handler: handler,
      };
    });

    // Determine message type
    const rawType = metadata?.type || "text";
    const messageType = options.length > 0 ? "text" : (rawType === "info" ? "info" : "text");

    // Create the base display message
    const displayMessage: MessageInfo = {
      id: message.id.toString(),
      type: messageType as "text" | "info",
      text_content: message.text_content || message.content,
      user_uuid: message.user_uuid || message.sender?.uuid || "greep_ai",
      user_name: getUserDisplayName(message),
      info_icon: metadata?.extras?.info_icon || "",
      actions: actions || [],
      orderSummary: null,
      isOrderSummary: false
    };

    // Handle order summary data
    if (metadata?.type === "order_summary" && orderData) {
      displayMessage.orderSummary = orderData;
      displayMessage.isOrderSummary = true;
    }

    // Handle media attachments (images, documents)
    const media = createMediaAttachment(message, metadata);
    if (media) {
      // @ts-ignore - Adding media property that might not exist in type
      displayMessage.media = media;
    }

    return displayMessage;
  } catch (error) {
    console.error("Error creating display message:", error);
    // Return fallback message
    return createFallbackMessage(message);
  }
}

/**
 * Get user display name from message data
 */
export function getUserDisplayName(message: RawMessage): string {
  if (message.user_name) {
    return message.user_name;
  }

  if (message.sender?.first_name || message.sender?.last_name) {
    return `${message.sender.first_name || ''} ${message.sender.last_name || ''}`.trim();
  }

  return "GreepPay AI";
}

/**
 * Create media attachment from message data
 */
export function createMediaAttachment(message: RawMessage, metadata: any) {
  try {
    const rawType = metadata?.type || "text";
    const content = (message.text_content || message.content || '').toString();

    // Handle image attachments
    const imgMatch = content.match(/https?:\/\/[^\s]+\.(?:png|jpe?g|webp|gif)/i);
    if ((rawType === 'proof_upload' || rawType === 'image') && imgMatch) {
      return {
        type: 'image',
        url: imgMatch[0]
      };
    }

    // Handle document attachments
    const docMatch = content.match(/https?:\/\/[^\s]+\.(?:pdf|doc|docx)/i);
    if ((rawType === 'proof_upload' || rawType === 'document') && docMatch) {
      return {
        type: 'document',
        url: docMatch[0],
        fileName: extractFileNameFromUrl(docMatch[0])
      };
    }

    return null;
  } catch (error) {
    console.error("Error creating media attachment:", error);
    return null;
  }
}

/**
 * Extract filename from URL
 */
export function extractFileNameFromUrl(url: string): string {
  try {
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    return fileName.split('?')[0]; // Remove query parameters
  } catch (error) {
    return 'document';
  }
}

/**
 * Create fallback message for error cases
 */
export function createFallbackMessage(message: RawMessage): MessageInfo {
  return {
    id: message.id.toString(),
    type: "text",
    text_content: message.text_content || message.content || "Message could not be displayed",
    user_uuid: message.user_uuid || message.sender?.uuid || "greep_ai",
    user_name: getUserDisplayName(message),
    info_icon: "",
    actions: [],
    orderSummary: null,
    isOrderSummary: false
  };
}

/**
 * Create system/AI message
 */
export function createSystemMessage(
  content: string,
  actions: any[] = [],
  messageType: "text" | "info" = "text"
): MessageInfo {
  return {
    id: `system_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: messageType,
    text_content: content,
    user_uuid: "greep_ai",
    user_name: "GreepPay AI",
    info_icon: "",
    actions: actions,
    orderSummary: null,
    isOrderSummary: false
  };
}

/**
 * Create order summary message
 */
export function createOrderSummaryMessage(
  orderSummary: any,
  additionalText?: string
): MessageInfo {
  return {
    id: `order_summary_${Date.now()}`,
    type: "text",
    text_content: additionalText || "Order Summary",
    user_uuid: "greep_ai",
    user_name: "GreepPay AI",
    info_icon: "",
    actions: [],
    orderSummary: orderSummary,
    isOrderSummary: true
  };
}

/**
 * Create business summary message for business users
 */
export function createBusinessSummaryMessage(
  orderSummary: any
): MessageInfo {
  return {
    id: `business_summary_${Date.now()}`,
    type: "text",
    text_content: "Order confirmed - continue from here",
    user_uuid: "greep_ai",
    user_name: "GreepPay AI",
    info_icon: "",
    actions: [],
    orderSummary: orderSummary,
    isOrderSummary: true
  };
}

/**
 * Create seller welcome message
 */
export function createSellerWelcomeMessage(
  sellerName: string,
  sellerUuid: string
): MessageInfo {
  return {
    id: "seller_welcome",
    type: "text",
    text_content: `Thanks for choosing to trade with me 😊 I'm fast, reliable, and always online for smooth transactions. If you ever need USDC again, I'm always here!`,
    user_uuid: sellerUuid,
    user_name: sellerName,
    info_icon: "",
    actions: []
  };
}
