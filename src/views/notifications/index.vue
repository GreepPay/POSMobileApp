<template>
  <app-wrapper>
    <subpage-layout title="ManyNotifications" :hasBottomButton="false">
      <div class="w-full flex flex-col justify-start px-4 h-full pt-1">
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

        <!-- ManyNotifications -->
        <div class="flex flex-col pt-2">
          <div v-if="!ManyNotifications.data.length" class="mt-10">
            <app-empty-state
              icon="info-circle-gray"
              title="No ManyNotifications"
              description="You're all caught up! Nothing new to see here."
              custonClass="border-none"
            />
          </div>

          <template v-else>
            <app-virtual-scroller
              :data="ManyNotifications.data"
              :pagination="ManyNotifications.paginatorInfo"
              :fetchMore="fetchMoreNotifications"
            >
              <template #item-content="{ index, item }">
                <div class="w-full">
                  <app-notification
                    class="!w-full"
                    :key="index"
                    :notification="mapNotificationsToUI(item)"
                  />
                </div>
              </template>

              <template #skeleton-loaders>
                <div class="w-full flex flex-col mt-2">
                  <div class="w-[40%] h-[10px] rounded skeleton mb-2"></div>
                  <div
                    class="w-full flex flex-col space-y-2 skeleton h-[60px] rounded-[10px]"
                  ></div>
                </div>
              </template>
            </app-virtual-scroller>
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
    AppVirtualScroller,
  } from "@greep/ui-components"
  import { Logic } from "@greep/logic"
  import { onIonViewWillEnter } from "@ionic/vue"
  import { notificationsTabs } from "../../db/index"
  import { MappedNotification } from "../../composable/types"
  import { mapNotificationsToUI } from "../../composable/notification"
  import { buildNotificationWhereQuery } from "../../utils/formatter/index"

  const itemsPerPage = 10

  export default defineComponent({
    name: "NotificationsPage",
    components: {
      AppButton,
      AppNotification,
      // AppTabs,
      AppEmptyState,
      AppVirtualScroller,
    },
    middlewares: {
      fetchRules: [
        {
          domain: "Notification",
          property: "ManyNotifications",
          method: "GetNotifications",
          params: [1, itemsPerPage],
          requireAuth: true,
          ignoreProperty: true,
          silentUpdate: false,
        },
      ],
    },
    setup() {
      const ManyNotifications = ref(Logic.Notification.ManyNotifications)
      const notifications = ref<MappedNotification[]>([])
      const activeTab = ref("all")

      const setDefaults = () => {
        if (!ManyNotifications.value?.data) return (notifications.value = [])

        notifications.value = ManyNotifications.value.data
          .filter((n) => !!n) // filter out nulls just in case
          .map((notification) => mapNotificationsToUI(notification))
      }

      const fetchMoreNotifications = (nextPage: number) => {
        console.log("nextPage", nextPage)
        return Logic.Notification.GetNotifications(nextPage, itemsPerPage)
          .then((response) => {
            if (response) {
              const existingData = JSON.parse(
                JSON.stringify(Logic.Notification.ManyNotifications)
              )
              existingData.data = existingData.data.concat(response.data)
              existingData.paginatorInfo = response.paginatorInfo

              Logic.Notification.ManyNotifications = existingData

              return true
            }
          })
          .catch(() => false)
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
        fetchMoreNotifications,
        ManyNotifications,
        mapNotificationsToUI,
      }
    },
  })
</script>
