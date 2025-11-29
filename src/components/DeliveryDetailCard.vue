<template>
  <!-- Card Content -->
  <div
    class="w-full flex flex-col p-4 mb-4 bg-white rounded-[16px] border-[1.5px] border-[#E0E2E4]"
  >
    <!-- Status Header -->
    <div class="w-full flex flex-row items-center justify-between mb-4 pb-3">
      <app-normal-text
        class="!text-left !text-black !font-[500] !leading-[20px]"
      >
        Status
      </app-normal-text>
      <div class="flex flex-row items-center gap-2">
        <app-normal-text
          class="!text-right !font-[500] !text-[12.5px] !leading-[20px]"
          :style="`color: ${colorByStatus(getDeliveryStatus(delivery.status) as any)} !important;`"
        >
          {{ getDeliveryStatusLabel(delivery.status) }}
        </app-normal-text>
        <app-icon
          :name="`order-delivery-${getDeliveryStatus(delivery.status)}`"
          custom-class="!h-[20px] !w-[20px]"
        />
      </div>
    </div>

    <!-- Price and Description -->
    <div class="w-full flex flex-row items-center justify-between pb-4">
      <app-normal-text
        class="!text-left !text-[#050709] !font-[600] !text-[18px] !leading-[20px]"
      >
        {{ formatPrice(delivery) }}
      </app-normal-text>
      <app-normal-text
        class="!text-right !text-gray-500 !font-[400] !leading-[20px] !tracking-[1%]"
      >
        {{ getDeliveryItemName(delivery) }}
      </app-normal-text>
    </div>

    <!-- Pickup and Dropoff Locations -->
    <div class="w-full flex flex-col mb-2">
      <!-- Pickup Location -->
      <div class="flex flex-row items-start mb-3">
        <app-icon
          name="pickup"
          custom-class="!h-[24px] !w-[24px] mr-3 flex-shrink-0"
        />
        <div class="flex flex-col flex-1">
          <app-normal-text
            class="!text-left !text-black !font-[500] !text-sm mb-2"
          >
            Pickup
          </app-normal-text>
          <div
            class="!text-left !text-gray-500 leading-relaxed"
            v-html="getPickupAddress(delivery)"
          ></div>
        </div>
      </div>

      <!-- Dropoff Location -->
      <div class="flex flex-row items-start">
        <app-icon
          name="dropoff"
          custom-class="!h-[24px] !w-[24px] !text-teal mr-3 flex-shrink-0"
        />
        <div class="flex flex-col flex-1">
          <app-normal-text
            class="!text-left !text-black !font-[500] !text-sm mb-2"
          >
            Dropoff
          </app-normal-text>
          <div
            class="!text-left !text-gray-500 leading-relaxed"
            v-html="getDropoffAddress(delivery)"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, ref } from "vue";
import {
  AppNormalText,
  AppIcon,
  availableCurrencies,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { Delivery } from "@greep/logic/src/gql/graphql";

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
    const CurrentGlobalExchangeRate = ref(
      Logic.Wallet.CurrentGlobalExchangeRate
    );

    const currencyInfo = availableCurrencies?.find(
      (currency) => currency.code === CurrentGlobalExchangeRate.value?.target
    );

    // Format price
    const formatPrice = (task: any) => {
      if (task.price) {
        const priceInUSD = task.price * CurrentGlobalExchangeRate.value!.mid;
        return `${currencyInfo?.symbol || "$"}${Logic.Common.convertToMoney(
          priceInUSD,
          true,
          ""
        )}`;
      }
    };

    // Get item details with description
    const getDeliveryItemName = (delivery: any) => {
      try {
        if (delivery.metadata && typeof delivery.metadata === "string") {
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
      } else if (delivery.type === "custom") {
        return "Custom Delivery";
      }
      return "Delivery Request";
    };

    // Get pickup address
    const getPickupAddress = (task: Delivery) => {
      return task.pickupAddress || "Not specified";
    };

    // Get dropoff address
    const getDropoffAddress = (delivery: Delivery) => {
      return delivery.deliveryAddress || "Not specified";
    };

    const colorByStatus = (
      status: "success" | "failed" | "pending" | "in_progress"
    ) => {
      if (status === "success") {
        return "#10BB76";
      } else if (status === "failed") {
        return "#FA1919";
      } else if (status === "in_progress") {
        return "#00619D";
      } else {
        return "#FFAA1F";
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
        case "ongoing":
          return "in_progress";
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
        case "ongoing":
          return "In Progress";
        case "failed":
          return "Failed";
        case "processing":
          return "Processing";
        case "pending":
        default:
          return "Pending";
      }
    };

    onMounted(() => {
      Logic.Wallet.watchProperty(
        "CurrentGlobalExchangeRate",
        CurrentGlobalExchangeRate
      );
    });

    return {
      colorByStatus,
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
