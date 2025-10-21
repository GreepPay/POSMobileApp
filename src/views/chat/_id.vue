<template>
  <app-workflow-chat
    v-if="conversationId && conversationData"
    :conversation-id="conversationId"
    workflow-type="p2p_withdrawal"
    :initial-messages="initialMessages"
    :conversation="conversationData"
  />
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import { Logic } from "@greep/logic";
import { AppWorkflowChat } from "@greep/ui-components";
import { onIonViewWillEnter, onIonViewWillLeave } from "@ionic/vue";

export default defineComponent({
  name: "ChatConversationPage",
  components: {
    AppWorkflowChat,
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
    const SingleConversation = ref(Logic.Messaging.SingleConversation);
    const AuthUser = ref(Logic.Auth.AuthUser);

    // Get conversation ID from route or conversation data
    const conversationId = computed(() => {
      return SingleConversation.value?.id || 0;
    });

    const conversationData = computed(() => {
      const conv = SingleConversation.value;
      if (!conv) return null;
      return conv;
    });

    // Transform existing messages to workflow format if needed
    const initialMessages = computed(() => {
      if (!SingleConversation.value?.messages?.length) {
        return [];
      }

      // Convert existing messages to workflow format
      return SingleConversation.value.messages.map((msg: any) => {
        const metadata = msg.metadata
          ? typeof msg.metadata === "string"
            ? JSON.parse(msg.metadata)
            : msg.metadata
          : {};

        return {
          id:
            msg.uuid ||
            msg.id ||
            `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          content: msg.content,
          isUser: msg.sender?.uuid !== "greep_ai" && msg.user_id !== 0,
          timestamp: new Date(msg.createdAt || msg.created_at || Date.now()),
          metadata,
          sender:
            msg.sender ||
            (msg.user_id === 0
              ? { uuid: "greep_ai", name: "Greep AI" }
              : undefined),
        };
      });
    });

    // Initialize conversation and authentication watchers
    const initializeWatchers = () => {
      Logic.Messaging.watchProperty("SingleConversation", SingleConversation);
      Logic.Auth.watchProperty("AuthUser", AuthUser);
    };

    // Lifecycle hooks
    onIonViewWillEnter(() => {
      console.log("🚀 Simple P2P Chat page entered - using SimpleWorkflowChat");
      initializeWatchers();
    });

    onIonViewWillLeave(() => {
      console.log("👋 P2P Chat page left");
    });

    onMounted(() => {
      initializeWatchers();
    });

    return {
      conversationId,
      initialMessages,
      conversationData,
      SingleConversation,
      AuthUser,
    };
  },
});
</script>

<style scoped>
/* All styles are handled by WorkflowChat component */
</style>
