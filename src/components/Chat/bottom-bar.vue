<template>
  <div
    :class="`w-full flex flex-col fixed bottom-0 left-0 py-4 !border-t-[1.5px] !border-[#F0F3F6] bg-white z-5 ${chatEnabled ? '' : '!opacity-[50%]'}`"
    :style="`
      ${getBottomPadding}
    `">
    <!-- Extra widget slot -->
    <slot name="extra-widget" />

    <!-- Main input text area -->
    <div class="w-full flex flex-row px-4 items-center justify-between overflow-hidden max-w-full">
      <div class="flex flex-row items-center w-full max-w-[calc(100%-56px)]">
        <span :contenteditable="chatEnabled" role="textbox" ref="editable"
          :class="`w-full textarea prose prose-sm relative !text-xs resize-none !min-h-[55px] border-[1.5px] border-[#E0E2E4] text-black whitespace-pre-wrap focus:outline-none !max-h-[80px] overflow-x-hidden bg-transparent rounded-full py-3 pt-4 pl-4 px-3 items-start text-left overflow-y-auto`"
          placeholder="Enter message here" id="messageContainerInput" :data-placeholder="placeholder" @input="onInput"
          @keypress="handleKeyEvent" :inputmode="inputmode">
        </span>
      </div>

      <div class="w-[56px] ml-3">
        <div @click="sendMessageInner"
          class="w-[56px] h-[56px] rounded-full bg-[#0A141E] items-center justify-center flex flex-row">
          <div class="w-[24px]">
            <app-icon name="send" custom-class="!h-[24px]" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, toRef, watch, nextTick } from "vue";
import { AppIcon } from "@greep/ui-components";
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
  },
  name: "ChatBottomBar",
  setup(props) {
    const editable = ref<HTMLElement | null>(null);
    const chatEnabled = ref(true);
    const placeholder = ref("Enter amount");
    const chatContent = ref("");
    const lastAIMessageRef = toRef(props, "lastAIMessage");
    const inputmode = ref<
      InputMode
    >("text");

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
        // For Input Mode
        if (extraInfo?.input_type) {
          inputmode.value = extraInfo.input_type as InputMode;
        } else {
          inputmode.value = "text";
        }

        // For Placeholder
        if (extraInfo?.input_placeholder) {
          placeholder.value = extraInfo.input_placeholder;
        } else {
          placeholder.value = "Enter message here"; // Default placeholder 
        }
      }
    }

    const sendMessageInner = () => {
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

    const setInputState = () => {
      if (lastAIMessageRef?.value?.metadata) {
        const metadata = JSON.parse(lastAIMessageRef.value.metadata);
        if (metadata.type == "options") {
          chatEnabled.value = false;
          placeholder.value = "Choose an option";
        } else {
          chatEnabled.value = true;
        }
      }
    }

    watch(lastAIMessageRef, () => {
      setInputAttributes();
      setInputState()
    });

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
      focus
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
