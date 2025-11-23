<template>
  <app-wrapper>
    <default-page-layout
      :title="Logic.Auth.GetDefaultBusiness()?.business_name"
      :photoUrl="
        Logic.Auth.GetDefaultBusiness()?.logo || '/images/profile-image.svg'
      "
      icon="drop"
      :title-click-action="
        () => Logic.Common.GoToRoute('/auth/switch-business')
      "
    >
      <div
        class="w-full flex flex-col items-center justify-start !space-y-[20px]"
      >
        <!-- Loading State -->
        <div v-if="isLoading" class="w-full flex flex-col items-center py-8">
          <app-normal-text class="!text-center !text-gray-500">
            Loading tasks...
          </app-normal-text>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="w-full flex flex-col items-center py-8">
          <app-normal-text class="!text-center !text-red-500">
            {{ error }}
          </app-normal-text>
        </div>

        <!-- Tasks List -->
        <div v-else class="w-full flex flex-col pb-4">
          <div
            v-if="tasks.length === 0"
            class="w-full flex flex-col items-center py-8 border-none px-4"
          >
            <app-empty-state
              icon="empty-events"
              title="No Delivery Tasks"
              description="You don't have any delivery tasks yet. Tasks will appear here when customers request custom deliveries."
            />
          </div>

          <!-- Top Divider -->
          <div
            v-if="tasks.length !== 0"
            class="w-screen h-[12px] !bg-[#f0f3f6]"
          ></div>

          <template
            v-for="(delivery, index) in tasks"
            :key="delivery.uuid || index"
          >
            <!-- Task Card Component -->
            <task-card
              :delivery="delivery"
              @ignore="ignoreTask"
              @accept="acceptTask"
            />
          </template>
        </div>

        <!-- Spacer -->
        <div class="h-[100px] py-8"></div>
      </div>
    </default-page-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed, onMounted } from "vue";
import {
  DefaultPageLayout,
  AppNormalText,
  AppEmptyState,
} from "@greep/ui-components";
import TaskCard from "@/components/TaskCard.vue";
import { Logic } from "@greep/logic";
import { User } from "@greep/logic/src/gql/graphql";

export default defineComponent({
  name: "TasksPage",
  components: {
    DefaultPageLayout,
    AppNormalText,
    AppEmptyState,
    TaskCard,
  },
  layout: "Dashboard",
  middlewares: {
    fetchRules: [
      {
        domain: "Commerce",
        property: "ManyDeliveries",
        method: "GetCustomDeliveryRequests",
        params: [1, 50],
        requireAuth: true,
        ignoreProperty: false,
        silentUpdate: true,
      },
      {
        domain: "Wallet",
        property: "CurrentGlobalExchangeRate",
        method: "GetGlobalExchangeRate",
        params: [],
        requireAuth: true,
        ignoreProperty: false,
      },
    ],
  },
  setup() {
    const AuthUser = ref<User>(Logic.Auth.AuthUser);
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    const updateTrigger = ref(0);
    const ManyDeliveries = ref(Logic.Commerce.ManyDeliveries);

    // Ignore task
    const ignoreTask = (task: any) => {
      console.log("Ignored task:", task.uuid);
      // TODO: Implement ignore logic
    };

    // Accept task
    const acceptTask = (task: any) => {
      Logic.Common.GoToRoute(`/delivery/${task.uuid}`);
    };

    // Computed for tasks
    const tasks = computed(() => {
      updateTrigger.value;

      let deliveries: any[] = [];

      if (ManyDeliveries.value?.data) {
        deliveries = ManyDeliveries.value.data;
      } else if (Array.isArray(ManyDeliveries.value)) {
        deliveries = ManyDeliveries.value;
      }

      // Sort by created_at descending (recent first)
      return [...deliveries].sort((a: any, b: any) => {
        const dateA = new Date(
          b.createdAt || b.created_at || b.updatedAt || b.updated_at
        );
        const dateB = new Date(
          a.createdAt || a.created_at || a.updatedAt || a.updated_at
        );
        return dateA.getTime() - dateB.getTime();
      });
    });

    // Watch for delivery changes
    watch(
      ManyDeliveries,
      () => {
        updateTrigger.value++;
      },
      { deep: true, immediate: true }
    );

    onMounted(() => {
      Logic.Commerce.watchProperty("ManyDeliveries", ManyDeliveries);
    });

    return {
      Logic,
      AuthUser,
      isLoading,
      error,
      tasks,
      ignoreTask,
      acceptTask,
      updateTrigger,
    };
  },
});
</script>
