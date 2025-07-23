<template>
  <app-wrapper>
    <div v-if="SingleConversation"
      class="w-full flex flex-col lg:text-sm mdlg:text-[12px] relative text-xs font-poppins overflow-y-auto h-full"
      id="chat-conversation-page" :style="mobileFullHeight">

      <!-- Top bar -->
      <chat-top-bar :conversation="SingleConversation" />

      <!-- Chat content -->
      <div class="w-full flex flex-col px-4 pt-4 pb-4">
        <template v-for="(message, index) in displayMessages" :key="`msg-${message.id}-${index}`">
          <chat-message :conversation="SingleConversation" :message="message" :show-actions="true" class="mb-4" />
        </template>

        <!-- Loading indicator -->
        <div v-if="isProcessing" class="flex items-center justify-center py-4">
          <div class="animate-pulse text-gray-500">AI is typing...</div>
        </div>

        <div class="w-full h-[130px]" id="bottom-anchor"></div>
      </div>

      <!-- Bottom bar -->
      <chat-bottom-bar :conversation="SingleConversation" :send-message="sendMessage" :last-a-i-message="lastAIMessage"
        :disabled="isProcessing" />
    </div>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, watch, reactive, ref, computed, onMounted, nextTick } from "vue";
import { Logic } from "@greep/logic";
import ChatTopBar from "../../components/Chat/top-bar.vue";
import ChatBottomBar from "../../components/Chat/bottom-bar.vue";
import ChatMessage from "../../components/Chat/message.vue";
import { MessageInfo, withdrawalAvailableCurrencies } from "../../composable";
import { onIonViewWillEnter, onIonViewWillLeave } from "@ionic/vue";
import { Message } from "@greep/logic/src/gql/graphql";

