<template>
  <app-wrapper>
    <subpage-layout title="Notifications" :hasBottomButton="false">
      <div class="w-full flex flex-col justify-start px-4 h-full pt-1">
        <app-tabs
          v-if="false"
          :tabs="notificationsTabs"
          v-model:activeTab="activeTab"
          tabsClass="!w-full flex border  rounded-full"
          tabClass="!flex-1 text-center border-none !mr-0 py-3"
          customClass="!overflow-x-hidden"
          type="badge"
        />

        <!-- Mark as read button -->
        <div v-if="false" class="w-full flex flex-col pb-4">
          <app-button
            class="w-full !py-4 !text-sm"
            outlined
            variant="secondary"
          >
            Mark all as Read
          </app-button>
        </div>

        <!-- Notifications -->
        <div class="flex flex-col pt-2">
          <div v-if="!notifications.length" class="mt-10">
            <app-empty-state
              icon="info-circle-gray"
              title="No Notifications"
              description="You're all caught up! Nothing new to see here."
              custonClass="border-none"
            />
          </div>

          <template v-else>
            <app-notification
              v-for="(notification, index) in notifications"
              :key="index"
              :notification="notification"
            />
          </template>
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
  import { defineComponent, ref, onMounted } from "vue"
  import {
    AppButton,
    AppNotification,
    // AppTabs,
    AppEmptyState,
  } from "@greep/ui-components"
  import { Logic } from "@greep/logic"
  import { onIonViewWillEnter } from "@ionic/vue"
  import { notificationsTabs } from "../../db/index"
  import { MappedNotification } from "../../composable/types"
  import { mapNotificationsToUI } from "../../composable/notification"
  import { buildNotificationWhereQuery } from "../../utils/formatter/index"

  export default defineComponent({
    name: "NotificationsPage",
    components: {
      AppButton,
      AppNotification,
      // AppTabs,
      AppEmptyState,
    },
    middlewares: {
      fetchRules: [
        {
          domain: "Notification",
          property: "ManyNotifications",
          method: "GetNotifications",
          params: [1, 10],
          requireAuth: true,
          ignoreProperty: true,
          silentUpdate: false,
        },
      ],
    },
    setup() {
      const notifications = ref<MappedNotification[]>([])
      const ManyNotifications = ref(Logic.Wallet.ManyTransactions)
      const activeTab = ref("all")

      const setDefaults = () => {
        if (!ManyNotifications.value?.data) return (notifications.value = [])

        notifications.value = ManyNotifications.value.data
          .filter((n) => !!n) // filter out nulls just in case
          .map((notification) => mapNotificationsToUI(notification))
      }

      onIonViewWillEnter(() => {
        setDefaults()
      })

      onMounted(() => {
        Logic.Notification.watchProperty("ManyNotifications", ManyNotifications)
        setDefaults()
      })

      return {
        Logic,
        notifications,
        notificationsTabs,
        activeTab,
        buildNotificationWhereQuery,
      }
    },
  })
</script>
