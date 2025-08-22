<template>
  <app-wrapper>
    <subpage-layout title="Notifications" :hasBottomButton="false">
      <div class="w-full flex flex-col justify-start px-4 h-full pt-1">
        <!-- Mark as read button -->
        <div class="w-full flex flex-col pb-4">
          <app-button
            class="w-full !py-4 !text-sm"
            outlined
            variant="secondary"
          >
            Mark all as Read
          </app-button>
        </div>

        <!-- Notifications -->
        <div class="flex flex-col">
          <app-notification
            v-for="(notification, index) in notifications"
            :key="index"
            :notification="notification"
          />
        </div>

        
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { AppButton, AppNotification } from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive } from "vue";

export default defineComponent({
  name: "NotificationsPage",
  components: {
    AppButton,
    AppNotification,
  },
  setup() {
    const notifications = reactive([
      {
        logo: "notify-info",
        title: "Reward Milestone",
        contents: [
          "Congratulations! You have earned 1000 GRP Tokens. Redeem now!",
        ],
        date: "Today",
      },
      {
        logo: "notify-success",
        title: "Payment Successful",
        contents: ["₦33,000", "Raymond Akintola"],
        date: "Today",
      },
      {
        logo: "notify-success",
        title: "Conversion Successful",
        contents: ["₺25", "GRP Token"],
        date: "Today",
      },
      {
        logo: "notify-error",
        title: "Payment Failed",
        contents: ["₺200", "Payment Request"],
        date: "Today",
      },
      {
        logo: "notify-success",
        title: "Withdrawal Successful",
        contents: ["₺966", "Timmy Salami"],
        date: "Today",
      },
    ]);

    return {
      Logic,
      notifications,
    };
  },
});
</script>
