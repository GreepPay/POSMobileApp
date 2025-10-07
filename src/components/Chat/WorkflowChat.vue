<template>
  <app-wrapper>
    <div class="w-full flex flex-col lg:text-sm mdlg:text-[12px] relative text-xs font-poppins overflow-y-auto h-full"
      id="workflow-chat-page" :style="mobileFullHeight">

      <!-- Top bar -->
      <chat-top-bar :conversation="conversationData" @back-click="handleBackClick" />


      <!-- WebSocket Connection Status -->
      <div v-if="!isConnected" class="w-full bg-yellow-50 border-b border-yellow-200 px-4 py-2">
        <div class="flex items-center space-x-2">
          <div class="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <span class="text-yellow-700 text-xs">
            📡 Connecting to real-time messaging...
          </span>
        </div>
      </div>

      <!-- Chat content -->
      <div class="w-full flex flex-col px-4 pt-4 pb-4">
        <template v-for="(message, index) in messages" :key="`msg-${message.id}-${index}`">
          <!-- Use the proper ChatMessage component from uicomponents -->
          <div class="mb-4">
            <chat-message :conversation="conversationData" :message="message" :show-actions="true"
              :authUser="Logic.Auth.AuthUser" />
          </div>
        </template>

        <!-- Loading indicator -->
        <div v-if="isProcessing" class="flex items-center justify-center py-4">
          <div class="animate-pulse text-gray-500">AI is typing...</div>
        </div>

        <!-- Countdown Timer (using proper AppCountdownTimer like backup) -->
        <div v-if="isCountdownActive && !isBusinessUser && !businessJoined"
          class="flex items-center justify-center py-4">
          <app-countdown-timer :duration="countdownTime" :customText="countdownText"
            customClass="!bg-orange-50 !border !border-orange-200 !text-orange-800" @expired="handleCountdownExpired" />
        </div>

        <div class="w-full h-[130px]" id="bottom-anchor"></div>
      </div>

      <!-- Bottom bar -->
      <chat-bottom-bar :conversation="conversationData" :send-message="sendMessage" :last-a-i-message="lastAIMessage"
        :is-processing="isProcessing" :authUser="Logic.Auth.AuthUser" @upload-proof="handleUploadProof" />

      <!-- Address Input -->
      <chat-address-input v-if="activeModal === 'address'" :is-processing="isProcessing"
        @address-confirm="handleAddressSelection" @cancel="handleAddressCancel" />

      <!-- Bank Transfer Modal -->
      <bank-transfer-modal v-if="activeModal === 'bank_transfer'" :show="true" :savedBankAccounts="savedBankAccounts"
        :isProcessing="isProcessing" @bank-details-submitted="handleBankDetailsSubmitted"
        @saved-account-selected="handleSavedAccountSelected" @cancel="handleBankTransferCancel" />

      <!-- Pickup Location Modal -->
      <pickup-location-modal v-if="activeModal === 'cash_pickup'" :isOpen="true"
        :savedLocations="businessStoreLocations" @confirm="handlePickupSelection" @close="manualModalOverride = null" />

      <!-- Proof Upload Modal using uicomponents -->
      <proof-upload-modal :isOpen="showProofModal" @close="handleProofCancel" @upload="handleProofUploadFiles" />

    </div>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, nextTick, watch, onUnmounted } from 'vue';
import { useWorkflowEngine } from '../../composable/useWorkflowEngine';
import { useWebSocket } from '../../composable/useWebSocket';
import { Logic } from '@greep/logic';

import {
  ChatTopBar,
  ChatBottomBar,
  ChatMessage,
  ChatAddressInput,
  BankTransferModal,
  PickupLocationModal,
  ProofUploadModal,
  AppCountdownTimer
} from "@greep/ui-components";

