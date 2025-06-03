<template>
  <app-wrapper>
    <div
      class="w-full flex flex-col lg:text-sm mdlg:text-[12px] relative text-xs font-poppins overflow-y-auto"
      style="padding-top: calc(env(safe-area-inset-top) + 0px) !important"
      :style="`height: ${
        mobileFullHeight ? mobileFullHeight.height : ''
      } !important;`"
    >
      <!-- Top bar -->
      <chat-top-bar />

      <!-- Chat content -->
      <div class="w-full flex flex-col px-4 pt-5">
        <template v-for="(message, index) in messages" :key="index">
          <chat-message :message="message" class="mb-4" />
        </template>
      </div>

      <!-- Bottom bar -->
      <chat-bottom-bar />
    </div>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Logic } from "@greep/logic";
import { reactive } from "vue";
import { ref } from "vue";
import ChatTopBar from "../../components/Chat/top-bar.vue";
import ChatBottomBar from "../../components/Chat/bottom-bar.vue";
import ChatMessage from "../../components/Chat/message.vue";
import { computed } from "vue";
import { onMounted } from "vue";
import { MessageInfo } from "../../composable";

export default defineComponent({
  name: "ChatConversationPage",
  components: {
    ChatTopBar,
    ChatBottomBar,
    ChatMessage,
  },
  setup() {
    const innerHeight = ref(window.innerHeight);

    const updateHeight = () => {
      innerHeight.value = window.innerHeight;
    };

    const mobileFullHeight = computed(() => {
      return {
        height: `${innerHeight.value}px`,
      };
    });

    const messages = reactive<MessageInfo[]>([
      {
        type: "text",
        text_content:
          "Thanks for choosing to trade with me 😊 I'm fast, reliable, and always online for smooth transactions. If you ever need USDC again, I’m always here!",
        user_uuid: "34dwuue",
        user_name: "Abass Damilare",
      },
      {
        type: "text",
        text_content: "How much USDC do you want to sell?",
        user_uuid: "greep_ai",
        user_name: "GreepPay AI",
      },
      {
        type: "info",
        text_content:
          "You have <span class='!font-semibold'>420.54872 USDC</span>",
        user_uuid: "info_dssw",
        info_icon: "wallet-grey",
      },
      {
        type: "text",
        text_content: "80 USDC",
        user_uuid: Logic.Auth.AuthUser.uuid,
      },
      {
        type: "info",
        text_content:
          "Transaction fee is <span class='!font-semibold'>0.15 USDC</span>",
        user_uuid: "info_23sw",
        info_icon: "info-grey",
      },
      {
        type: "text",
        text_content: "Great! Choose how do you want to collect your cash",
        user_uuid: "greep_ai",
        user_name: "GreepPay AI",
        actions: [
          {
            label: "Pickup",
            message: "Pickup at your location",
            type: "success",
          },
          {
            label: "Delivery",
            message: "Delivery to my doorstep",
            type: "info",
          },
        ],
      },
      {
        type: "text",
        text_content: "Delivery to my doorstep",
        user_uuid: Logic.Auth.AuthUser.uuid,
      },
      {
        type: "text",
        text_content: "Proof",
        user_uuid: "34dwuue",
        user_name: "Abass Damilare",
        media: {
          type: "image",
          url: `https://picsum.photos/400/300?random=${Math.random()}`,
        },
      },
    ]);

    onMounted(() => {
      updateHeight();
      window.addEventListener("resize", updateHeight);
    });

    return {
      Logic,
      mobileFullHeight,
      messages,
    };
  },
});
</script>
