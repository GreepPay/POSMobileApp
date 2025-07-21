<template>
  <app-wrapper>
    <div v-if="SingleConversation"
      class="w-full flex flex-col lg:text-sm mdlg:text-[12px] relative text-xs font-poppins overflow-y-auto h-full"
      id="chat-conversation-page" style="padding-top: calc(env(safe-area-inset-top) + 0px) !important">
      <!-- Top bar -->
      <chat-top-bar :conversation="SingleConversation" />

      <!-- Chat content -->
      <div class="w-full flex flex-col px-4 pt-4 ">
        <template v-for="(message, index) in messages" :key="index">
          <chat-message :conversation="SingleConversation" :message="message" class="mb-4" />
        </template>
        <div class="w-full h-[130px]" id="bottom-anchor"></div>
      </div>

      <!-- Bottom bar -->
      <chat-bottom-bar :conversation="SingleConversation" :send-message="sendMessage"
        :last-a-i-message="lastAIMessage" />
    </div>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, watch } from "vue";
import { Logic } from "@greep/logic";
import { reactive } from "vue";
import { ref } from "vue";
import ChatTopBar from "../../components/Chat/top-bar.vue";
import ChatBottomBar from "../../components/Chat/bottom-bar.vue";
import ChatMessage from "../../components/Chat/message.vue";
import { computed } from "vue";
import { onMounted } from "vue";
import { MessageInfo, withdrawalAvailableCurrencies } from "../../composable";
import { onIonViewWillEnter } from "@ionic/vue";
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
    const SingleConversation = ref(Logic.Messaging.SingleConversation)
    const AuthUser = ref(Logic.Auth.AuthUser);
    const CurrentGlobalExchangeRate = ref(Logic.Wallet.CurrentGlobalExchangeRate);

    const updateHeight = () => {
      innerHeight.value = window.innerHeight;
    };

    const currentConversationState = computed(() => {
      const stage = SingleConversation.value?.stage || "0";

      const splited = stage.split("_");

      const state = splited[splited.length - 1] == "0" ? "initiation" : "reaction";
      const actualStage = stage.replace("_0", "").replace("_1", "");

      return {
        state: state,
        stage: actualStage,
      };
    });

    const mobileFullHeight = computed(() => {
      return {
        height: `${innerHeight.value}px`,
      };
    });

    const messages = reactive<MessageInfo[]>([
      // {
      //   type: "text",
      //   text_content:
      //     "Thanks for choosing to trade with me 😊 I'm fast, reliable, and always online for smooth transactions. If you ever need USDC again, I’m always here!",
      //   user_uuid: "34dwuue",
      //   user_name: "Abass Damilare",
      // },
      // {
      //   type: "text",
      //   text_content: "How much USDC do you want to sell?",
      //   user_uuid: "greep_ai",
      //   user_name: "GreepPay AI",
      // },
      // {
      //   type: "info",
      //   text_content:
      //     "You have <span class='!font-semibold'>420.54872 USDC</span>",
      //   user_uuid: "info_dssw",
      //   info_icon: "wallet-grey",
      // },
      // {
      //   type: "text",
      //   text_content: "80 USDC",
      //   user_uuid: Logic.Auth.AuthUser.uuid,
      // },
      // {
      //   type: "info",
      //   text_content:
      //     "Transaction fee is <span class='!font-semibold'>0.15 USDC</span>",
      //   user_uuid: "info_23sw",
      //   info_icon: "info-grey",
      // },
      // {
      //   type: "text",
      //   text_content: "Great! Choose how do you want to collect your cash",
      //   user_uuid: "greep_ai",
      //   user_name: "GreepPay AI",
      //   actions: [
      //     {
      //       label: "Pickup",
      //       message: "Pickup at your location",
      //       type: "success",
      //     },
      //     {
      //       label: "Delivery",
      //       message: "Delivery to my doorstep",
      //       type: "info",
      //     },
      //   ],
      // },
      // {
      //   type: "text",
      //   text_content: "Delivery to my doorstep",
      //   user_uuid: Logic.Auth.AuthUser.uuid,
      // },
      // {
      //   type: "text",
      //   text_content: "Proof",
      //   user_uuid: "34dwuue",
      //   user_name: "Abass Damilare",
      //   media: {
      //     type: "image",
      //     url: `https://picsum.photos/400/300?random=${Math.random()}`,
      //   },
      // },
    ]);

    const setMessages = () => {
      SingleConversation.value?.messages?.forEach((message) => {
        const messageExists = messages.find(m => m.id === message.id.toString());

        if (!messageExists) {
          const metadata = message.metadata ? JSON.parse(message.metadata) : {};

          const options = metadata?.options || [];

          const actions = options.map((option: any) => {
            return {
              label: option.content,
              message: option.message?.content || option.content,
              type: option.type || "primary",
              value: option.value,
              handler: () => {
                sendMessage(option.message?.content, option.value);
              },
            };
          });
          messages.push({
            id: message.id.toString(),
            type: "text",
            text_content: message.content,
            user_uuid: message.sender?.uuid || "greep_ai",
            user_name: message.sender ? (message.sender?.first_name + " " + message.sender.last_name) : "GreepPay AI",
            info_icon: metadata?.extras?.info_icon || "",
            actions: actions
          });
        }

      });
    };

    const scrollToBottom = () => {
      const bottomAnchor = document.getElementById('bottom-anchor');
      if (bottomAnchor) {

        bottomAnchor.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        });
      }
    };

    const pushNewMessage = (newMessage: Message) => {
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

    };

    const sendMessage = (content: string, extraValue = "") => {
      if (SingleConversation.value) {
        const conversationMetadata = SingleConversation.value?.metadata ? JSON.parse(SingleConversation.value.metadata) : {};

        const balance = AuthUser.value?.wallet?.total_balance;
        // Other data
        const otherMetaData = {
          "wallet_balance": Logic.Common.convertToMoney(
            balance,
            true,
            "",
            false
          )
        };

        let structuredResponse: any = {};
        const exchangeAd = SingleConversation.value?.exchangeAd;

        if (currentConversationState.value.state == "reaction") {
          const currentStage = currentConversationState.value.stage;

          const withdrawaCurrency = withdrawalAvailableCurrencies.find(c => c.code === exchangeAd?.from_currency);

          if (currentStage == "withdrawal_amount") {

            const exchangeRate = exchangeAd?.rate || 1;


            const amount = parseFloat(content.replace(/,/g, "") || "0");

            if (amount > parseFloat(balance)) {
              Logic.Common.showAlert({
                show: true,
                message: "Insufficient wallet balance.",
                type: "error",
              });
              return false;
            }

            structuredResponse = {
              currency: exchangeAd?.to_currency || "USD",
              amount: parseFloat(amount.toFixed(2)),
              currency_symbol: withdrawaCurrency?.symbol || "$",
              business_name: exchangeAd?.business?.business_name || "GreepPay",
              sell_amount: Logic.Common.convertToMoney(
                amount * exchangeRate,
                true,
                "",
                false
              ),
              sell_rate: Logic.Common.convertToMoney(
                exchangeRate,
                true,
                "",
                false
              ),
            }
          }

          if (currentStage == "exchange_rate") {
            structuredResponse = {
              selected_option: extraValue,
            }
          }

        }

        Logic.Messaging.CreateMessageForm = {
          input: {
            conversation_id: SingleConversation.value?.id,
            content: content,
            type: "text",
            sender_id: parseInt(Logic.Auth.AuthUser.id),
            metadata: JSON.stringify({
              is_bot: false,
              type: "text",
              ...conversationMetadata,
              ...otherMetaData,
              ...structuredResponse,
              structured_response: structuredResponse
            }),
          },
        }

        Logic.Messaging.CreateMessage();

        // Push the new message to the messages array
        const newMessage: Message = {
          id: Date.now(), // Use a timestamp as a unique ID
          content: content,
          type: "text",
          sender_id: parseInt(Logic.Auth.AuthUser.id),
          conversation_id: SingleConversation.value?.id,
          // @ts-expect-error partial type
          sender: {
            uuid: Logic.Auth.AuthUser.uuid,
            first_name: Logic.Auth.AuthUser.first_name,
            last_name: Logic.Auth.AuthUser.last_name,
          },
          metadata: JSON.stringify({
            is_bot: false,
            type: "text",
          }),
        }
        pushNewMessage(newMessage);

        return true;

      }

      return false;

    };

    const lastAIMessage = computed(() => {
      const aiMessages = SingleConversation.value?.messages.filter(
        (message) => {
          const metadata = JSON.parse(message.metadata || '{}');
          const failure_message = metadata?.extras?.failure_message;
          return (message.sender == null || message.sender?.uuid === "greep_ai") && !failure_message
        }
      );

      if (aiMessages?.length === 0) {
        return undefined;
      }
      // Get the last AI message
      // @ts-expect-error partial type
      const lastMessage = aiMessages[aiMessages.length - 1];
      if (lastMessage) {
        return lastMessage;
      } else {
        return undefined;
      }

    });

    const setDefault = () => {
      interface MessageEventData {
        id?: string;
        content: string;
        conversation_id: string;
        updatedAt: string;
        createdAt: string;
        metadata: any;
        status: string;
        user_id: number
      }
      //  Listen to messaging events
      Logic.Common.laravelEcho?.join(`message.${SingleConversation.value?.uuid}`)
        .here((users: any) => {
          console.log("Users in the channel:", users);
        }).joining((user: any) => {
          console.log("User joined:", user);
        }).leaving((user: any) => {
          console.log("User left:", user)
        }).listen('.message.created', (e: MessageEventData) => {

          if (e.user_id === parseInt(Logic.Auth.AuthUser.id)) {
            // Ignore messages sent by the current user
            return;
          }
          const currentParticipant = SingleConversation.value?.participants?.find(p => p.user_id === e.user_id);
          const metadata = typeof e.metadata === 'string' ? JSON.parse(e.metadata) : e.metadata;

          const newMessage: Message = {
            id: e.id ? parseInt(e.id) : Date.now(), // Use a timestamp as a unique ID
            content: e.content,
            type: "text",
            sender_id: e.user_id,
            conversation_id: SingleConversation.value?.id || 0,
            // @ts-expect-error partial type
            sender: currentParticipant?.user ? {
              uuid: currentParticipant?.user?.uuid || "0",
              first_name: currentParticipant?.user?.first_name || "GreepPay",
              last_name: currentParticipant?.user?.last_name || "AI",
            } : undefined,
            metadata: JSON.stringify(metadata),
          }

          pushNewMessage(newMessage);
        });

      if (SingleConversation.value?.entity_type == 'p2p_withdrawal') {
        const conversationMetadata = SingleConversation.value?.metadata ? JSON.parse(SingleConversation.value.metadata) : {};

        if (conversationMetadata) {
          // Logic.Wallet.GetGlobalExchangeRate("USD", conversationMetadata.currency || "USD");
        }
      }
    }

    onIonViewWillEnter(() => {
      setDefault();
      setMessages()
      setTimeout(() => {
        scrollToBottom();
      }, 300);
    });

    watch(SingleConversation, () => {
      setMessages();
    })

    onMounted(() => {
      updateHeight();
      window.addEventListener("resize", updateHeight);
      Logic.Messaging.watchProperty("SingleConversation", SingleConversation)
      Logic.Auth.watchProperty("AuthUser", AuthUser);
      Logic.Wallet.watchProperty("CurrentGlobalExchangeRate", CurrentGlobalExchangeRate);
    });

    return {
      Logic,
      mobileFullHeight,
      messages,
      SingleConversation,
      sendMessage,
      lastAIMessage
    };
  },
});
</script>
