<template>
  <app-wrapper>
    <div
      class="w-full flex flex-col lg:text-sm mdlg:text-[12px] relative text-xs font-poppins overflow-y-auto h-full"
      id="workflow-chat-page"
      :style="mobileFullHeight"
    >
      <!-- Top bar -->
      <chat-top-bar
        :conversation="conversationData"
        @back-click="handleBackClick"
      />

      <!-- WebSocket Connection Status -->
      <div
        v-if="!isConnected"
        class="w-full bg-yellow-50 border-b border-yellow-200 px-4 py-2"
      >
        <div class="flex items-center space-x-2">
          <div class="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <span class="text-yellow-700 text-xs">
            📡 Connecting to real-time messaging...
          </span>
        </div>
      </div>

      <!-- Chat content -->
      <div class="w-full flex flex-col px-4 pt-4 pb-4">
        <template
          v-for="(message, index) in messages"
          :key="`msg-${message.id}-${index}`"
        >
          <div class="mb-4">
            <chat-message
              :conversation="conversationData"
              :message="message"
              :show-actions="true"
              :authUser="Logic.Auth.AuthUser"
            />
          </div>
        </template>

        <!-- Loading indicator -->
        <div v-if="isProcessing" class="flex items-center justify-center py-4">
          <div class="animate-pulse text-gray-500">AI is typing...</div>
        </div>

        <!-- Countdown Timer -->
        <div
          v-if="isCountdownActive && !isBusinessUser && !businessJoined"
          class="flex items-center justify-center py-4"
        >
          <app-countdown-timer
            :duration="countdownTime"
            :customText="countdownText"
            customClass="!bg-orange-50 !border !border-orange-200 !text-orange-800"
            @expired="handleCountdownExpired"
          />
        </div>

        <div class="w-full h-[130px]" id="bottom-anchor"></div>
      </div>

      <!-- Bottom bar -->
      <chat-bottom-bar
        :conversation="conversationData"
        :send-message="sendMessage"
        :last-a-i-message="lastAIMessage"
        :is-processing="isProcessing"
        :authUser="Logic.Auth.AuthUser"
        @upload-proof="handleUploadProof"
      />

      <!-- Address Input -->
      <chat-address-input
        v-if="activeModal === 'address'"
        :is-processing="isProcessing"
        @address-confirm="handleAddressSelection"
        @cancel="handleAddressCancel"
      />

      <!-- Bank Transfer Modal -->
      <bank-transfer-modal
        v-if="activeModal === 'bank_transfer'"
        :show="true"
        :savedBankAccounts="savedBankAccounts"
        :isProcessing="isProcessing"
        @bank-details-submitted="handleBankDetailsSubmitted"
        @saved-account-selected="handleSavedAccountSelected"
        @cancel="handleBankTransferCancel"
      />

      <!-- Pickup Location Modal -->
      <pickup-location-modal
        v-if="activeModal === 'cash_pickup'"
        :isOpen="true"
        :savedLocations="businessStoreLocations"
        @confirm="handlePickupSelection"
        @close="handlePickupCancel"
      />

      <!-- Proof Upload Modal -->
      <proof-upload-modal
        :isOpen="showProofModal"
        @close="handleProofCancel"
        @upload="handleProofUploadFiles"
      />
    </div>
  </app-wrapper>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  onMounted,
  nextTick,
  watch,
  onUnmounted,
} from "vue";
import { useSimpleWorkflowEngine } from "../../composable/useSimpleWorkflowEngine";
import { useWorkflowInput } from "../../composable/useWorkflowInput";
import { useWebSocket } from "../../composable/useWebSocket";
import { Logic } from "@greep/logic";

import {
  ChatTopBar,
  ChatBottomBar,
  ChatMessage,
  ChatAddressInput,
  BankTransferModal,
  PickupLocationModal,
  ProofUploadModal,
  AppCountdownTimer,
} from "@greep/ui-components";

