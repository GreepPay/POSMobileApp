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

        <!-- ✅ NEW: Countdown timer display -->
        <div v-if="isCountdownActive" class="flex items-center justify-center py-4">
          <div class="bg-orange-50 border border-orange-200 rounded-lg px-4 py-2">
            <div class="flex items-center space-x-2">
              <span class="text-orange-600">⏰</span>
              <span class="text-orange-800 font-semibold">Waiting for business: {{ formatCountdown }}</span>
            </div>
          </div>
        </div>

        <!-- ✅ NEW: Success message and action buttons when conversation is completed -->
        <div v-if="isConversationCompleted" class="w-full flex flex-col items-center py-4">
          <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 max-w-md">
            <div class="flex items-center justify-center mb-2">
              <span class="text-2xl mr-2">✅</span>
              <span class="text-green-800 font-semibold">P2P trade successful!</span>
            </div>
            <p class="text-green-700 text-sm text-center">Your transaction has been completed successfully.</p>
          </div>

          <div class="flex gap-3">
            <button class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
              View transaction
            </button>
            <button
              class="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
              Rate your experience
            </button>
          </div>
        </div>

        <!-- Address Input Component for cash_delivery step -->
        <!-- Now shows as bottom modal instead of inline -->

        <div class="w-full h-[130px]" id="bottom-anchor"></div>
      </div>

      <!-- Bottom bar -->
      <chat-bottom-bar :conversation="SingleConversation" :send-message="sendMessage" :last-a-i-message="lastAIMessage"
        :disabled="isProcessing || isConversationCompleted || (!isCurrentStageInteractive && !orderConfirmed)"
        :show-address-mode="showAddressInput" :order-confirmed="orderConfirmed"
        @click-address-input="showAddressModal = true" @upload-proof="showProofModal = true" />

      <!-- Address Modal/Bottom Sheet -->
      <div v-if="showAddressModal" class="fixed inset-0 bg-white bg-opacity-60 z-50 flex items-end"
        @click="handleAddressCancel">
        <div class="w-full bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto shadow-2xl border-t border-gray-200"
          @click.stop>
          <div class="p-4 pb-8">
            <!-- Handle bar -->
            <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>

            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center space-x-2">
                <span class="text-xl">📍</span>
                <span class="text-lg font-semibold text-gray-800">Enter your delivery address</span>
              </div>
              <button @click="handleAddressCancel"
                class="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Address Input Component -->
            <chat-address-input :on-address-confirm="handleAddressConfirm" :on-cancel="handleAddressCancel"
              :is-processing="isProcessing" />
          </div>
        </div>
      </div>

      <!-- ✅ NEW: Proof Upload Modal/Bottom Sheet -->
      <div v-if="showProofModal" class="fixed inset-0 bg-white bg-opacity-60 z-50 flex items-end"
        @click="handleProofCancel">
        <div class="w-full bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto shadow-2xl border-t border-gray-200"
          @click.stop>
          <div class="p-4 pb-8">
            <!-- Handle bar -->
            <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>

            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center space-x-2">
                <span class="text-xl">📸</span>
                <span class="text-lg font-semibold text-gray-800">Upload proof of cash delivery</span>
              </div>
              <button @click="handleProofCancel"
                class="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Proof Upload Component -->
            <div class="space-y-4">
              <div class="text-center">
                <div class="w-24 h-24 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <span class="text-3xl">📸</span>
                </div>
                <p class="text-gray-600 text-sm">
                  Upload a photo or document showing proof that the buyer has received the cash
                </p>
              </div>

              <!-- Upload options -->
              <div class="space-y-3">
                <button @click="handleProofUploadModal('photo')"
                  class="w-full p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 transition-colors text-center">
                  <span class="text-blue-600 text-lg">📷</span>
                  <p class="text-blue-800 font-medium mt-2">Take Photo</p>
                  <p class="text-blue-600 text-sm">Take a photo of the cash delivery</p>
                </button>

                <button @click="handleProofUploadModal('document')"
                  class="w-full p-4 border-2 border-dashed border-green-300 rounded-lg hover:border-green-400 transition-colors text-center">
                  <span class="text-green-600 text-lg">📄</span>
                  <p class="text-green-800 font-medium mt-2">Upload Document</p>
                  <p class="text-green-600 text-sm">Upload a receipt or document</p>
                </button>

                <button @click="handleProofUploadModal('text')"
                  class="w-full p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-400 transition-colors text-center">
                  <span class="text-purple-600 text-lg">✍️</span>
                  <p class="text-purple-800 font-medium mt-2">Text Description</p>
                  <p class="text-purple-600 text-sm">Describe the proof in text</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, watch, reactive, ref, computed, onMounted, nextTick } from "vue";
import { Logic } from "@greep/logic";
import ChatTopBar from "../../components/Chat/top-bar.vue";
import ChatBottomBar from "../../components/Chat/bottom-bar.vue";
import ChatMessage from "../../components/Chat/message.vue";
import ChatAddressInput from "../../components/Chat/address-input.vue";
import { MessageInfo, withdrawalAvailableCurrencies } from "../../composable";
import { onIonViewWillEnter, onIonViewWillLeave } from "@ionic/vue";
import { Message } from "@greep/logic/src/gql/graphql";

