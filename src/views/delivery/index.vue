<template>
    <app-wrapper mobilePadding="!pt-0">
        <default-page-layout title="Deliveries"
            :photoUrl="AuthUser?.profile?.business?.logo || '/images/profile-image.svg'">
            <template #extra-top-section>
                <div class="w-full flex flex-col pt-4">
                    <app-tabs :tabs="deliveryTabs" v-model:activeTab="activeTab"
                        tabsClass="!w-full flex border-[1.5px] !border-veryLightGray rounded-full"
                        tabClass="!flex-1 text-center border-none !mr-0 py-3" customClass="!overflow-x-hidden"
                        type="badge" />
                </div>
            </template>

            <div class="w-full flex flex-col items-center justify-start !space-y-[20px]">
                <!-- Loading State -->
                <div v-if="isLoading" class="w-full flex flex-col items-center py-8">
                    <app-normal-text class="!text-center !text-gray-500">
                        Loading deliveries...
                    </app-normal-text>
                </div>

                <!-- Error State -->
                <div v-else-if="error" class="w-full flex flex-col items-center py-8">
                    <app-normal-text class="!text-center !text-red-500">
                        {{ error }}
                    </app-normal-text>
                </div>

                <!-- Deliveries List -->
                <div v-else class="w-full flex flex-col px-4">
                    <div v-for="(delivery, index) in currentDeliveries" :key="delivery.uuid || index"
                        class="w-full flex flex-row items-center pt-4 pb-4 !border-b-[1.5px] !border-[#F0F3F6] cursor-pointer"
                        @click="goToDelivery(delivery.uuid)">
                        <div class="w-[48px] mr-3">
                            <div class="w-[48px]">
                                <app-icon :name="`delivery-${getDeliveryStatus(delivery.status)}`"
                                    custom-class="!h-[48px]" />
                            </div>
                        </div>

                        <div class="w-full flex flex-col">
                            <app-normal-text class="!text-left !text-black !font-[500] !text-sm mb-[3px]">
                                {{ getDeliveryItemName(delivery) }}
                            </app-normal-text>

                            <div class="w-full flex flex-row items-center">
                                <app-normal-text class="!text-left !text-[#616161]">
                                    {{ getDeliveryTypeLabel(delivery) }}
                                </app-normal-text>

                                <div class="h-[4px] w-[4px] rounded-full mx-[6px]"
                                    :style="`background-color: ${colorByStatus(getDeliveryStatus(delivery.status))} !important;`">
                                </div>

                                <app-normal-text class="!text-left"
                                    :style="`color: ${colorByStatus(getDeliveryStatus(delivery.status))} !important;`">
                                    {{ getDeliveryStatusLabel(delivery.status) }}
                                </app-normal-text>
                            </div>

                            <!-- Additional delivery info -->
                            <div v-if="delivery.fromAddress || delivery.toAddress" class="w-full flex flex-col mt-2">
                                <app-normal-text class="!text-left !text-[#616161] !text-xs">
                                    <span v-if="delivery.fromAddress">From: {{ truncateAddress(delivery.fromAddress)
                                    }}</span>
                                    <span v-if="delivery.fromAddress && delivery.toAddress"> → </span>
                                    <span v-if="delivery.toAddress">To: {{ truncateAddress(delivery.toAddress) }}</span>
                                </app-normal-text>
                            </div>
                        </div>
                    </div>

                    <!-- Empty State -->
                    <div v-if="currentDeliveries.length === 0" class="w-full flex flex-col items-center py-8">
                        <app-normal-text class="!text-center !text-gray-500">
                            No {{ getEmptyStateText() }} found
                        </app-normal-text>
                    </div>
                </div>
            </div>
        </default-page-layout>
    </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted, watch, nextTick, computed } from "vue";
