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
          <div class="animate-pulse text-gray-500">typing...</div>
        </div>

        <div class="w-full h-[200px]" id="bottom-anchor"></div>
      </div>

      <!-- Floating Upload Proof Button (prominent when needed) -->
      <div
        v-if="showProofUpload && !hasUploadedProof"
        class="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40 animate-bounce"
      >
        <app-button
          @click="showProofModal = true"
          class="!bg-primary !text-white !px-6 !py-3 !rounded-full !shadow-lg !border-2 !border-white flex items-center space-x-2 hover:!bg-primary-dark transition-all duration-300"
        >
          <span class="text-lg">📸</span>
          <span class="font-semibold">Upload Proof</span>
        </app-button>
      </div>

      <!-- Fixed bottom section -->
      <div class="fixed bottom-0 left-0 right-0 bg-white z-30">
        <!-- Bottom bar with upload functionality -->
        <chat-bottom-bar
          :conversation="conversationDataWithStage"
          :send-message="sendMessage"
          :last-a-i-message="lastAIMessage"
          :is-processing="isProcessing"
          :authUser="Logic.Auth.AuthUser"
          :disabled="isProcessing"
          :show-address-mode="false"
          :order-confirmed="true"
          :proof-uploaded="proofUploaded"
          @click-address-input="() => {}"
          @upload-proof="showProofModal = true"
        />
      </div>

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
        :show="showProofModal"
        @cancel="handleProofCancel"
        @upload-success="handleProofUploadSuccess"
        @upload-error="handleProofUploadError"
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
  AppButton,
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
    AppButton,
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

    // New reactive variables for proof upload modal
    const showProofModal = ref(false);
    const proofUploaded = ref(false);

    // Input handling composable (simplified usage)
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
      businessStoreLocations,
      loadSavedBankAccounts,
      handleAddressSelection,
      handleAddressCancel,
      handleBankDetailsSubmitted,
      handleSavedAccountSelected,
      handleBankTransferCancel,
      handlePickupSelection,
      handlePickupCancel,
      handleUploadProof: inputHandleUploadProof,
      handleProofUploadFiles: inputHandleProofUploadFiles,
      handleProofCancel: inputHandleProofCancel,
    } = workflowInput;

    // WebSocket integration
    const {
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
          const isBusiness =
            user.user_type === "business" ||
            user.participant_type === "business" ||
            user.is_business === true ||
            (user.id && user.id !== currentUserId && user.id !== 0) ||
            (user.user_id &&
              user.user_id !== currentUserId &&
              user.user_id !== 0);

          if (isBusiness && !businessJoined.value) {
            console.log(
              "🎉 Business user detected! Calling handleBusinessJoined"
            );
            handleBusinessJoined(user);
          }
        },
        onUserLeaving: (user) => {
          const displayName = getUserDisplayName(user);

          const leaveMessage = {
            id: `leave_${Date.now()}`,
            content: `${displayName} left the conversation`,
            text_content: `${displayName} left the conversation`,
            user_uuid: "greep_ai",
            user_name: "Greep AI",
            type: "info" as const,
            isUser: false,
            timestamp: new Date(),
            sender: {
              uuid: "greep_ai",
              name: "Greep AI",
            },
          };
          addMessage(leaveMessage);
        },
        onMessageCreated: (data) => {
          console.log(
            "📨 Simple WorkflowChat received WebSocket message:",
            data
          );
          handleIncomingMessage(data);
        },
        onBusinessJoined: (data) => {
          console.log("🎉 Business joined via WebSocket");
          handleBusinessJoined(data);
        },
      });
    };

    // Computed properties
    const lastAIMessage = computed(() => {
      const lastAI = getLastAIMessage();
      if (!lastAI) return undefined;

      // Simple workflow messages don't have complex metadata
      return {
        ...lastAI,
        metadata: "{}", // Simple placeholder
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

    // Add stage for proof upload functionality
    const conversationDataWithStage = computed(() => {
      return {
        ...conversationData.value,
        stage: proofUploaded.value ? "awaiting_confirmation" : "send_payment", // Progress stage after proof upload
      };
    });

    const mobileFullHeight = computed(() => {
      return "height: 100vh;";
    });

    // Methods
    const sendMessage = async (content: string) => {
      const success = await engineSendMessage(content);
      if (success) {
        await scrollToBottom();
      }
      return success;
    };

    const handleBackClick = () => {
      window.history.back();
    };

    // Handle proof upload (connecting both systems)
    const handleUploadProof = () => {
      console.log("📤 Proof upload requested");
      handleProofUpload(); // Simple workflow engine
      inputHandleUploadProof(); // Input composable
    };

    // Handle proof upload completion
    const handleProofUploadFiles = async (files: File[]) => {
      await handleProofUploadComplete(files);
      await scrollToBottom();
    };

    const handleProofCancel = () => {
      showProofModal.value = false;
    };

    // Handle the new upload success event from the modal
    const handleProofUploadSuccess = async (uploadData: {
      fileUrl: string;
      fileName: string;
      fileType: string;
    }) => {
      console.log("📤 Proof upload successful:", uploadData);

      // Show success notification
      Logic.Common.showAlert({
        show: true,
        message: `Proof uploaded successfully: ${uploadData.fileName}`,
        type: "success",
      });

      // Include the file URL so ChatMessage can automatically detect and display the media
      const proofMessageForUser = `📸 Proof of payment uploaded: ${uploadData.fileName} - ${uploadData.fileUrl}`;

      try {
        await engineSendMessage(proofMessageForUser);

        console.log("✅ Proof message sent to user successfully");
      } catch (error) {
        console.error("❌ Failed to send proof message to user:", error);
        Logic.Common.showAlert({
          show: true,
          message:
            "Proof uploaded but failed to notify user. Please contact support.",
          type: "error",
        });
      }

      // Mark proof as uploaded to hide upload button and disable bottom box
      proofUploaded.value = true;

      // Mark proof as uploaded and trigger workflow continuation
      await handleProofUploadComplete([
        { name: uploadData.fileName, type: uploadData.fileType },
      ] as File[]);

      showProofModal.value = false;
      await scrollToBottom();
    };

    // Handle upload error
    const handleProofUploadError = (error: any) => {
      console.error("❌ Proof upload failed:", error);
      Logic.Common.showAlert({
        show: true,
        message: "Failed to upload proof. Please try again.",
        type: "error",
      });
    };

    // Track if proof has been uploaded
    const hasUploadedProof = computed(() => {
      return messages.some(
        (msg: any) =>
          msg.content?.includes("proof") ||
          msg.content?.includes("upload") ||
          msg.type === "file"
      );
    });

    const scrollToBottom = async () => {
      await nextTick();
      const bottomAnchor = document.getElementById("bottom-anchor");
      if (bottomAnchor) {
        bottomAnchor.scrollIntoView({ behavior: "smooth" });
      }
    };

    // Initialize
    onMounted(async () => {
      console.log("🚀 Simple WorkflowChat: Initializing...");

      // Initialize the simple workflow
      await initialize(props.conversation);

      // Setup WebSocket
      setupChatWebSocket();

      // Scroll to bottom
      await scrollToBottom();
    });

    // Cleanup
    onUnmounted(() => {
      console.log(
        "👋 Simple WorkflowChat unmounting - cleaning up WebSocket..."
      );
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
      // State
      messages,
      isProcessing,
      businessJoined,
      showProofUpload,
      showProofModal,
      proofUploaded,
      lastAIMessage,
      conversationData,
      conversationDataWithStage,
      mobileFullHeight,
      isConnected,
      businessStoreLocations,
      savedBankAccounts,
      activeModal,

      // Computed
      isBusinessUser,
      directMessagingEnabled,
      hasUploadedProof,
      workflowType: props.workflowType,

      // Methods
      sendMessage,
      handleBackClick,
      handleUploadProof,
      handleProofUploadFiles,
      handleProofCancel,
      handleProofUploadSuccess,
      handleProofUploadError,
      handleAddressSelection,
      handleAddressCancel,
      handleBankDetailsSubmitted,
      handleSavedAccountSelected,
      handleBankTransferCancel,
      handlePickupSelection,
      handlePickupCancel,
      loadSavedBankAccounts,
      setupChatWebSocket,

      // Constants
      Logic,
    };
  },
});
</script>

<style scoped>
/* Use existing styles from original chat component */
</style>