export default defineComponent({
  name: "WorkflowChat",
  components: {
    ChatTopBar,
    ChatBottomBar,
    ChatMessage,
    ChatAddressInput,
    BankTransferModal,
    PickupLocationModal,
    ProofUploadModal,
    AppCountdownTimer,
  },
  props: {
    conversationId: {
      type: Number,
      required: true,
    },
    workflowType: {
      type: String as () => "p2p_withdrawal" | "deliveries",
      required: true,
    },
    initialMessages: {
      type: Array,
      default: () => [],
    },
    conversation: {
      type: Object,
      default: () => null,
    },
  },
  setup(props) {
    // Simple workflow engine
    const workflowEngine = useSimpleWorkflowEngine({
      conversationId: props.conversationId,
      workflowType: props.workflowType,
    });

    const {
      messages,
      isProcessing,
      businessJoined,
      showProofUpload,
      orderSummary,
      sendMessage: engineSendMessage,
      handleIncomingMessage,
      initialize,
      handleBusinessJoined,
      handleProofUpload,
      handleProofUploadComplete,
      addMessage,
      getLastAIMessage,
      isBusinessUser,
      directMessagingEnabled,
      activeModal,
      manualModalOverride,
    } = workflowEngine;

    // ✅ NEW: Use the input handling composable
    const workflowInput = useWorkflowInput(
      {
        workflowType: props.workflowType,
        conversationId: props.conversationId,
        conversation: props.conversation,
      },
      engineSendMessage,
      manualModalOverride
    );

    const {
      savedBankAccounts,
      showProofModal,
      businessStoreLocations,
      loadSavedBankAccounts,
      handleAddressSelection,
      handleAddressCancel,
      handleBankDetailsSubmitted,
      handleSavedAccountSelected,
      handleBankTransferCancel,
      handlePickupSelection,
      handlePickupCancel,
      handleUploadProof,
      handleProofUploadFiles,
      handleProofCancel,
    } = workflowInput;

    // ✅ Countdown visibility logic (simplified - no countdown in simple workflow)
    const isCountdownActive = computed(() => false);

    // ✅ Countdown text (simplified)
    const countdownText = computed(() => "⏰ Processing");

    // ✅ Handle countdown expiration (simplified)
    const handleCountdownExpired = () => {
      console.log("⏰ Simple workflow - no countdown needed");
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
      console.log(
        "🔧 Setting up WebSocket for conversation:",
        conversationUuid
      );

      setupWebSocketListeners(conversationUuid, {
        onUserJoining: (user) => {
          console.log("🔧 User joining detected:", user);

          const currentUserId = parseInt(Logic.Auth.AuthUser?.id || "0");
          console.log(
            "🔧 Current user ID:",
            currentUserId,
            "Joining user ID:",
            user.id || user.user_id
          );

          const isBusiness =
            user.user_type === "business" ||
            user.participant_type === "business" ||
            user.is_business === true ||
            (user.id && user.id !== currentUserId && user.id !== 0) ||
            (user.user_id &&
              user.user_id !== currentUserId &&
              user.user_id !== 0);

          console.log("🔧 Business detection result:", isBusiness, {
            user_type: user.user_type,
            participant_type: user.participant_type,
            is_business: user.is_business,
            different_user:
              user.id && user.id !== currentUserId && user.id !== 0,
            businessJoined: businessJoined.value,
          });

          if (isBusiness && !businessJoined.value) {
            console.log(
              "🎉 Business user detected! Calling handleBusinessJoined"
            );
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
          console.log("📨 WorkflowChat received WebSocket message:", data);
          handleIncomingMessage(data);
        },
        onBusinessJoined: (data) => {
          const currentParticipantCount =
            props.conversation?.participant_count || 1;

          if (currentParticipantCount < 2) {
            return;
          }

          console.log("🎉 Business joined - stopping countdown");
          stopCountdown();

          handleBusinessJoined(data);

          setTimeout(async () => {
            await refreshConversationData();
          }, 1000);
        },
      });
    };

    // Computed
    const activeModal = computed(() => {
      return manualModalOverride.value || computedActiveModal.value;
    });

    // Watch for bank transfer modal activation to load saved accounts
    watch(activeModal, (newModal) => {
      if (newModal === "bank_transfer") {
        loadSavedBankAccounts();
      }
    });

    const lastAIMessage = computed(() => {
      const lastAI = getLastAIMessage();
      if (!lastAI) return undefined;

      return {
        ...lastAI,
        metadata:
          typeof lastAI.metadata === "object"
            ? JSON.stringify(lastAI.metadata)
            : lastAI.metadata,
      };
    });

    const conversationData = computed(() => {
      const fullConversation = Logic.Messaging?.SingleConversation;

      return (
        props.conversation ||
        fullConversation || {
          id: props.conversationId,
          participants: [],
        }
      );
    });

    const mobileFullHeight = computed(() => {
      return "height: 100vh;";
    });

    // Methods
    const refreshConversationData = async () => {
      try {
        console.log("🔄 Refreshing conversation data after business joined...");

        const conversationUuid =
          conversationData.value?.uuid || props.conversation?.uuid;
        if (!conversationUuid) {
          console.log("❌ No conversation UUID to refresh");
          return;
        }

        console.log(
          "🔧 Current participants before refresh:",
          conversationData.value?.participants
        );

        const updatedConversation = await Logic.Messaging.GetSingleConversation(
          conversationUuid
        );

        if (updatedConversation) {
          Logic.Messaging.SingleConversation = updatedConversation;
          console.log(
            "✅ Conversation data refreshed - participant names updated"
          );
          console.log(
            "🔧 New participants after refresh:",
            updatedConversation.participants
          );

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
      window.history.back();
    };

    const handleActionClick = async (action: any) => {
      const success = await engineSendMessage(action.label, {
        selected_option: action.value,
      });
      if (success) {
        await scrollToBottom();
      }
    };

    // Business action handlers
    const handleCompleteOrder = async () => {
      try {
        const success = await sendDirectMessage(
          "Order has been completed successfully. Payment has been processed."
        );
        if (success) {
          await sendDirectMessage(
            "✅ **ORDER COMPLETED** - Transaction finalized by business partner"
          );
          await scrollToBottom();
        }
      } catch (error) {
        console.error("❌ Error completing order:", error);
      }
    };

    const handleDeliveryComplete = async () => {
      // try {
      //   const success = await sendDirectMessage("Delivery has been completed successfully. Item has been delivered to the specified address.");
      //   if (success) {
      //     await sendDirectMessage("🚚 **DELIVERY COMPLETED** - Item delivered by business partner");
      //     await scrollToBottom();
      //   }
      // } catch (error) {
      //   console.error("❌ Error marking delivery complete:", error);
      // }
    };

    const handleSendReceipt = async () => {
      try {
        const orderSummary = workflowEngine.extractOrderSummary();

        let receiptContent = "📄 **TRANSACTION RECEIPT**\n\n";
        receiptContent += `🆔 Order ID: ${props.conversationId}\n`;
        receiptContent += `📅 Date: ${new Date().toLocaleDateString()}\n`;

        const summary = orderSummary as any;
        if (summary?.amount) {
          receiptContent += `💰 Amount: ₦${summary.amount}\n`;
        }

        if (summary?.method) {
          const methodName = summary.method
            .replace("_", " ")
            .replace(/\b\w/g, (l: string) => l.toUpperCase());
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

    const scrollToBottom = async () => {
      await nextTick();
      const bottomAnchor = document.getElementById("bottom-anchor");
      if (bottomAnchor) {
        bottomAnchor.scrollIntoView({ behavior: "smooth" });
      }
    };

    // Initialize
    onMounted(async () => {
      console.log(props.initialMessages);
      if (props.initialMessages?.length) {
        props.initialMessages.forEach((msg) => addMessage(msg));
      }

      await initializeFromConversation(props.conversation);
      setupChatWebSocket();
      await scrollToBottom();
    });

    // Cleanup
    onUnmounted(() => {
      console.log("👋 WorkflowChat unmounting - cleaning up WebSocket...");
      cleanupWebSocket();
    });

    // Auto-scroll when new messages arrive
    watch(
      messages,
      async () => {
        await scrollToBottom();
      },
      { deep: true }
    );

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
      handleBankDetailsSubmitted,
      handleSavedAccountSelected,
      handleBankTransferCancel,
      handlePickupSelection,
      handlePickupCancel,
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
      countdownText,
      handleCountdownExpired,
      Logic,
    };
  },
});
</script>

<style scoped>
/* Use existing styles from original chat component */
</style>
