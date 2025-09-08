<template>
  <div
    :class="`w-full flex flex-col fixed bottom-0 left-0 py-4 !border-t-[1.5px] !border-[#F0F3F6] bg-white z-5 ${chatEnabled ? '' : '!opacity-[50%]'}`"
    :style="`
      ${getBottomPadding}
    `">
    <!-- Extra widget slot -->
    <slot name="extra-widget" />

    <!-- ✅ NEW: Proof upload section for sellers -->
    <div v-if="isSeller && showProofUpload" class="w-full px-4 mb-2">
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span class="text-blue-600">📸</span>
            <span class="text-blue-800 text-sm font-medium">Upload proof of cash delivery</span>
          </div>
          <app-button
            variant="primary"
            :class="`px-5 !py-2 !border-[1.5px] !bg-transparent !border-purple-500 !text-purple-500`"
            @click="openProofUpload"
            >Upload</app-button
          >
        </div>
      </div>
    </div>

    <!-- Main input text area -->
    <div class="w-full flex flex-row px-4 items-center justify-between overflow-hidden max-w-full">
      <div class="flex flex-row items-center w-full max-w-[calc(100%-56px)]">
        
        <!-- Regular text input -->
        <span 
          v-if="!showAddressMode"
          :contenteditable="chatEnabled" 
          role="textbox" 
          ref="editable"
          :class="`w-full textarea prose prose-sm relative !text-xs resize-none !min-h-[55px] border-[1.5px] border-[#E0E2E4] text-black whitespace-pre-wrap focus:outline-none !max-h-[80px] overflow-x-hidden bg-transparent rounded-full py-3 pt-4 pl-4 px-3 items-start text-left overflow-y-auto`"
          :placeholder="placeholder" 
          id="messageContainerInput" 
          :data-placeholder="placeholder" 
          @input="onInput"
          @keypress="handleKeyEvent" 
          :inputmode="inputmode">
        </span>

        <!-- Address input mode -->
        <div 
          v-else
          @click="$emit('click-address-input')"
          :class="`w-full textarea prose prose-sm relative !text-xs resize-none !min-h-[55px] border-[1.5px] border-[#2563EB] text-blue-700 whitespace-pre-wrap focus:outline-none !max-h-[80px] overflow-x-hidden bg-blue-50 rounded-full py-3 pt-4 pl-4 px-3 items-start text-left overflow-y-auto cursor-pointer flex items-center`"
        >
          <span class="flex items-center space-x-2">
            <span>📍</span>
            <span>Tap to enter your delivery address...</span>
          </span>
        </div>

      </div>

      <div class="w-[56px] ml-3">
        <div 
          @click="showAddressMode ? $emit('click-address-input') : sendMessageInner"
          :class="`w-[56px] h-[56px] rounded-full ${showAddressMode ? 'bg-[#2563EB]' : chatEnabled ? 'bg-[#0A141E]' : 'bg-gray-300'} items-center justify-center flex flex-row ${chatEnabled ? 'cursor-pointer' : 'cursor-not-allowed'}`"
        >
          <div class="w-[24px]">
            <span v-if="showAddressMode" class="text-white text-lg">📍</span>
            <app-icon v-else name="send" :custom-class="`!h-[24px] ${chatEnabled ? 'text-white' : 'text-gray-500'}`" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, toRef, watch, nextTick } from "vue";
import { AppIcon, AppButton } from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { ref } from "vue";
import { getBottomPadding } from "../../composable";
import { Conversation } from "@greep/logic/src/gql/graphql";

type InputMode =
  | "search"
  | "text"
  | "email"
  | "tel"
  | "none"
  | "url"
  | "numeric"
  | "decimal";

