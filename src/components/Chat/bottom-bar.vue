<template>
  <div
    class="w-full flex flex-col sticky bottom-0 left-0 py-4 !border-t-[1.5px] !border-[#F0F3F6] bg-white z-5"
  >
    <!-- Extra widget slot -->
    <slot name="extra-widget" />

    <!-- Main input text area -->
    <div
      class="w-full flex flex-row px-4 items-center justify-between overflow-hidden max-w-full"
    >
      <div class="flex flex-row items-center w-full max-w-[calc(100%-56px)]">
        <span
          :contenteditable="true"
          role="textbox"
          :class="`w-full textarea prose prose-sm relative !text-xs resize-none !min-h-[55px] border-[1.5px] border-[#E0E2E4] text-black whitespace-pre-wrap focus:outline-none !max-h-[80px] overflow-x-hidden bg-transparent rounded-full py-3 pt-4 pl-4 px-3 items-start text-left overflow-y-auto`"
          placeholder="Enter message here"
          id="messageContainerInput"
          :data-placeholder="placeholder"
          @input="onInput"
          @keypress="handleKeyEvent"
          :inputmode="inputmode"
        >
        </span>
      </div>

      <div class="w-[56px] ml-3">
        <div
          class="w-[56px] h-[56px] rounded-full bg-[#0A141E] items-center justify-center flex flex-row"
        >
          <div class="w-[24px]">
            <app-icon name="send" custom-class="!h-[24px]" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { AppIcon } from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { ref } from "vue";

export default defineComponent({
  components: {
    AppIcon,
  },
  props: {},
  name: "ChatBottomBar",
  setup() {
    const chatEnabled = ref(true);
    const placeholder = ref("Enter amount");
    const chatContent = ref("");
    const inputmode = ref<
      | "search"
      | "text"
      | "email"
      | "tel"
      | "none"
      | "url"
      | "numeric"
      | "decimal"
    >("text");

    const onInput = (e: any) => {
      chatContent.value = e.target.innerText;
    };

    const handleKeyEvent = (e: any) => {
      if (e.keyCode == 13 && e.shiftKey) {
        return;
      }
      // if (e.key === "Enter" || e.keyCode === 13) {
      //   // send message
      //   e.preventDefault();
      //   return;
      // }
    };

    return {
      Logic,
      chatContent,
      chatEnabled,
      placeholder,
      onInput,
      handleKeyEvent,
      inputmode,
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
