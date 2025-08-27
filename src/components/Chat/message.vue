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

              <!-- Delivery address / Pickup location -->
              <div class="w-full flex flex-col mt-3">
                <app-normal-text class="!text-[#666666] mb-2">
                  • {{ message.orderSummary.payoutOption === 'Pickup' ? 'Pickup location' : 'We deliver cash to you at' }}
                </app-normal-text>
                <div class="order-summary-address">
                  <app-normal-text class="!text-[#333333] !font-medium">{{ message.orderSummary.deliveryAddress }}</app-normal-text>
                </div>
              </div>
            </div>
          </div>

          <!-- ✅ REGULAR MESSAGE CONTENT (when not order summary) -->
          <template v-else-if="message.text_content && !message.text_content.includes('{order_summary_text}') && !clickableImageUrl && !derivedPdfUrl">
            <app-normal-text is-html :html-content="message.text_content" :class="`prose prose-sm !text-xs !leading-relaxed ${isUserMessage ? '!text-white' : ''
              }`">
            </app-normal-text>
          </template>

          <!-- ✅ HIDE TEMPLATE PLACEHOLDERS -->
          <!-- Template placeholder messages with {order_summary_text} are not displayed -->

          <!-- Media: show image clickable; opens original file in a new tab -->
          <template v-if="clickableImageUrl">
            <a :href="clickableImageUrl" target="_blank" rel="noopener noreferrer">
              <app-image-loader :photo-url="clickableImageUrl" class="h-[250px] w-[250px] rounded-[12px] mt-2 cursor-pointer" />
            </a>
            <!-- Remove extra view link for images to avoid double UI on some devices -->
          </template>

          <!-- PDF: render a neat clickable chip with filename -->
          <template v-else-if="derivedPdfUrl">
            <a :href="derivedPdfUrl" target="_blank" rel="noopener noreferrer" class="pdf-chip mt-2 inline-flex items-center">
              <span class="mr-2">📄</span>
              <span class="truncate max-w-[220px]">{{ pdfFileName }}</span>
            </a>
            <!-- Keep chip only; link is the chip -->
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

    // Try to derive an image URL from the message content if media is not explicitly provided
    const derivedImageUrl = computed(() => {
      // Prefer explicit media
      // @ts-ignore
      if (props.message?.media && props.message.media.url) return '';

      // Check common fields for a URL
      // @ts-ignore
      const content: string = (props.message?.text_content || props.message?.content || '').toString();
      if (!content) return '';

      // Simple regex to find image URLs (png|jpg|jpeg|webp|gif)
      const regex = /(https?:\/\/[^\s]+\.(?:png|jpe?g|webp|gif))/i;
      const match = content.match(regex);
      return match ? match[1] : '';
    });

    const clickableImageUrl = computed(() => {
      // @ts-ignore
      const mediaUrl = props.message?.media && props.message.media.url ? props.message.media.url : '';
      return mediaUrl || derivedImageUrl.value || '';
    });

    // Detect PDF URL inside the message content
    const derivedPdfUrl = computed(() => {
      // Prefer explicit media if it indicates a PDF
      // @ts-ignore
      const explicit = props.message?.media && props.message.media.url ? props.message.media.url : '';
      if (explicit && /\.pdf($|\?)/i.test(explicit)) return explicit;
      // Fallback: parse from text content
      // @ts-ignore
      const content: string = (props.message?.text_content || props.message?.content || '').toString();
      const regex = /(https?:\/\/[^\s]+\.pdf(?:\?[^\s]*)?)/i;
      const match = content.match(regex);
      return match ? match[1] : '';
    });

    const pdfFileName = computed(() => {
      if (!derivedPdfUrl.value) return '';
      try {
        const url = new URL(derivedPdfUrl.value);
        const pathname = url.pathname;
        const name = pathname.substring(pathname.lastIndexOf('/') + 1) || 'document.pdf';
        return name;
      } catch {
        const parts = derivedPdfUrl.value.split('/');
        return parts[parts.length - 1] || 'document.pdf';
      }
    });

    return {
      Logic,
      isUserMessage,
      derivedImageUrl,
      clickableImageUrl,
      derivedPdfUrl,
      pdfFileName,
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

.pdf-chip {
  border: 1.5px solid #6b7280; /* gray-500 */
  color: #374151; /* gray-700 */
  background: #ffffff;
  padding: 8px 12px;
  border-radius: 9999px;
  text-decoration: none;
  max-width: 260px;
}

.view-link {
  margin-top: 6px;
}
.view-link a {
  color: #2563eb; /* blue-600 */
  text-decoration: none;
  font-weight: 600;
}
.view-link a:hover {
  text-decoration: underline;
}
</style>