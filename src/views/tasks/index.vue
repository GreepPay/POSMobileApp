<template>
    <app-wrapper>
        <default-page-layout :title="Logic.Auth.GetDefaultBusiness()?.business_name" :photoUrl="Logic.Auth.GetDefaultBusiness()?.logo || '/images/profile-image.svg'
            " icon="drop" :title-click-action="() => Logic.Common.GoToRoute('/auth/switch-business')
                ">

            <div class="w-full flex flex-col items-center justify-start !space-y-[20px]">
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
                <div v-else class="w-full flex flex-col px-4 pb-4">
                    <div v-if="tasks.length === 0" class="w-full flex flex-col items-center py-8 border-none">
                        <app-empty-state icon="empty-events" title="No Delivery Tasks"
                            description="You don't have any delivery tasks yet. Tasks will appear here when customers request custom deliveries." />
                    </div>

                    <!-- Top Divider -->
                    <div v-if="tasks.length !== 0" class="w-screen h-[12px] -mx-4" style="background-color: #F0F3F6;">
                    </div>

                    <template v-for="(delivery, index) in tasks" :key="delivery.uuid || index">
                        <!-- Task Card Component -->
                        <task-card :delivery="delivery" @ignore="ignoreTask" @accept="acceptTask" />
                    </template>

                    <!-- Bottom Divider -->
                    <div v-if="tasks.length !== 0" class="w-screen h-[12px] -mx-4" style="background-color: #F0F3F6;">
                    </div>
                </div>
            </div>
        </default-page-layout>
    </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from "vue";
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
            },
        ],
    },
    setup() {
        const AuthUser = ref<User>(Logic.Auth.AuthUser);
        const isLoading = ref(false);
        const error = ref<string | null>(null);
        const updateTrigger = ref(0);

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

            const manyDeliveries = Logic.Commerce.ManyDeliveries;
            let deliveries: any[] = [];

            if (manyDeliveries?.data) {
                deliveries = manyDeliveries.data;
            } else if (Array.isArray(manyDeliveries)) {
                deliveries = manyDeliveries;
            }

            console.log('Custom delivery tasks:', deliveries.length, manyDeliveries);

            // Sort by created_at descending (recent first)
            return [...deliveries].sort((a: any, b: any) => {
                const dateA = new Date(b.createdAt || b.created_at || b.updatedAt || b.updated_at);
                const dateB = new Date(a.createdAt || a.created_at || a.updatedAt || a.updated_at);
                return dateA.getTime() - dateB.getTime();
            });
        });

        // Watch for delivery changes
        watch(() => Logic.Commerce.ManyDeliveries, () => {
            updateTrigger.value++;
        }, { deep: true, immediate: true });

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
