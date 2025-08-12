<template>
  <div :class="`w-full flex flex-row ${isUserMessage ? 'justify-end' : 'justify-start'
    }  ${message?.type == 'info' ? 'justify-center !items-center' : ''}`">
    <!-- For Info Message Type -->
    <template v-if="message?.type == 'info'">
      <div class="w-full flex flex-row justify-center items-center">
        <div class="w-[24px] mr-1">
          <app-icon :name="message.info_icon" class="h-[24px]" />
        </div>
        <app-normal-text class="!text-[#999999]" is-html :html-content="message.text_content">
        </app-normal-text>
      </div>
    </template>

    <!-- For Text Message Type -->
    <template v-if="message?.type == 'text'">
      <div class="min-w-[100px] max-w-[90%] flex flex-col">
        <!-- Message box -->
        <div :class="`w-full flex flex-col rounded-[24px] px-3 py-3 ${!isUserMessage
          ? 'bg-light-gray-one !rounded-tl-none'
          : 'bg-primary  !rounded-br-none'
          }`">
          <app-normal-text :class="`!text-left !font-semibold pb-1 ${message.user_uuid == 'greep_ai' ? '!text-primary' : ''
            }`" v-if="!isUserMessage">
            {{ message.user_name }}
          </app-normal-text>

          <!-- ✅ ORDER SUMMARY DISPLAY -->
          <div v-if="message.isOrderSummary && message.orderSummary" class="order-summary-container">
            <!-- Delivery fee notice -->
            <div class="w-full flex flex-row items-center mb-4">
              <div class="w-[24px] h-[24px] mr-2">
                <span class="text-lg">⚠️</span>
              </div>
              <app-normal-text class="!text-sm !text-[#666666]">
                Delivery fee is 3 USDC
              </app-normal-text>
            </div>
            
            <!-- Order summary header -->
            <app-normal-text class="!text-base !font-semibold !text-[#333333] !mb-4">
              Confirm your order details to move forward with the trade;
            </app-normal-text>

            <!-- Order details -->
            <div class="order-summary-details">
              <!-- You sell -->
              <div class="w-full flex flex-row justify-between items-center mb-2">
                <app-normal-text class="!text-[#666666]">• You sell</app-normal-text>
                <app-normal-text class="!font-semibold">{{ message.orderSummary.youSell }}</app-normal-text>
              </div>

              <!-- You get -->
              <div class="w-full flex flex-row justify-between items-center mb-2">
                <app-normal-text class="!text-[#666666]">• You get</app-normal-text>
                <app-normal-text class="!font-semibold !text-green-600">{{ message.orderSummary.youGet }}</app-normal-text>
              </div>

              <!-- Fee -->
              <div class="w-full flex flex-row justify-between items-center mb-2">
                <app-normal-text class="!text-[#666666]">• Fee</app-normal-text>
                <app-normal-text class="!font-semibold">{{ message.orderSummary.fee }}</app-normal-text>
              </div>

              <!-- Delivery fee -->
              <div class="w-full flex flex-row justify-between items-center mb-2">
                <app-normal-text class="!text-[#666666]">• Delivery fee</app-normal-text>
                <app-normal-text class="!font-semibold">{{ message.orderSummary.deliveryFee }}</app-normal-text>
              </div>

              <!-- You pay -->
              <div class="w-full flex flex-row justify-between items-center pt-3 mt-3 order-summary-total">
                <app-normal-text class="!text-[#333333] !font-medium">• You pay</app-normal-text>
                <app-normal-text class="!font-bold !text-lg">{{ message.orderSummary.youPay }}</app-normal-text>
              </div>

              <!-- Payment type -->
              <div class="w-full flex flex-row justify-between items-center mb-2 mt-3">
                <app-normal-text class="!text-[#666666]">• Payment type</app-normal-text>
                <app-normal-text class="!font-semibold">{{ message.orderSummary.paymentType }}</app-normal-text>
              </div>

              <!-- Payout option -->
              <div class="w-full flex flex-row justify-between items-center mb-2">
                <app-normal-text class="!text-[#666666]">• Payout option</app-normal-text>
                <app-normal-text class="!font-semibold">{{ message.orderSummary.payoutOption }}</app-normal-text>
              </div>

              <!-- Delivery address -->
              <div class="w-full flex flex-col mt-3">
                <app-normal-text class="!text-[#666666] mb-2">• We deliver cash to you at</app-normal-text>
                <div class="order-summary-address">
                  <app-normal-text class="!text-[#333333] !font-medium">{{ message.orderSummary.deliveryAddress }}</app-normal-text>
                </div>
              </div>
            </div>
          </div>

          <!-- ✅ REGULAR MESSAGE CONTENT (when not order summary) -->
          <template v-else-if="message.text_content && !message.text_content.includes('{order_summary_text}')">
            <app-normal-text is-html :html-content="message.text_content" :class="`prose prose-sm !text-xs !leading-relaxed ${isUserMessage ? '!text-white' : ''
              }`">
            </app-normal-text>
          </template>

          <!-- ✅ HIDE TEMPLATE PLACEHOLDERS -->
          <!-- Template placeholder messages with {order_summary_text} are not displayed -->

          <!-- Media -->
          <template v-if="message.media">
            <app-image-loader :photo-url="message.media.url" class="h-[250px] w-[250px] rounded-[12px] mt-2" />
          </template>
        </div>

        <!-- Actions -->
        <div class="w-full flex flex-row flex-wrap gap-2 mt-3" v-if="message.actions && showActions">
          <template v-for="(item, index) in message.actions" :key="index">
            <app-button @click="item.handler" :class="`!px-5 !py-2 !border-[1.5px] !bg-transparent ${item.type == 'success'
              ? '!border-green-500 !text-green-500'
              : ''
              } ${item.type == 'info' ? '!border-blue-500 !text-blue-500' : ''
              } ${item.type == 'danger' ? '!border-red-500 !text-red-500' : ''
              } ${item.type == 'warning'
                ? '!border-orange-500 !text-orange-500'
                : ''
              } ${item.type == 'primary' ? '!border-purple-500 !text-purple-500' : ''
              } `">
              {{ item.label }}
            </app-button>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  AppNormalText,
  AppIcon,
  AppImageLoader,
  AppButton,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { computed } from "vue";
import { MessageInfo } from "../../composable";
import { Conversation } from "@greep/logic/src/gql/graphql";

export default defineComponent({
  components: {
    AppNormalText,
    AppIcon,
    AppImageLoader,
    AppButton,
  },
  props: {
    message: {
      type: Object as () => MessageInfo,
    },
    showActions: {
      type: Boolean,
      default: true,
    },
    conversation: {
      type: Object as () => Conversation,
      required: true,
    }
  },
  name: "ChatMessage",
  setup(props) {
    const isUserMessage = computed(() => {
      return Logic.Auth.AuthUser?.uuid == props.message?.user_uuid;
    });

    return {
      Logic,
      isUserMessage,
    };
  },
});
</script>

<style scoped>
.order-summary-container {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  margin: 8px 0;
}

.order-summary-details {
  font-size: 14px;
}

.order-summary-total {
  border-top: 1px solid #e9ecef;
}

.order-summary-address {
  background: #f1f3f4;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #dadce0;
}
</style>