export default defineComponent({
  name: "ChatConversationPage",
  components: {
    ChatTopBar,
    ChatBottomBar,
    ChatMessage,
  },
  middlewares: {
    fetchRules: [
      {
        domain: "Messaging",
        property: "SingleConversation",
        method: "GetSingleConversation",
        params: [],
        useRouteId: true,
        requireAuth: true,
        ignoreProperty: true,
      },
    ],
  },
  setup() {
    const innerHeight = ref(window.innerHeight);
    const SingleConversation = ref(Logic.Messaging.SingleConversation);
    const AuthUser = ref(Logic.Auth.AuthUser);
    const CurrentGlobalExchangeRate = ref(Logic.Wallet.CurrentGlobalExchangeRate);
    const isProcessing = ref(false);
    const echoChannel = ref(null);

    // Reactive messages array
    const messages = reactive<MessageInfo[]>([]);

    const updateHeight = () => {
      innerHeight.value = window.innerHeight;
    };

    const mobileFullHeight = computed(() => ({
      height: `${innerHeight.value}px`,
      paddingTop: `calc(env(safe-area-inset-top) + 0px)`,
    }));

    const currentConversationState = computed(() => {
      const stage = SingleConversation.value?.stage || 0;
      
      console.log("Computing conversation state for stage:", stage);
      
      if (!stage) {
        const defaultState = { state: "reaction", stage: "withdrawal_amount" };
        console.log("No stage found, using default:", defaultState);
        return defaultState;
      }

      const stageParts = stage.split("_");
      const lastPart = stageParts[stageParts.length - 1];
      
      // Determine if this is initiation (ends with _0) or reaction (ends with _1)
      const state = lastPart === "0" ? "initiation" : "reaction";
      
      // Get the actual stage name by removing the _0 or _1 suffix
      const actualStage = stage.replace(/_[01]$/, "");

      const result = { state, stage: actualStage };
      
      console.log("Computed conversation state:", {
        original_stage: stage,
        stage_parts: stageParts,
        last_part: lastPart,
        computed_state: result
      });

      return result;
    });

    const displayMessages = computed(() => {
      // Filter out duplicate messages and ensure proper ordering
      const uniqueMessages = messages.filter((message, index, self) =>
        index === self.findIndex(m => m.id === message.id)
      );

      const sortedMessages = uniqueMessages.sort((a, b) => {
        const aId = typeof a.id === 'string' ? parseInt(a.id) || 0 : a.id;
        const bId = typeof b.id === 'string' ? parseInt(b.id) || 0 : b.id;
        return aId - bId;
      });

      // DEBUG: Log the final messages being rendered
      console.log("FINAL DISPLAY MESSAGES:", sortedMessages.map(msg => ({
        id: msg.id,
        type: msg.type,
        content: msg.text_content?.substring(0, 50) + "...",
        actions_count: msg.actions?.length || 0,
        has_handler: msg.actions?.[0]?.handler ? "YES" : "NO"
      })));

      return sortedMessages;
    });

    const lastAIMessage = computed(() => {
      if (!SingleConversation.value?.messages?.length) return undefined;

      const aiMessages = SingleConversation.value.messages.filter((message) => {
        try {
          const metadata = message.metadata ? JSON.parse(message.metadata) : {};
          const failureMessage = metadata?.extras?.failure_message;
          const isAI = !message.sender || message.sender?.uuid === "greep_ai";
          return isAI && !failureMessage;
        } catch (error) {
          console.warn("Error parsing message metadata:", error);
          return !message.sender || message.sender?.uuid === "greep_ai";
        }
      });

      return aiMessages.length > 0 ? aiMessages[aiMessages.length - 1] : undefined;
    });

    const initializeMessages = () => {
      // Only initialize if messages array is empty to avoid clearing existing messages
      if (messages.length > 0) return;

      // If no messages exist, add only the seller welcome message
      // Let the backend handle sending the AI questions and conversation flow entirely
      if (!SingleConversation.value?.messages?.length) {
        const exchangeAd = SingleConversation.value?.exchangeAd;
        const sellerName = exchangeAd?.business?.business_name || "Fggh";
        const sellerUuid = exchangeAd?.business?.uuid || "seller_uuid";

        // Only add seller welcome message - backend will handle all AI messages
        messages.push({
          id: "seller_welcome",
          type: "text",
          text_content: `Thanks for choosing to trade with me 😊 I'm fast, reliable, and always online for smooth transactions. If you ever need USDC again, I'm always here!`,
          user_uuid: sellerUuid,
          user_name: sellerName,
          info_icon: "",
          actions: []
        });

        // Trigger backend to start conversation flow
        setTimeout(() => {
          triggerBackendConversationStart();
        }, 1500);
      } else {
        // Process existing messages from server
        SingleConversation.value.messages.forEach((message) => {
          addMessageToDisplay(message);
        });
      }
    };

    const triggerBackendConversationStart = async () => {
      // Send a natural user message to trigger backend conversation flow
      // This message won't be displayed to the user - it's just to trigger the backend
      if (!SingleConversation.value || !AuthUser.value) return;

      try {
        const balance = AuthUser.value?.wallet?.total_balance || "0";

        // Send a greeting message to trigger backend flow (won't be displayed)
        Logic.Messaging.CreateMessageForm = {
          input: {
            conversation_id: SingleConversation.value.id,
            content: "Hi", // Simple greeting to trigger backend flow
            type: "text",
            sender_id: parseInt(AuthUser.value.id),
            metadata: JSON.stringify({
              is_bot: false,
              type: "text",
              wallet_balance: Logic.Common.convertToMoney(balance, true, "", false),
              stage: "withdrawal_amount",
              trigger_conversation: true, // Flag to indicate this is a trigger
              structured_response: {}
            }),
          },
        };

        await Logic.Messaging.CreateMessage();
      } catch (error) {
        console.error("Error triggering backend conversation start:", error);
      }
    };

    const addMessageToDisplay = (message: Message) => {
      try {
        const existingIndex = messages.findIndex(m => m.id === message.id.toString());
        if (existingIndex !== -1) return; // Message already exists

        const metadata = message.metadata ? JSON.parse(message.metadata) : {};
        const options = metadata?.options || [];

        console.log("Adding message to display:", {
          message_id: message.id,
          content: message.content,
          metadata: metadata,
          options: options,
          message_type: metadata?.type
        });

        const actions = options.map((option: any) => {
          const handler = () => {
            console.log("Button clicked:", option.value, "message:", option.message?.content || option.content);
            sendMessage(option.message?.content || option.content, option.value);
          };
          
          return {
            label: option.content,
            message: option.message?.content || option.content,
            type: option.type || "primary",
            value: option.value,
            handler: handler,
          };
        });

        // Force message type to "text" if it has options, since ChatMessage component only handles "text" and "info"
        const messageType = options.length > 0 ? "text" : (metadata?.type || "text");

        const displayMessage: MessageInfo = {
          id: message.id.toString(),
          type: messageType,
          text_content: message.content,
          user_uuid: message.sender?.uuid || "greep_ai",
          user_name: message.sender
            ? `${message.sender.first_name} ${message.sender.last_name}`.trim()
            : "GreepPay AI",
          info_icon: metadata?.extras?.info_icon || "",
          actions: actions
        };

        console.log("Created display message:", {
          id: displayMessage.id,
          type: displayMessage.type,
          actions_count: displayMessage.actions.length,
          actions: displayMessage.actions,
          first_action_handler_exists: typeof displayMessage.actions[0]?.handler === 'function',
          actions_detail: displayMessage.actions.map(a => ({ label: a.label, type: a.type, value: a.value }))
        });

        // Make actions available globally for debugging
        if (displayMessage.actions.length > 0) {
          (window as any).lastMessageActions = displayMessage.actions;
          console.log("Actions available globally at window.lastMessageActions - try calling window.lastMessageActions[0].handler()");
        }

        messages.push(displayMessage);
      } catch (error) {
        console.error("Error adding message to display:", error);
        // Add fallback message
        messages.push({
          id: message.id.toString(),
          type: "text",
          text_content: message.content,
          user_uuid: message.sender?.uuid || "greep_ai",
          user_name: message.sender
            ? `${message.sender.first_name} ${message.sender.last_name}`.trim()
            : "GreepPay AI",
          info_icon: "",
          actions: []
        });
      }
    };

    const scrollToBottom = async () => {
      await nextTick();
      const bottomAnchor = document.getElementById('bottom-anchor');
      if (bottomAnchor) {
        bottomAnchor.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        });
      }
    };

    const addNewMessage = async (newMessage: Message) => {
      try {
        // Add to local state immediately for responsive UI
        addMessageToDisplay(newMessage);

        // Update the conversation in Logic
        if (SingleConversation.value?.messages) {
          const messageExists = SingleConversation.value.messages.some(
            m => m.id === newMessage.id
          );

          if (!messageExists) {
            SingleConversation.value.messages.push(newMessage);
          }
        }

        await scrollToBottom();
      } catch (error) {
        console.error("Error adding new message:", error);
      }
    };

    const pushNewMessage = (newMessage: Message) => {
      try {
        const oldConversation = JSON.parse(JSON.stringify(SingleConversation.value));
        const existingConversation = Logic.Messaging.SingleConversation;
        existingConversation?.messages.push(newMessage);

        Logic.Messaging.SingleConversation = oldConversation;

        setTimeout(() => {
          Logic.Messaging.SingleConversation = existingConversation; // Reassign to trigger a refetch
          setTimeout(() => {
            scrollToBottom();
          }, 300);
        }, 200);// Clear the SingleConversation to trigger a refetch
      } catch (error) {
        console.error("Error pushing new message:", error);
      }
    };

    // FIXED: Validation function
    const validateInput = (content: string, stage: string, extraValue: string = ""): boolean => {
      const trimmedContent = content.trim();
      
      if (!trimmedContent) {
        Logic.Common.showAlert({
          show: true,
          message: "Please enter a valid input.",
          type: "error",
        });
        return false;
      }

      // Skip validation for button actions (when extraValue is provided)
      if (extraValue) {
        console.log("Skipping validation for button action:", extraValue);
        return true;
      }

      // Skip validation for common button texts
      const buttonTexts = ["Accept", "Cancel", "I accept", "Confirm", "Yes", "No"];
      if (buttonTexts.some(btn => trimmedContent.toLowerCase().includes(btn.toLowerCase()))) {
        console.log("Skipping validation for button text:", trimmedContent);
        return true;
      }

      // Check if it's a numeric amount
      const amount = parseFloat(trimmedContent.replace(/,/g, ""));
      if (!isNaN(amount) && amount > 0) {
        console.log("Validating withdrawal amount:", amount);
        
        const balance = parseFloat(AuthUser.value?.wallet?.total_balance || "0");
        if (amount > balance) {
          Logic.Common.showAlert({
            show: true,
            message: "Insufficient wallet balance.",
            type: "error",
          });
          return false;
        }

        if (amount < 0.9) {
          Logic.Common.showAlert({
            show: true,
            message: "Amount must be greater than 0.9 USDC.",
            type: "error",
          });
          return false;
        }
      }

      console.log("Validation passed for:", trimmedContent);
      return true;
    };

    // FIXED: Build structured response function
    const buildStructuredResponse = (content: string, extraValue: string) => {
      const exchangeAd = SingleConversation.value?.exchangeAd;
      let structuredResponse: any = {};

      console.log("Building structured response:", {
        content,
        extraValue,
        exchangeAd: exchangeAd ? "exists" : "missing"
      });

      // Check if content is a number (withdrawal amount)
      const amount = parseFloat(content.replace(/,/g, ""));
      if (!isNaN(amount) && amount > 0) {
        console.log("Detected withdrawal amount:", amount);
        
        const exchangeRate = exchangeAd?.rate || 1.2; // fallback rate
        const withdrawalCurrency = withdrawalAvailableCurrencies.find(
          c => c.code === exchangeAd?.from_currency
        );

        structuredResponse = {
          currency: exchangeAd?.to_currency || "USD",
          amount: amount,
          currency_symbol: withdrawalCurrency?.symbol || "$",
          business_name: exchangeAd?.business?.business_name || "GreepPay",
          sell_amount: (amount * exchangeRate).toFixed(2),
          sell_rate: exchangeRate.toFixed(2),
        };
      } 
      // Check for button actions with extraValue
      else if (extraValue) {
        console.log("Detected extraValue:", extraValue);
        structuredResponse = {
          selected_option: extraValue,
        };
      }
      // Check for common text responses
      else if (content.toLowerCase().includes("accept") || content.toLowerCase() === "i accept") {
        console.log("Detected accept response");
        structuredResponse = {
          selected_option: "accept",
        };
      }
      else if (content.toLowerCase().includes("cancel")) {
        console.log("Detected cancel response");
        structuredResponse = {
          selected_option: "cancel", 
        };
      }
      // Fallback for any other text
      else {
        console.log("Fallback text response");
        structuredResponse = {
          selected_option: content.toLowerCase(),
        };
      }

      console.log("Built structured response:", structuredResponse);
      return structuredResponse;
    };

    // Your excellent sendMessage function - keeping as-is
    const sendMessage = async (content: string, extraValue = ""): Promise<boolean> => {
      if (!SingleConversation.value || !AuthUser.value || isProcessing.value) {
        return false;
      }

      const trimmedContent = content.trim();
      if (!trimmedContent) return false;

      // Validate input based on current stage
      if (!validateInput(trimmedContent, currentConversationState.value.stage, extraValue)) {
        return false;
      }

      try {
        isProcessing.value = true;

        const conversationMetadata = SingleConversation.value.metadata 
          ? JSON.parse(SingleConversation.value.metadata) 
          : {};

        const balance = AuthUser.value.wallet?.total_balance || "0";
        const structuredResponse = buildStructuredResponse(trimmedContent, extraValue);

        const otherMetadata = {
          wallet_balance: Logic.Common.convertToMoney(balance, true, "", false),
          timestamp: Date.now(),
        };

        // Create user message first
        const userMessage: Message = {
          id: Date.now(),
          content: trimmedContent,
          type: "text",
          sender_id: parseInt(AuthUser.value.id),
          conversation_id: SingleConversation.value.id,
          // @ts-expect-error partial type
          sender: {
            uuid: AuthUser.value.uuid,
            first_name: AuthUser.value.first_name,
            last_name: AuthUser.value.last_name,
          },
          metadata: JSON.stringify({
            is_bot: false,
            type: "text",
            ...structuredResponse,
          }),
        };

        // Add user message to display immediately
        await addNewMessage(userMessage);

        // Prepare message for backend
        Logic.Messaging.CreateMessageForm = {
          input: {
            conversation_id: SingleConversation.value.id,
            content: trimmedContent,
            type: "text",
            sender_id: parseInt(AuthUser.value.id),
            metadata: JSON.stringify({
              is_bot: false,
              type: "text",
              ...conversationMetadata,
              ...otherMetadata,
              ...structuredResponse,
              structured_response: structuredResponse,
            }),
          },
        };

        console.log("Sending to backend:", {
          content: trimmedContent,
          structured_response: structuredResponse,
          full_metadata: {
            is_bot: false,
            type: "text",
            ...conversationMetadata,
            ...otherMetadata,
            ...structuredResponse,
            structured_response: structuredResponse,
          }
        });

        // Send message to backend
        await Logic.Messaging.CreateMessage();
        
        return true;
      } catch (error) {
        console.error("Error sending message:", error);
        Logic.Common.showAlert({
          show: true,
          message: "Failed to send message. Please try again.",
          type: "error",
        });
        return false;
      } finally {
        isProcessing.value = false;
      }
    };

    const setupWebSocketListeners = () => {
      if (!SingleConversation.value?.uuid || echoChannel.value) return;

      try {
        echoChannel.value = Logic.Common.laravelEcho?.join(`message.${SingleConversation.value.uuid}`)
          .here((users: any) => {
            console.log("Users in channel:", users);
          })
          .joining((user: any) => {
            console.log("User joined:", user);
          })
          .leaving((user: any) => {
            console.log("User left:", user);
          })
          .listen('.message.created', async (eventData: any) => {
            try {
              // Ignore messages from current user
              if (eventData.user_id === parseInt(AuthUser.value?.id || "0")) {
                return;
              }

              // Check if message already exists to prevent duplicates
              const existingMessage = messages.find(m => m.id === eventData.id?.toString());
              if (existingMessage) {
                return;
              }

              // Parse metadata to check for trigger messages
              const metadata = typeof eventData.metadata === 'string'
                ? JSON.parse(eventData.metadata)
                : eventData.metadata || {};

              // Skip trigger messages from displaying
              if (metadata.trigger_conversation) {
                return;
              }

              const participant = SingleConversation.value?.participants?.find(
                p => p.user_id === eventData.user_id
              );

              const newMessage: Message = {
                id: eventData.id ? parseInt(eventData.id) : Date.now(),
                content: eventData.content,
                type: "text",
                sender_id: eventData.user_id,
                conversation_id: SingleConversation.value?.id || 0,
                sender: participant?.user ? {
                  uuid: participant.user.uuid || "greep_ai",
                  first_name: participant.user.first_name || "GreepPay",
                  last_name: participant.user.last_name || "AI",
                } : undefined,
                metadata: JSON.stringify(metadata),
              };

              await addNewMessage(newMessage);
            } catch (error) {
              console.error("Error handling WebSocket message:", error);
            }
          });
      } catch (error) {
        console.error("Error setting up WebSocket listeners:", error);
      }
    };

    const cleanup = () => {
      if (echoChannel.value) {
        try {
          echoChannel.value.leave();
          echoChannel.value = null;
        } catch (error) {
          console.error("Error leaving WebSocket channel:", error);
        }
      }
    };

    const initialize = async () => {
      try {
        initializeMessages();
        setupWebSocketListeners();

        // Handle P2P withdrawal specific setup
        if (SingleConversation.value?.entity_type === 'p2p_withdrawal') {
          const conversationMetadata = SingleConversation.value.metadata
            ? JSON.parse(SingleConversation.value.metadata)
            : {};

          if (conversationMetadata?.currency) {
            // Logic.Wallet.GetGlobalExchangeRate("USD", conversationMetadata.currency);
          }
        }

        await scrollToBottom();
      } catch (error) {
        console.error("Error during initialization:", error);
      }
    };

    // Debug functions for troubleshooting
    const debugMessageSending = (testAmount = "5.0") => {
      console.log("=== DEBUGGING MESSAGE SENDING ===");
      
      console.log("Current conversation data:", {
        conversation_id: SingleConversation.value?.id,
        stage: SingleConversation.value?.stage,
        computed_state: currentConversationState.value,
        exchange_ad: SingleConversation.value?.exchangeAd,
        messages_count: SingleConversation.value?.messages?.length
      });
      
      console.log("User data:", {
        user_id: Logic.Auth.AuthUser?.id,
        wallet_balance: Logic.Auth.AuthUser?.wallet?.total_balance
      });
      
      // Test the structured response creation
      const testStructuredResponse = buildStructuredResponse(testAmount, "");
      console.log("Test structured response:", testStructuredResponse);
      
      console.log("=== END DEBUG ===");
    };

    // Expose debug function to window for console testing
    if (typeof window !== 'undefined') {
      (window as any).debugMessageSending = debugMessageSending;
    }

    // Watchers
    watch(SingleConversation, (newConversation, oldConversation) => {
      // Only initialize if this is a completely new conversation
      if (newConversation && newConversation !== oldConversation && newConversation.id !== oldConversation?.id) {
        initializeMessages();
      }
    }, { deep: true });

    // Lifecycle hooks
    onIonViewWillEnter(() => {
      initialize();
    });

    onIonViewWillLeave(() => {
      cleanup();
    });

    onMounted(() => {
      updateHeight();
      window.addEventListener("resize", updateHeight);

      // Setup property watchers
      Logic.Messaging.watchProperty("SingleConversation", SingleConversation);
      Logic.Auth.watchProperty("AuthUser", AuthUser);
      Logic.Wallet.watchProperty("CurrentGlobalExchangeRate", CurrentGlobalExchangeRate);
    });

    return {
      Logic,
      mobileFullHeight,
      displayMessages,
      SingleConversation,
      sendMessage,
      lastAIMessage,
      isProcessing,
    };
  },
});
</script>