<template>
    <!-- Card Content -->
    <div class="w-full flex flex-col p-4 mb-0 bg-white rounded-[16px] border-[1.5px] border-[#E0E2E4]">

        <!-- Status Header -->
        <div class="w-full flex flex-row items-center justify-between mb-4 pb-3">
            <app-normal-text class="!text-left !text-black !font-[500] !text-[14px] !leading-[20px]">
                Status
            </app-normal-text>
            <div class="flex flex-row items-center gap-2">
                <app-normal-text class="!text-right !text-[#FF9500] !font-[600] !text-[14px] !leading-[20px]">
                    {{ getDeliveryStatusLabel(delivery.status) }}
                </app-normal-text>
                <app-icon :name="`order-delivery-${getDeliveryStatus(delivery.status)}`"
                    custom-class="!h-[20px] !w-[20px]" />
            </div>
        </div>

        <!-- Price and Description -->
        <div class="w-full flex flex-row items-center justify-between pb-4">
            <app-normal-text class="!text-left !text-[#050709] !font-[600] !text-[20px] !leading-[32px]">
                {{ formatPrice(delivery) }}
            </app-normal-text>
            <app-normal-text class="!text-right !text-gray-500 !font-[400] !text-[14px] !leading-[20px] !tracking-[1%]">
                {{ getDeliveryItemName(delivery) }}
            </app-normal-text>
        </div>

        <!-- Pickup and Dropoff Locations -->
        <div class="w-full flex flex-col mb-4">
            <!-- Pickup Location -->
            <div class="flex flex-row items-start mb-3">
                <app-icon name="pickup" custom-class="!h-[24px] !w-[24px] mr-3 flex-shrink-0" />
                <div class="flex flex-col flex-1">
                    <app-normal-text class="!text-left !text-black !font-[500] !text-base mb-2">
                        Pickup
                    </app-normal-text>
                    <div class="!text-left !text-gray-500 !text-[14px] leading-relaxed" v-html="getPickupAddress(delivery)">
                    </div>
                </div>
            </div>

            <!-- Dropoff Location -->
            <div class="flex flex-row items-start">
                <app-icon name="dropoff" custom-class="!h-[24px] !w-[24px] !text-teal mr-3 flex-shrink-0" />
                <div class="flex flex-col flex-1">
                    <app-normal-text class="!text-left !text-black !font-[500] !text-base mb-2">
                        Dropoff
                    </app-normal-text>
                    <div class="!text-left !text-gray-500 !text-[14px] leading-relaxed"
                        v-html="getDropoffAddress(delivery)">
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import {
    AppNormalText,
    AppIcon,
} from "@greep/ui-components";

export default defineComponent({
    name: "DeliveryDetailCard",
    components: {
        AppNormalText,
        AppIcon,
    },
    props: {
        delivery: {
            type: Object as PropType<any>,
            required: true,
        },
    },
    setup() {
        // Format price
        const formatPrice = (delivery: any) => {
            return `$${delivery.price}`;
        };

        // Get item details with description
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
            }
            return "Delivery Request";
        };

        // Get pickup address
        const getPickupAddress = (task: any) => {
            try {
                if (task.metadata && typeof task.metadata === 'string') {
                    const metadata = JSON.parse(task.metadata);
                    if (metadata.pickupAddress) {
                        return metadata.pickupAddress;
                    }
                }
            } catch (e) {
                // continue
            }
            return task.deliveryAddress || "Not specified";
        };

        // Get dropoff address
        const getDropoffAddress = (delivery: any) => {
            try {
                if (delivery.metadata && typeof delivery.metadata === 'string') {
                    const metadata = JSON.parse(delivery.metadata);
                    if (metadata.dropoffAddress) {
                        return metadata.dropoffAddress;
                    }
                }
            } catch (e) {
                // continue
            }
            return delivery.deliveryAddress || delivery.toAddress || "Not specified";
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

        return {
            formatPrice,
            getDeliveryItemName,
            getPickupAddress,
            getDropoffAddress,
            getDeliveryStatus,
            getDeliveryStatusLabel,
        };
    },
});
</script>