export default defineComponent({
  components: {
    AppIcon,
    AppButton,
  },
  props: {
    conversation: {
      type: Object as () => Conversation,
      required: true,
    },
    sendMessage: {
      type: Function,
      required: true,
    },
    lastAIMessage: {
      type: Object as () => any,
      default: () => ({}),
    },
    showAddressMode: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    orderConfirmed: {
      type: Boolean,
      default: false,
    },
    proofUploaded: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['click-address-input', 'upload-proof'],
  name: "ChatBottomBar",
  setup(props, { emit }) {
    const editable = ref<HTMLElement | null>(null);
    const chatEnabled = ref(true);
    const placeholder = ref("Enter amount");
    const chatContent = ref("");
    const lastAIMessageRef = toRef(props, "lastAIMessage");
    const inputmode = ref<InputMode>("text");

    // ✅ NEW: Check if user is seller
    const isSeller = computed(() => {
      const participants = props.conversation?.participants || [];
      const currentUserId = Logic.Auth.AuthUser?.id;
      const currentUserUuid = Logic.Auth.AuthUser?.uuid;
      
      if (!currentUserId || !participants.length) {
        return false;
      }
      
      // ✅ FIXED: Convert currentUserId to number for proper comparison
      const currentUserIdNum = parseInt(currentUserId);
      
      // Check if current user is a participant
      const isParticipant = participants.some(p => p.user_id === currentUserIdNum);
      
      // Check if current user is the owner (conversation creator)
      let isOwner = false;
      
      // Method 1: Check if owner_id matches current user
      if (props.conversation?.owner_id) {
        isOwner = props.conversation.owner_id === currentUserIdNum;
      }
      // Method 2: If owner_id is undefined, check if this is the first participant (likely the creator)
      else if (participants.length > 0) {
        // Sort participants by ID to get the first one (likely the creator)
        const sortedParticipants = [...participants].sort((a, b) => a.id - b.id);
        isOwner = sortedParticipants[0].user_id === currentUserIdNum;
      }
      
      // Business user is a participant who is not the owner
      const isBusiness = isParticipant && !isOwner;
      
      console.log("🔧 Bottom bar business detection:", {
        currentUserId,
        currentUserIdNum,
        currentUserUuid,
        ownerId: props.conversation?.owner_id,
        isParticipant,
        isOwner,
        isBusiness,
        participants: participants.map(p => ({ id: p.id, user_id: p.user_id, uuid: p.user?.uuid })),
        sortedParticipants: participants.length > 0 ? [...participants].sort((a, b) => a.id - b.id).map(p => ({ id: p.id, user_id: p.user_id })) : []
      });
      
      return isBusiness;
    });

    // ✅ NEW: Check if proof upload should be shown
    const showProofUpload = computed(() => {
      const stage = props.conversation?.stage || "";
      // Hide proof upload if stage is not payment-related or if proof has been uploaded
      return (stage === "send_payment" || stage.includes("payment")) && !props.proofUploaded;
    });

    // ✅ NEW: Open proof upload
    const openProofUpload = () => {
      emit('upload-proof');
    };

    const isFormatted = computed((() => {
      return inputmode.value == "tel" || inputmode.value == "numeric"
    }));

    const applyFormatting = (value: string) => {
      // if (isFormatted.value && value.length > 1) {
      //   return Logic.Common.convertToMoney(
      //     value ? value.toString().replace(/,/g, "") || 0 : 0,
      //     false,
      //     "",
      //     false
      //   );
      // }
      return value;
    };

    const setContentAndPositionCursor = (newContent: string) => {
      if (editable.value) {
        editable.value.textContent = newContent;
        chatContent.value = newContent;
        //set cursor to the end
        nextTick(() => {
          const range = document.createRange();
          range.selectNodeContents(editable.value!);
          range.collapse(false);
          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);
        });
      }
    };

    const onInput = (event: any) => {
      const innerText = event.target.innerText;
      const formattedValue = isFormatted.value
        ? applyFormatting(innerText)
        : innerText;

      setContentAndPositionCursor(formattedValue); //set formatted value to the contenteditable
    };

    const focus = () => {
      if (editable.value) {
        editable.value.focus();
        nextTick(() => {
          const range = document.createRange();
          range.selectNodeContents(editable.value!);
          range.collapse(false);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
        });
      }
    };

    const isNumber = (evt: any) => {
      if (inputmode.value != "tel" && inputmode.value != "numeric" && inputmode.value != "decimal") return true;

      evt = evt ? evt : window.event;
      const charCode = evt.which ? evt.which : evt.keyCode;
      // Allow: 46 ('.') for decimal, but only one '.'
      if (
        charCode > 31 &&
        (charCode < 48 || charCode > 57) &&
        charCode !== 46
      ) {
        evt.preventDefault();
      } else if (charCode === 46) {
        // Only allow one '.'
        const value = evt.target.innerText || evt.target.value || '';
        if (value.includes('.')) {
          evt.preventDefault();
        } else {
          return true;
        }
      } else {
        return true;
      }
    };

    const setInputAttributes = () => {
      const metadata = lastAIMessageRef.value?.metadata ? JSON.parse(lastAIMessageRef.value?.metadata) : {};
      const extraInfo = metadata?.extras || {};
      
      if (extraInfo) {
        // ✅ UPDATED: Business users always get text input mode
        if (isSeller.value) {
          inputmode.value = "text";
        } else if (extraInfo?.input_type) {
          inputmode.value = extraInfo.input_type as InputMode;
        } else {
          inputmode.value = "text";
        }

        // For Placeholder - Business users get different placeholder
        if (isSeller.value) {
          placeholder.value = "Type your message...";
        } else if (extraInfo?.input_placeholder) {
          placeholder.value = extraInfo.input_placeholder;
        } else {
          placeholder.value = "Enter message here"; // Default placeholder 
        }
      } else {
        // ✅ NEW: Default placeholder for business users
        if (isSeller.value) {
          placeholder.value = "Type your message...";
        } else {
          placeholder.value = "Enter message here";
        }
      }
    }

    const setInputState = () => {
      if (props.disabled) {
        chatEnabled.value = false;
        placeholder.value = "Chat disabled";
        return;
      }
      
      // ✅ NEW: Business users can always chat, regardless of message metadata
      if (isSeller.value) {
        chatEnabled.value = true;
        placeholder.value = "Type your message...";
        return;
      }
      
      // ✅ NEW: If order is confirmed, enable free chat regardless of message metadata
      if (props.orderConfirmed) {
        chatEnabled.value = true;
        placeholder.value = "Type your message...";
        return;
      }
      
      // ✅ NEW: Business users should also get free chat after order confirmation
      if (isSeller.value && props.orderConfirmed) {
        chatEnabled.value = true;
        placeholder.value = "Type your message...";
        return;
      }
      
      // ✅ UPDATED: Only disable chat for non-business users when metadata type is "options"
      if (lastAIMessageRef?.value?.metadata) {
        const metadata = JSON.parse(lastAIMessageRef.value.metadata);
        if (metadata.type == "options" && !isSeller.value) {
          chatEnabled.value = false;
          placeholder.value = "Choose an option";
        } else {
          chatEnabled.value = true;
          // ✅ UPDATED: Ensure non-business users get appropriate placeholder
          if (!isSeller.value) {
            placeholder.value = "Enter message here";
          }
        }
      } else {
        chatEnabled.value = true;
        // ✅ UPDATED: Ensure non-business users get appropriate placeholder
        if (!isSeller.value) {
          placeholder.value = "Enter message here";
        }
      }
    }

    const sendMessageInner = () => {
      if (props.disabled || !chatEnabled.value) {
        return;
      }
      
      if (props.showAddressMode) {
        // If in address mode, clicking send should open address modal
        return;
      }

      if (chatContent.value.trim() === "") {
        return;
      }
      const canSend = props.sendMessage(chatContent.value);
      if (canSend) {
        chatContent.value = "";
        const messageBox = document.getElementById("messageContainerInput");

        if (messageBox) {
          messageBox.innerHTML = "";
          messageBox.focus();
        }
      }
    };

    const handleKeyEvent = (e: any) => {
      // Don't handle key events in address mode
      if (props.showAddressMode) {
        e.preventDefault();
        return;
      }

      // ✅ NEW: Business users can type freely without restrictions
      if (isSeller.value) {
        if (e.key === "Enter" || e.keyCode === 13) {
          if (!e.shiftKey) {
            sendMessageInner();
            e.preventDefault();
          }
        }
        return;
      }

      // ✅ UPDATED: Only apply number restrictions for non-business users
      isNumber(e);
      if (e.keyCode == 13 && e.shiftKey) {
        return;
      }
      if (e.key === "Enter" || e.keyCode === 13) {
        // send message
        sendMessageInner();
        e.preventDefault();
        return;
      }
    };

    watch(lastAIMessageRef, () => {
      setInputAttributes();
      setInputState()
    });

    // ✅ NEW: Watch for changes to the disabled prop
    watch(() => props.disabled, () => {
      setInputState();
    });

    // ✅ NEW: Watch for changes to the orderConfirmed prop
    watch(() => props.orderConfirmed, () => {
      setInputState();
    });

    // ✅ NEW: Watch for changes to the conversation prop (affects isSeller)
    watch(() => props.conversation, () => {
      setInputState();
    }, { deep: true });

    onMounted(() => {
      setInputAttributes();
      setInputState()
    });

    return {
      Logic,
      chatContent,
      chatEnabled,
      placeholder,
      onInput,
      handleKeyEvent,
      inputmode,
      getBottomPadding,
      sendMessageInner,
      lastAIMessageRef,
      editable,
      focus,
      isSeller,
      showProofUpload,
      openProofUpload
    };
  },
});
</script>
<style scoped>
.textarea[contenteditable]:empty::before {
  content: attr(data-placeholder);
  color: #999999;
  pointer-events: none;
  display: block;
}
</style>