import {
    DefaultPageLayout,
    AppTabs,
    AppIcon,
    AppNormalText,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { User } from "@greep/logic/src/gql/graphql";

export default defineComponent({
    name: "DeliveryIndexPage",
    components: {
        DefaultPageLayout,
        AppTabs,
        AppIcon,
        AppNormalText,
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
            {
                domain: "Commerce",
                property: "ManyBusinessDeliveries",
                method: "GetBusinessDeliveries",
                params: [1, 50],
                requireAuth: true,
                ignoreProperty: false,
            },
        ],
    },
    setup() {
        const AuthUser = ref<User>(Logic.Auth.AuthUser);
        const activeTab = ref("active");
        const isLoading = ref(false);
        const error = ref<string | null>(null);

        // Delivery tabs
        const deliveryTabs = ref([
            {
                key: "active",
                label: "Active",
            },
            {
                key: "history",
                label: "History",
            },
        ]);

        const colorByStatus = (status: "success" | "failed" | "pending") => {
            if (status === "success") {
                return "#10BB76";
            } else if (status === "failed") {
                return "#FA1919";
            } else {
                return "#FFAA1F";
            }
        };

        // Format delivery title
        const formatDeliveryTitle = (delivery: any) => {
            if (delivery.trackingNumber) {
                return `Delivery #${delivery.trackingNumber}`;
            } else if (delivery.orderNumber) {
                return `Order #${delivery.orderNumber}`;
            } else if (delivery.uuid) {
                return `Delivery #${delivery.uuid.slice(-8)}`;
            }
            return "Delivery Request";
        };

        // Get delivery item name/description
        const getDeliveryItemName = (delivery: any) => {
            try {
                if (delivery.metadata && typeof delivery.metadata === 'string') {
                    const metadata = JSON.parse(delivery.metadata);
                    if (metadata.itemDescription) {
                        return metadata.itemDescription;
                    }
                }
            } catch (e) {
                // If metadata is not valid JSON, continue
            }

            // Fallback to tracking number or default
            if (delivery.trackingNumber) {
                return `Delivery #${delivery.trackingNumber}`;
            } else if (delivery.type === 'custom') {
                return "Custom Delivery";
            } else if (delivery.type === 'order') {
                return "Order Delivery";
            }
            return "Delivery Request";
        };

        // Get delivery type label
        const getDeliveryTypeLabel = (delivery: any) => {
            if (activeTab.value === "requests") {
                return "Delivery Request";
            } else if (delivery.trackingNumber) {
                return "Delivery Service";
            } else {
                return "Delivery Order";
            }
        };

        // Get delivery status for UI
        const getDeliveryStatus = (status: string) => {
            switch (status?.toLowerCase()) {
                case "completed":
                case "delivered":
                    return "success";
                case "cancelled":
                case "failed":
                    return "failed";
                case "pending":
                case "processing":
                case "confirmed":
                case "picked_up":
                case "in_transit":
                default:
                    return "pending";
            }
        };

        // Get delivery status label
        const getDeliveryStatusLabel = (status: string) => {
            switch (status?.toLowerCase()) {
                case "completed":
                    return "Completed";
                case "delivered":
                    return "Delivered";
                case "confirmed":
                    return "Confirmed";
                case "picked_up":
                    return "Picked Up";
                case "in_transit":
                    return "In Transit";
                case "cancelled":
                    return "Cancelled";
                case "failed":
                    return "Failed";
                case "processing":
                    return "Processing";
                case "pending":
                default:
                    return "Pending";
            }
        };

        // Truncate address for display
        const truncateAddress = (address: string) => {
            if (!address) return "";
            return address.length > 30 ? address.substring(0, 30) + "..." : address;
        };

        // Get empty state text based on active tab
        const getEmptyStateText = () => {
            if (activeTab.value === "active") {
                return "active deliveries";
            } else {
                return "completed deliveries";
            }
        };

        // Navigate to delivery details
        const goToDelivery = (uuid: string) => {
            if (uuid) {
                Logic.Common.GoToRoute(`/delivery/${uuid}`);
            }
        };

        // Create a reactive trigger for forcing updates
        const updateTrigger = ref(0);

        // Computed for current deliveries with immediate reactivity
        const currentDeliveries = computed(() => {
            // Use the trigger to force re-computation
            updateTrigger.value;

            let deliveries: any[] = [];

            // Active and History tabs: Show business deliveries
            const manyBusinessDeliveries = Logic.Commerce.ManyBusinessDeliveries;
            if (manyBusinessDeliveries?.data) {
                deliveries = manyBusinessDeliveries.data;
            } else if (Array.isArray(manyBusinessDeliveries)) {
                deliveries = manyBusinessDeliveries;
            }
            console.log('Business deliveries:', deliveries.length, manyBusinessDeliveries);

            // Sort deliveries by created_at descending (recent first)
            const sortedDeliveries = [...deliveries].sort((a: any, b: any) => {
                const dateA = new Date(b.createdAt || b.created_at || b.updatedAt || b.updated_at);
                const dateB = new Date(a.createdAt || a.created_at || a.updatedAt || a.updated_at);
                return dateA.getTime() - dateB.getTime();
            });

            // Filter based on tab
            if (activeTab.value === "active") {
                // Active: Any status except "delivered" and "completed"
                const activeDeliveries = sortedDeliveries.filter((delivery: any) => {
                    const status = delivery.status?.toLowerCase() || "";
                    return !["delivered", "completed", "cancelled", "failed"].includes(status);
                });
                console.log('Active deliveries:', activeDeliveries.length);
                return activeDeliveries;
            } else {
                // History: Only "delivered", "completed", "cancelled", or "failed" status
                const historyDeliveries = sortedDeliveries.filter((delivery: any) => {
                    const status = delivery.status?.toLowerCase() || "";
                    return ["delivered", "completed", "cancelled", "failed"].includes(status);
                });
                console.log('History deliveries:', historyDeliveries.length);
                return historyDeliveries;
            }
        });

        // Watch for delivery changes
        watch(() => Logic.Commerce.ManyDeliveries, () => {
            updateTrigger.value++; // Force reactive update
        }, { deep: true, immediate: true });

        // Watch for business delivery changes
        watch(() => Logic.Commerce.ManyBusinessDeliveries, () => {
            updateTrigger.value++; // Force reactive update
        }, { deep: true, immediate: true });

        return {
            Logic,
            AuthUser,
            deliveryTabs,
            activeTab,
            isLoading,
            error,
            currentDeliveries,
            colorByStatus,
            goToDelivery,
            formatDeliveryTitle,
            getDeliveryItemName,
            getDeliveryTypeLabel,
            getDeliveryStatus,
            getDeliveryStatusLabel,
            getEmptyStateText,
            truncateAddress,
            updateTrigger,
        };
    },
});
</script>

<style scoped></style>