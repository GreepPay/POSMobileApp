<template>
  <app-wrapper>
    <subpage-layout title="Business Locations">
      <div class="w-full flex flex-col justify-start h-full pt-1">
        <div
          class="w-full flex flex-col items-center justify-start px-4 h-full pt-4"
        >
          <!-- Add new location button -->
          <div class="w-full flex flex-col pb-4">
            <div
              @click="goToAddLocation"
              class="w-full flex flex-row space-x-1 px-3 py-3 border-[1.5px] rounded-[12px] items-center border-[#0A141E]"
            >
              <app-icon name="black-plus" custom-class="h-[24px]" />

              <app-normal-text class="!text-left">
                Add New Address
              </app-normal-text>
            </div>
          </div>

          <!-- Empty state -->
          <template v-if="!deliveryAddresses || deliveryAddresses.length === 0">
            <div class="w-full flex flex-col items-center justify-center py-20">
              <app-normal-text class="text-gray-500 text-center mb-2">
                No delivery addresses added yet
              </app-normal-text>
            </div>
          </template>

          <!-- Delivery addresses list -->
          <template v-else>
            <template
              v-for="(address, index) in deliveryAddresses"
              :key="index"
            >
              <div
                class="w-full flex flex-row items-center justify-between mb-5 p-4 border border-gray-200 rounded-lg"
              >
                <div class="w-full flex flex-row space-x-3 items-start">
                  <app-icon
                    name="event/location"
                    custom-class="h-[24px] mt-1"
                  />

                  <div class="flex flex-col space-y-1">
                    <app-normal-text class="!text-left font-semibold">
                      {{ address.name }}
                    </app-normal-text>
                    <app-normal-text
                      class="!text-left text-sm text-gray-600"
                      v-if="address.description"
                    >
                      {{ address.description }}
                    </app-normal-text>
                    <app-normal-text
                      class="!text-left text-sm text-gray-500"
                      v-if="address.is_default === true"
                    >
                      Default Address
                    </app-normal-text>
                  </div>
                </div>

                <div class="flex flex-row justify-end">
                  <div
                    @click="goToEditAddress(address.uuid)"
                    class="cursor-pointer"
                  >
                    <app-icon
                      name="edit"
                      custom-class="h-[20px] text-gray-400"
                    />
                  </div>
                </div>
              </div>
            </template>
          </template>
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { AppNormalText, AppIcon } from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive } from "vue";
import { ref } from "vue";
import { onIonViewDidEnter } from "@ionic/vue";
import { onMounted } from "vue";

export default defineComponent({
  name: "DeliveryAddressesPage",
  components: {
    AppNormalText,
    AppIcon,
  },
  setup() {
    const DeliveryAddresses = ref<any>(Logic.User.DeliveryAddresses);

    const deliveryAddresses = reactive<
      Array<{
        uuid: string;
        name: string;
        description?: string;
        google_map_link?: string;
        delivery_location_id?: string;
        is_default: boolean;
        is_active: boolean;
        created_at: string;
        updated_at: string;
      }>
    >(Logic.User.DeliveryAddresses?.data || []);

    const paginatorInfo = ref<any>(
      Logic.User.DeliveryAddresses?.paginatorInfo || {}
    );

    const refreshData = async () => {
      try {
        await Logic.User.GetDeliveryAddresses(20, 1);
        deliveryAddresses.splice(
          0,
          deliveryAddresses.length,
          ...(Logic.User.DeliveryAddresses?.data || [])
        );
        paginatorInfo.value = Logic.User.DeliveryAddresses?.paginatorInfo || {};
      } catch (error) {
        console.error("Error fetching addresses:", error);
      }
    };

    refreshData();

    onIonViewDidEnter(() => {
      refreshData();
    });

    const goToAddLocation = () => {
      Logic.Common.GoToRoute("/profile/business-location/add");
    };

    const goToEditAddress = (addressUuid: string) => {
      if (addressUuid) {
        Logic.Common.GoToRoute(`/profile/business-location/${addressUuid}`);
      } else {
        console.warn("⚠️ No UUID provided for editing address");
      }
    };

    onMounted(() => {
      Logic.User.watchProperty("DeliveryAddresses", DeliveryAddresses);
    });

    return {
      Logic,
      deliveryAddresses,
      goToAddLocation,
      goToEditAddress,
    };
  },
});
</script>
