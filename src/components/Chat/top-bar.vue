<template>
  <div class="w-full flex flex-col sticky top-0 left-0 pt-4 bg-white z-5">
    <!-- Top bar -->
    <div
      class="w-full flex flex-row items-center justify-between border-b-[1.5px] border-[#F0F3F6] px-4 pb-4"
    >
      <div class="flex flex-row items-center">
        <div class="w-[24px] mr-2" @click="Logic.Common.goBack()">
          <app-icon name="arrow-left" custom-class="!h-[24px]" />
        </div>
        <div class="w-[50px] mr-3">
          <app-avatar :src="topBarInfo.photo_url" :size="48" />
        </div>
        <div class="flex flex-row">
          <app-normal-text
            class="!text-sm px-2"
            is-html
            :html-content="topBarInfo.title"
          >
          </app-normal-text>
        </div>
      </div>

      <div class="w-[24px]">
        <app-icon name="info-circle" custom-class="!h-[24px]" />
      </div>
    </div>

    <!-- Alerts -->
    <template v-for="(item, index) in topBarInfo.alerts" :key="index">
      <div
        class="w-full flex flex-row items-center justify-between border-b-[1.5px] border-[#F0F3F6] px-4 py-4"
      >
        <div class="flex flex-row items-center">
          <div class="!w-[35px]">
            <div class="!w-[35px]">
              <app-icon :name="`${item.type}-alert`" custom-class="!h-[35px]" />
            </div>
          </div>

          <div class="flex flex-row">
            <app-normal-text class="px-3 !text-gray-500">
              {{ item.content }}
            </app-normal-text>
          </div>
        </div>

        <div class="w-[25px]">
          <app-icon name="close" class="!h-[25px]" />
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { AppAvatar, AppNormalText, AppIcon } from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive } from "vue";

export default defineComponent({
  components: {
    AppAvatar,
    AppNormalText,
    AppIcon,
  },
  props: {},
  name: "ChatTopBar",
  setup() {
    const topBarInfo = reactive<{
      title: string;
      photo_url: string;
      alerts: {
        type: "info" | "success" | "danger";
        content: string;
      }[];
    }>({
      title: "P2P Trade with <span class='font-semibold'>Abass Damilare</span>",
      photo_url: "https://randomuser.me/api/portraits/men/4.jpg",
      alerts: [
        {
          type: "danger",
          content:
            "Avoid scam! Only scammers will ask to interact outside GreepPay.",
        },
      ],
    });

    return {
      Logic,
      topBarInfo,
    };
  },
});
</script>
