<template>
    <!-- Card Content -->
    <div class="w-full flex flex-col p-4 mb-0 bg-white">

        <!-- Price and Item Details -->
        <div class="w-full flex flex-row items-center justify-between mb-3 pb-3">
            <app-normal-text class="!text-left !text-black !font-[600] !text-[18px] !leading-[20px]">
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
                <!-- Connecting Line -->

                <app-icon name="pickup" custom-class="!h-[24px] !w-[24px] mr-3 flex-shrink-0" />
                <div class="flex flex-col flex-1">
                    <app-normal-text class="!text-left !text-black !font-[600] !text-base mb-2">
                        Pickup
                    </app-normal-text>
                    <div class="!text-left !text-gray-500 !text-sm leading-relaxed" v-html="getPickupAddress(delivery)">
                    </div>
                </div>
            </div>

            <!-- Dropoff Location -->
            <div class="flex flex-row items-start">
                <app-icon name="dropoff" custom-class="!h-[24px] !w-[24px] !text-teal mr-3 flex-shrink-0" />
                <div class="flex flex-col flex-1">
                    <app-normal-text class="!text-left !text-black !font-[600] !text-base mb-2">
                        Dropoff
                    </app-normal-text>
                    <div class="!text-left !text-gray-500 !text-sm leading-relaxed"
                        v-html="getDropoffAddress(delivery)">
                    </div>
                </div>
            </div>
            <!-- Action Buttons -->
            <div class="w-full flex flex-row gap-3 pt-5">
                <app-button outlined class="!flex-1 !border-2 !border-red-500 !text-red-500 !rounded-full !py-3 !px-4"
                    @click="$emit('ignore', delivery)">
                    Ignore
                </app-button>
                <app-button class="!flex-1 !bg-black !text-white !rounded-full !py-3 !px-4"
                    @click="$emit('accept', delivery)">
                    Take Order
                </app-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import {
    AppNormalText,
    AppIcon,
    AppButton,
} from "@greep/ui-components";

export default defineComponent({
    name: "TaskCard",
    components: {
        AppNormalText,
        AppIcon,
        AppButton,
    },
    props: {
        delivery: {
            type: Object as PropType<any>,
            required: true,
        },
    },
    emits: ["ignore", "accept"],
    setup() {
        // Format price
        const formatPrice = (task: any) => {
            if (task.price) {
                return `$${task.price}`;
            }
        };

        // Get delivery item name
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
        const getDropoffAddress = (task: any) => {
            try {
                if (task.metadata && typeof task.metadata === 'string') {
                    const metadata = JSON.parse(task.metadata);
                    if (metadata.dropoffAddress) {
                        return metadata.dropoffAddress;
                    }
                }
            } catch (e) {
                // continue
            }
            return task.deliveryAddress || "Not specified";
        };

        return {
            formatPrice,
            getDeliveryItemName,
            getPickupAddress,
            getDropoffAddress,
        };
    },
});
</script>