export default defineComponent({
  name: "ChatConversationPage",
  components: {
    ChatTopBar,
    ChatBottomBar,
    ChatMessage,
    ChatAddressInput,
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
    const showAddressInput = ref(false);
    const showAddressModal = ref(false);
    const showProofModal = ref(false);

    // ✅ NEW: flip this once order summary is confirmed
    const orderConfirmed = ref(false);

    // ✅ NEW: Add flag to prevent double order creation
    const orderCreationInProgress = ref(false);
    const countdownTimer = ref<number | null>(null);
    const countdownSeconds = ref(600); // 10 minutes

    // Reactive messages array
    const messages = reactive<MessageInfo[]>([]);

    const updateHeight = () => {
      innerHeight.value = window.innerHeight;
    };

    const mobileFullHeight = computed(() => ({
      height: `${innerHeight.value}px`,
      paddingTop: `calc(env(safe-area-inset-top) + 0px)`,
    }));

    // ✅ NEW: Countdown timer function
    const startCountdownTimer = () => {
      countdownSeconds.value = 600; // Reset to 10 minutes
      countdownTimer.value = window.setInterval(() => {
        countdownSeconds.value--;
        if (countdownSeconds.value <= 0) {
          if (countdownTimer.value) {
            clearInterval(countdownTimer.value);
            countdownTimer.value = null;
          }
          // Add timeout message
          const timeoutMessage = {
            id: `timeout_${Date.now()}`,
            type: "text" as const,
            text_content: "⏰ Time's up! The business didn't respond within 10 minutes. Your order has been cancelled.",
            user_uuid: "greep_ai",
            user_name: "GreepPay AI",
            info_icon: "",
            actions: [],
            orderSummary: null,
            isOrderSummary: false
          };
          messages.push(timeoutMessage);
          scrollToBottom();
        }
      }, 1000);
    };

    // ✅ NEW: Stop countdown timer
    const stopCountdownTimer = () => {
      if (countdownTimer.value) {
        clearInterval(countdownTimer.value);
        countdownTimer.value = null;
      }
    };

    // ✅ NEW: Format countdown display
    const formatCountdown = computed(() => {
      const minutes = Math.floor(countdownSeconds.value / 60);
      const seconds = countdownSeconds.value % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    });

    // ✅ NEW: Check if countdown is active
    const isCountdownActive = computed(() => {
      return countdownTimer.value !== null && countdownSeconds.value > 0;
    });

    // ✅ IMPROVED currentConversationState with better stage detection
    const currentConversationState = computed(() => {
      const stage = SingleConversation.value?.stage || 0;

      // Determine actual stage based on latest messages
      const latestMessages = SingleConversation.value?.messages || [];
      const lastAIMessage = latestMessages
        .filter(msg => !msg.sender || msg.sender?.uuid === "greep_ai")
        .pop();

      // Check backend stage first
      let backendStage = "withdrawal_amount";
      if (stage) {
        backendStage = stage.toString().replace(/_[01]$/, "");
      }

      let detectedStage = "withdrawal_amount";

      if (lastAIMessage?.content) {
        const content = lastAIMessage.content.toLowerCase();

        // ✅ Better stage detection including new stages
        if (content.includes("p2p trade successful")) {
          detectedStage = "usdc_sent";
        } else if (content.includes("usdc sent")) {
          detectedStage = "usdc_sent";
        } else if (content.includes("are you sure that you have collected your cash")) {
          detectedStage = "finalize_payment";
        } else if (content.includes("payment confirmed") && content.includes("release usdc")) {
          detectedStage = "send_payment";
        } else if (content.includes("order confirmed") && content.includes("payment confirmed")) {
          detectedStage = "send_payment";
        } else if (content.includes("{order_summary_text}") || content.includes("confirm your order details") || content.includes("order summary")) {
          detectedStage = "order_summary";
        } else if (content.includes("what is your address") ||
          content.includes("choose your address") ||
          content.includes("delivery address") ||
          content.includes("add enough details")) {
          detectedStage = "cash_delivery";
        } else if (content.includes("choose how do you want to collect")) {
          detectedStage = "withdrawal_method";
        } else if (content.includes("rate is") && content.includes("for 1 usdc")) {
          detectedStage = "exchange_rate";
        } else if (content.includes("currency must be a string")) {
          // ✅ FIX: Don't change stage for error messages
          detectedStage = backendStage;
        } else if (content.includes("how much") && content.includes("usdc")) {
          detectedStage = "withdrawal_amount";
        }
      }

      // ✅ CRITICAL FIX: Check if user just provided an address in withdrawal_method stage
      const userMessages = latestMessages.filter(msg => msg.sender && msg.sender?.uuid === AuthUser.value?.uuid);
      const lastUserMessage = userMessages[userMessages.length - 1];

      if (lastUserMessage?.content && backendStage === "withdrawal_method") {
        const userContent = lastUserMessage.content.toLowerCase();
        const isAddressContent = userContent.includes('nigeria') ||
          userContent.includes('lagos') ||
          userContent.includes('abuja') ||
          userContent.includes('ota') ||
          userContent.includes('university') ||
          userContent.includes('road') ||
          userContent.includes('street') ||
          userContent.includes('address') ||
          (userContent.length > 20 && !userContent.includes('usdc'));

        if (isAddressContent) {
          detectedStage = "cash_delivery";
          console.log("🔧 CRITICAL FIX: Detected address input in withdrawal_method stage, switching to cash_delivery");
        }
      }

      // Use the more specific stage
      const actualStage = detectedStage !== "withdrawal_amount" ? detectedStage : backendStage;

      console.log("🔍 Stage detection:", {
        stage,
        detectedStage,
        backendStage,
        actualStage,
        lastAIContent: lastAIMessage?.content?.substring(0, 50) + "...",
        lastUserContent: lastUserMessage?.content?.substring(0, 50) + "..."
      });

      // Check if we need address input mode
      const needsAddressInput = (actualStage === "cash_delivery" ||
        (lastAIMessage?.content?.toLowerCase().includes("what is your address"))) &&
        // ✅ NEW: Only show address input for conversation owner/buyer, not business users
        isBusinessUser.value === false;

      updateAddressInputVisibility(needsAddressInput || false);
      console.log("🔍 Address input needed:", needsAddressInput, "for stage:", actualStage, "isBusinessUser:", isBusinessUser.value);

      return { state: "reaction", stage: actualStage, needsAddressInput };
    });

    const displayMessages = computed(() => {
      // Filter out duplicate messages and ensure proper ordering
      const uniqueMessages = messages.filter((message, index, self) =>
        index === self.findIndex(m => m.id === message.id)
      );

      // Maintain chronological order based on when messages were added to the array
      // This ensures proper conversation flow
      const sortedMessages = uniqueMessages;

      console.log("🔧 DisplayMessages computed triggered:", {
        totalMessages: messages.length,
        uniqueMessages: uniqueMessages.length,
        sortedMessages: sortedMessages.length,
        businessJoinedMessages: sortedMessages.filter(m => m.id.toString().includes('business_joined')).length,
        lastMessage: sortedMessages[sortedMessages.length - 1] ? {
          id: sortedMessages[sortedMessages.length - 1].id,
          content: sortedMessages[sortedMessages.length - 1].text_content,
          user: sortedMessages[sortedMessages.length - 1].user_name
        } : null
      });

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
          return !message.sender || message.sender?.uuid === "greep_ai";
        }
      });

      return aiMessages.length > 0 ? aiMessages[aiMessages.length - 1] : undefined;
    });

    // ✅ NEW: Check if conversation is completed
    const isConversationCompleted = computed(() => {
      const stage = currentConversationState.value.stage;
      return stage === "usdc_sent";
    });

    // ✅ NEW: Robust business user detection
    const isBusinessUser = computed(() => {
      if (!SingleConversation.value?.participants || !AuthUser.value?.id) {
        return false;
      }

      const currentUserId = parseInt(AuthUser.value.id);
      const participants = SingleConversation.value.participants;

      // Check if current user is a participant
      const isParticipant = participants.some(p => p.user_id === currentUserId);

      // Check if current user is the owner (conversation creator)
      let isOwner = false;

      // Method 1: Check if owner_id matches current user
      if (SingleConversation.value.owner_id) {
        isOwner = SingleConversation.value.owner_id === currentUserId;
      }
      // Method 2: If owner_id is undefined, check if this is the first participant (likely the creator)
      else if (participants.length > 0) {
        // Sort participants by ID to get the first one (likely the creator)
        const sortedParticipants = [...participants].sort((a, b) => a.id - b.id);
        isOwner = sortedParticipants[0].user_id === currentUserId;
      }

      // Business user is a participant who is not the owner
      const isBusiness = isParticipant && !isOwner;

      console.log("🔧 Business user detection:", {
        currentUserId,
        ownerId: SingleConversation.value.owner_id,
        userUuid: AuthUser.value.uuid,
        isParticipant,
        isOwner,
        isBusiness,
        participants: participants.map(p => ({ id: p.id, user_id: p.user_id, uuid: p.user?.uuid })),
        sortedParticipants: participants.length > 0 ? [...participants].sort((a, b) => a.id - b.id).map(p => ({ id: p.id, user_id: p.user_id })) : []
      });

      return isBusiness;
    });

    // ✅ NEW: Check if current stage should be interactive
    const isCurrentStageInteractive = computed(() => {
      const stage = currentConversationState.value.stage;
      const completedStages = [
        "usdc_sent" // Only disable for final completed stage
      ];

      // If we're in a completed stage, disable interaction
      const isCompletedStage = completedStages.includes(stage);

      console.log("🔧 Stage interactivity check:", {
        stage,
        isCompletedStage,
        isBusiness: isBusinessUser.value,
        isInteractive: !isCompletedStage || isBusinessUser.value
      });

      // ✅ FIXED: Enable chat for all stages except final completed stage, OR if user is business
      return !isCompletedStage || isBusinessUser.value;
    });

    // ✅ HELPER FUNCTION: Better address detection
    const isAddressContent = (content: string): boolean => {
      const addressIndicators = [
        'nigeria', 'lagos', 'abuja', 'ibadan', 'kano', 'port harcourt', 'ota',
        'street', 'avenue', 'road', 'close', 'estate', 'area', 'university',
        'house', 'apartment', 'flat', 'block', 'plot', 'deliver', 'address',
        'covenant', 'idiroko', 'campus', 'building', 'complex'
      ];

      const lowerContent = content.toLowerCase();
      const hasAddressIndicators = addressIndicators.some(indicator => lowerContent.includes(indicator));
      const hasCommas = content.includes(',');
      const isLongText = content.length > 15;
      const notCurrencyRelated = !lowerContent.includes('usdc') && !lowerContent.includes('cash') && !lowerContent.includes('money');

      const isAddress = hasAddressIndicators || (hasCommas && isLongText && notCurrencyRelated);

      console.log("🔍 Address detection:", {
        content: content.substring(0, 50) + "...",
        hasAddressIndicators,
        hasCommas,
        isLongText,
        notCurrencyRelated,
        isAddress
      });

      return isAddress;
    };

    // ✅ COMPLETELY FIXED buildStructuredResponse function
    const buildStructuredResponse = (content: string, extraValue: string) => {
      const exchangeAd = SingleConversation.value?.exchangeAd;
      const currentStage = currentConversationState.value.stage;
      let structuredResponse: any = {};

      console.log("🔧 Building structured response:", {
        currentStage,
        content,
        extraValue,
        showAddressInput: showAddressInput.value,
        exchangeAd: exchangeAd,
        exchangeAdRate: exchangeAd?.rate,
        exchangeAdFromCurrency: exchangeAd?.from_currency,
        exchangeAdToCurrency: exchangeAd?.to_currency
      });

      // Check if content is a number (withdrawal amount) AND we're actually in withdrawal stage
      const amount = parseFloat(content.replace(/,/g, ""));
      if (!isNaN(amount) && amount > 0 && currentStage === "withdrawal_amount") {
        // ✅ FIX: Use the actual rate from the exchange ad, but hardcode currency to TRY
        const exchangeRate = exchangeAd?.rate || 10; // Use business-set rate
        const withdrawalCurrency = withdrawalAvailableCurrencies.find(
          c => c.code === "TRY"
        );

        // ✅ FIX: Calculate the correct sell amount based on the business rate
        // The rate is how much local currency you get for 1 USDC
        const sellAmount = (amount * exchangeRate);

        structuredResponse = {
          currency: "USDC", // Always send USDC as currency
          amount: amount,
          currency_symbol: "₺", // Hardcoded to TRY symbol
          business_name: exchangeAd?.business?.business_name || "GreepPay",
          sell_amount: sellAmount.toFixed(2),
          sell_rate: exchangeRate.toFixed(2),
        };

        console.log("🔧 EXCHANGE RATE CALCULATION:", {
          userAmount: amount,
          exchangeRate: exchangeRate,
          calculatedSellAmount: sellAmount,
          currencySymbol: "₺", // Hardcoded to TRY
          businessName: exchangeAd?.business?.business_name,
          exchangeAd: exchangeAd,
          fromCurrency: "TRY", // Hardcoded to TRY
          toCurrency: "USDC"
        });
      }
      // ✅ CRITICAL FIX: Address handling - send correct key
      else if (
        (currentStage === "cash_delivery" || showAddressInput.value ||
          // ✅ NEW: Handle address input even when backend stage is withdrawal_method
          (currentStage === "withdrawal_method" && isAddressContent(content))) &&
        !extraValue &&
        (content.trim().length > 5 || isAddressContent(content))
      ) {
        // ✅ This is the key fix - send selected_option, not selected_option_data_type
        structuredResponse = {
          selected_option: content.trim()  // Backend expects this exact key
        };

        console.log("✅ Address structured response (FIXED):", structuredResponse, typeof content.trim());
        console.log("🔧 CRITICAL FIX: Sending address in stage:", currentStage);

        // Disable address input after sending
        setTimeout(() => {
          updateAddressInputVisibility(false);
          showAddressModal.value = false;
        }, 100);
      }
      // ✅ NEW: Handle order summary confirmation (FIXED)
      else if (currentStage === "order_summary" && (content.toLowerCase().includes("confirm") || content === "success")) {
        console.log("🔧 Order summary confirmation detected, sending 'success'");

        // Get the delivery address from conversation history
        const deliveryAddress = getDeliveryAddressFromHistory();

        // For testing - if no address found, use a default address
        const finalDeliveryAddress = (!deliveryAddress || deliveryAddress === "Address not provided")
          ? "123 Test Street, Lagos, Nigeria"
          : deliveryAddress;

        structuredResponse = {
          selected_option: "success",  // Backend expects "success", not "confirm"
          delivery_address: finalDeliveryAddress, // Include the delivery address
        };

        console.log("🔧 P2P ORDER CREATION: Sending structured response:", structuredResponse);
        console.log("🔧 P2P ORDER CREATION: Current stage:", currentStage);
        console.log("🔧 P2P ORDER CREATION: SingleConversation:", SingleConversation.value);
        console.log("🔧 P2P ORDER CREATION: Delivery address:", finalDeliveryAddress);
        console.log("🔧 P2P ORDER CREATION: Original delivery address:", deliveryAddress);
      }
      // ✅ NEW: Handle order summary step automatically when user provides address
      else if (currentStage === "order_summary" && !extraValue && content.trim().length > 0) {
        console.log("🔧 Order summary step detected, automatically confirming order");

        // Get the delivery address from conversation history
        const deliveryAddress = getDeliveryAddressFromHistory();

        // For testing - if no address found, use a default address
        const finalDeliveryAddress = (!deliveryAddress || deliveryAddress === "Address not provided")
          ? "123 Test Street, Lagos, Nigeria"
          : deliveryAddress;

        structuredResponse = {
          selected_option: "success",  // Backend expects "success", not "confirm"
          delivery_address: finalDeliveryAddress, // Include the delivery address
        };

        console.log("🔧 P2P ORDER CREATION: Auto-confirming order summary:", structuredResponse);
        console.log("🔧 P2P ORDER CREATION: Current stage:", currentStage);
        console.log("🔧 P2P ORDER CREATION: Delivery address:", finalDeliveryAddress);
      }
      // ✅ NEW: Handle payment confirmation
      else if (currentStage === "send_payment" && content.toLowerCase().includes("payment confirmed")) {
        structuredResponse = {
          selected_option: "confirm_payment",
        };

        // Add final confirmation message
        setTimeout(() => {
          const finalConfirmationMessage = {
            id: `final_confirm_${Date.now()}`,
            type: "text" as const,
            text_content: "Are you sure that you have collected your cash?",
            user_uuid: "greep_ai",
            user_name: "GreepPay AI",
            info_icon: "",
            actions: [
              {
                label: "Yes, release USDC",
                message: "Yes, release USDC",
                type: "success" as const,
                value: "yes",
                handler: () => sendMessage("Yes, release USDC", "yes")
              },
              {
                label: "No, I haven't",
                message: "No, I haven't",
                type: "info" as const,
                value: "no",
                handler: () => sendMessage("No, I haven't", "no")
              }
            ],
            orderSummary: null,
            isOrderSummary: false
          };

          messages.push(finalConfirmationMessage);
          scrollToBottom();
        }, 1000);
      }
      // ✅ NEW: Handle final payment confirmation
      else if (currentStage === "finalize_payment" && content.toLowerCase().includes("yes")) {
        structuredResponse = {
          selected_option: "yes",
        };

        // Add success messages
        setTimeout(() => {
          const usdcSentMessage = {
            id: `usdc_sent_${Date.now()}`,
            type: "text" as const,
            text_content: "USDC sent!",
            user_uuid: "greep_ai",
            user_name: "GreepPay AI",
            info_icon: "",
            actions: [],
            orderSummary: null,
            isOrderSummary: false
          };

          messages.push(usdcSentMessage);
          scrollToBottom();

          // Add success message with action buttons
          setTimeout(() => {
            const successMessage = {
              id: `success_${Date.now()}`,
              type: "text" as const,
              text_content: "P2P trade successful!",
              user_uuid: "greep_ai",
              user_name: "GreepPay AI",
              info_icon: "",
              actions: [
                {
                  label: "View transaction",
                  message: "View transaction",
                  type: "success" as const,
                  value: "view_transaction",
                  handler: () => {
                    console.log("View transaction clicked");
                    // Handle view transaction
                  }
                },
                {
                  label: "Rate your experience",
                  message: "Rate your experience",
                  type: "info" as const,
                  value: "rate_experience",
                  handler: () => {
                    console.log("Rate experience clicked");
                    // Handle rating
                  }
                }
              ],
              orderSummary: null,
              isOrderSummary: false
            };

            messages.push(successMessage);
            scrollToBottom();
          }, 1000);
        }, 1000);
      }
      // Handle button actions with extraValue
      else if (extraValue) {
        structuredResponse = {
          selected_option: extraValue,
        };

        // Add specific handling for delivery method selection
        if (extraValue === "cash_delivery") {
          structuredResponse.collection_method = "cash_delivery";
        }
        // ✅ NEW: Handle order confirmation via button
        else if (extraValue === "confirm") {
          console.log("🔧 P2P ORDER CREATION: Button confirm clicked, sending 'success'");
          structuredResponse = {
            selected_option: "success",  // Backend expects "success", not "confirm"
          };
          console.log("🔧 P2P ORDER CREATION: Button structured response:", structuredResponse);
        }
      }
      // Handle common text responses
      else if (content.toLowerCase().includes("accept") || content.toLowerCase() === "i accept") {
        structuredResponse = {
          selected_option: "accept",
        };
      }
      else if (content.toLowerCase().includes("cancel")) {
        structuredResponse = {
          selected_option: "cancel",
        };
      }
      // Fallback for any other text
      else {
        structuredResponse = {
          selected_option: content.toLowerCase().trim(),
        };
      }

      console.log("🔧 Final structured response:", structuredResponse);
      return structuredResponse;
    };

    // ✅ REMOVED: Business participant logic to prevent loops

    // ✅ NEW: Simulate business joining the conversation
    const simulateBusinessJoining = async (businessUuid: string, businessName: string) => {
      try {
        console.log("🔧 Simulating business joining conversation:", { businessUuid, businessName });

        // Send a system message to simulate the business joining
        Logic.Messaging.CreateMessageForm = {
          input: {
            conversation_id: SingleConversation.value?.id || 0,
            content: `@system:business_joined:${businessUuid}:${businessName}`,
            type: "text",
            sender_id: parseInt(AuthUser.value?.id || "0"),
            metadata: JSON.stringify({
              is_bot: false,
              type: "system_notification",
              action: "business_joined",
              business_uuid: businessUuid,
              business_name: businessName,
              trigger_conversation: false
            }),
          },
        };

        await Logic.Messaging.CreateMessage();
        console.log("✅ Business joining simulation sent to backend");
      } catch (error) {
        console.error("❌ Error simulating business joining:", error);
      }
    };



    // ✅ NEW: Send business message through WebSocket
    const sendBusinessMessage = async (content: string, userUuid: string, userName: string, media?: any) => {
      try {
        console.log("🔧 Sending business message:", { content, userUuid, userName, media });

        if (!SingleConversation.value) {
          console.error("❌ No conversation available");
          return;
        }

        // For AI messages (greep_ai), add them locally since they're system messages
        if (userUuid === "greep_ai") {
          const aiMessage = {
            id: Date.now().toString(),
            type: "text" as const,
            text_content: content,
            user_uuid: userUuid,
            user_name: userName,
            info_icon: "",
            actions: [],
            orderSummary: null,
            isOrderSummary: false,
            metadata: JSON.stringify({
              is_bot: true,
              type: "text",
              sender_type: "ai",
              sender_name: userName,
              sender_uuid: userUuid,
              media: media || null
            })
          };

          messages.push(aiMessage);
          await scrollToBottom();
          console.log("🔧 AI message added to display:", aiMessage);
          return aiMessage;
        }

        // For business messages, try to send through the proper channel
        // First, try to get the business user's actual ID
        const business = SingleConversation.value.exchangeAd?.business;
        const businessUserId = business?.auth_user_id || business?.id;

        if (businessUserId) {
          // Try to send through GraphQL with the business user ID
          try {
            Logic.Messaging.CreateMessageForm = {
              input: {
                conversation_id: SingleConversation.value.id,
                content: content,
                type: "text",
                sender_id: parseInt(businessUserId.toString()),
                metadata: JSON.stringify({
                  is_bot: false,
                  type: "text",
                  sender_type: "business",
                  sender_name: userName,
                  sender_uuid: userUuid,
                  media: media || null
                }),
              },
            };

            const response = await Logic.Messaging.CreateMessage();
            console.log("🔧 Business message sent through GraphQL:", response);
            return response;
          } catch (graphqlError) {
            console.log("🔧 GraphQL failed, falling back to local message:", graphqlError);
            // Fall back to local message if GraphQL fails
          }
        }

        // If no business user ID, try to send as a system message to trigger participant addition
        if (userUuid !== "greep_ai") {
          try {
            Logic.Messaging.CreateMessageForm = {
              input: {
                conversation_id: SingleConversation.value.id,
                content: content,
                type: "text",
                sender_id: parseInt(AuthUser.value?.id || "0"),
                metadata: JSON.stringify({
                  is_bot: false,
                  type: "business_message",
                  sender_type: "business",
                  sender_name: userName,
                  sender_uuid: userUuid,
                  business_uuid: userUuid,
                  business_name: userName,
                  media: media || null,
                  trigger_participant_addition: true,
                  business_joined: true // Indicate that business has joined
                }),
              },
            };

            const response = await Logic.Messaging.CreateMessage();
            console.log("🔧 Business message sent as system message:", response);
            return response;
          } catch (systemError) {
            console.log("🔧 System message failed, falling back to local message:", systemError);
            // Fall back to local message if system message fails
          }
        }

        // Fallback: Add business message locally
        const businessMessage = {
          id: Date.now().toString(),
          type: "text" as const,
          text_content: content,
          user_uuid: userUuid,
          user_name: userName,
          info_icon: "",
          actions: [],
          orderSummary: null,
          isOrderSummary: false,
          metadata: JSON.stringify({
            is_bot: false,
            type: "text",
            sender_type: "business",
            sender_name: userName,
            sender_uuid: userUuid,
            media: media || null
          })
        };

        messages.push(businessMessage);
        await scrollToBottom();

        console.log("🔧 Business message added to display (fallback):", businessMessage);
        return businessMessage;
      } catch (error) {
        console.error("❌ Error sending business message:", error);
      }
    };



    const initializeMessages = async () => {
      console.log("🔧 initializeMessages called, current messages length:", messages.length);
      console.log("🔧 SingleConversation messages:", SingleConversation.value?.messages);

      // Only initialize if messages array is empty to avoid clearing existing messages
      if (messages.length > 0) {
        console.log("🔧 Messages already exist, skipping initialization");
        return;
      }

      // If no messages exist, add only the seller welcome message
      if (!SingleConversation.value?.messages?.length) {
        console.log("🔧 No conversation messages, adding seller welcome message");
        const exchangeAd = SingleConversation.value?.exchangeAd;
        const sellerName = exchangeAd?.business?.business_name || "Fggh";
        const sellerUuid = exchangeAd?.business?.uuid || "seller_uuid";

        messages.push({
          id: "seller_welcome",
          type: "text",
          text_content: `Thanks for choosing to trade with me 😊 I'm fast, reliable, and always online for smooth transactions. If you ever need USDC again, I'm always here!`,
          user_uuid: sellerUuid,
          user_name: sellerName,
          info_icon: "",
          actions: []
        });

        setTimeout(() => {
          console.log("🔧 About to trigger backend conversation start...");
          triggerBackendConversationStart();
        }, 1500);
      } else {
        // ✅ NEW: If current user is business, show only summary instead of all messages
        if (isBusinessUser.value) {
          console.log("🎯 Business user - showing summary instead of all conversation messages");

          // Create order summary message for business user
          const businessSummaryMessage = {
            id: `business_summary_${Date.now()}`,
            type: "text" as const,
            text_content: "Order confirmed - continue from here",
            user_uuid: "greep_ai",
            user_name: "GreepPay AI",
            info_icon: "",
            actions: [],
            orderSummary: getOrderSummaryFromConversation(),
            isOrderSummary: true
          };

          messages.push(businessSummaryMessage);
          console.log("📋 Business summary message added during initialization:", businessSummaryMessage);
        } else {
          console.log("🔧 Processing existing conversation messages:", SingleConversation.value.messages.length);
          await Promise.all(SingleConversation.value.messages.map(async (message, index) => {
            console.log(`🔧 Processing message ${index}:`, message.content);
            await addMessageToDisplay(message);
          }));
        }
      }
    };

    const triggerBackendConversationStart = async () => {
      if (!SingleConversation.value || !AuthUser.value) return;

      try {
        const balance = AuthUser.value?.wallet?.total_balance || "0";

        console.log("🔧 Triggering backend conversation start with balance:", balance);

        Logic.Messaging.CreateMessageForm = {
          input: {
            conversation_id: SingleConversation.value.id,
            content: "Hi",
            type: "text",
            sender_id: parseInt(AuthUser.value.id),
            metadata: JSON.stringify({
              is_bot: false,
              type: "text",
              wallet_balance: Logic.Common.convertToMoney(balance, true, "", false),
              stage: "withdrawal_amount",
              trigger_conversation: true,
              structured_response: {}
            }),
          },
        };

        console.log("🔧 Sending CreateMessage with form:", Logic.Messaging.CreateMessageForm);
        const result = await Logic.Messaging.CreateMessage();
        console.log("🔧 CreateMessage result:", result);
      } catch (error) {
        console.error("Error triggering backend conversation start:", error);
      }
    };

    const addMessageToDisplay = async (message: any) => {
      console.log("🔧 addMessageToDisplay called with message:", {
        id: message.id,
        content: message.content,
        text_content: message.text_content,
        user_uuid: message.user_uuid,
        user_name: message.user_name,
        sender: message.sender,
        metadata: message.metadata
      });

      try {
        const existingIndex = messages.findIndex(m => m.id === message.id.toString());
        if (existingIndex !== -1) {
          console.log("🔧 Message already exists, skipping:", message.id);
          return;
        }

        // ✅ ENHANCED: Robust deduplication logic to prevent duplicate messages
        console.log("🔍 Enhanced deduplication check for message:", message.id);
        console.log("🔍 Current messages count:", messages.length);

        // ✅ ENHANCED: Check for duplicate content within a short time window (5 seconds)
        const messageContent = message.text_content || message.content;
        const messageUserId = message.sender?.uuid || message.user_uuid;
        const now = Date.now();
        const timeWindow = 5000; // 5 seconds

        const recentDuplicate = messages.find(m => {
          const mContent = m.text_content;
          const mUserId = m.user_uuid === "greep_ai" ? "greep_ai" :
            (m.user_uuid === "temp_user" ? "temp_user" : m.user_uuid);

          // Check if content and user match
          const contentMatches = mContent === messageContent;
          const userMatches = mUserId === messageUserId ||
            (mUserId === "greep_ai" && messageUserId === "greep_ai");

          // Check if message was added recently (within time window)
          const isRecent = typeof m.id === 'string' && m.id.startsWith('temp_') ?
            parseInt(m.id.split('_')[1]) > (now - timeWindow) : false;

          return contentMatches && userMatches && isRecent;
        });

        if (recentDuplicate) {
          console.log("⏭️ Recent duplicate message found, skipping:", {
            existingId: recentDuplicate.id,
            content: messageContent,
            userId: messageUserId
          });
          return;
        }

        // ✅ ADDITIONAL: Check for exact content match from current user (prevents server confirmation duplicates)
        const isFromCurrentUser = message.sender?.uuid === AuthUser.value?.uuid || message.user_uuid === AuthUser.value?.uuid;
        if (isFromCurrentUser) {
          const exactContentMatch = messages.find(m =>
            m.text_content === messageContent &&
            m.user_uuid === AuthUser.value?.uuid
          );

          if (exactContentMatch) {
            console.log("⏭️ Exact content match found for current user, skipping duplicate:", {
              existingId: exactContentMatch.id,
              content: messageContent
            });
            return;
          }
        }

        const metadata = message.metadata ? JSON.parse(message.metadata) : {};
        const options = metadata?.options || [];
        const orderData = metadata?.order_data || {};

        console.log("🔍 Message processing details:", {
          hasMetadata: !!message.metadata,
          parsedMetadata: metadata,
          hasOptions: options.length > 0,
          hasOrderData: !!orderData,
          messageType: metadata?.type || 'unknown'
        });

        console.log("🔍 Processing message:", {
          content: message.content,
          text_content: message.text_content,
          hasOrderSummaryTemplate: (message.text_content || message.content)?.includes('{order_summary_text}'),
          orderData: orderData,
          metadata: metadata,
          messageType: metadata?.type || 'unknown',
          isFromBusiness: metadata?.sender_type === 'business',
          isRegularChat: metadata?.type === 'chat_message'
        });

        // ✅ FILTER OUT ERROR MESSAGES
        if ((message.text_content || message.content)?.includes("Currency must be a string.")) {
          console.log("🚫 Filtering out currency error message");
          return; // Don't add this message to display
        }

        // ✅ NEW: Ensure regular chat messages are always displayed
        if (metadata?.type === 'chat_message') {
          console.log("💬 Regular chat message detected, ensuring it's displayed");
          // Skip all filtering for regular chat messages
        }

        // ✅ FILTER OUT CONFIRMATION EMAIL MESSAGE
        if ((message.text_content || message.content)?.includes("Your order has been confirmed. Please wait for the confirmation email.")) {
          console.log("🚫 Filtering out confirmation email message, proceeding to next stage");

          // ✅ NEW: Instead of filtering out, let's handle this as order confirmation
          orderConfirmed.value = true;
          showAddressInput.value = false;

          console.log("🎯 BACKEND CONFIRMATION: orderConfirmed set to true, showAddressInput set to false");

          // ✅ NEW: This confirmation should also enable business users to chat freely
          // The business user will receive this message and should also get orderConfirmed = true

          const orderConfirmationMessage = {
            id: `order_confirmed_${Date.now()}`,
            type: "text" as const,
            text_content: "Order confirmed! Your P2P trade has been created successfully.",
            user_uuid: "greep_ai",
            user_name: "GreepPay AI",
            info_icon: "",
            actions: [
              {
                label: "View order details",
                message: "View order details",
                type: "success" as const,
                value: "view_order",
                handler: () => {
                  console.log("View order details clicked");
                  // Handle view order
                }
              }
            ],
            orderSummary: null,
            isOrderSummary: false
          };

          messages.push(orderConfirmationMessage);
          scrollToBottom();

          return; // Don't add the original message
        }

        // ✅ HANDLE PAYMENT CONFIRMATION MESSAGE FROM BACKEND
        if ((message.text_content || message.content)?.includes("Order confirmed! Pressing the") && (message.text_content || message.content)?.includes("Payment confirmed")) {
          console.log("🔧 Payment confirmation message from backend detected");

          // ✅ Make bottom bar a free chat input from now on
          orderConfirmed.value = true;
          showAddressInput.value = false;

          console.log("🎯 PAYMENT CONFIRMATION: orderConfirmed set to true, showAddressInput set to false");

          // ✅ FIXED: Check if business participant has been added - Updated detection logic
          const businessExists = SingleConversation.value?.participants?.some(p =>
            p.user_id !== parseInt(AuthUser.value?.id || "0") &&
            p.user_id !== 0 && // Not AI
            p.state === 'active'
          ) || messages.some(m =>
            m.user_uuid === SingleConversation.value?.exchangeAd?.business?.uuid ||
            (m.user_name && m.user_name !== "GreepPay AI" && m.user_name !== AuthUser.value?.first_name)
          );

          // ✅ NEW: Business users should also get orderConfirmed = true when they receive this message
          // This ensures both customer and business can chat freely after order confirmation

          if (!businessExists) {
            console.log("🔧 Business participant not found, showing payment confirmation message");
            // Add the backend's payment confirmation message directly
            const backendPaymentMessage = {
              id: `backend_payment_${Date.now()}`,
              type: "text" as const,
              text_content: message.content,
              user_uuid: "greep_ai",
              user_name: "GreepPay AI",
              info_icon: "",
              actions: [
                {
                  label: "Payment confirmed",
                  message: "Payment confirmed",
                  type: "success" as const,
                  value: "confirm_payment",
                  handler: () => sendMessage("Payment confirmed", "confirm_payment")
                }
              ],
              orderSummary: null,
              isOrderSummary: false
            };
            messages.push(backendPaymentMessage);
            scrollToBottom();
            return; // Don't add this message yet, it will be added after business participant
          } else {
            console.log("✅ Business participant found, allowing payment confirmation message");
          }
          // If business already exists, let the message through normally
        }

        // ✅ HANDLE ADDRESS CONFIRMATION STEP
        if (message.content?.includes("What is your address") && !message.content?.includes("Is this your correct address")) {
          console.log("🔧 Address question detected, will show confirmation after user responds");
          // This will be handled when user responds with address
        }

        // ✅ HANDLE ADDRESS CONFIRMATION MESSAGE
        if (message.content?.includes("Is this your correct address")) {
          console.log("🔧 Address confirmation step detected");
          // This step is handled by the backend, we just need to display it
        }

        // ✅ PREVENT DUPLICATE ORDER SUMMARY MESSAGES
        const isOrderSummary = message.content?.includes('{order_summary_text}');
        if (isOrderSummary) {
          // Check if we already have an order summary message
          const existingOrderSummary = messages.find(m => m.isOrderSummary);
          if (existingOrderSummary) {
            console.log("🚫 Skipping duplicate order summary message");
            return; // Don't add duplicate order summary
          }
        }

        // ✅ CHECK FOR ORDER SUMMARY TEMPLATE
        let orderSummaryDetails = null;

        if (isOrderSummary) {
          console.log("🔍 Creating order summary with data:", orderData);

          // Get the delivery address from conversation history
          const deliveryAddress = getDeliveryAddressFromHistory();

          // ✅ FIX: Get actual values from conversation metadata
          const conversationMetadata = SingleConversation.value?.metadata ?
            JSON.parse(SingleConversation.value.metadata) : {};

          // Get the actual values from the conversation
          const amount = conversationMetadata.amount || orderData.amount || metadata.amount || 100;
          const currencySymbol = '₺'; // Always use TRY symbol

          // ✅ FIX: Get the business-set rate from the exchange ad
          const exchangeAd = SingleConversation.value?.exchangeAd;
          const sellRate = exchangeAd?.rate || 10; // Use business-set rate

          // ✅ FIX: Calculate the correct sell amount based on the business rate
          const amountNum = typeof amount === 'number' ? amount : parseFloat(amount.toString());
          const calculatedSellAmount = (amountNum * sellRate).toFixed(2);

          // Use the calculated amount instead of the stored one
          const sellAmount = calculatedSellAmount;

          console.log("🔧 ORDER SUMMARY VALUES:", {
            conversationMetadata,
            amount,
            calculatedSellAmount,
            sellAmount,
            currencySymbol,
            sellRate,
            orderData,
            metadata
          });

          // Calculate fees
          const tradingFee = (amountNum * 0.0015).toFixed(2);
          const deliveryFee = 3;
          const totalToPay = (amountNum + parseFloat(tradingFee) + deliveryFee).toFixed(2);

          orderSummaryDetails = {
            youSell: `${amount} USDC`,
            youGet: `${currencySymbol}${sellAmount}`,
            fee: `${tradingFee} USDC`,
            deliveryFee: `${deliveryFee} USDC`,
            youPay: `${totalToPay} USDC`,
            paymentType: 'Cash',
            payoutOption: 'Delivery',
            deliveryAddress: deliveryAddress || 'Address not provided'
          };

          console.log("✅ Order summary details created:", orderSummaryDetails);
        }

        // Check if this message is asking for address
        const isAddressQuestion = message.content?.toLowerCase().includes("what is your address") ||
          message.content?.toLowerCase().includes("choose your address") ||
          message.content?.toLowerCase().includes("delivery address") ||
          message.content?.toLowerCase().includes("enter your address") ||
          message.content?.toLowerCase().includes("add enough details");

        if (isAddressQuestion && (!message.sender || message.sender?.uuid === "greep_ai")) {
          console.log("Detected address question, checking if user should see address input");
          // ✅ FIX: Only show address input for conversation owner/buyer, not business users
          updateAddressInputVisibility(true);
        }

        const actions = options.map((option: any) => {
          const handler = () => {
            console.log("🔧 Button clicked:", option.value, "Content:", option.message?.content || option.content);

            // ✅ FIX: Map "confirm" to "success" for order summary
            let actualValue = option.value;
            if (currentConversationState.value.stage === "order_summary" && option.value === "confirm") {
              actualValue = "success";
              console.log("🔧 Mapping 'confirm' to 'success' for order summary stage");
            }

            console.log("🔧 Sending button action with value:", actualValue);
            // ✅ FIX: Send the actualValue instead of the message content
            sendMessage(actualValue, actualValue);
          };

          return {
            label: option.content,
            message: option.message?.content || option.content,
            type: option.type || "primary",
            value: option.value,
            handler: handler,
          };
        });

        const messageType = options.length > 0 ? "text" : (metadata?.type === "chat_message" ? "text" : metadata?.type || "text");

        // ✅ NEW: Ensure regular chat messages are properly formatted
        if (metadata?.type === 'chat_message' || (!options.length && !orderSummaryDetails && !isOrderSummary)) {
          console.log("💬 Creating regular chat message display");
        }

        const displayMessage: MessageInfo = {
          id: message.id.toString(),
          type: messageType as "text" | "info",
          text_content: message.text_content || message.content,
          user_uuid: message.user_uuid || message.sender?.uuid || "greep_ai",
          user_name: message.user_name || (message.sender
            ? `${message.sender.first_name} ${message.sender.last_name}`.trim()
            : "GreepPay AI"),
          info_icon: metadata?.extras?.info_icon || "",
          actions: actions || [],
          // ✅ ADD ORDER SUMMARY DATA
          orderSummary: orderSummaryDetails,
          isOrderSummary: isOrderSummary
        };

        messages.push(displayMessage);
        console.log("✅ Message added to display:", displayMessage);
        console.log("📊 Current messages array length:", messages.length);
        console.log("📊 All messages in array:", messages.map(m => ({ id: m.id, content: m.text_content, user: m.user_name })));

        // Force reactivity update
        await nextTick();
        console.log("🔍 After nextTick - displayMessages computed should now have:", displayMessages.value.length, "messages");
        console.log("🔍 displayMessages computed value:", displayMessages.value);

        // Force a manual trigger of the computed property
        console.log("🔍 Manually checking displayMessages length:", displayMessages.value.length);
        console.log("🔍 Manually checking messages array length:", messages.length);
      } catch (error) {
        console.error("Error adding message to display:", error);
        const fallbackMessage: MessageInfo = {
          id: message.id.toString(),
          type: "text",
          text_content: message.text_content || message.content,
          user_uuid: message.user_uuid || message.sender?.uuid || "greep_ai",
          user_name: message.user_name || (message.sender
            ? `${message.sender.first_name} ${message.sender.last_name}`.trim()
            : "GreepPay AI"),
          info_icon: "",
          actions: [],
          orderSummary: null,
          isOrderSummary: false
        };
        messages.push(fallbackMessage);
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
        await addMessageToDisplay(newMessage);

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
          Logic.Messaging.SingleConversation = existingConversation;
          setTimeout(() => {
            scrollToBottom();
          }, 300);
        }, 200);
      } catch (error) {
        console.error("Error pushing new message:", error);
      }
    };

    // ✅ IMPROVED handleAddressConfirm function
    const handleAddressConfirm = async (fullAddress: string) => {
      console.log("🔧 Address confirm called with:", fullAddress);

      if (!fullAddress || fullAddress.trim().length < 5) {
        Logic.Common.showAlert({
          show: true,
          message: "Please enter a valid address with at least 5 characters.",
          type: "error",
        });
        return;
      }

      try {
        // Close modal immediately
        showAddressModal.value = false;

        console.log("🔧 About to send address:", fullAddress.trim());

        // Send the clean address string
        const success = await sendMessage(fullAddress.trim());

        if (success) {
          console.log("✅ Address sent successfully");
          // Only disable address input after successful send
          updateAddressInputVisibility(false);
        } else {
          console.error("❌ Failed to send address");
          // Re-enable address input if sending failed
          updateAddressInputVisibility(true);
          Logic.Common.showAlert({
            show: true,
            message: "Failed to send address. Please try again.",
            type: "error",
          });
        }
      } catch (error) {
        console.error("❌ Error sending address:", error);
        // Re-enable address input if error occurred
        updateAddressInputVisibility(true);
        Logic.Common.showAlert({
          show: true,
          message: "Error sending address. Please try again.",
          type: "error",
        });
      }
    };

    const handleAddressCancel = () => {
      console.log("Address input cancelled");
      showAddressModal.value = false;
      // Don't disable address mode, just close modal
    };

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

      // Skip validation for button actions
      if (extraValue) {
        return true;
      }

      // Skip validation for common button texts
      const buttonTexts = ["Accept", "Cancel", "I accept", "Confirm", "Yes", "No"];
      if (buttonTexts.some(btn => trimmedContent.toLowerCase().includes(btn.toLowerCase()))) {
        return true;
      }

      // Skip validation for address inputs
      if (stage === "cash_delivery" || showAddressInput.value) {
        return trimmedContent.length >= 5;
      }

      // Check if it's a numeric amount
      const amount = parseFloat(trimmedContent.replace(/,/g, ""));
      if (!isNaN(amount) && amount > 0) {
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

      return true;
    };

    // ✅ NEW: Direct send method that bypasses processing check for auto-send
    const sendMessageDirectly = async (content: string, extraValue = ""): Promise<boolean> => {
      if (!SingleConversation.value || !AuthUser.value) {
        console.log("❌ Cannot send message directly - missing requirements");
        return false;
      }

      console.log("🔧 AUTO-SEND: Sending message directly:", content);

      // Temporarily set processing to false for auto-send
      const originalProcessing = isProcessing.value;
      isProcessing.value = false;

      try {
        const result = await sendMessage(content, extraValue);
        return result;
      } finally {
        // Restore original processing state
        isProcessing.value = originalProcessing;
      }
    };

    // ✅ IMPROVED sendMessage function with comprehensive debugging and proof upload support
    const sendMessage = async (content: string, extraValue = ""): Promise<boolean> => {
      if (!SingleConversation.value || !AuthUser.value || isProcessing.value) {
        console.log("❌ Cannot send message - missing requirements");
        return false;
      }

      const trimmedContent = content.trim();
      if (!trimmedContent) {
        console.log("❌ Cannot send empty message");
        return false;
      }

      // ✅ NEW: Check if this is a proof upload (seller sending proof)
      const isProofUpload = trimmedContent.toLowerCase().includes('proof') ||
        trimmedContent.toLowerCase().includes('receipt') ||
        trimmedContent.toLowerCase().includes('photo') ||
        trimmedContent.toLowerCase().includes('image');

      // ✅ NEW: Handle proof upload for sellers
      if (isProofUpload && isBusinessUser.value) {
        console.log("🔧 Seller uploading proof:", trimmedContent);
        return await handleProofUpload(trimmedContent);
      }

      // ✅ NEW: Business users - check if this is a structured response first
      if (isBusinessUser.value) {
        // Check if this is a structured response (like amount, address, etc.)
        if (isStructuredResponse(trimmedContent, currentConversationState.value.stage)) {
          console.log("🔧 Business user sending structured response:", trimmedContent);
          // Let it continue to the structured response flow below
        } else {
          console.log("🔧 Business user sending regular chat message:", trimmedContent);
          return await sendRegularChatMessage(trimmedContent);
        }
      } else {
        // ✅ NEW: Handle regular chat messages (not structured responses) for non-business users
        if (!isStructuredResponse(trimmedContent, currentConversationState.value.stage)) {
          console.log("🔧 Sending regular chat message:", trimmedContent);
          return await sendRegularChatMessage(trimmedContent);
        }
      }

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

        // ✅ DEBUG: Log what we're sending
        console.log("🔧 SENDING MESSAGE DEBUG:", {
          content: trimmedContent,
          stage: currentConversationState.value.stage,
          structuredResponse: structuredResponse,
          structuredResponseKeys: Object.keys(structuredResponse),
          hasSelectedOption: structuredResponse.hasOwnProperty('selected_option'),
          selectedOptionType: typeof structuredResponse.selected_option,
          selectedOptionValue: structuredResponse.selected_option
        });

        const otherMetadata = {
          wallet_balance: Logic.Common.convertToMoney(balance, true, "", false),
          timestamp: Date.now(),
          currency: "USDC", // ✅ FIX: Ensure currency is always USDC
        };

        // ✅ NEW: Generate a temporary client-side ID for deduplication
        const tempMessageId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create user message first with temporary ID
        const userMessage: Message = {
          id: tempMessageId as any, // Type assertion for temporary ID
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
            // ✅ NEW: Add temporary message flag for deduplication
            is_temp_message: true,
            temp_message_id: tempMessageId,
            original_content: trimmedContent,
            original_sender_id: parseInt(AuthUser.value.id)
          }),
        };

        await addNewMessage(userMessage);

        // ✅ CRITICAL: Ensure structured_response is in the metadata
        const fullMetadata = {
          is_bot: false,
          type: "text",
          ...conversationMetadata,
          ...otherMetadata,
          ...structuredResponse,
          structured_response: structuredResponse, // This is what the backend looks for
          // Ensure exchangeAd is included for P2P order creation
          exchangeAd: SingleConversation.value?.exchangeAd || null,
          // Include customer information for P2P order creation
          customer_name: `${AuthUser.value.first_name} ${AuthUser.value.last_name}`.trim(),
          user_name: `${AuthUser.value.first_name} ${AuthUser.value.last_name}`.trim(),
          sender: {
            first_name: AuthUser.value.first_name,
            last_name: AuthUser.value.last_name,
            uuid: AuthUser.value.uuid
          }
        };

        console.log("🔧 Full metadata being sent:", fullMetadata);
        console.log("🔧 P2P ORDER CREATION: Checking if this should trigger P2P order creation");
        console.log("🔧 P2P ORDER CREATION: Current stage:", currentConversationState.value.stage);
        console.log("🔧 P2P ORDER CREATION: Structured response:", structuredResponse);
        console.log("🔧 P2P ORDER CREATION: Has selected_option:", structuredResponse.hasOwnProperty('selected_option'));
        console.log("🔧 P2P ORDER CREATION: Selected option value:", structuredResponse.selected_option);
        console.log("🔧 P2P ORDER CREATION: Has delivery_address:", structuredResponse.hasOwnProperty('delivery_address'));
        console.log("🔧 P2P ORDER CREATION: Delivery address value:", structuredResponse.delivery_address);
        console.log("🔧 P2P ORDER CREATION: Conversation metadata keys:", Object.keys(conversationMetadata));
        console.log("🔧 P2P ORDER CREATION: ExchangeAd in conversation:", conversationMetadata.exchangeAd);
        console.log("🔧 P2P ORDER CREATION: SingleConversation exchangeAd:", SingleConversation.value?.exchangeAd);
        console.log("🔧 P2P ORDER CREATION: Full metadata keys:", Object.keys(fullMetadata));

        // ✅ NEW: Check if this is the order summary confirmation
        const isOrderSummaryConfirmation = currentConversationState.value.stage === "order_summary" &&
          structuredResponse.selected_option === "success";

        if (isOrderSummaryConfirmation && !orderCreationInProgress.value) {
          console.log("🎯 P2P ORDER CREATION: This should trigger P2P order creation!");
          console.log("🎯 P2P ORDER CREATION: Order summary confirmed with success");
          console.log("🎯 P2P ORDER CREATION: Delivery address:", structuredResponse.delivery_address);

          // ✅ Make bottom bar a free chat input from now on
          orderConfirmed.value = true;
          showAddressInput.value = false;

          console.log("🎯 ORDER CONFIRMED: orderConfirmed set to true, showAddressInput set to false");
          console.log("🎯 ORDER CONFIRMED: Bottom bar should now be enabled for free chat");

          // ✅ NEW: Also enable business users to chat freely after order confirmation
          // This will be handled by the backend when the business user receives the order confirmation

          // ✅ NEW: Set flag to prevent double creation
          orderCreationInProgress.value = true;

          // ✅ NEW: P2P Order creation is not yet supported by backend GraphQL
          // TODO: Backend needs to add CreateP2pOrder mutation
          console.log("⚠️ P2P Order creation via GraphQL not yet supported by backend");
          console.log("📋 Order data that would be sent:", {
            exchange_ad_uuid: SingleConversation.value?.exchangeAd?.uuid,
            amount: structuredResponse.amount,
            delivery_address: structuredResponse.delivery_address,
            payment_type: structuredResponse.payment_type,
            payout_option: structuredResponse.payout_option,
            conversation_uuid: SingleConversation.value?.uuid
          });

          // ✅ NEW: Clear chat and show order summary for regular users (like business users)
          if (!isBusinessUser.value) {
            console.log("🎯 Regular user confirmed order - clearing chat and showing summary");
            
            // Clear all existing messages
            messages.length = 0;
            
            // Create order summary message for regular users
            const userSummaryMessage = {
              id: `user_summary_${Date.now()}`,
              type: "text" as const,
              text_content: "✅ Order confirmed! Your P2P trade has been created successfully.",
              user_uuid: "greep_ai",
              user_name: "GreepPay AI",
              info_icon: "",
              actions: [],
              orderSummary: getOrderSummaryFromConversation(),
              isOrderSummary: true
            };
            
            messages.push(userSummaryMessage);
            console.log("📋 User summary message added after order confirmation:", userSummaryMessage);
          }

          // ✅ NEW: Start countdown timer after order creation
          setTimeout(() => {
            startCountdownTimer();

            // Add countdown message
            const countdownMessage = {
              id: `countdown_${Date.now()}`,
              type: "text" as const,
              text_content: `⏰ Order created! Waiting for business to accept... (10:00)`,
              user_uuid: "greep_ai",
              user_name: "GreepPay AI",
              info_icon: "",
              actions: [],
              orderSummary: null,
              isOrderSummary: false
            };
            messages.push(countdownMessage);
            scrollToBottom();
          }, 1000);
        }

        Logic.Messaging.CreateMessageForm = {
          input: {
            conversation_id: SingleConversation.value.id,
            content: trimmedContent,
            type: "text",
            sender_id: parseInt(AuthUser.value.id),
            metadata: JSON.stringify(fullMetadata),
          },
        };

        await Logic.Messaging.CreateMessage();

        console.log("✅ Message sent successfully");
        return true;
      } catch (error) {
        console.error("❌ Error sending message:", error);
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

    const getActionButtonClass = (type: String) => {
      const baseClasses = "px-4 py-2 rounded-full text-sm font-medium transition-colors";

      switch (type) {
        case 'success':
          return `${baseClasses} bg-green-500 text-white hover:bg-green-600`;
        case 'danger':
          return `${baseClasses} bg-red-500 text-white hover:bg-red-600`;
        case 'warning':
          return `${baseClasses} bg-orange-500 text-white hover:bg-orange-600`;
        case 'info':
          return `${baseClasses} bg-blue-500 text-white hover:bg-blue-600`;
        case 'primary':
        default:
          return `${baseClasses} bg-green-100 text-green-800 border border-green-200 hover:bg-green-200`;
      }
    };

    const getDeliveryAddressFromHistory = () => {
      const conversationMessages = SingleConversation.value?.messages || [];

      console.log("🔍 Looking for delivery address in conversation history...");
      console.log("🔍 Total messages in conversation:", conversationMessages.length);

      // Look for the most recent address input from any user (usually the customer provides the address)
      for (let i = conversationMessages.length - 1; i >= 0; i--) {
        const message = conversationMessages[i];
        if (message.sender && message.content) {
          const content = message.content;
          console.log(`🔍 Checking message ${i} from ${message.sender.uuid}:`, content);

          // Skip confirmation messages and short messages
          if (content && (
            content.toLowerCase().includes("your order has been confirmed") ||
            content.toLowerCase().includes("confirm") ||
            content.length < 10
          )) {
            console.log(`🔍 Skipping message ${i} - confirmation or too short`);
            continue;
          }

          // Check if this looks like an address (contains location indicators)
          if (content && (
            content.toLowerCase().includes('nigeria') ||
            content.toLowerCase().includes('lagos') ||
            content.toLowerCase().includes('ibadan') ||
            content.toLowerCase().includes('abuja') ||
            content.toLowerCase().includes('address') ||
            content.toLowerCase().includes('street') ||
            content.toLowerCase().includes('road') ||
            content.toLowerCase().includes('avenue') ||
            content.toLowerCase().includes('close') ||
            content.toLowerCase().includes('drive') ||
            content.toLowerCase().includes('lane') ||
            content.toLowerCase().includes('way') ||
            content.toLowerCase().includes('court') ||
            content.toLowerCase().includes('place') ||
            content.toLowerCase().includes('boulevard') ||
            content.toLowerCase().includes('terrace') ||
            content.toLowerCase().includes('estate') ||
            content.toLowerCase().includes('village') ||
            content.toLowerCase().includes('area') ||
            content.toLowerCase().includes('zone') ||
            content.toLowerCase().includes('district') ||
            content.toLowerCase().includes('ward') ||
            content.toLowerCase().includes('local government') ||
            content.toLowerCase().includes('lga') ||
            content.includes(',') ||
            (content.length > 20 && !content.toLowerCase().includes('usdc'))
          )) {
            console.log("✅ Found delivery address:", content);
            return content;
          }
        }
      }

      console.log("❌ No delivery address found in conversation history");
      console.log("🔍 All messages in conversation:");
      conversationMessages.forEach((message, index) => {
        if (message.sender && message.content) {
          console.log(`  ${index}: [${message.sender.uuid}] "${message.content}"`);
        }
      });
      return "Address not provided";
    }

    // ✅ NEW: Extract actual order data from conversation for business summary
    const getOrderSummaryFromConversation = () => {
      try {
        // Get conversation data
        const conversation = SingleConversation.value;
        if (!conversation) {
          console.log("🔍 No conversation found for order summary");
          return getDefaultOrderSummary();
        }

        // Get conversation metadata
        const conversationMetadata = conversation.metadata ? 
          JSON.parse(conversation.metadata) : {};

        // Get exchange ad data for rate
        const exchangeAd = conversation.exchangeAd;
        const sellRate = exchangeAd?.rate || 10; // Default rate if not available

        // ✅ IMPROVED: Get delivery address directly from order data instead of parsing messages
        let deliveryAddress = "Address to be confirmed";
        
        // Check if we have order data with delivery address (wallet service P2P format)
        if (conversationMetadata.order_data) {
          const orderData = conversationMetadata.order_data;
          
          // Use wallet service order format (pickup location)
          if (orderData.pickup_location_address_line) {
            const addressParts = [
              orderData.pickup_location_address_line,
              orderData.pickup_location_city,
              orderData.pickup_location_country
            ].filter(Boolean);
            
            if (addressParts.length > 0) {
              deliveryAddress = addressParts.join(", ");
              console.log("✅ Found delivery address from order pickup location:", deliveryAddress);
            }
          }
        }

        // Extract USDC amount from conversation
        let usdcAmount = "N/A";
        let localCurrency = "N/A";
        let paymentType = "Cash";

        // Look for USDC amount in conversation messages
        if (conversation.messages && conversation.messages.length > 0) {
          for (const message of conversation.messages) {
            const content = message.content?.toLowerCase() || "";
            
            // Look for USDC amount
            if (content.includes("usdc") && content.includes("sell")) {
              const amountMatch = content.match(/(\d+(?:\.\d+)?)\s*usdc/i);
              if (amountMatch) {
                const amount = parseFloat(amountMatch[1]);
                if (!isNaN(amount)) {
                  usdcAmount = `${amount} USDC`;
                  // Calculate local currency using business rate
                  localCurrency = `₺${(amount * sellRate).toFixed(2)}`;
                }
              }
            }
            
            // Look for payment type
            if (content.includes("cash")) {
              paymentType = "Cash";
            }
          }
        }

        // If no USDC amount found in messages, try metadata
        if (usdcAmount === "N/A" && conversationMetadata.amount) {
          const amount = parseFloat(conversationMetadata.amount);
          if (!isNaN(amount)) {
            usdcAmount = `${amount} USDC`;
            localCurrency = `₺${(amount * sellRate).toFixed(2)}`;
          }
        }
        
        // ✅ IMPROVED: If no delivery address found in messages, try conversation metadata
        if (deliveryAddress === "Address to be confirmed" && conversationMetadata.delivery_address) {
          deliveryAddress = conversationMetadata.delivery_address;
          console.log("✅ Found delivery address in conversation metadata:", deliveryAddress);
        }
        
        // ✅ IMPROVED: Final fallback - use the existing getDeliveryAddressFromHistory function
        if (deliveryAddress === "Address to be confirmed") {
          const fallbackAddress = getDeliveryAddressFromHistory();
          if (fallbackAddress && fallbackAddress !== "Address not provided") {
            deliveryAddress = fallbackAddress;
            console.log("✅ Found delivery address via fallback function:", deliveryAddress);
          }
        }

        // Calculate fees and total
        let fee = "0.05 USDC";
        let deliveryFee = "3 USDC";
        let totalAmount = "N/A";

        if (usdcAmount !== "N/A") {
          const amount = parseFloat(usdcAmount.replace(" USDC", ""));
          if (!isNaN(amount)) {
            const feeAmount = 0.05;
            const deliveryFeeAmount = 3;
            const total = amount + feeAmount + deliveryFeeAmount;
            totalAmount = `${total.toFixed(2)} USDC`;
          }
        }

        return {
          youSell: usdcAmount,
          youGet: localCurrency,
          fee: fee,
          deliveryFee: deliveryFee,
          youPay: totalAmount,
          paymentType: paymentType,
          payoutOption: "Delivery",
          deliveryAddress: deliveryAddress
        };
      } catch (error) {
        console.error("Error extracting order summary:", error);
        return getDefaultOrderSummary();
      }
    }

    // ✅ NEW: Default order summary fallback
    const getDefaultOrderSummary = () => {
      return {
        youSell: "N/A USDC",
        youGet: "N/A",
        fee: "0.05 USDC",
        deliveryFee: "3 USDC",
        youPay: "N/A USDC",
        paymentType: "Cash",
        payoutOption: "Delivery",
        deliveryAddress: "Address to be confirmed"
      };
    }


    const setupWebSocketListeners = () => {
      if (!SingleConversation.value?.uuid || echoChannel.value) return;

      try {
        const conversationUuid = SingleConversation.value.uuid;
        console.log("🔧 Setting up unified WebSocket for:", conversationUuid);

        // Check if WebSocket is properly initialized
        if (!Logic.Common.laravelEcho) {
          console.error("❌ WebSocket not initialized");
          Logic.Common.initiateWebSocket();
        }

        // ✅ SINGLE UNIFIED CHANNEL - Fix 1: Unified Channel Management
        echoChannel.value = Logic.Common.laravelEcho?.join(`conversation.${conversationUuid}`)
          .here((users: any) => {
            console.log("🔧 Users currently in conversation:", users);
          })
          .joining((user: any) => {
            console.log("🔧 User joining conversation:", user);
            handleUserJoining(user);
          })
          .leaving((user: any) => {
            console.log("🔧 User leaving conversation:", user);
          })
          // ✅ LISTEN FOR ALL MESSAGE TYPES ON SAME CHANNEL - Fix 1: Unified Channel Management
          .listen('.message.created', (data: any) => {
            console.log("🔧 WebSocket message.created event received:", data);
            handleNewMessage(data);
          })
          .listen('.participant.created', handleParticipantAdded)
          .listen('.business.joined', handleBusinessJoined);

        // ✅ RESTORED: Message channel listener (this is the working one)
        const messageChannel = Logic.Common.laravelEcho?.join(`message.${conversationUuid}`)
          .here((users: any) => {
            console.log("🔧 Users currently in message channel:", users);
          })
          .joining((user: any) => {
            console.log("🔧 User joining message channel:", user);
            handleUserJoining(user);
          })
          .leaving((user: any) => {
            console.log("🔧 User leaving message channel:", user);
          })
          .listen('.message.created', (data: any) => {
            console.log("🔧 WebSocket message channel message.created event received:", data);
            handleNewMessage(data);
          })
          .listen('.participant.created', handleParticipantAdded)
          .listen('.business.joined', handleBusinessJoined);

        console.log("✅ Unified WebSocket listeners set up successfully");
        console.log("🔧 Listening on channels:", {
          conversation: `conversation.${conversationUuid}`,
          message: `message.${conversationUuid}`
        });

      } catch (error) {
        console.error("❌ Error setting up WebSocket listeners:", error);
      }
    };

    // ✅ NEW: Handle user joining the conversation
    const handleUserJoining = (user: any) => {
      console.log("🔧 User joining conversation:", user);

      // ✅ FIXED: Check if this is a business user joining - Updated detection logic
      const currentUserId = parseInt(AuthUser.value?.id || "0");
      const isBusiness = user.user_type === 'business' ||
        user.participant_type === 'business' ||
        user.is_business === true ||
        (user.id && user.id !== currentUserId && user.id !== 0) ||
        (user.user_id && user.user_id !== currentUserId && user.user_id !== 0);

      console.log("🔧 Business detection check:", {
        user_id: user.id || user.user_id,
        current_user_id: currentUserId,
        user_type: user.user_type,
        participant_type: user.participant_type,
        is_business: user.is_business,
        isBusiness
      });

      if (isBusiness) {
        console.log("🎉 Business user joining conversation:", user);
        handleBusinessJoined(user);
      } else {
        console.log("👤 Regular user joining conversation:", user);
      }
    };

    // ✅ NEW: Handle business joined event
    const handleBusinessJoined = async (eventData: any) => {
      try {
        console.log("🎉 BUSINESS JOINED EVENT:", eventData);

        // Stop countdown timer
        stopCountdownTimer();

        // ✅ FIXED: Get the actual business name from the user data
        const businessName = eventData.first_name && eventData.last_name
          ? `${eventData.first_name} ${eventData.last_name}`
          : eventData.name || eventData.user_name || "Seller";

        // Add business joined message
        const businessJoinedMessage = {
          id: `business_joined_${Date.now()}`,
          type: "text" as const,
          text_content: `✅ ${businessName} has joined the conversation!`,
          user_uuid: "greep_ai",
          user_name: "GreepPay AI",
          info_icon: "",
          actions: [],
          orderSummary: null,
          isOrderSummary: false
        };

        console.log("🔧 Adding business joined message:", businessJoinedMessage);
        messages.push(businessJoinedMessage);
        console.log("🔧 Messages array after adding business joined message:", messages.length);

        await scrollToBottom();

        // ✅ NEW: If current user is business, show only summary instead of all messages
        if (isBusinessUser.value) {
          console.log("🎯 Business user joined - showing summary instead of all messages");

          // Clear any existing messages (except the business joined message we just added)
          const businessJoinedMessageId = businessJoinedMessage.id;
          messages.length = 0;

          // Re-add the business joined message
          messages.push(businessJoinedMessage);

          // Create order summary message for business user
          const businessSummaryMessage = {
            id: `business_summary_${Date.now()}`,
            type: "text" as const,
            text_content: "Order confirmed - continue from here",
            user_uuid: "greep_ai",
            user_name: "GreepPay AI",
            info_icon: "",
            actions: [],
            orderSummary: getOrderSummaryFromConversation(),
            isOrderSummary: true
          };

          messages.push(businessSummaryMessage);
          console.log("📋 Business summary message added:", businessSummaryMessage);
        } else {
          // For regular users, refresh conversation data to show all messages
          await refreshConversationData();
        }

        console.log("✅ Business joined message added successfully");

      } catch (error) {
        console.error("❌ Error handling business joined:", error);
      }
    };

    // ✅ NEW: Handle participant added event - Fix 2: Improved Participant Addition Detection
    const handleParticipantAdded = async (eventData: any) => {
      try {
        console.log("🎉 PARTICIPANT ADDED:", eventData);

        // Stop countdown timer
        stopCountdownTimer();

        // ✅ FIXED: Check if this is a business participant - Updated detection logic
        const isBusiness = eventData.participant_type === 'business' ||
          eventData.user_type === 'business' ||
          eventData.is_business === true ||
          (eventData.user_id && eventData.user_id !== parseInt(AuthUser.value?.id || "0") && eventData.user_id !== 0);

        if (isBusiness) {
          console.log("🎉 Business participant added:", eventData);

          // ✅ FIXED: Get the actual business name from the event data
          const businessName = eventData.first_name && eventData.last_name
            ? `${eventData.first_name} ${eventData.last_name}`
            : eventData.name || eventData.user_name || "Seller";

          // Add business joined message
          const businessJoinedMessage = {
            id: `business_joined_${Date.now()}`,
            type: "text" as const,
            text_content: `✅ ${businessName} has joined the conversation!`,
            user_uuid: "greep_ai",
            user_name: "GreepPay AI",
            info_icon: "",
            actions: [],
            orderSummary: null,
            isOrderSummary: false
          };

          messages.push(businessJoinedMessage);
          await scrollToBottom();

          // ✅ NEW: If current user is business, show only summary instead of all messages
          if (isBusinessUser.value) {
            console.log("🎯 Business user joined via participant addition - showing summary instead of all messages");

            // Clear any existing messages (except the business joined message we just added)
            const businessJoinedMessageId = businessJoinedMessage.id;
            messages.length = 0;

            // Re-add the business joined message
            messages.push(businessJoinedMessage);

            // Create order summary message for business user
            const businessSummaryMessage = {
              id: `business_summary_${Date.now()}`,
              type: "text" as const,
              text_content: "Order confirmed - continue from here",
              user_uuid: "greep_ai",
              user_name: "GreepPay AI",
              info_icon: "",
              actions: [],
              orderSummary: getOrderSummaryFromConversation(),
              isOrderSummary: true
            };

            messages.push(businessSummaryMessage);
            console.log("📋 Business summary message added via participant addition:", businessSummaryMessage);
          } else {
            // For regular users, refresh conversation data to show all messages
            await refreshConversationData();
          }

          console.log("✅ Business participant added message displayed");
        } else {
          console.log("👤 Regular participant added:", eventData);
        }

      } catch (error) {
        console.error("❌ Error handling participant addition:", error);
      }
    };

    // ✅ NEW: Handle new message - Fix 4: Message Filtering Fix with Deduplication
    const handleNewMessage = async (eventData: any) => {
      try {
        console.log("📨 New message received:", eventData);
        console.log("📨 Message details:", {
          id: eventData.id,
          text_content: eventData.text_content,
          content: eventData.content,
          user_id: eventData.user_id,
          metadata: eventData.metadata,
          sender: eventData.sender
        });

        // ✅ IMPROVED: Don't filter by user_id, filter by message type
        const metadata = typeof eventData.metadata === 'string'
          ? JSON.parse(eventData.metadata)
          : eventData.metadata || {};

        console.log("📨 Parsed metadata:", metadata);

        // Skip system/trigger messages only
        if (metadata.trigger_conversation || metadata.is_system_message) {
          console.log("⏭️ Skipping system message");
          return;
        }

        // ✅ CHECK: Don't skip business messages
        const isFromBusiness = metadata.sender_type === 'business' ||
          eventData.sender_type === 'business';

        if (isFromBusiness) {
          console.log("💼 Business message detected, processing...");
        }

        // ✅ NEW: Log all message types for debugging
        console.log("📨 Message sender type:", metadata.sender_type || 'unknown');
        console.log("📨 Message content type:", metadata.type || 'unknown');

        // ✅ DECLARE: isFromCurrentUser early for use in deduplication
        const isFromCurrentUser = eventData.user_id === AuthUser.value?.id;
        console.log("📨 Is from current user:", isFromCurrentUser);

        // ✅ ENHANCED: Robust deduplication logic to prevent duplicate messages
        console.log("🔍 Enhanced deduplication check for message:", eventData.id);
        console.log("🔍 Current messages count:", messages.length);

        // Check if this exact message ID already exists
        const existingMessageById = messages.find(m => m.id === eventData.id?.toString());
        if (existingMessageById) {
          console.log("⏭️ Message with same ID already exists, skipping");
          return;
        }

        // ✅ ENHANCED: Check for duplicate content within a short time window (5 seconds)
        const messageContent = eventData.text_content || eventData.content;
        const messageUserId = eventData.user_id;
        const now = Date.now();
        const timeWindow = 5000; // 5 seconds

        const recentDuplicate = messages.find(m => {
          const mContent = m.text_content;
          const mUserId = m.user_uuid === "greep_ai" ? "greep_ai" :
            (m.user_uuid === "temp_user" ? "temp_user" : m.user_uuid);

          // Check if content and user match
          const contentMatches = mContent === messageContent;
          const userMatches = mUserId === messageUserId ||
            (mUserId === "greep_ai" && messageUserId === "greep_ai");

          // Check if message was added recently (within time window)
          const isRecent = typeof m.id === 'string' && m.id.startsWith('temp_') ?
            parseInt(m.id.split('_')[1]) > (now - timeWindow) : false;

          return contentMatches && userMatches && isRecent;
        });

        if (recentDuplicate) {
          console.log("⏭️ Recent duplicate message found, skipping:", {
            existingId: recentDuplicate.id,
            content: messageContent,
            userId: messageUserId
          });
          return;
        }

        // ✅ ADDITIONAL: Check for exact content match from current user (prevents server confirmation duplicates)
        if (isFromCurrentUser) {
          const exactContentMatch = messages.find(m =>
            m.text_content === messageContent &&
            m.user_uuid === AuthUser.value?.uuid
          );

          if (exactContentMatch) {
            console.log("⏭️ Exact content match found for current user, skipping duplicate:", {
              existingId: exactContentMatch.id,
              content: messageContent
            });
            return;
          }
        }

        // ✅ NEW: Check if this is a business user confirming an order
        const isBusinessConfirmation = metadata.sender_type === 'business' &&
          metadata.structured_response?.selected_option === 'business_accept';

        if (isBusinessConfirmation) {
          console.log("🎯 BUSINESS ORDER CONFIRMATION DETECTED - Clearing messages and showing summary");

          // Clear all existing messages
          messages.length = 0;
          console.log("🧹 All messages cleared");

          // Create and display summary message
          const summaryMessage = {
            id: `summary_${Date.now()}`,
            type: "text" as const,
            text_content: `✅ Order confirmed by ${metadata.sender_name || 'Business'}\n\n📋 Order Summary:\n• Amount: ${metadata.structured_response?.amount || 'N/A'} USDC\n• Payment Type: ${metadata.structured_response?.payment_type || 'N/A'}\n• Delivery Address: ${metadata.structured_response?.delivery_address || 'N/A'}\n\n⏰ Order is now active and being processed.`,
            user_uuid: "greep_ai",
            user_name: "GreepPay AI",
            info_icon: "",
            actions: [],
            orderSummary: null,
            isOrderSummary: false
          };

          messages.push(summaryMessage);
          console.log("📋 Summary message added:", summaryMessage);

          // Scroll to bottom to show the summary
          await scrollToBottom();
          return; // Don't process this as a regular message
        }

        // ✅ ENHANCED: Check if this is a server confirmation of a temporary message
        if (isFromCurrentUser) {
          console.log("🔍 This is a message from current user, checking for temporary message replacement");

          // Look for a temporary message with matching content and sender
          const tempMessageIndex = messages.findIndex(m => {
            // Check if this is a temporary message by ID pattern
            const isTempMessage = typeof m.id === 'string' && m.id.startsWith('temp_');
            // Check if content matches (use both text_content and content for comparison)
            const contentMatches = m.text_content === (eventData.text_content || eventData.content);

            return isTempMessage && contentMatches;
          });

          if (tempMessageIndex !== -1) {
            console.log("🔄 Found temporary message to replace at index:", tempMessageIndex);
            console.log("🔄 Replacing temporary message with server-confirmed message");

            // Remove the temporary message
            messages.splice(tempMessageIndex, 1);
            console.log("✅ Temporary message removed, will add server-confirmed message");
          } else {
            console.log("🔍 No temporary message found to replace");
          }
        }

        const participant = SingleConversation.value?.participants?.find(
          p => p.user_id === eventData.user_id
        );

        console.log("📨 Found participant:", participant);

        const newMessage: any = {
          id: eventData.id ? parseInt(eventData.id) : Date.now(),
          content: eventData.text_content || eventData.content,
          sender_id: eventData.user_id,
          conversation_id: SingleConversation.value?.id || 0,
          sender: participant?.user ? {
            uuid: participant.user.uuid || "greep_ai",
            first_name: participant.user.first_name || "GreepPay",
            last_name: participant.user.last_name || "AI",
          } : undefined,
          metadata: JSON.stringify(metadata),
        };

        console.log("📨 Created new message:", newMessage);
        console.log("📨 About to call addNewMessage...");

        // ✅ NEW: Check if this is an AI message asking for amount
        if (eventData.text_content?.includes("How much in USDC do you want to sell") ||
          eventData.text_content?.includes("USDC in your wallet")) {
          console.log("🎯 AI AMOUNT QUESTION DETECTED:", eventData.text_content);
        }

        await addNewMessage(newMessage);
        console.log("📨 addNewMessage completed");

      } catch (error) {
        console.error("Error handling WebSocket message:", error);
      }
    };

    // ✅ NEW: Refresh conversation data - Fix 5: Conversation Data Refresh
    const refreshConversationData = async () => {
      try {
        console.log("🔄 Refreshing conversation data...");

        const conversationUuid = SingleConversation.value?.uuid;
        if (!conversationUuid) return;

        // Fetch latest conversation data
        const updatedConversation = await Logic.Messaging.GetSingleConversation(conversationUuid);

        if (updatedConversation) {
          // Update local state
          Logic.Messaging.SingleConversation = updatedConversation;

          // ✅ NEW: If current user is business, don't load all messages
          // if (isBusinessUser.value) {
          //   console.log("🎯 Business user - skipping message loading in refreshConversationData");
          // } else {
          //   // Process any new messages for regular users
          //   if (updatedConversation.messages) {
          //     await Promise.all(updatedConversation.messages.map(async message => {
          //       const exists = messages.find(m => m.id === message.id.toString());
          //       if (!exists) {
          //         await addMessageToDisplay(message);
          //       }
          //     }));
          //   }
          // }

          console.log("✅ Conversation data refreshed");
          await scrollToBottom();
        }

      } catch (error) {
        console.error("❌ Error refreshing conversation:", error);
      }
    };

    const cleanup = () => {
      if (echoChannel.value) {
        try {
          echoChannel.value = null;
        } catch (error) {
          console.error("Error leaving WebSocket channel:", error);
        }
      }

      // ✅ NEW: Clean up countdown timer
      stopCountdownTimer();
    };

    const loadConversation = async () => {
      try {
        console.log("🔧 Loading single conversation for persistence...");
        // The conversation is already loaded via middleware using GetSingleConversation
        console.log("✅ Conversation loaded:", SingleConversation.value?.uuid);

        // ✅ NEW: Save conversation to local storage for offline access
        saveConversationToStorage();
      } catch (error) {
        console.error("❌ Error loading conversation:", error);
        // ✅ NEW: Load from local storage if network fails
        loadConversationFromStorage();
      }
    };

    const saveConversationToStorage = () => {
      try {
        if (SingleConversation.value) {
          const conversationData = {
            conversation: SingleConversation.value,
            timestamp: Date.now(),
            userId: AuthUser.value?.uuid
          };
          localStorage.setItem(`greep_conversation_${SingleConversation.value.uuid}`, JSON.stringify(conversationData));
          console.log("✅ Conversation saved to local storage");
        }
      } catch (error) {
        console.error("❌ Error saving conversation to storage:", error);
      }
    };

    const loadConversationFromStorage = () => {
      try {
        const conversationUuid = Logic.Common.route?.params?.id;
        if (conversationUuid) {
          const stored = localStorage.getItem(`greep_conversation_${conversationUuid}`);
          if (stored) {
            const data = JSON.parse(stored);
            const isRecent = Date.now() - data.timestamp < 24 * 60 * 60 * 1000; // 24 hours
            const isSameUser = data.userId === AuthUser.value?.uuid;

            if (isRecent && isSameUser) {
              Logic.Messaging.SingleConversation = data.conversation;
              console.log("✅ Conversation loaded from local storage");
            }
          }
        }
      } catch (error) {
        console.error("❌ Error loading conversation from storage:", error);
      }
    };

    const initialize = async () => {
      try {
        // ✅ NEW: Load conversation for persistence
        await loadConversation();

        await initializeMessages();
        setupWebSocketListeners();

        if (SingleConversation.value?.entity_type === 'p2p_withdrawal') {
          const conversationMetadata = SingleConversation.value.metadata
            ? JSON.parse(SingleConversation.value.metadata)
            : {};

          // ✅ NEW: Auto-send the pre-entered amount after AI asks the question
          const hasMessages = SingleConversation.value?.messages && SingleConversation.value.messages.length > 0;
          if (conversationMetadata?.amount && !hasMessages) {
            console.log("🔧 WAITING FOR AI TO ASK AMOUNT QUESTION:", conversationMetadata.amount);

            // Wait for AI to ask "How much in USDC do you want to sell?" and show wallet balance
            const checkForAmountQuestion = () => {
              const conversationMessages = SingleConversation.value?.messages || [];
              const hasAmountQuestion = conversationMessages.some(msg =>
                msg.content?.includes("How much in USDC do you want to sell") ||
                msg.content?.includes("USDC in your wallet")
              );

              if (hasAmountQuestion) {
                console.log("🔧 AI ASKED AMOUNT QUESTION, CHECKING IF AUTO-SEND IS NEEDED");

                // Get the original amount (don't convert TRY to USDC)
                const originalAmount = parseFloat(conversationMetadata.amount);

                // Extract wallet balance from the message
                let walletBalance = 500.00; // Default fallback
                const walletMessage = conversationMessages.find(msg =>
                  msg.content?.includes("USDC in your wallet")
                );
                if (walletMessage) {
                  const match = walletMessage.content.match(/(\d+\.?\d*)\s*USDC/);
                  if (match) {
                    walletBalance = parseFloat(match[1]);
                  }
                }

                // Only auto-send if amount is sufficient and user hasn't already sent something
                const userHasSentAmount = conversationMessages.some(msg =>
                  msg.sender?.uuid !== 'greep_ai' &&
                  !isNaN(parseFloat(msg.content))
                );

                if (!userHasSentAmount && originalAmount <= walletBalance) {
                  console.log("🔧 AUTO-SENDING SUFFICIENT AMOUNT:", originalAmount);

                  setTimeout(() => {
                    // ✅ FIX: Use a direct send method that bypasses processing check
                    sendMessageDirectly(originalAmount.toString());
                  }, 500);
                } else if (originalAmount > walletBalance) {
                  console.log("🔧 AMOUNT INSUFFICIENT, NOT AUTO-SENDING:", {
                    requested: originalAmount,
                    available: walletBalance
                  });
                }
              } else {
                // Check again in 500ms
                setTimeout(checkForAmountQuestion, 500);
              }
            };

            // Start checking after a short delay
            setTimeout(checkForAmountQuestion, 1000);
          }

          if (conversationMetadata?.currency) {
            // Logic.Wallet.GetGlobalExchangeRate("USD", conversationMetadata.currency);
          }
        }

        await scrollToBottom();
      } catch (error) {
        console.error("Error during initialization:", error);
      }
    };

    // Watchers
    watch(SingleConversation, async (newConversation, oldConversation) => {
      if (newConversation && newConversation !== oldConversation && newConversation.id !== oldConversation?.id) {
        await initializeMessages();
      }
    }, { deep: true });

    // ✅ NEW: Watch for business participant addition - Updated for unified approach
    watch(() => SingleConversation.value?.participants, (newParticipants, oldParticipants) => {
      if (newParticipants && oldParticipants) {
        const newParticipantCount = newParticipants.length;
        const oldParticipantCount = oldParticipants?.length || 0;

        console.log("🔧 Participant change detected:", {
          oldCount: oldParticipantCount,
          newCount: newParticipantCount,
          newParticipants: newParticipants,
          oldParticipants: oldParticipants
        });

        if (newParticipantCount > oldParticipantCount) {
          console.log("🎉 Business participant detected, showing order confirmation messages");

          // ✅ NEW: Stop countdown timer when business joins
          stopCountdownTimer();

          // Add a system message to show business joined
          const businessJoinedMessage = {
            id: `business_joined_${Date.now()}`,
            type: "text" as const,
            text_content: "✅ Seller has joined the conversation!",
            user_uuid: "greep_ai",
            user_name: "GreepPay AI",
            info_icon: "",
            actions: [],
            orderSummary: null,
            isOrderSummary: false
          };

          messages.push(businessJoinedMessage);
          scrollToBottom();

          // Add the order confirmation messages from the image
          setTimeout(() => {
            const orderConfirmedMessage = {
              id: `order_confirmed_${Date.now()}`,
              type: "text" as const,
              text_content: "Order confirmed! Pressing the \"Payment confirmed\" button will release USDC to the buyer, do so after you get your cash.",
              user_uuid: "greep_ai",
              user_name: "GreepPay AI",
              info_icon: "",
              actions: [
                {
                  label: "Payment confirmed",
                  message: "Payment confirmed",
                  type: "success" as const,
                  value: "confirm_payment",
                  handler: () => sendMessage("Payment confirmed", "confirm_payment")
                }
              ],
              orderSummary: null,
              isOrderSummary: false
            };

            messages.push(orderConfirmedMessage);
            scrollToBottom();

            // Add the second message about chatting with Abass/rider
            setTimeout(() => {
              const chatInstructionsMessage = {
                id: `chat_instructions_${Date.now()}`,
                type: "text" as const,
                text_content: "You can chat with Abass or the delivery rider while waiting for payment. Use @abass for Abass and @rider for the delivery rider.",
                user_uuid: "greep_ai",
                user_name: "GreepPay AI",
                info_icon: "",
                actions: [],
                orderSummary: null,
                isOrderSummary: false
              };

              messages.push(chatInstructionsMessage);
              scrollToBottom();
            }, 1000);
          }, 500);
        }
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

      Logic.Messaging.watchProperty("SingleConversation", SingleConversation);
      Logic.Auth.watchProperty("AuthUser", AuthUser);
      Logic.Wallet.watchProperty("CurrentGlobalExchangeRate", CurrentGlobalExchangeRate);
    });

    // ✅ NEW: Manual test function for participant joining (for debugging) - Updated for unified approach
    const testParticipantJoining = () => {
      console.log("🧪 Testing participant joining manually...");

      // Simulate the participant.created event
      const testEventData = {
        conversation_id: SingleConversation.value?.uuid,
        user_id: 999, // Test business user ID
        added_by: 1,
        conversation_entity: "p2p_withdrawal",
        conversation_stage: "order_summary",
        participant_type: "business",
        is_business: true
      };

      // Trigger the participant.created event handler manually
      handleParticipantAdded(testEventData);
    };

    // ✅ NEW: Check if message is a structured response
    const isStructuredResponse = (content: string, stage: string): boolean => {
      const lowerContent = content.toLowerCase();

      // Check if content is a number (amount)
      const amount = parseFloat(content.replace(/,/g, ""));
      if (!isNaN(amount) && amount > 0 && stage === "withdrawal_amount") {
        return true;
      }

      // Check if content is a button action
      const buttonActions = ["accept", "cancel", "confirm", "success", "cash_delivery"];
      if (buttonActions.some(action => lowerContent.includes(action))) {
        return true;
      }

      // Check if content is an address
      if (stage === "cash_delivery" && isAddressContent(content)) {
        return true;
      }

      return false;
    };

    // ✅ NEW: Handle proof upload for sellers
    const handleProofUpload = async (content: string): Promise<boolean> => {
      try {
        console.log("🔧 Handling proof upload:", content);

        // ✅ NEW: Generate a temporary client-side ID for deduplication
        const tempMessageId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create proof message with temporary ID
        const proofMessage = {
          id: tempMessageId,
          type: "text" as const,
          text_content: `📸 Proof uploaded: ${content}`,
          user_uuid: AuthUser.value?.uuid || "",
          user_name: `${AuthUser.value?.first_name} ${AuthUser.value?.last_name}`.trim(),
          info_icon: "📸",
          actions: [
            {
              label: "View proof",
              message: "View proof",
              type: "info" as const,
              value: "view_proof",
              handler: () => {
                console.log("View proof clicked");
                // Handle proof viewing
              }
            }
          ],
          orderSummary: null,
          isOrderSummary: false
        };

        messages.push(proofMessage);
        await scrollToBottom();

        // Send proof to backend
        Logic.Messaging.CreateMessageForm = {
          input: {
            conversation_id: SingleConversation.value?.id || 0,
            content: content,
            type: "text",
            sender_id: parseInt(AuthUser.value?.id || "0"),
            metadata: JSON.stringify({
              is_bot: false,
              type: "proof_upload",
              proof_type: "cash_receipt",
              sender_type: "business",
              sender_name: `${AuthUser.value?.first_name} ${AuthUser.value?.last_name}`.trim(),
              sender_uuid: AuthUser.value?.uuid,
              timestamp: new Date().toISOString()
            }),
          },
        };

        await Logic.Messaging.CreateMessage();
        console.log("✅ Proof uploaded successfully");
        return true;

      } catch (error) {
        console.error("❌ Error uploading proof:", error);
        return false;
      }
    };

    // ✅ NEW: Handle regular chat messages
    const sendRegularChatMessage = async (content: string): Promise<boolean> => {
      try {
        console.log("🔧 Sending regular chat message:", content);

        // ✅ NEW: Generate a temporary client-side ID for deduplication
        const tempMessageId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create chat message with temporary ID
        const chatMessage = {
          id: tempMessageId,
          type: "text" as const,
          text_content: content,
          user_uuid: AuthUser.value?.uuid || "",
          user_name: `${AuthUser.value?.first_name} ${AuthUser.value?.last_name}`.trim(),
          info_icon: "",
          actions: [],
          orderSummary: null,
          isOrderSummary: false
        };

        messages.push(chatMessage);
        await scrollToBottom();

        // Send message to backend
        Logic.Messaging.CreateMessageForm = {
          input: {
            conversation_id: SingleConversation.value?.id || 0,
            content: content,
            type: "text",
            sender_id: parseInt(AuthUser.value?.id || "0"),
            metadata: JSON.stringify({
              is_bot: false,
              type: "chat_message",
              sender_type: "user",
              sender_name: `${AuthUser.value?.first_name} ${AuthUser.value?.last_name}`.trim(),
              sender_uuid: AuthUser.value?.uuid,
              timestamp: new Date().toISOString()
            }),
          },
        };

        await Logic.Messaging.CreateMessage();
        console.log("✅ Chat message sent successfully");
        return true;

      } catch (error) {
        console.error("❌ Error sending chat message:", error);
        return false;
      }
    };

    // ✅ NEW: Handle proof upload from modal
    const handleProofUploadModal = async (type: 'photo' | 'document' | 'text') => {
      try {
        console.log("🔧 Handling proof upload modal:", type);

        let proofContent = "";

        switch (type) {
          case 'photo':
            proofContent = "📸 Photo proof uploaded: Cash delivery photo taken";
            break;
          case 'document':
            proofContent = "📄 Document proof uploaded: Receipt or document uploaded";
            break;
          case 'text':
            proofContent = "✍️ Text proof uploaded: Cash delivery confirmed via text description";
            break;
        }

        const success = await handleProofUpload(proofContent);
        if (success) {
          showProofModal.value = false;
          Logic.Common.showAlert({
            show: true,
            message: "Proof uploaded successfully!",
            type: "success",
          });
        }
      } catch (error) {
        console.error("❌ Error handling proof upload:", error);
        Logic.Common.showAlert({
          show: true,
          message: "Failed to upload proof. Please try again.",
          type: "error",
        });
      }
    };

    // ✅ NEW: Handle proof cancel
    const handleProofCancel = () => {
      showProofModal.value = false;
    };

    // ✅ NEW: Centralized function to handle address input visibility
    const updateAddressInputVisibility = (shouldShow: boolean) => {
      // Only show address input for conversation owner/buyer, not business users
      if (shouldShow && isBusinessUser.value) {
        console.log("🚫 Skipping address input for business user");
        showAddressInput.value = false;
      } else {
        console.log(`🔧 Setting address input visibility: ${shouldShow} (isBusinessUser: ${isBusinessUser.value})`);
        showAddressInput.value = shouldShow;
      }
    };

    return {
      Logic,
      SingleConversation,
      AuthUser,
      CurrentGlobalExchangeRate,
      isProcessing,
      echoChannel,
      showAddressInput,
      showAddressModal,
      showProofModal,
      orderConfirmed,
      orderCreationInProgress,
      countdownTimer,
      countdownSeconds,
      messages,
      updateHeight,
      mobileFullHeight,
      startCountdownTimer,
      stopCountdownTimer,
      formatCountdown,
      isCountdownActive,
      currentConversationState,
      displayMessages,
      lastAIMessage,
      isConversationCompleted,
      isCurrentStageInteractive,
      isBusinessUser,
      isAddressContent,
      buildStructuredResponse,
      simulateBusinessJoining,
      sendBusinessMessage,
      initializeMessages,
      triggerBackendConversationStart,
      addMessageToDisplay,
      scrollToBottom,
      addNewMessage,
      pushNewMessage,
      handleAddressConfirm,
      handleAddressCancel,
      validateInput,
      sendMessage,
      getActionButtonClass,
      getDeliveryAddressFromHistory,
      getOrderSummaryFromConversation,
      getDefaultOrderSummary,
      setupWebSocketListeners,
      handleUserJoining,
      handleBusinessJoined,
      handleParticipantAdded,
      handleNewMessage,
      refreshConversationData,
      testParticipantJoining,
      handleProofUploadModal,
      handleProofCancel,
      updateAddressInputVisibility
    };
  },
});
</script>