export default defineComponent({
  name: 'WorkflowChat',
  components: {
    ChatTopBar,
    ChatBottomBar,
    ChatMessage,
    ChatAddressInput,
    BankTransferModal,
    PickupLocationModal,
    ProofUploadModal,
    AppCountdownTimer
  },
  props: {
    conversationId: {
      type: Number,
      required: true
    },
    workflowType: {
      type: String as () => 'p2p_withdrawal' | 'deliveries',
      required: true
    },
    initialMessages: {
      type: Array,
      default: () => []
    },
    conversation: {
      type: Object,
      default: () => null
    }
  },
  setup(props) {
    // Workflow engine with business user support
    const workflowEngine = useWorkflowEngine({
      conversationId: props.conversationId,
      workflowType: props.workflowType,
      enableDirectMessaging: true
    });

    const {
      messages,
      isProcessing,
      activeModal: computedActiveModal,
      sendMessage: engineSendMessage,
      sendDirectMessage,
      addMessage,
      handleIncomingMessage,
      initializeFromConversation,
      getLastAIMessage,
      isBusinessUser,
      businessJoined,
      directMessagingEnabled,
      handleBusinessJoined,
      manualModalOverride,
      countdownType,
      countdownTime,
      stopCountdown
    } = workflowEngine;

    // Reactive data for bank accounts
    const savedBankAccounts = ref<any[]>([]);

    // ✅ Proof upload modal state
    const showProofModal = ref(false);

    // ✅ Countdown visibility logic (matching backup implementation)
    const isCountdownActive = computed(() => {
      return countdownTime.value > 0 && countdownType.value !== null && !businessJoined.value;
    });

    // ✅ Countdown text (matching backup implementation)
    const countdownText = computed(() => {
      if (countdownType.value === 'waiting_business') {
        return '⏰ Waiting for business to join';
      }
      return '⏰ Countdown';
    });

    // ✅ Format countdown display (like backup)
    const formatCountdown = computed(() => {
      const minutes = Math.floor(countdownTime.value / 60);
      const seconds = countdownTime.value % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    });

    // ✅ Handle countdown expiration (matching backup implementation)
    const handleCountdownExpired = () => {
      console.log('⏰ Countdown expired for type:', countdownType.value);

      if (countdownType.value === 'waiting_business') {
        // Add timeout message like in backup
        const timeoutMessage = {
          id: `timeout_${Date.now()}`,
          type: "text" as const,
          content: "⚠️ Business join timeout reached. This transaction may be cancelled.",
          text_content: "⚠️ Business join timeout reached. This transaction may be cancelled.",
          user_uuid: "greep_ai",
          user_name: "GreepPay AI",
          isUser: false,
          timestamp: new Date(),
          info_icon: "",
          actions: [],
          orderSummary: null,
          isOrderSummary: false
        };

        messages.push(timeoutMessage);
        scrollToBottom();
      }

      // Stop the countdown
      stopCountdown();
    };

    // WebSocket integration
    const {
      echoChannel,
      isConnected,
      setupWebSocketListeners,
      cleanup: cleanupWebSocket,
      getUserDisplayName,
    } = useWebSocket();

    // Setup WebSocket for real-time messaging and business user joining
    const setupChatWebSocket = () => {
      if (!props.conversation?.uuid) {
        console.log("❌ No conversation UUID available for WebSocket");
        return;
      }

      const conversationUuid = props.conversation.uuid;
      console.log("🔧 Setting up WebSocket for conversation:", conversationUuid);

      setupWebSocketListeners(conversationUuid, {
        onUserJoining: (user) => {
          console.log("🔧 User joining detected:", user);

          // ✅ FIXED: Remove participant count check - detect business joining regardless
          // The participant count might not be updated immediately when user joins

          // Detect if this is a business user joining
          const currentUserId = parseInt(Logic.Auth.AuthUser?.id || "0");
          console.log("🔧 Current user ID:", currentUserId, "Joining user ID:", user.id || user.user_id);

          // ✅ FIXED: Improved business detection logic
          const isBusiness = user.user_type === 'business' ||
            user.participant_type === 'business' ||
            user.is_business === true ||
            // If the joining user has a different ID from current user and isn't system (ID 0)
            ((user.id && user.id !== currentUserId && user.id !== 0) ||
              (user.user_id && user.user_id !== currentUserId && user.user_id !== 0));

          console.log("🔧 Business detection result:", isBusiness, {
            user_type: user.user_type,
            participant_type: user.participant_type,
            is_business: user.is_business,
            different_user: (user.id && user.id !== currentUserId && user.id !== 0),
            businessJoined: businessJoined.value
          });

          if (isBusiness && !businessJoined.value) {
            console.log("🎉 Business user detected! Calling handleBusinessJoined");
            handleBusinessJoined(user);
          } else if (businessJoined.value) {
            console.log("⚠️ Business already joined, skipping");
          } else {
            console.log("❌ Not a business user");
          }
        },
        onUserLeaving: (user) => {
          const displayName = getUserDisplayName(user);

          const leaveMessage = {
            id: `leave_${Date.now()}`,
            content: `${displayName} left the conversation`,
            isUser: false,
            timestamp: new Date(),
            sender: {
              uuid: "greep_ai",
              name: "Greep AI",
            },
            metadata: {
              type: "info" as const,
              extras: {
                info_icon: "user-minus",
                system_message: true,
              },
            },
          };
          addMessage(leaveMessage);
        },
        onMessageCreated: (data) => {
          // ✅ FIXED: Process ALL messages like backup does, don't filter by current user
          // The workflow engine will handle message processing and display correctly
          console.log("📨 WorkflowChat received WebSocket message:", data);
          handleIncomingMessage(data);
        },
        onBusinessJoined: (data) => {
          const currentParticipantCount = props.conversation?.participant_count || 1;

          // Only process if we have more than 1 participant
          if (currentParticipantCount < 2) {
            return;
          }

          // Stop countdown when business joins (like in backup)
          console.log("🎉 Business joined - stopping countdown");
          stopCountdown();

          handleBusinessJoined(data);

          // ✅ BACKUP LOGIC: Refresh conversation data to update participant names in header
          setTimeout(async () => {
            await refreshConversationData();
          }, 1000); // Small delay to ensure backend has updated
        }
      });
    };

    // Computed
    const activeModal = computed(() => {
      const result = manualModalOverride.value || computedActiveModal.value;
      return result;
    });

    // Watch for bank transfer modal activation to load saved accounts
    watch(activeModal, (newModal) => {
      if (newModal === 'bank_transfer') {
        loadSavedBankAccounts();
      }
    });

    const businessStoreLocations = computed(() => {
      const storeLocations = props.conversation?.exchangeAd?.business?.storeLocations || [];
      return storeLocations
        .filter(location => location.name && location.address && location.city && location.country)
        .map(location => ({
          name: location.name || '',
          address: location.address || '',
          city: location.city || '',
          country: location.country || '',
          __typename: location.__typename || 'StoreLocation'
        }));
    });

    const lastAIMessage = computed(() => {
      const lastAI = getLastAIMessage();
      if (!lastAI) return undefined;

      return {
        ...lastAI,
        metadata: typeof lastAI.metadata === 'object'
          ? JSON.stringify(lastAI.metadata)
          : lastAI.metadata
      };
    });

    const conversationData = computed(() => {
      // Get full conversation data from Logic.Messaging like backup does
      const fullConversation = Logic.Messaging?.SingleConversation;

      return props.conversation || fullConversation || {
        id: props.conversationId,
        participants: [], // This will be populated by the Logic call
        // Add minimal conversation structure for UI components
      };
    });

    const mobileFullHeight = computed(() => {
      // Mobile full height calculation
      return 'height: 100vh;';
    });

    // Methods
    const refreshConversationData = async () => {
      try {
        console.log("🔄 Refreshing conversation data after business joined...");

        const conversationUuid = conversationData.value?.uuid || props.conversation?.uuid;
        if (!conversationUuid) {
          console.log("❌ No conversation UUID to refresh");
          return;
        }

        console.log("🔧 Current participants before refresh:", conversationData.value?.participants);

        // Fetch latest conversation data to get updated participant names
        const updatedConversation = await Logic.Messaging.GetSingleConversation(conversationUuid);

        if (updatedConversation) {
          // Update local state
          Logic.Messaging.SingleConversation = updatedConversation;
          console.log("✅ Conversation data refreshed - participant names updated");
          console.log("🔧 New participants after refresh:", updatedConversation.participants);

          // Force a reactive update
          nextTick(() => {
            console.log("🔧 Topbar should now show updated participant names");
          });
        } else {
          console.log("❌ No updated conversation data received");
        }
      } catch (error) {
        console.error("❌ Error refreshing conversation:", error);
      }
    };

    const sendMessage = async (content: string, metadata?: any) => {
      const success = await engineSendMessage(content, metadata);
      if (success) {
        await scrollToBottom();
      }
      return success;
    };

    const handleBackClick = () => {
      // Navigate back - you can customize this based on your routing needs
      window.history.back();
    };

    const handleActionClick = async (action: any) => {
      const success = await engineSendMessage(action.label, { selected_option: action.value });
      if (success) {
        await scrollToBottom();
      }
    };

    const handleAddressSelection = async (address: any) => {
      const success = await engineSendMessage(`Address: ${address.formatted || address.name}`, {
        address,
        selected_option: "string"
      });
      if (success) {
        manualModalOverride.value = null;
        await scrollToBottom();
      }
    };

    const handleAddressCancel = () => {
      console.log('📍 Address modal cancelled');
      manualModalOverride.value = 'closed';
    };

    const handleBankSelection = async (bank: any) => {
      const displayText = `${bank.bank_name} - ${bank.account_number} (${bank.account_name})`;

      const success = await engineSendMessage(`Bank: ${displayText}`, {
        bank_account: bank,
        selected_option_data_type: "string"
      });

      if (success) {
        manualModalOverride.value = 'closed';
        await scrollToBottom();
      }
    };

    const handleBankDetailsSubmitted = async (bankForm: any, savedAccount?: any) => {

      try {
        const newSavedAccount = await Logic.Wallet.CreateP2pPaymentMethodDirect({
          bank_name: bankForm.bankName,
          account_number: bankForm.accountNumber,
          account_name: bankForm.accountName,
          currency: bankForm.currency,
          meta_data: JSON.stringify({
            added_via: 'transfer_chat',
            timestamp: Date.now()
          })
        });

        // Convert P2pPaymentMethod to BankAccount format for consistency
        const bankAccount = newSavedAccount ? {
          uuid: newSavedAccount.uuid,
          bank_name: newSavedAccount.bank_name || '',
          account_number: newSavedAccount.account_number || '',
          account_name: newSavedAccount.account_name || '',
          currency: newSavedAccount.currency || 'TRY'
        } : savedAccount;

        // Send message with the bank account details
        const displayText = `${bankAccount.bank_name} - ${bankAccount.account_number} (${bankAccount.account_name})`;
        const success = await engineSendMessage(`Bank: ${displayText}`, { bank_account: bankAccount });

        if (success) {
          manualModalOverride.value = 'closed';
          await scrollToBottom();

          // Refresh saved bank accounts
          await loadSavedBankAccounts();
        }
      } catch (error) {
        console.error('Failed to save bank account:', error);
      }
    };

    const handleSavedAccountSelected = async (account: any) => {
      const displayText = `${account.bank_name} - ${account.account_number} (${account.account_name})`;

      const success = await engineSendMessage(`Bank: ${displayText}`, {
        bank_account: account,
        selected_option: "string"
      });

      if (success) {
        manualModalOverride.value = 'closed';
        await scrollToBottom();
      }
    };

    const handleBankTransferCancel = () => {
      manualModalOverride.value = 'closed';
    };

    const handlePickupSelection = async (location: any) => {
      const displayText = `${location.name} - ${location.address}, ${location.city}, ${location.country}`;

      const success = await engineSendMessage(`Pickup: ${displayText}`, {
        selected_option: "branch_selected",
        selected_option_data_type: "string",
        pickup_location: location
      });

      if (success) {
        manualModalOverride.value = null;
        await scrollToBottom();
      }
    };

    // Business action handlers
    const handleCompleteOrder = async () => {
      try {
        const success = await sendDirectMessage("Order has been completed successfully. Payment has been processed.");
        if (success) {
          // Send system completion message
          await sendDirectMessage("✅ **ORDER COMPLETED** - Transaction finalized by business partner");
          await scrollToBottom();
        }
      } catch (error) {
        console.error("❌ Error completing order:", error);
      }
    };

    const handleDeliveryComplete = async () => {
      try {
        const success = await sendDirectMessage("Delivery has been completed successfully. Item has been delivered to the specified address.");
        if (success) {
          // Send system completion message
          await sendDirectMessage("🚚 **DELIVERY COMPLETED** - Item delivered by business partner");
          await scrollToBottom();
        }
      } catch (error) {
        console.error("❌ Error marking delivery complete:", error);
      }
    };

    const handleSendReceipt = async () => {
      try {
        // Extract order details from messages for receipt
        const orderSummary = workflowEngine.extractOrderSummary();

        let receiptContent = "📄 **TRANSACTION RECEIPT**\n\n";
        receiptContent += `🆔 Order ID: ${props.conversationId}\n`;
        receiptContent += `📅 Date: ${new Date().toLocaleDateString()}\n`;

        if (orderSummary?.amount) {
          receiptContent += `💰 Amount: ₦${orderSummary.amount}\n`;
        }

        if (orderSummary?.method) {
          const methodName = orderSummary.method.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase());
          receiptContent += `🏦 Method: ${methodName}\n`;
        }

        receiptContent += `✅ Status: Completed\n`;
        receiptContent += `🏪 Processed by: Business Partner\n\n`;
        receiptContent += `Thank you for using Greep! 🙏`;

        const success = await sendDirectMessage(receiptContent);
        if (success) {
          await scrollToBottom();
        }
      } catch (error) {
        console.error("❌ Error sending receipt:", error);
      }
    };

    const handleUploadProof = async () => {
      try {
        console.log("📸 Upload proof clicked - showing proof modal");
        showProofModal.value = true;
      } catch (error) {
        console.error("❌ Error showing proof modal:", error);
      }
    };

    // ✅ Handle proof upload files from uicomponents modal
    const handleProofUploadFiles = async (files: File[], notes: string) => {
      try {
        console.log(`📸 Proof upload files:`, files, 'Notes:', notes);

        // Generate proof content based on files and notes
        const fileCount = files.length;
        const fileTypes = files.map(f => f.type.startsWith('image/') ? 'photo' : 'document');
        const hasPhotos = fileTypes.includes('photo');
        const hasDocs = fileTypes.includes('document');

        let proofContent = '';
        if (hasPhotos && hasDocs) {
          proofContent = `📸📄 ${fileCount} files uploaded (photos & documents)`;
        } else if (hasPhotos) {
          proofContent = `📷 ${fileCount} photo(s) uploaded`;
        } else {
          proofContent = `� ${fileCount} document(s) uploaded`;
        }

        // Add notes if provided
        if (notes.trim()) {
          proofContent += ` - ${notes.trim()}`;
        }

        // Send proof upload message like in backup
        const success = await sendDirectMessage(`📸 **PROOF UPLOADED** - ${proofContent}`);

        if (success) {
          showProofModal.value = false;
          console.log("✅ Proof upload message sent successfully");
          await scrollToBottom();
        }
      } catch (error) {
        console.error("❌ Error uploading proof files:", error);
      }
    };

    // ✅ Handle proof cancel (like backup)
    const handleProofCancel = () => {
      console.log("📸 Proof upload cancelled");
      showProofModal.value = false;
    };

    const scrollToBottom = async () => {
      await nextTick();
      const bottomAnchor = document.getElementById('bottom-anchor');
      if (bottomAnchor) {
        bottomAnchor.scrollIntoView({ behavior: 'smooth' });
      }
    };

    // ✅ NEW: Load saved bank accounts from P2P Payment Methods API
    const loadSavedBankAccounts = async () => {
      try {
        console.log("🏦 Loading saved bank accounts...");
        const response = await Logic.Wallet.GetMyP2pPaymentMethods(20, 1);
        savedBankAccounts.value = response?.data || [];
        console.log("✅ Loaded saved bank accounts:", savedBankAccounts.value.length);
      } catch (error) {
        console.error("❌ Failed to load saved bank accounts:", error);
        savedBankAccounts.value = [];
      }
    };

    // Initialize with existing messages
    onMounted(async () => {
      console.log("🚀 WorkflowChat mounted - initializing...");

      // Setup Logic watchers like in backup
      if (Logic.Messaging) {
        Logic.Messaging.watchProperty("SingleConversation", conversationData);
      }

      if (props.initialMessages?.length) {
        props.initialMessages.forEach(msg => addMessage(msg));
      }

      // Initialize with conversation data to detect business users
      await initializeFromConversation(props.conversation);

      // Setup WebSocket for real-time messaging
      setupChatWebSocket();

      await scrollToBottom();
    });

    // Cleanup WebSocket when component unmounts
    onUnmounted(() => {
      console.log("👋 WorkflowChat unmounting - cleaning up WebSocket...");
      cleanupWebSocket();
    });

    // Auto-scroll when new messages arrive
    watch(messages, async () => {
      await scrollToBottom();
    }, { deep: true });

    return {
      messages,
      isProcessing,
      activeModal,
      lastAIMessage,
      conversationData,
      mobileFullHeight,
      manualModalOverride,
      businessStoreLocations,
      savedBankAccounts,
      loadSavedBankAccounts,
      isBusinessUser,
      businessJoined,
      directMessagingEnabled,
      isConnected,
      echoChannel,
      workflowType: props.workflowType,
      sendMessage,
      handleBackClick,
      handleActionClick,
      handleAddressSelection,
      handleAddressCancel,
      handleBankSelection,
      handleBankDetailsSubmitted,
      handleSavedAccountSelected,
      handleBankTransferCancel,
      handlePickupSelection,
      handleCompleteOrder,
      handleDeliveryComplete,
      handleSendReceipt,
      handleUploadProof,
      handleProofUploadFiles,
      handleProofCancel,
      showProofModal,
      setupChatWebSocket,
      countdownType,
      countdownTime,
      isCountdownActive,
      formatCountdown,
      countdownText,
      handleCountdownExpired,
      Logic
    };
  }
});
</script>

<style scoped>
/* Use existing styles from original chat component */
</style>