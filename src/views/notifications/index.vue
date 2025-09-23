<template>
  <app-wrapper>
    <subpage-layout title="Notifications" :hasBottomButton="false">
      <div
        class="w-full flex flex-col justify-start px-4 h-screen pt-1 relative"
      >
        <!-- Mark as read button -->
        <div class="flex flex-col pb-2 stic ky !top-2 0 bg-wh ite">
          <app-tabs
            :tabs="notificationsTabs"
            v-model:activeTab="activeTab"
            tabsClass="!w-full     !border-veryLightGray rounded-full gap-3 "
            tabClass="!flex-1 text-center border !mr-0 py-3 !px-4"
            type="badge"
          />

          <div class="w-full mt-4" v-if="ManyNotifications.data.length">
            <app-button
              class="w-full !py-3 !text-sm"
              outlined
              :disabled="isMarkingAsRead"
              variant="secondary"
              @click="markNotificationAsRead"
            >
              Mark all as Read
            </app-button>
          </div>
        </div>

        <!-- ManyNotifications -->
        <div class="flex flex-col pt-2">
          <div v-if="!ManyNotifications.data.length" class="mt-10">
            <app-empty-state
              icon="info-circle-gray"
              title="No Notifications"
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
  import { defineComponent, ref, onMounted, watch } from "vue"
  import {
    AppButton,
    AppNotification,
    AppTabs,
    AppEmptyState,
    AppVirtualScroller,
  } from "@greep/ui-components"
  import { Logic } from "@greep/logic"
  import { notificationsTabs } from "../../db/index"
  import { mapNotificationsToUI } from "../../composable/notification"

  const itemsPerPage = 10

  export default defineComponent({
    name: "NotificationsPage",
    components: {
      AppButton,
      AppNotification,
      AppTabs,
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
      const isMarkingAsRead = ref(false)
      const activeTab = ref("all")

      const fetchMoreNotifications = (nextPage: number) => {
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

      const markNotificationAsRead = async () => {
        const ids: number[] = ManyNotifications.value.data
          .filter((n) => !n.is_read)
          .map((n) => Number(n.id))

        if (!ids.length) return

        isMarkingAsRead.value = true
        await Logic.Notification.MarkNotificationsAsRead(ids)
        fetchNotifications()
        isMarkingAsRead.value = false
      }

      const fetchNotifications = async () => {
        const whereQuery = `{ 
            column: CATEGORY
            operator: EQ
            value: "${activeTab.value}" 
          }`

        Logic.Common.showLoader({ loading: true, show: true })
        await Logic.Notification.GetNotifications(
          1,
          10,
          "CREATED_AT",
          "DESC",
          activeTab.value !== "all" ? whereQuery : ""
        )
        Logic.Common.hideLoader()
      }

      watch(activeTab, (newValue, oldValue) => {
        if (newValue !== oldValue) fetchNotifications()
      })

      onMounted(() => {
        Logic.Notification.watchProperty("ManyNotifications", ManyNotifications)
      })

      return {
        Logic,
        notificationsTabs,
        activeTab,
        fetchMoreNotifications,
        ManyNotifications,
        mapNotificationsToUI,
        markNotificationAsRead,
        isMarkingAsRead,
      }
    },
  })
</script>
