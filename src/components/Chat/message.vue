<template>
  <div
    :class="`w-full flex flex-row ${
      isUserMessage ? 'justify-end' : 'justify-start'
    }  ${message?.type == 'info' ? 'justify-center !items-center' : ''}`"
  >
    <!-- For Info Message Type -->
    <template v-if="message?.type == 'info'">
      <div class="w-full flex flex-row justify-center items-center">
        <div class="w-[24px] mr-1">
          <app-icon :name="message.info_icon" class="h-[24px]" />
        </div>
        <app-normal-text
          class="!text-[#999999]"
          is-html
          :html-content="message.text_content"
        >
        </app-normal-text>
      </div>
    </template>

    <!-- For Text Message Type -->
    <template v-if="message?.type == 'text'">
      <div class="min-w-[100px] max-w-[90%] flex flex-col">
        <!-- Message box -->
        <div
          :class="`w-full flex flex-col rounded-[24px] px-3 py-3 ${
            !isUserMessage
              ? 'bg-light-gray-one !rounded-tl-none'
              : 'bg-primary  !rounded-br-none'
          }`"
        >
          <app-normal-text
            :class="`!text-left !font-semibold pb-1 ${
              message.user_uuid == 'greep_ai' ? '!text-primary' : ''
            }`"
            v-if="!isUserMessage"
          >
            {{ message.user_name }}
          </app-normal-text>

          <app-normal-text
            is-html
            :html-content="message.text_content"
            :class="`prose prose-sm !text-xs !leading-relaxed ${
              isUserMessage ? '!text-white' : ''
            }`"
          >
          </app-normal-text>

          <!-- Media -->
          <template v-if="message.media">
            <app-image-loader
              :photo-url="message.media.url"
              class="h-[250px] w-[250px] rounded-[12px] mt-2"
            />
          </template>
        </div>

        <!-- Actions -->
        <div
          class="w-full flex flex-row flex-wrap gap-2 mt-3"
          v-if="message.actions && showActions"
        >
          <template v-for="(item, index) in message.actions" :key="index">
            <app-button
              :class="`!px-5 !py-2 !border-[1.5px] !bg-transparent ${
                item.type == 'success'
                  ? '!border-green-500 !text-green-500'
                  : ''
              } ${
                item.type == 'info' ? '!border-blue-500 !text-blue-500' : ''
              } ${
                item.type == 'danger' ? '!border-red-500 !text-red-500' : ''
              } ${
                item.type == 'warning'
                  ? '!border-orange-500 !text-orange-500'
                  : ''
              } `"
            >
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
